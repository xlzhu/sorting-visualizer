import { VisualizerStep } from '../types';

export function* mergeSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  yield* mergeSortRecursive(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'SORTED', index: i };
  }
}

function* mergeSortRecursive(arr: number[], left: number, right: number): Generator<VisualizerStep> {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    yield* mergeSortRecursive(arr, left, mid);
    yield* mergeSortRecursive(arr, mid + 1, right);
    yield* merge(arr, left, mid, right);
  }
}

function* merge(arr: number[], left: number, mid: number, right: number): Generator<VisualizerStep> {
  const leftArray = arr.slice(left, mid + 1);
  const rightArray = arr.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < leftArray.length && j < rightArray.length) {
    yield { type: 'COMPARE', indices: [left + i, mid + 1 + j] };
    if (leftArray[i] <= rightArray[j]) {
      arr[k] = leftArray[i];
      yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
      i++;
    } else {
      arr[k] = rightArray[j];
      yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
      j++;
    }
    k++;
  }

  while (i < leftArray.length) {
    arr[k] = leftArray[i];
    yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
    i++;
    k++;
  }

  while (j < rightArray.length) {
    arr[k] = rightArray[j];
    yield { type: 'SET', index: k, value: arr[k], array: [...arr] };
    j++;
    k++;
  }
}

export function* quickSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  yield* quickSortRecursive(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    yield { type: 'SORTED', index: i };
  }
}

function* quickSortRecursive(arr: number[], low: number, high: number): Generator<VisualizerStep> {
  if (low <= high) {
    const pivotIdxRef = { value: -1 };
    yield* partition(arr, low, high, pivotIdxRef);
    const pivotIdx = pivotIdxRef.value;
    yield* quickSortRecursive(arr, low, pivotIdx - 1);
    yield* quickSortRecursive(arr, pivotIdx + 1, high);
  }
}

function* partition(arr: number[], low: number, high: number, pivotIdxRef: { value: number }): Generator<VisualizerStep> {
  const pivot = arr[high];
  yield { type: 'PIVOT', index: high };
  let i = low - 1;

  for (let j = low; j < high; j++) {
    yield { type: 'COMPARE', indices: [j, high] };
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      yield { type: 'SWAP', indices: [i, j], array: [...arr] };
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  yield { type: 'SWAP', indices: [i + 1, high], array: [...arr] };
  pivotIdxRef.value = i + 1;
  yield { type: 'SORTED', index: i + 1 };
}

export function* heapSort(array: number[]): Generator<VisualizerStep> {
  const arr = [...array];
  const n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    yield { type: 'SWAP', indices: [0, i], array: [...arr] };
    yield { type: 'SORTED', index: i };
    yield* heapify(arr, i, 0);
  }
  yield { type: 'SORTED', index: 0 };
}

function* heapify(arr: number[], n: number, i: number): Generator<VisualizerStep> {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    yield { type: 'COMPARE', indices: [left, largest] };
    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < n) {
    yield { type: 'COMPARE', indices: [right, largest] };
    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    yield { type: 'SWAP', indices: [i, largest], array: [...arr] };
    yield* heapify(arr, n, largest);
  }
}
