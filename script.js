const BOARD = document.getElementById("board");
const START_BTN = document.getElementById("startBtn");
const RESET_BTN = document.getElementById("resetBtn");
const STATUS = document.getElementById("status");
const ROD_COUNT_INPUT = document.getElementById("rodCount");
const SORT_METHOD_SELECT = document.getElementById("sortMethod");
const SPEED_INPUT = document.getElementById("speed");
const SPEED_VALUE = document.getElementById("speedValue");

const MIN_RODS = 5;
const MAX_RODS = 500;
const MIN_HEIGHT = 35;
const MAX_HEIGHT = 320;
const MIN_DELAY_MS = 1;
const MAX_DELAY_MS = 180;
let stepDelayMs = 115;

let values = [];
let isSorting = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(text) {
  STATUS.textContent = text;
}

function updateSpeed() {
  const speed = Number.parseInt(SPEED_INPUT.value, 10) || 55;
  SPEED_VALUE.textContent = String(speed);
  const ratio = (speed - 1) / 99;
  stepDelayMs = Math.max(MIN_DELAY_MS, Math.round(MAX_DELAY_MS - ratio * (MAX_DELAY_MS - MIN_DELAY_MS)));
}

function getRodCount() {
  const parsed = Number.parseInt(ROD_COUNT_INPUT.value, 10);
  if (Number.isNaN(parsed)) return 20;
  return Math.max(MIN_RODS, Math.min(MAX_RODS, parsed));
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function createFixedHeights(count) {
  if (count <= 1) return [MIN_HEIGHT];
  const step = (MAX_HEIGHT - MIN_HEIGHT) / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(MIN_HEIGHT + step * index));
}

function createRandomValues() {
  const rodCount = getRodCount();
  ROD_COUNT_INPUT.value = String(rodCount);
  BOARD.style.setProperty("--rod-gap", rodCount > 180 ? "0" : rodCount > 100 ? "1px" : rodCount > 40 ? "2px" : "0.35rem");
  values = shuffle(createFixedHeights(rodCount));
}

function methodLabel(method) {
  if (method === "selection") return "Selection Sort";
  if (method === "insertion") return "Insertion Sort";
  if (method === "quick") return "Quick Sort";
  if (method === "merge") return "Merge Sort";
  if (method === "heap") return "Heap Sort";
  if (method === "shell") return "Shell Sort";
  if (method === "comb") return "Comb Sort";
  if (method === "cocktail") return "Cocktail Sort";
  return "Bubble Sort";
}

function rodClassForIndex(index, state) {
  if (state.sortedIndexes.has(index)) return "rod sorted";
  if (state.swappingIndexes.has(index)) return "rod swapping";
  if (index === state.compareA) return "rod compare-a";
  if (index === state.compareB) return "rod compare-b";
  return "rod";
}

function render(state = {}) {
  const localState = {
    compareA: state.compareA ?? -1,
    compareB: state.compareB ?? -1,
    sortedIndexes: state.sortedIndexes ?? new Set(),
    swappingIndexes: state.swappingIndexes ?? new Set()
  };

  BOARD.innerHTML = "";

  values.forEach((height, index) => {
    const rod = document.createElement("div");
    rod.className = rodClassForIndex(index, localState);
    rod.style.height = `${height}px`;
    rod.title = `Height: ${height}`;
    BOARD.appendChild(rod);
  });
}

function setSortingActive(active) {
  isSorting = active;
  START_BTN.disabled = active;
  RESET_BTN.disabled = active;
  ROD_COUNT_INPUT.disabled = active;
  SORT_METHOD_SELECT.disabled = active;
}

async function bubbleSortVisual(sortedIndexes) {
  for (let end = values.length - 1; end > 0; end -= 1) {
    for (let i = 0; i < end; i += 1) {
      render({ compareA: i, compareB: i + 1, sortedIndexes });
      await sleep(stepDelayMs);

      if (values[i] > values[i + 1]) {
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
        render({
          compareA: i,
          compareB: i + 1,
          swappingIndexes: new Set([i, i + 1]),
          sortedIndexes
        });
        await sleep(stepDelayMs);
      }
    }

    sortedIndexes.add(end);
    render({ sortedIndexes });
    await sleep(stepDelayMs);
  }
}

async function selectionSortVisual(sortedIndexes) {
  for (let i = 0; i < values.length - 1; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < values.length; j += 1) {
      render({ compareA: minIndex, compareB: j, sortedIndexes });
      await sleep(stepDelayMs);
      if (values[j] < values[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [values[i], values[minIndex]] = [values[minIndex], values[i]];
      render({
        compareA: i,
        compareB: minIndex,
        swappingIndexes: new Set([i, minIndex]),
        sortedIndexes
      });
      await sleep(stepDelayMs);
    }

    sortedIndexes.add(i);
    render({ sortedIndexes });
    await sleep(stepDelayMs);
  }
}

async function insertionSortVisual(sortedIndexes) {
  sortedIndexes.add(0);
  render({ sortedIndexes });
  await sleep(stepDelayMs);

  for (let i = 1; i < values.length; i += 1) {
    let j = i;
    while (j > 0) {
      render({ compareA: j - 1, compareB: j, sortedIndexes });
      await sleep(stepDelayMs);

      if (values[j - 1] <= values[j]) break;

      [values[j - 1], values[j]] = [values[j], values[j - 1]];
      render({
        compareA: j - 1,
        compareB: j,
        swappingIndexes: new Set([j - 1, j]),
        sortedIndexes
      });
      await sleep(stepDelayMs);
      j -= 1;
    }

    sortedIndexes.clear();
    for (let k = 0; k <= i; k += 1) {
      sortedIndexes.add(k);
    }
    render({ sortedIndexes });
    await sleep(stepDelayMs);
  }
}

async function partition(low, high, sortedIndexes) {
  const pivot = values[high];
  let i = low;

  for (let j = low; j < high; j += 1) {
    render({ compareA: j, compareB: high, sortedIndexes });
    await sleep(stepDelayMs);
    if (values[j] < pivot) {
      [values[i], values[j]] = [values[j], values[i]];
      render({
        compareA: i,
        compareB: j,
        swappingIndexes: new Set([i, j]),
        sortedIndexes
      });
      await sleep(stepDelayMs);
      i += 1;
    }
  }

  [values[i], values[high]] = [values[high], values[i]];
  render({
    compareA: i,
    compareB: high,
    swappingIndexes: new Set([i, high]),
    sortedIndexes
  });
  await sleep(stepDelayMs);
  sortedIndexes.add(i);
  return i;
}

async function quickSortRecursive(low, high, sortedIndexes) {
  if (low > high) return;
  if (low === high) {
    sortedIndexes.add(low);
    return;
  }

  const pivotIndex = await partition(low, high, sortedIndexes);
  await quickSortRecursive(low, pivotIndex - 1, sortedIndexes);
  await quickSortRecursive(pivotIndex + 1, high, sortedIndexes);
}

async function quickSortVisual(sortedIndexes) {
  await quickSortRecursive(0, values.length - 1, sortedIndexes);
}

async function mergeSortRecursive(left, right, sortedIndexes) {
  if (left >= right) return;
  const mid = Math.floor((left + right) / 2);
  await mergeSortRecursive(left, mid, sortedIndexes);
  await mergeSortRecursive(mid + 1, right, sortedIndexes);

  const merged = [];
  let i = left;
  let j = mid + 1;

  while (i <= mid && j <= right) {
    render({ compareA: i, compareB: j, sortedIndexes });
    await sleep(stepDelayMs);
    if (values[i] <= values[j]) {
      merged.push(values[i]);
      i += 1;
    } else {
      merged.push(values[j]);
      j += 1;
    }
  }

  while (i <= mid) {
    merged.push(values[i]);
    i += 1;
  }

  while (j <= right) {
    merged.push(values[j]);
    j += 1;
  }

  for (let k = 0; k < merged.length; k += 1) {
    values[left + k] = merged[k];
    render({
      compareA: left + k,
      swappingIndexes: new Set([left + k]),
      sortedIndexes
    });
    await sleep(stepDelayMs);
  }
}

async function mergeSortVisual(sortedIndexes) {
  await mergeSortRecursive(0, values.length - 1, sortedIndexes);
}

async function heapify(size, root, sortedIndexes) {
  let largest = root;
  const left = 2 * root + 1;
  const right = 2 * root + 2;

  if (left < size) {
    render({ compareA: root, compareB: left, sortedIndexes });
    await sleep(stepDelayMs);
    if (values[left] > values[largest]) largest = left;
  }

  if (right < size) {
    render({ compareA: largest, compareB: right, sortedIndexes });
    await sleep(stepDelayMs);
    if (values[right] > values[largest]) largest = right;
  }

  if (largest !== root) {
    [values[root], values[largest]] = [values[largest], values[root]];
    render({
      compareA: root,
      compareB: largest,
      swappingIndexes: new Set([root, largest]),
      sortedIndexes
    });
    await sleep(stepDelayMs);
    await heapify(size, largest, sortedIndexes);
  }
}

async function heapSortVisual(sortedIndexes) {
  const n = values.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    await heapify(n, i, sortedIndexes);
  }

  for (let end = n - 1; end > 0; end -= 1) {
    [values[0], values[end]] = [values[end], values[0]];
    sortedIndexes.add(end);
    render({
      compareA: 0,
      compareB: end,
      swappingIndexes: new Set([0, end]),
      sortedIndexes
    });
    await sleep(stepDelayMs);
    await heapify(end, 0, sortedIndexes);
  }
}

async function shellSortVisual(sortedIndexes) {
  for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < values.length; i += 1) {
      let j = i;
      while (j >= gap) {
        render({ compareA: j - gap, compareB: j, sortedIndexes });
        await sleep(stepDelayMs);

        if (values[j - gap] <= values[j]) break;

        [values[j - gap], values[j]] = [values[j], values[j - gap]];
        render({
          compareA: j - gap,
          compareB: j,
          swappingIndexes: new Set([j - gap, j]),
          sortedIndexes
        });
        await sleep(stepDelayMs);
        j -= gap;
      }
    }
  }
}

async function combSortVisual(sortedIndexes) {
  const shrink = 1.3;
  let gap = values.length;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.floor(gap / shrink);
    if (gap < 1) gap = 1;
    swapped = false;

    for (let i = 0; i + gap < values.length; i += 1) {
      const j = i + gap;
      render({ compareA: i, compareB: j, sortedIndexes });
      await sleep(stepDelayMs);

      if (values[i] > values[j]) {
        [values[i], values[j]] = [values[j], values[i]];
        swapped = true;
        render({
          compareA: i,
          compareB: j,
          swappingIndexes: new Set([i, j]),
          sortedIndexes
        });
        await sleep(stepDelayMs);
      }
    }
  }
}

async function cocktailSortVisual(sortedIndexes) {
  let start = 0;
  let end = values.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    for (let i = start; i < end; i += 1) {
      render({ compareA: i, compareB: i + 1, sortedIndexes });
      await sleep(stepDelayMs);

      if (values[i] > values[i + 1]) {
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
        swapped = true;
        render({
          compareA: i,
          compareB: i + 1,
          swappingIndexes: new Set([i, i + 1]),
          sortedIndexes
        });
        await sleep(stepDelayMs);
      }
    }

    sortedIndexes.add(end);
    end -= 1;
    if (!swapped) break;

    swapped = false;
    for (let i = end; i > start; i -= 1) {
      render({ compareA: i - 1, compareB: i, sortedIndexes });
      await sleep(stepDelayMs);

      if (values[i - 1] > values[i]) {
        [values[i - 1], values[i]] = [values[i], values[i - 1]];
        swapped = true;
        render({
          compareA: i - 1,
          compareB: i,
          swappingIndexes: new Set([i - 1, i]),
          sortedIndexes
        });
        await sleep(stepDelayMs);
      }
    }

    sortedIndexes.add(start);
    start += 1;
  }
}

async function runSortVisual() {
  const method = SORT_METHOD_SELECT.value;
  const label = methodLabel(method);
  setSortingActive(true);
  setStatus(`Sorting with ${label}...`);

  const sortedIndexes = new Set();

  if (method === "selection") {
    await selectionSortVisual(sortedIndexes);
  } else if (method === "insertion") {
    await insertionSortVisual(sortedIndexes);
  } else if (method === "quick") {
    await quickSortVisual(sortedIndexes);
  } else if (method === "merge") {
    await mergeSortVisual(sortedIndexes);
  } else if (method === "heap") {
    await heapSortVisual(sortedIndexes);
  } else if (method === "shell") {
    await shellSortVisual(sortedIndexes);
  } else if (method === "comb") {
    await combSortVisual(sortedIndexes);
  } else if (method === "cocktail") {
    await cocktailSortVisual(sortedIndexes);
  } else {
    await bubbleSortVisual(sortedIndexes);
  }

  sortedIndexes.clear();
  for (let i = 0; i < values.length; i += 1) sortedIndexes.add(i);
  sortedIndexes.add(0);
  render({ sortedIndexes });
  setStatus(`Done with ${label}: shortest on left, tallest on right.`);

  setSortingActive(false);
}

function initialize() {
  createRandomValues();
  render();
  setStatus("Ready");
}

START_BTN.addEventListener("click", () => {
  if (!isSorting) {
    runSortVisual();
  }
});

RESET_BTN.addEventListener("click", () => {
  if (!isSorting) {
    initialize();
  }
});

ROD_COUNT_INPUT.addEventListener("change", () => {
  if (!isSorting) {
    initialize();
  }
});

SPEED_INPUT.addEventListener("input", updateSpeed);

updateSpeed();
initialize();
