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
