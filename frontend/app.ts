const rows = [
  "C6",
  "B5",
  "A5",
  "G5",
  "F5",
  "E5",
  "D5",
  "C5",
  "B4",
  "A4",
  "G4",
  "F4",
  "E4",
  "D4",
  "C4",
];
const columns = 16;
const tempo = { value: 100 };
let isPlaying = false;
let currentStep = 0;
let intervalId: number | null = null;

const activeGrid = Array.from({ length: rows.length }, () => Array(columns).fill(false));

const noteFrequencies: Record<string, number> = {
  C6: 1046.5,
  B5: 987.77,
  A5: 880.0,
  G5: 783.99,
  F5: 698.46,
  E5: 659.26,
  D5: 587.33,
  C5: 523.25,
  B4: 493.88,
  A4: 440.0,
  G4: 392.0,
  F4: 349.23,
  E4: 329.63,
  D4: 293.66,
  C4: 261.63,
};

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

function createGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  rows.forEach((note, rowIndex) => {
    const row = document.createElement("div");
    row.className = "grid-row";

    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent = note;
    row.appendChild(label);

    for (let col = 0; col < columns; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "grid-cell";
      cell.dataset.row = String(rowIndex);
      cell.dataset.col = String(col);
      cell.addEventListener("click", () => toggleCell(rowIndex, col, cell));
      row.appendChild(cell);
    }

    grid.appendChild(row);
  });
}

function toggleCell(row: number, col: number, cell: HTMLButtonElement) {
  activeGrid[row][col] = !activeGrid[row][col];
  cell.classList.toggle("active", activeGrid[row][col]);
}

function scheduleStep() {
  const stepLabel = document.getElementById("step");
  if (stepLabel) stepLabel.textContent = String(currentStep + 1);

  const instrument = (document.getElementById("instrument") as HTMLSelectElement | null)?.value || "sine";
  for (let row = 0; row < rows.length; row += 1) {
    const note = rows[row];
    if (!activeGrid[row][currentStep]) continue;
    playTone(noteFrequencies[note], 0.18, instrument);
  }

  highlightColumn(currentStep);
  currentStep = (currentStep + 1) % columns;
}

function highlightColumn(col: number) {
  document.querySelectorAll(".grid-row").forEach((rowEl, rowIndex) => {
    rowEl.querySelectorAll<HTMLButtonElement>(".grid-cell").forEach((cell, index) => {
      cell.classList.toggle("playing", index === col);
    });
  });
}

function playTone(frequency: number, duration: number, instrument = "sine") {
  if (instrument === "noise") {
    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = audioContext.createBufferSource();
    src.buffer = buffer;
    const g = audioContext.createGain();
    g.gain.value = 0.25;
    src.connect(g);
    g.connect(audioContext.destination);
    src.start();
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = instrument as OscillatorType;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.15;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function startPlayback() {
  if (intervalId !== null) return;
  const intervalMs = (60 / tempo.value) * 1000 / 4; // 16th notes
  intervalId = window.setInterval(scheduleStep, intervalMs);
  isPlaying = true;
  updatePlayButton();
}

function stopPlayback() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
  isPlaying = false;
  currentStep = 0;
  highlightColumn(-1);
  updatePlayButton();
}

function togglePlayback() {
  if (isPlaying) {
    stopPlayback();
  } else {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    startPlayback();
  }
}

function updatePlayButton() {
  const button = document.getElementById("play-button");
  if (!button) return;
  button.textContent = isPlaying ? "Stop" : "Play";
}

function initControls() {
  const playButton = document.getElementById("play-button");
  const tempoSlider = document.getElementById("tempo") as HTMLInputElement | null;
  const tempoValue = document.getElementById("tempo-value");

  if (playButton) playButton.addEventListener("click", togglePlayback);
  if (tempoSlider) {
    tempoSlider.value = String(tempo.value);
    tempoSlider.addEventListener("input", () => {
      tempo.value = Number(tempoSlider.value);
      if (tempoValue) tempoValue.textContent = `${tempo.value} BPM`;
      if (isPlaying) {
        stopPlayback();
        startPlayback();
      }
    });
  }

  const saveBtn = document.getElementById("save-pattern");
  const loadBtn = document.getElementById("load-pattern");
  const clearBtn = document.getElementById("clear-pattern");

  if (saveBtn) saveBtn.addEventListener("click", () => {
    const name = prompt("Pattern name", `pattern-${new Date().toISOString()}`);
    if (!name) return;
    savePattern(name);
    alert("Saved pattern: " + name);
  });

  if (loadBtn) loadBtn.addEventListener("click", () => {
    const saved = listPatterns();
    if (!saved.length) {
      alert("No saved patterns");
      return;
    }
    const name = prompt("Load pattern name:\n" + saved.join("\n"), saved[0]);
    if (!name) return;
    loadPattern(name);
  });

  if (clearBtn) clearBtn.addEventListener("click", () => {
    if (!confirm("Clear the grid?")) return;
    for (let r = 0; r < rows.length; r++) activeGrid[r].fill(false);
    document.querySelectorAll<HTMLButtonElement>(".grid-cell").forEach(c => c.classList.remove("active"));
  });
}

function savePattern(name: string) {
  const payload = { rows, columns, grid: activeGrid, tempo: tempo.value };
  const patterns = JSON.parse(localStorage.getItem("beatcraft.patterns") || "{}");
  patterns[name] = payload;
  localStorage.setItem("beatcraft.patterns", JSON.stringify(patterns));
}

function listPatterns(): string[] {
  const patterns = JSON.parse(localStorage.getItem("beatcraft.patterns") || "{}");
  return Object.keys(patterns);
}

function loadPattern(name: string) {
  const patterns = JSON.parse(localStorage.getItem("beatcraft.patterns") || "{}");
  const p = patterns[name];
  if (!p) return alert("Pattern not found: " + name);
  // ensure grid shape
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < columns; c++) {
      activeGrid[r][c] = !!(p.grid && p.grid[r] && p.grid[r][c]);
    }
  }
  document.querySelectorAll<HTMLButtonElement>(".grid-cell").forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    cell.classList.toggle("active", activeGrid[r][c]);
  });
  if (p.tempo) {
    tempo.value = p.tempo;
    const tempoSlider = document.getElementById("tempo") as HTMLInputElement | null;
    const tempoValue = document.getElementById("tempo-value");
    if (tempoSlider) tempoSlider.value = String(tempo.value);
    if (tempoValue) tempoValue.textContent = `${tempo.value} BPM`;
  }
}

function init() {
  createGrid();
  initControls();
  updatePlayButton();
}

window.addEventListener("DOMContentLoaded", init);
