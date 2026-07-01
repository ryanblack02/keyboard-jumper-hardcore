// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// PHASE 3 - NEON POLISH VERSION
// ===============================

// DOM elements
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

// Game state
let wordPools = null;
let currentWord = "";
let typed = "";
let gameOver = false;

// -------------------------------
// Load word database (JSON)
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
// Utility: pick random item
// -------------------------------
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------
// Get word by difficulty tier
// -------------------------------
function getRandomWord() {
    const roll = Math.random();

    if (roll < 0.65) {
        return pick(wordPools.easy);
    } 
    else if (roll < 0.90) {
        return pick(wordPools.medium);
    } 
    else {
        return pick(wordPools.boss);
    }
}

// -------------------------------
// Start / restart game
// -------------------------------
function startGame() {
    gameOver = false;
    typed = "";

    nextWord();

    statusEl.textContent = "Focus. One mistake ends everything.";
    inputEl.value = "";
    inputEl.focus();
}

// -------------------------------
// End game (hardcore mode)
// -------------------------------
function endGame() {
    gameOver = true;
    statusEl.textContent = "💀 SYSTEM FAILURE — Press Enter to restart";

    triggerShake();
}

// -------------------------------
// Screen shake effect
// -------------------------------
function triggerShake() {
    gameEl.classList.add("shake");

    setTimeout(() => {
        gameEl.classList.remove("shake");
    }, 300);
}

// -------------------------------
// Load next word
// -------------------------------
function nextWord() {
    currentWord = getRandomWord();
    typed = "";

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();
}

// -------------------------------
// Typing system (core gameplay)
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || !wordPools) return;

    typed = inputEl.value;

    // neon glow feedback
    wordEl.classList.add("glow");
    setTimeout(() => wordEl.classList.remove("glow"), 120);

    // fail condition
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // success condition
    if (typed === currentWord) {
        statusEl.textContent = "✔ PERFECT";

        setTimeout(nextWord, 180);
    }
});

// -------------------------------
// Restart system
// -------------------------------
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "Enter") {
        startGame();
    }
});
