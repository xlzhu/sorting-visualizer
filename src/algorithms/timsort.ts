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
  yield* merge(arr, run1.start, run1.start + run1.len - 1, run2.start + run2.len - 1);

  // Update runs stack
  runs[i] = { start: run1.start, len: run1.len + run2.len };
  runs.splice(i + 1, 1);
}

// Simple merge for visualization, in reality Timsort uses a more complex galloping merge
function* merge(arr: number[], left: number, mid: number, right: number): Generator<VisualizerStep> {
  const temp = arr.slice(left, right + 1);
  let i = 0;
  let j = mid - left + 1;
  let k = left;
  const midInTemp = mid - left;
  const endInTemp = right - left;

  while (i <= midInTemp && j <= endInTemp) {
    yield { type: 'COMPARE', indices: [left + i, left + j] };
    if (temp[i] <= temp[j]) {
      arr[k] = temp[i++];
    } else {
      arr[k] = temp[j++];
    }
    yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
    k++;
  }

  while (i <= midInTemp) {
    arr[k] = temp[i++];
    yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
    k++;
  }
  while (j <= endInTemp) {
    arr[k] = temp[j++];
    yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
    k++;
  }
}
