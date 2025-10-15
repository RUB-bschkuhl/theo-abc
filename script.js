const allowedChars = [
  ..."abcdefghijklmnopqrstuvwxyz".split("").map((char) => char.toLowerCase()),
  ..."0123456789".split("")
];

const activeCharEl = document.getElementById("active-char");
const historyEl = document.getElementById("history");
const clearBtn = document.getElementById("clear-history");
const controlsGrid = document.getElementById("control-buttons");
const modeButtons = document.querySelectorAll(".mode-switch__button");
const confettiEl = document.getElementById("confetti");

const confettiColors = ["#ff7171", "#ffb347", "#5cd6ff", "#9d9cff", "#7bffb5"];

let mode = "explore";
let currentTarget = null;
let isAwaitingInput = false;
let nextPlayTimeout = null;

// Build control buttons for clicking interaction
allowedChars.forEach((char) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.dataset.char = char;
  btn.textContent = char.toUpperCase();
  btn.addEventListener("click", () => handleInput(char));
  controlsGrid.appendChild(btn);
});

function handleInput(char) {
  if (!allowedChars.includes(char)) {
    return;
  }

  if (mode === "explore") {
    renderActiveChar(char);
    appendToHistory(char);
    playAudio(char);
    return;
  }

  if (mode === "play") {
    if (!isAwaitingInput || !currentTarget) {
      return;
    }

    if (char !== currentTarget) {
      return;
    }

    isAwaitingInput = false;
    renderActiveChar(char);
    appendToHistory(char);
    triggerConfetti();

    window.clearTimeout(nextPlayTimeout);
    nextPlayTimeout = window.setTimeout(() => {
      startPlayRound();
    }, 1400);
  }
}

function renderActiveChar(char) {
  activeCharEl.textContent = char.toUpperCase();
  activeCharEl.classList.add("display__char--active");
  window.requestAnimationFrame(() => {
    activeCharEl.classList.remove("display__char--active");
  });
}

function appendToHistory(char) {
  const item = document.createElement("span");
  item.className = "history__item";
  item.textContent = char.toUpperCase();
  historyEl.appendChild(item);
}

function playAudio(char) {
  const audioPath = `audio/${char.toLowerCase()}.mp3`;
  const audio = new Audio(audioPath);
  audio.play().catch((error) => {
    console.warn(`Konnte Audiodatei für ${char} nicht abspielen:`, error);
  });
}

function clearHistory() {
  historyEl.innerHTML = "";
}

function triggerConfetti() {
  if (!confettiEl) {
    return;
  }

  confettiEl.innerHTML = "";
  confettiEl.classList.add("confetti--visible");

  const pieceCount = 70;

  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti__piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[i % confettiColors.length];
    piece.style.setProperty("--confetti-end-x", `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty("--confetti-rotation", `${(Math.random() - 0.5) * 1440}deg`);
    piece.style.setProperty("--confetti-duration", `${0.9 + Math.random() * 0.7}s`);
    confettiEl.appendChild(piece);
  }

  window.setTimeout(() => {
    confettiEl.classList.remove("confetti--visible");
    confettiEl.innerHTML = "";
  }, 1200);
}

function startPlayRound() {
  window.clearTimeout(nextPlayTimeout);
  currentTarget = pickRandomChar(currentTarget);
  isAwaitingInput = true;
  activeCharEl.textContent = "";
  playAudio(currentTarget);
}

function pickRandomChar(lastChar) {
  if (allowedChars.length <= 1) {
    return allowedChars[0];
  }

  let candidate = allowedChars[Math.floor(Math.random() * allowedChars.length)];

  while (candidate === lastChar) {
    candidate = allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }

  return candidate;
}

function setMode(newMode) {
  if (mode === newMode) {
    return;
  }

  mode = newMode;
  modeButtons.forEach((button) => {
    const buttonMode = button.dataset.mode;
    button.classList.toggle("mode-switch__button--active", buttonMode === mode);
  });

  window.clearTimeout(nextPlayTimeout);
  isAwaitingInput = false;
  currentTarget = null;

  if (mode === "play") {
    activeCharEl.textContent = "";
    historyEl.innerHTML = "";
    startPlayRound();
  }
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const newMode = button.dataset.mode;
    setMode(newMode);
  });
});

// Keyboard input support
window.addEventListener("keydown", (event) => {
  const pressed = event.key.toLowerCase();
  if (allowedChars.includes(pressed)) {
    event.preventDefault();
    handleInput(pressed);
  }
});

clearBtn.addEventListener("click", clearHistory);


