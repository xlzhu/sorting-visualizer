import { VisualizerStep } from '../types';

const MIN_MERGE = 32;

function getMinrun(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= (n & 1);
    n >>= 1;
  }
  return n + r;
}

export function* timsort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;
  if (n < 2) return;

  const minRun = getMinrun(n);
  const pendingRuns: { start: number; len: number }[] = [];

  let i = 0;
  while (i < n) {
    // 1. Find the run
    let runLen = yield* countRunAndMakeAscending(arr, i, n);
    
    // 2. If run is too short, extend it using insertion sort
    if (runLen < minRun) {
      const force = Math.min(n - i, minRun);
      yield* binaryInsertionSort(arr, i, i + force, i + runLen);
      runLen = force;
    }

    pendingRuns.push({ start: i, len: runLen });
    i += runLen;

    // 3. Merge runs to maintain invariants
    yield* mergeCollapse(arr, pendingRuns);
  }

  // 4. Final merges
  while (pendingRuns.length > 1) {
    yield* mergeAt(arr, pendingRuns, pendingRuns.length - 2);
  }

  for (let k = 0; k < n; k++) {
    yield { type: 'SORTED', index: k };
  }
}

function* countRunAndMakeAscending(arr: number[], start: number, end: number): Generator<VisualizerStep> {
  let runHi = start + 1;
  if (runHi === end) return 1;

  yield { type: 'COMPARE', indices: [start, runHi] };
  if (arr[runHi] < arr[start]) {
    // Descending
    while (runHi < end) {
      yield { type: 'COMPARE', indices: [runHi - 1, runHi] };
      if (arr[runHi] < arr[runHi - 1]) runHi++;
      else break;
    }
    // Reverse descending run
    yield* reverseRange(arr, start, runHi);
  } else {
    // Ascending
    while (runHi < end) {
      yield { type: 'COMPARE', indices: [runHi - 1, runHi] };
      if (arr[runHi] >= arr[runHi - 1]) runHi++;
      else break;
    }
  }
  return runHi - start;
}

function* reverseRange(arr: number[], start: number, end: number): Generator<VisualizerStep> {
  let lo = start;
  let hi = end - 1;
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    yield { type: 'SWAP', indices: [lo, hi], array: [...arr] };
    lo++;
    hi--;
  }
}

function* binaryInsertionSort(arr: number[], lo: number, hi: number, start: number): Generator<VisualizerStep> {
  if (start === lo) start++;
  for (; start < hi; start++) {
    const pivot = arr[start];
    yield { type: 'KEY', index: start };
    
    let left = lo;
    let right = start;
    
    while (left < right) {
      const mid = (left + right) >>> 1;
      yield { type: 'COMPARE', indices: [mid, start] };
      if (pivot < arr[mid]) right = mid;
      else left = mid + 1;
    }

    // Move elements
    for (let j = start; j > left; j--) {
      arr[j] = arr[j - 1];
      yield { type: 'SWAP', indices: [j, j - 1], array: [...arr] };
    }
    arr[left] = pivot;
    yield { type: 'SET', index: left, value: pivot, array: [...arr] };
  }
}

function* mergeCollapse(arr: number[], runs: { start: number; len: number }[]): Generator<VisualizerStep> {
  while (runs.length > 1) {
    let n = runs.length - 2;
    if (n > 0 && runs[n - 1].len <= runs[n].len + runs[n + 1].len) {
      if (runs[n - 1].len < runs[n + 1].len) n--;
      yield* mergeAt(arr, runs, n);
    } else if (runs[n].len <= runs[n + 1].len) {
      yield* mergeAt(arr, runs, n);
    } else {
      break;
    }
  }
}

function* mergeAt(arr: number[], runs: { start: number; len: number }[], i: number): Generator<VisualizerStep> {
  const run1 = runs[i];
  const run2 = runs[i + 1];

  // Merge run1 and run2
  if (run1.len <= run2.len) {
    yield* mergeLo(arr, run1.start, run1.len, run2.start, run2.len);
  } else {
    yield* mergeHi(arr, run1.start, run1.len, run2.start, run2.len);
  }

  // Update runs stack
  runs[i] = { start: run1.start, len: run1.len + run2.len };
  runs.splice(i + 1, 1);
}

const MIN_GALLOP = 7;

function* mergeLo(arr: number[], base1: number, len1: number, base2: number, len2: number): Generator<VisualizerStep> {
  const temp = arr.slice(base1, base1 + len1);
  let i = 0; // index in temp
  let j = base2; // index in arr
  let k = base1; // index in arr
  
  let m1 = len1;
  let m2 = len2;

  let minGallop = MIN_GALLOP;

  outer: while (true) {
    let count1 = 0;
    let count2 = 0;

    // 1. One-at-a-time mode
    do {
      yield { type: 'COMPARE', indices: [k, j] };
      if (arr[j] < temp[i]) {
        arr[k++] = arr[j++];
        yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
        count2++;
        count1 = 0;
        if (--m2 === 0) break outer;
      } else {
        arr[k++] = temp[i++];
        yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
        count1++;
        count2 = 0;
        if (--m1 === 0) break outer;
      }
    } while ((count1 | count2) < minGallop);

    // 2. Galloping mode
    do {
      // Gallop in run1 for first element of run2
      let gallop1 = yield* gallopRight(arr[j], temp, i, m1, 0);
      if (gallop1 !== 0) {
        for (let x = 0; x < gallop1; x++) {
          arr[k++] = temp[i++];
          yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
        }
        m1 -= gallop1;
        if (m1 === 0) break outer;
      }
      arr[k++] = arr[j++];
      yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
      if (--m2 === 0) break outer;

      // Gallop in run2 for first element of run1
      let gallop2 = yield* gallopLeft(temp[i], arr, j, m2, 0);
      if (gallop2 !== 0) {
        for (let x = 0; x < gallop2; x++) {
          arr[k++] = arr[j++];
          yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
        }
        m2 -= gallop2;
        if (m2 === 0) break outer;
      }
      arr[k++] = temp[i++];
      yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
      if (--m1 === 0) break outer;

      minGallop--;
    } while (minGallop >= 0); // Keep galloping if it's working
    
    minGallop += 2; // Penalize for leaving galloping mode
  }

  // Final cleanup
  while (m1 > 0) {
    arr[k++] = temp[i++];
    yield { type: 'SET', index: k - 1, value: arr[k - 1], array: [...arr] };
    m1--;
  }
}

function* mergeHi(arr: number[], base1: number, len1: number, base2: number, len2: number): Generator<VisualizerStep> {
  const temp = arr.slice(base2, base2 + len2);
  let i = base1 + len1 - 1; // index in arr
  let j = len2 - 1; // index in temp
  let k = base2 + len2 - 1; // index in arr

  let m1 = len1;
  let m2 = len2;

  let minGallop = MIN_GALLOP;

  outer: while (true) {
    let count1 = 0;
    let count2 = 0;

    // 1. One-at-a-time mode
    do {
      yield { type: 'COMPARE', indices: [i, k] };
      if (temp[j] < arr[i]) {
        arr[k--] = arr[i--];
        yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
        count1++;
        count2 = 0;
        if (--m1 === 0) break outer;
      } else {
        arr[k--] = temp[j--];
        yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
        count2++;
        count1 = 0;
        if (--m2 === 0) break outer;
      }
    } while ((count1 | count2) < minGallop);

    // 2. Galloping mode
    do {
      // Gallop in run1 for last element of run2
      let gallop1 = m1 - (yield* gallopRight(temp[j], arr, base1, m1, m1 - 1));
      if (gallop1 !== 0) {
        for (let x = 0; x < gallop1; x++) {
          arr[k--] = arr[i--];
          yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
        }
        m1 -= gallop1;
        if (m1 === 0) break outer;
      }
      arr[k--] = temp[j--];
      yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
      if (--m2 === 0) break outer;

      // Gallop in run2 for last element of run1
      let gallop2 = m2 - (yield* gallopLeft(arr[i], temp, 0, m2, m2 - 1));
      if (gallop2 !== 0) {
        for (let x = 0; x < gallop2; x++) {
          arr[k--] = temp[j--];
          yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
        }
        m2 -= gallop2;
        if (m2 === 0) break outer;
      }
      arr[k--] = arr[i--];
      yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
      if (--m1 === 0) break outer;

      minGallop--;
    } while (minGallop >= 0);

    minGallop += 2;
  }

  // Final cleanup
  while (m2 > 0) {
    arr[k--] = temp[j--];
    yield { type: 'SET', index: k + 1, value: arr[k + 1], array: [...arr] };
    m2--;
  }
}

function* gallopLeft(key: number, arr: number[], base: number, len: number, hint: number): Generator<VisualizerStep, number> {
  let lastOffset = 0;
  let offset = 1;
  
  yield { type: 'COMPARE', indices: [base + hint] };
  if (arr[base + hint] < key) {
    // Gallop right until arr[base + hint + offset] >= key
    const maxOffset = len - hint;
    while (offset < maxOffset) {
      yield { type: 'COMPARE', indices: [base + hint + offset] };
      if (arr[base + hint + offset] < key) {
        lastOffset = offset;
        offset = (offset << 1) + 1;
        if (offset <= 0) offset = maxOffset;
      } else {
        break;
      }
    }
    if (offset > maxOffset) offset = maxOffset;
    
    lastOffset += hint;
    offset += hint;
  } else {
    // Gallop left until arr[base + hint - offset] < key
    const maxOffset = hint + 1;
    while (offset < maxOffset) {
      yield { type: 'COMPARE', indices: [base + hint - offset] };
      if (arr[base + hint - offset] >= key) {
        lastOffset = offset;
        offset = (offset << 1) + 1;
        if (offset <= 0) offset = maxOffset;
      } else {
        break;
      }
    }
    if (offset > maxOffset) offset = maxOffset;
    
    let tmp = lastOffset;
    lastOffset = hint - offset;
    offset = hint - tmp;
  }

  // Binary search in [base + lastOffset, base + offset]
  lastOffset++;
  while (lastOffset < offset) {
    let m = lastOffset + ((offset - lastOffset) >>> 1);
    yield { type: 'COMPARE', indices: [base + m] };
    if (arr[base + m] < key) lastOffset = m + 1;
    else offset = m;
  }
  return offset;
}

function* gallopRight(key: number, arr: number[], base: number, len: number, hint: number): Generator<VisualizerStep, number> {
  let offset = 1;
  let lastOffset = 0;

  yield { type: 'COMPARE', indices: [base + hint] };
  if (arr[base + hint] <= key) {
    const maxOffset = len - hint;
    while (offset < maxOffset) {
      yield { type: 'COMPARE', indices: [base + hint + offset] };
      if (arr[base + hint + offset] <= key) {
        lastOffset = offset;
        offset = (offset << 1) + 1;
        if (offset <= 0) offset = maxOffset;
      } else {
        break;
      }
    }
    if (offset > maxOffset) offset = maxOffset;
    lastOffset += hint;
    offset += hint;
  } else {
    const maxOffset = hint + 1;
    while (offset < maxOffset) {
      yield { type: 'COMPARE', indices: [base + hint - offset] };
      if (arr[base + hint - offset] > key) {
        lastOffset = offset;
        offset = (offset << 1) + 1;
        if (offset <= 0) offset = maxOffset;
      } else {
        break;
      }
    }
    if (offset > maxOffset) offset = maxOffset;
    let tmp = lastOffset;
    lastOffset = hint - offset;
    offset = hint - tmp;
  }

  lastOffset++;
  while (lastOffset < offset) {
    let m = lastOffset + ((offset - lastOffset) >>> 1);
    yield { type: 'COMPARE', indices: [base + m] };
    if (arr[base + m] <= key) lastOffset = m + 1;
    else offset = m;
  }
  return offset;
}
