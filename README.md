# 多算法排序实时可视化对比工具 (Sorting Visualizer)

这是一个基于 React 和 TypeScript 构建的高性能、交互式排序算法可视化工具。它能够在一个页面上同时并行演示 8 种经典排序算法，让用户直观地观察和对比不同算法在处理相同乱序数据时的执行效率和工作原理。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite)

## 🚀 核心特性

-   **8 种算法同台竞技**：支持冒泡、选择、插入、希尔、归并、快速、堆排序以及完全遵循 CPython 规范的 **Timsort**。
-   **实时竞赛排名**：根据算法完成的先后顺序，实时显示从 #1 到 #8 的名次图标，前三名享有金、银、铜牌配色。
-   **精准动画控制**：基于 Generator（生成器）实现，支持“单步步进”、“实时暂停”和“播放/重置”。
-   **动态参数调节**：支持通过滑块实时调整数组规模（10-100）和动画执行节奏。
-   **丰富的视觉反馈**：
    -   🟡 **黄色**：正在比较
    -   🔴 **红色**：正在交换/写入
    -   🟣 **紫色**：基准值 (Pivot)
    -   💗 **粉色**：关键值 (Key/Min)
    -   🟢 **绿色**：已就位 (Sorted)
-   **现代 UI/UX**：支持深色/浅色模式切换，响应式网格布局。

## 🧠 包含的算法

| 算法 | 平均时间复杂度 | 空间复杂度 | 说明 |
| :--- | :--- | :--- | :--- |
| **冒泡排序** | $O(n^2)$ | $O(1)$ | 基础交换排序 |
| **选择排序** | $O(n^2)$ | $O(1)$ | 每次选择最小元素 |
| **插入排序** | $O(n^2)$ | $O(1)$ | 构建有序序列 |
| **希尔排序** | $O(n^{1.3})$ | $O(1)$ | 插入排序的改进版，分组插入 |
| **归并排序** | $O(n \log n)$ | $O(n)$ | 经典分治法 |
| **快速排序** | $O(n \log n)$ | $O(\log n)$ | 递归分区，速度极快 |
| **堆排序** | $O(n \log n)$ | $O(1)$ | 利用完全二叉树堆结构 |
| **Timsort** | $O(n \log n)$ | $O(n)$ | 结合归并与插入，真实数据表现优异 |

## 🛠️ 技术栈

-   **前端框架**: React 18
-   **编程语言**: TypeScript
-   **构建工具**: Vite
-   **样式方案**: Vanilla CSS (原生 CSS 变量 + Flex/Grid)

## 📦 快速开始

1.  **克隆仓库**
    ```bash
    git clone https://github.com/xlzhu/sorting-visualizer.git
    cd sorting-visualizer
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```

4.  **构建生产版本**
    ```bash
    npm run build
    ```

## 📖 实现细节

-   **Timsort 实现**：本项目严格按照 CPython 的 `listsort.txt` 规范实现，包含 `minrun` 计算、升序/降序 Run 识别、二分插入排序扩展以及合并栈的不变性维护。
-   **状态机驱动**：利用 JavaScript Generator 的特性，将算法执行过程中的每一个关键步骤封装为“快照”输出，从而实现了不阻塞主线程的丝滑动画和精确的单步控制。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。
