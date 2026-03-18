import { describe, it, expect } from 'vitest';
import { shellSort } from '../basic';
import { VisualizerStep } from '../../types';

describe('shellSort', () => {
  // 辅助函数：运行算法并收集最终排序结果
  const runSort = (array: number[]): number[] => {
    const generator = shellSort(array);
    let result = [...array];

    for (const step of generator) {
      if (step.array) {
        result = step.array;
      }
    }
    return result;
  };

  // 辅助函数：收集所有步骤
  const collectSteps = (array: number[]): VisualizerStep[] => {
    const generator = shellSort(array);
    const steps: VisualizerStep[] = [];

    for (const step of generator) {
      steps.push(step);
    }
    return steps;
  };

  describe('排序正确性', () => {
    it('应该正确排序空数组', () => {
      const input: number[] = [];
      const result = runSort(input);
      expect(result).toEqual([]);
    });

    it('应该正确排序单元素数组', () => {
      const input = [42];
      const result = runSort(input);
      expect(result).toEqual([42]);
    });

    it('应该正确排序已排序数组', () => {
      const input = [1, 2, 3, 4, 5];
      const result = runSort(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该正确排序逆序数组', () => {
      const input = [5, 4, 3, 2, 1];
      const result = runSort(input);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该正确排序随机数组', () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = runSort(input);
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('应该正确处理包含重复元素的数组', () => {
      const input = [3, 1, 4, 1, 5, 9, 2, 6, 5];
      const result = runSort(input);
      expect(result).toEqual([1, 1, 2, 3, 4, 5, 5, 6, 9]);
    });

    it('应该正确处理包含负数的数组', () => {
      const input = [-3, 1, -5, 0, 2, -1];
      const result = runSort(input);
      expect(result).toEqual([-5, -3, -1, 0, 1, 2]);
    });

    it('应该正确处理较大数组', () => {
      const input = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
      const result = runSort(input);
      // 验证结果是有序的
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
      }
    });
  });

  describe('可视化步骤', () => {
    it('应该生成有效的步骤类型', () => {
      const input = [5, 2, 4, 1, 3];
      const steps = collectSteps(input);
      const validTypes = ['COMPARE', 'SWAP', 'SET', 'KEY', 'SORTED'];

      for (const step of steps) {
        expect(validTypes).toContain(step.type);
      }
    });

    it('COMPARE 步骤应该包含 indices 数组', () => {
      const input = [5, 2, 4];
      const steps = collectSteps(input);
      const compareSteps = steps.filter(s => s.type === 'COMPARE');

      for (const step of compareSteps) {
        expect(step.indices).toBeDefined();
        expect(Array.isArray(step.indices)).toBe(true);
        expect(step.indices!.length).toBeGreaterThan(0);
      }
    });

    it('SWAP 步骤应该包含 array 状态', () => {
      const input = [5, 2, 4];
      const steps = collectSteps(input);
      const swapSteps = steps.filter(s => s.type === 'SWAP');

      for (const step of swapSteps) {
        expect(step.array).toBeDefined();
        expect(Array.isArray(step.array)).toBe(true);
      }
    });

    it('最后应该有 SORTED 步骤标记所有元素已排序', () => {
      const input = [3, 1, 2];
      const steps = collectSteps(input);
      const sortedSteps = steps.filter(s => s.type === 'SORTED');

      // 应该有 n 个 SORTED 步骤（每个元素一个）
      expect(sortedSteps.length).toBeGreaterThanOrEqual(input.length);

      // 验证每个 SORTED 步骤都有有效的 index
      for (const step of sortedSteps) {
        expect(step.index).toBeDefined();
        expect(step.index).toBeGreaterThanOrEqual(0);
        expect(step.index).toBeLessThan(input.length);
      }
    });

    it('KEY 步骤应该标记关键值索引', () => {
      const input = [5, 2, 4];
      const steps = collectSteps(input);
      const keySteps = steps.filter(s => s.type === 'KEY');

      for (const step of keySteps) {
        expect(step.index).toBeDefined();
        expect(step.index).toBeGreaterThanOrEqual(0);
        expect(step.index).toBeLessThan(input.length);
      }
    });

    it('步骤序列应该是确定性的', () => {
      const input = [5, 2, 4, 1, 3];
      const steps1 = collectSteps(input);
      const steps2 = collectSteps(input);

      expect(steps1.length).toBe(steps2.length);
      for (let i = 0; i < steps1.length; i++) {
        expect(steps1[i].type).toBe(steps2[i].type);
      }
    });
  });

  describe('希尔排序特性', () => {
    it('应该通过递减的 gap 序列进行排序', () => {
      const input = [8, 7, 6, 5, 4, 3, 2, 1];
      const steps = collectSteps(input);

      // 希尔排序应该产生多个 COMPARE 步骤
      const compareSteps = steps.filter(s => s.type === 'COMPARE');
      expect(compareSteps.length).toBeGreaterThan(0);

      // 应该比简单插入排序更高效（比较次数少于 n*(n-1)/2）
      expect(compareSteps.length).toBeLessThan(input.length * (input.length - 1) / 2);
    });

    it('不应该修改原始数组（纯函数）', () => {
      const input = [5, 2, 4, 1, 3];
      const original = [...input];
      runSort(input);

      // 原始数组应该保持不变
      expect(input).toEqual(original);
    });
  });
});
