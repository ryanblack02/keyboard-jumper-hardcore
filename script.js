// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// Phase 1 Complete Build
// ===============================

const wordPools = {
    easy: [
        "neon", "glow", "jump", "code", "react",
        "pulse", "game", "type", "arcade", "focus"
    ],

    medium: [
        "matrix", "vector", "cyber", "signal", "system",
        "object", "function", "variable", "module", "browser"
    ],

    boss: [
        "synchronization",
        "architecture",
        "implementation",
        "optimization",
        "configuration"
    ]
};

// DOM
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

// Game state
let currentWord = "";
let typed = "";
let gameOver = false;

// -------------------------------
// Pick word by difficulty tier
// -------------------------------
function getRandomWord() {
    const roll = Math.random();

    if (roll < 0.6) {
        return wordPools.easy[Math.floor(Math.random() * wordPools.easy.length)];
    } 
    else if (roll < 0.9) {
        return wordPools.medium[Math.floor(Math.random() * wordPools.medium.length)];
    } 
    else {
        return wordPools.boss[Math.floor(Math.random() * wordPools.boss.length)];
    }
}

// -------------------------------
// Start new game
// -------------------------------
function newGame() {
    gameOver = false;
    typed = "";
    currentWord = getRandomWord();

    wordEl.textContent = currentWord;
    statusEl.textContent = "Focus. One mistake ends everything.";
    inputEl.value = "";
    inputEl.focus();
}

// -------------------------------
// End game (ONE LIFE RULE)
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
    if (gameOver) return;

    typed = inputEl.value;

    // Instant fail if mismatch
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // Word completed
    if (typed === currentWord) {
        statusEl.textContent = "✔ Correct!";
        
        setTimeout(() => {
            nextWord();
        }, 250);
    }
});

// -------------------------------
// Restart after death
// -------------------------------
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "Enter") {
        newGame();
    }
});

// Start game
newGame();
