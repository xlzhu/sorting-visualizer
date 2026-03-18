import { VisualizerStep } from '../types';

export function* bubbleSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'COMPARE', indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield { type: 'SWAP', indices: [j, j + 1], array: [...arr] };
      }
    }
    yield { type: 'SORTED', index: n - i - 1 };
  }
}

export function* selectionSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    yield { type: 'KEY', index: minIdx };
    for (let j = i + 1; j < n; j++) {
      yield { type: 'COMPARE', indices: [minIdx, j] };
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        yield { type: 'KEY', index: minIdx };
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      yield { type: 'SWAP', indices: [i, minIdx], array: [...arr] };
    }
    yield { type: 'SORTED', index: i };
  }
}

export function* insertionSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    yield { type: 'KEY', index: i };
    while (j >= 0 && arr[j] > key) {
      yield { type: 'COMPARE', indices: [j, j + 1] };
      arr[j + 1] = arr[j];
      yield { type: 'SWAP', indices: [j, j + 1], array: [...arr] };
      j = j - 1;
    }
    arr[j + 1] = key;
    yield { type: 'SET', index: j + 1, value: key, array: [...arr] };
    yield { type: 'SORTED', index: i }; // For visual, everything up to i is "partially sorted"
  }
}

export function* shellSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;

  if (n === 0) return;

  // 希尔增量序列: n/2, n/4, ..., 1
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // 对每个 gap 进行插入排序
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      yield { type: 'KEY', index: i };

      let j = i;
      while (j >= gap) {
        yield { type: 'COMPARE', indices: [j - gap, j] };
        if (arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          yield { type: 'SWAP', indices: [j - gap, j], array: [...arr] };
          j -= gap;
        } else {
          break;
        }
      }
      arr[j] = temp;
      yield { type: 'SET', index: j, value: temp, array: [...arr] };
    }
  }

  // 标记所有元素已排序
  for (let i = 0; i < n; i++) {
    yield { type: 'SORTED', index: i };
  }
}
