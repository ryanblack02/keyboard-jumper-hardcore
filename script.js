// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// 10K WORD SYSTEM UPGRADE
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

// STATE
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;
let combo = 0;

// AUDIO
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration = 0.04, volume = 0.04) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// -------------------------------
// LOAD 10K WORD LIST
// -------------------------------
fetch("words.txt")
    .then(res => res.text())
    .then(text => {
        allWords = text
            .split("\n")
            .map(w => w.trim())
            .filter(w => w.length > 1);

        startGame();
    })
    .catch(err => {
        statusEl.textContent = "Failed to load words.txt";
        console.error(err);
    });

// -------------------------------
// PICK WORD (SMART FILTERING)
// -------------------------------
function getRandomWord() {
    let word = "";

    // try a few times to avoid empty junk
    for (let i = 0; i < 5; i++) {
        const candidate = allWords[Math.floor(Math.random() * allWords.length)];

        if (!candidate) continue;

        // lightweight difficulty feel
        if (combo < 10 && candidate.length <= 6) {
            word = candidate;
            break;
        }

        if (combo >= 10 && combo < 25 && candidate.length <= 10) {
            word = candidate;
            break;
        }

        if (combo >= 25) {
            word = candidate;
            break;
        }
    }

    return word || "code";
}

// -------------------------------
// START GAME
// -------------------------------
function startGame() {
    gameOver = false;
    combo = 0;
    typed = "";

    statusEl.textContent = "Focus. One mistake ends everything.";
    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// -------------------------------
// GAME OVER
// -------------------------------
function endGame() {
    gameOver = true;

    statusEl.textContent = `💀 SYSTEM FAILURE — Combo: ${combo} — Press Enter`;

    combo = 0;

    shake();
    beep(90, 0.2, 0.08);
}

// -------------------------------
// SHAKE EFFECT
// -------------------------------
function shake() {
    gameEl.classList.add("shake");
    setTimeout(() => gameEl.classList.remove("shake"), 300);
}

// -------------------------------
// NEXT WORD
// -------------------------------
function nextWord() {
    currentWord = getRandomWord();
    typed = "";

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    flash();

    statusEl.textContent = combo > 0 ? `Combo: ${combo}` : "Keep going...";
}

// -------------------------------
// VISUAL FEEDBACK
// -------------------------------
function flash() {
    wordEl.classList.add("glow");
    setTimeout(() => wordEl.classList.remove("glow"), 120);
}

// -------------------------------
// INPUT LOGIC
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || allWords.length === 0) return;

    typed = inputEl.value;

    flash();

    // FAIL
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // SUCCESS
    if (typed === currentWord) {
        combo++;

        const pitch = 180 + combo * 10;
        beep(pitch, 0.03, 0.03);

        setTimeout(nextWord, 120);
    }
});

// -------------------------------
// RESTART
// -------------------------------
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "Enter") {
        startGame();
    }
});
