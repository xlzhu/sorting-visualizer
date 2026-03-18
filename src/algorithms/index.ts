import { bubbleSort, selectionSort, insertionSort } from './basic';
import { mergeSort, quickSort, heapSort } from './advanced';
import { timsort } from './timsort';
import { AlgorithmInfo } from '../types';

export const ALGORITHMS: Record<string, any> = {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  timsort,
};

export const ALGORITHM_DETAILS: Record<string, AlgorithmInfo> = {
  bubbleSort: {
    name: '冒泡排序 (Bubble Sort)',
    description: '通过重复走访要排序的数列，一次比较两个元素，如果它们的顺序错误就把它们交换过来。',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
  },
  selectionSort: {
    name: '选择排序 (Selection Sort)',
    description: '每一次从待排序的数据元素中选出最小（或最大）的一个元素，存放在序列的起始位置。',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
  },
  insertionSort: {
    name: '插入排序 (Insertion Sort)',
    description: '通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
  },
  mergeSort: {
    name: '归并排序 (Merge Sort)',
    description: '采用分治法的一个非常典型的应用。将已有序的子序列合并，得到完全有序的序列。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
  },
  quickSort: {
    name: '快速排序 (Quick Sort)',
    description: '通过一趟排序将要排序的数据分割成独立的两部分，其中一部分的所有数据都比另外一部分的所有数据都要小。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
  },
  heapSort: {
    name: '堆排序 (Heap Sort)',
    description: '利用堆这种数据结构所设计的一种排序算法。堆是一个近似完全二叉树的结构，并同时满足堆积的性质。',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
  },
  timsort: {
    name: 'Timsort',
    description: '结合了合并排序和插入排序的派生算法，旨在很好地处理真实世界中的各种数据。它是 Python 和 Java 标准库中的默认排序算法。',
    timeComplexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
  },
};
