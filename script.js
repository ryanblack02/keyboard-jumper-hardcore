// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// PHASE 2 - DATA DRIVEN ENGINE
// ===============================

// DOM elements
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
// Pick random word (tier system)
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

// helper
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------
// Start / restart game
// -------------------------------
function startGame() {
    gameOver = false;
    typed = "";
    nextWord();

    statusEl.textContent = "Focus. One mistake ends everything.";
    inputEl.focus();
}

// -------------------------------
// End game (hardcore mode)
// -------------------------------
function endGame() {
    gameOver = true;
    statusEl.textContent = "💀 GAME OVER — Press Enter to restart";
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
// Typing logic (core gameplay)
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || !wordPools) return;

    typed = inputEl.value;

    // instant fail
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // success
    if (typed === currentWord) {
        statusEl.textContent = "✔ Correct!";
        setTimeout(nextWord, 200);
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
