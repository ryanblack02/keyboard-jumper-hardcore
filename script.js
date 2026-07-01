// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// ARCADE LEVEL 2 (FINAL UPGRADE)
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

// Game state
let wordPools = null;
let currentWord = "";
let typed = "";
let gameOver = false;

// combo system (SESSION ONLY)
let combo = 0;

// -------------------------------
// AUDIO (no files needed)
// -------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration = 0.05, volume = 0.05) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// -------------------------------
// Load words.json
// -------------------------------
fetch("words.json")
    .then(res => res.json())
    .then(data => {
        wordPools = data;
        startGame();
    })
    .catch(err => {
        statusEl.textContent = "Failed to load words.json";
        console.error(err);
    });

// -------------------------------
// Utility
// -------------------------------
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------
// Word system
// -------------------------------
function getRandomWord() {
    const roll = Math.random();

    if (roll < 0.65) return pick(wordPools.easy);
    if (roll < 0.90) return pick(wordPools.medium);
    return pick(wordPools.boss);
}

// detect boss word
function isBossWord(word) {
    return wordPools.boss.includes(word);
}

// -------------------------------
// Game start
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
// End game
// -------------------------------
function endGame() {
    gameOver = true;
    statusEl.textContent = `💀 SYSTEM FAILURE — Combo: ${combo} — Press Enter`;

    combo = 0;

    triggerShake();
    beep(120, 0.2, 0.1); // death sound
}

// -------------------------------
// Screen shake
// -------------------------------
function triggerShake() {
    gameEl.classList.add("shake");

    setTimeout(() => {
        gameEl.classList.remove("shake");
    }, 300);
}

// -------------------------------
// Next word
// -------------------------------
function nextWord() {
    currentWord = getRandomWord();
    typed = "";

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    // boss warning effect
    if (isBossWord(currentWord)) {
        statusEl.textContent = "⚠ BOSS WORD DETECTED";
        beep(300, 0.08, 0.04);
    } else {
        statusEl.textContent = "Keep going...";
    }
}

// -------------------------------
// Typing logic
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || !wordPools) return;

    typed = inputEl.value;

    // glow feedback
    wordEl.classList.add("glow");
    setTimeout(() => wordEl.classList.remove("glow"), 120);

    // FAIL
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // SUCCESS
    if (typed === currentWord) {
        combo++;

        // combo feedback intensity
        const pitch = 200 + combo * 15;
        beep(pitch, 0.05, 0.03);

        statusEl.textContent = `✔ ${combo} combo!`;

        setTimeout(nextWord, 150);
    }
});

// -------------------------------
// Restart
// -------------------------------
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "Enter") {
        startGame();
    }
});
