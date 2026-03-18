export type VisualizerStepType = 'COMPARE' | 'SWAP' | 'SET' | 'PIVOT' | 'SORTED' | 'KEY' | 'RUN';

export interface VisualizerStep {
  type: VisualizerStepType;
  indices?: number[];
  index?: number;
  value?: number;
  array?: number[];
  description?: string;
}

export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

export type Theme = 'light' | 'dark';

export interface VisualizerState {
  array: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  pivotIndex: number | null;
  sortedIndices: Set<number>;
  keyIndex: number | null;
  comparisons: number;
  swaps: number;
}
