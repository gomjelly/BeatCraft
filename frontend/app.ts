const rows = ["C4", "D4", "E4", "G4", "A4"];
const columns = 16;
const tempo = { value: 100 };
let isPlaying = false;
let currentStep = 0;
let intervalId: number | null = null;

const activeGrid = Array.from({ length: rows.length }, () => Array(columns).fill(false));

const noteFrequencies: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
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

  for (let row = 0; row < rows.length; row += 1) {
    const note = rows[row];
    if (!activeGrid[row][currentStep]) continue;
    playTone(noteFrequencies[note], 0.2);
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

function playTone(frequency: number, duration: number) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.15;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function startPlayback() {
  if (intervalId !== null) return;
  const intervalMs = (60 / tempo.value) * 250;
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
}

function init() {
  createGrid();
  initControls();
  updatePlayButton();
}

window.addEventListener("DOMContentLoaded", init);
