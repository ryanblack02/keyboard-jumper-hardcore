// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// FINAL POLISHED WORD ENGINE (FIXED)
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");
const difficultyEl = document.getElementById("difficulty");
const modeEl = document.getElementById("mode");

// STATE
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;
let combo = 0;

// prevent immediate repetition (BIG FIX)
let lastWord = "";

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
// LOAD WORDS (CLEAN + SAFE)
// -------------------------------
fetch("https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt")
    .then(res => res.text())
    .then(text => {

        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())

            // HARD CLEANING (fixes "],", junk, symbols)
            .filter(w =>
                /^[a-z]+$/.test(w) &&
                w.length > 1 &&
                w.length < 20
            );

        console.log("Loaded words:", allWords.length);

        startGame();
    })
    .catch(err => {
        statusEl.textContent = "Failed to load word list";
        console.error(err);
    });

// -------------------------------
// START GAME
// -------------------------------
function startGame() {
    gameOver = false;
    combo = 0;
    typed = "";
    lastWord = "";

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
// WORD PICKER (FIXED + NO REPETITION + SMOOTH FLOW)
// -------------------------------
function getRandomWord() {
    const mode = modeEl.value;
    const difficulty = Number(difficultyEl.value);

    const len = allWords.length;

    let start = 0;
    let end = len;

    // MODE RANGE CONTROL
    if (mode === "casual") {
        start = 0;
        end = len * 0.25;
    } 
    else if (mode === "standard") {
        start = len * 0.1;
        end = len * 0.7;
    } 
    else if (mode === "hardcore") {
        start = len * 0.3;
        end = len;
    }

    const slice = allWords.slice(start, end);

    // SAFETY: avoid empty slices
    if (!slice.length) return allWords[0];

    // SMART RANDOM PICK (prevents repetition)
    for (let i = 0; i < 10; i++) {
        const word = slice[Math.floor(Math.random() * slice.length)];

        if (!word) continue;

        // prevent immediate repeat (BIG IMPROVEMENT)
        if (word === lastWord) continue;

        // difficulty filter
        if (difficulty === 1 && word.length > 6) continue;
        if (difficulty === 3 && word.length < 4) continue;

        lastWord = word;
        return word;
    }

    // fallback (safe, not biased like "code")
    return slice[Math.floor(Math.random() * slice.length)];
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

    statusEl.textContent =
        combo > 0 ? `Combo: ${combo}` : "Keep going...";
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
