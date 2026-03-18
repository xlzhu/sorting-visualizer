import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { ALGORITHMS, ALGORITHM_DETAILS } from './algorithms';
import { VisualizerState, VisualizerStep, Theme } from './types';

const ALGORITHM_KEYS = [
  'bubbleSort', 'selectionSort', 'insertionSort', 'shellSort',
  'mergeSort', 'quickSort', 'heapSort', 'timsort'
];

const INITIAL_ARRAY_SIZE = 30;
const INITIAL_ANIMATION_SPEED = 80;

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_ANIMATION_SPEED);
  const [size, setSize] = useState(INITIAL_ARRAY_SIZE);
  const [theme, setTheme] = useState<Theme>('light');
  
  // States for each algorithm
  const [algoStates, setAlgoStates] = useState<Record<string, VisualizerState>>({});
  const [finishedAlgos, setFinishedAlgos] = useState<Set<string>>(new Set());
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  const generatorsRef = useRef<Record<string, Generator<VisualizerStep> | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateArray = useCallback((newSize = size) => {
    const baseArray = Array.from({ length: newSize }, () => Math.floor(Math.random() * 380) + 20);
    
    const initialStates: Record<string, VisualizerState> = {};
    ALGORITHM_KEYS.forEach(key => {
      initialStates[key] = {
        array: [...baseArray],
        comparingIndices: [],
        swappingIndices: [],
        pivotIndex: null,
        sortedIndices: new Set(),
        keyIndex: null,
        comparisons: 0,
        swaps: 0,
      };
      generatorsRef.current[key] = null;
    });

    setAlgoStates(initialStates);
    setFinishedAlgos(new Set());
    setFinishOrder([]);
    setIsFinished(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [size]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleStep = useCallback(() => {
    let allDone = true;
    const nextStates = { ...algoStates };
    const nextFinished = new Set(finishedAlgos);
    const newFinishedThisStep: string[] = [];

    ALGORITHM_KEYS.forEach(key => {
      if (nextFinished.has(key)) return;

      if (!generatorsRef.current[key]) {
        generatorsRef.current[key] = ALGORITHMS[key]([...nextStates[key].array]);
      }

      const { value, done } = generatorsRef.current[key]!.next();

      if (done) {
        nextFinished.add(key);
        newFinishedThisStep.push(key);
        nextStates[key] = {
          ...nextStates[key],
          comparingIndices: [],
          swappingIndices: [],
          pivotIndex: null,
          keyIndex: null,
        };
      } else {
        allDone = false;
        const step = value as VisualizerStep;
        const current = nextStates[key];
        
        const update: Partial<VisualizerState> = {
          comparingIndices: step.type === 'COMPARE' ? (step.indices || []) : [],
          swappingIndices: step.type === 'SWAP' ? (step.indices || []) : [],
        };

        if (step.array) update.array = step.array;
        if (step.type === 'COMPARE') update.comparisons = current.comparisons + 1;
        if (step.type === 'SWAP' || step.type === 'SET') update.swaps = current.swaps + 1;
        
        if (step.type === 'PIVOT') update.pivotIndex = step.index ?? null;
        if (step.type === 'KEY') update.keyIndex = step.index ?? null;
        if (step.type === 'SORTED' && step.index !== undefined) {
          const newSorted = new Set(current.sortedIndices);
          newSorted.add(step.index);
          update.sortedIndices = newSorted;
        }
        if (step.type === 'SET' && step.index !== undefined && step.value !== undefined) {
            const newArray = [...(update.array || current.array)];
            newArray[step.index] = step.value;
            update.array = newArray;
        }
        
        nextStates[key] = { ...current, ...update };
      }
    });

    if (newFinishedThisStep.length > 0) {
      setFinishOrder(prev => [...prev, ...newFinishedThisStep]);
    }
    setAlgoStates(nextStates);
    setFinishedAlgos(nextFinished);

    if (allDone) {
      setIsPlaying(false);
      setIsFinished(true);
      return false;
    }
    return true;
  }, [algoStates, finishedAlgos]);

  useEffect(() => {
    if (isPlaying) {
      const run = () => {
        const hasMore = handleStep();
        if (hasMore) {
          const delay = Math.max(1, 200 - (speed * 2));
          timerRef.current = setTimeout(run, delay);
        }
      };
      run();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, handleStep, speed]);

  const handleStart = () => {
    if (isFinished) generateArray();
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  const handleReset = () => generateArray();

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <h1>多算法排序实时对比</h1>
          <p className="subtitle">8 种排序算法在相同初始数据下的效率博弈</p>
        </div>
        <div className="global-controls">
          <div className="control-group">
            <label>数组大小: {size}</label>
            <input type="range" min="10" max="100" step="2" value={size} onChange={(e) => setSize(Number(e.target.value))} disabled={isPlaying} />
          </div>
          <div className="control-group">
            <label>动画速度</label>
            <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </div>
          <div className="button-group">
            {!isPlaying ? (
              <button className="primary" onClick={handleStart} disabled={isFinished}>▶ 开始竞速</button>
            ) : (
              <button onClick={handlePause}>⏸ 暂停</button>
            )}
            <button onClick={handleReset}>🔄 重置</button>
            <button className="icon-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="algo-grid">
        {ALGORITHM_KEYS.map(key => {
          const state = algoStates[key];
          const details = ALGORITHM_DETAILS[key];
          if (!state) return null;

          const rankIndex = finishOrder.indexOf(key);
          const rank = rankIndex !== -1 ? rankIndex + 1 : null;

          return (
            <div key={key} className={`algo-card ${finishedAlgos.has(key) ? 'finished' : ''}`}>
              {rank && <div className={`rank-badge rank-${rank}`}>#{rank}</div>}
              <div className="algo-card-header">
                <h3>{details.name}</h3>
                <div className="algo-stats">
                  <span>比较: {state.comparisons}</span>
                  <span>交换: {state.swaps}</span>
                </div>
              </div>
              
              <div className="bars-container-mini">
                {state.array.map((val, idx) => {
                  let color = 'var(--bar-default)';
                  if (state.sortedIndices.has(idx)) color = 'var(--bar-sorted)';
                  if (state.comparingIndices.includes(idx)) color = 'var(--bar-compare)';
                  if (state.swappingIndices.includes(idx)) color = 'var(--bar-swap)';
                  if (state.pivotIndex === idx) color = 'var(--bar-pivot)';
                  if (state.keyIndex === idx) color = 'var(--bar-key)';
                  
                  return (
                    <div 
                      key={idx} 
                      className="bar-mini" 
                      style={{ 
                        height: `${(val / 400) * 100}%`,
                        backgroundColor: color
                      }}
                    />
                  );
                })}
              </div>

              <div className="complexity-info-mini">
                <span>时间: {details.timeComplexity.average}</span>
                <span>空间: {details.spaceComplexity}</span>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="legend-footer">
        <div className="legend-item"><div className="color-box" style={{background: 'var(--bar-compare)'}}></div> 比较</div>
        <div className="legend-item"><div className="color-box" style={{background: 'var(--bar-swap)'}}></div> 交换/写入</div>
        <div className="legend-item"><div className="color-box" style={{background: 'var(--bar-pivot)'}}></div> 基准值</div>
        <div className="legend-item"><div className="color-box" style={{background: 'var(--bar-key)'}}></div> 关键值</div>
        <div className="legend-item"><div className="color-box" style={{background: 'var(--bar-sorted)'}}></div> 已就位</div>
      </footer>
    </div>
  );
}

export default App;
