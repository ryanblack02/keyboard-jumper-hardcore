// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// FINAL POLISH PASS (ULTIMATE)
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

// STATE
let wordPools = null;
let currentWord = "";
let typed = "";
let gameOver = false;
let combo = 0;

// -------------------------------
// AUDIO ENGINE (light + responsive)
// -------------------------------
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
// LOAD WORDS
// -------------------------------
fetch("words.json")
    .then(res => res.json())
    .then(data => {
        wordPools = data;
        startGame();
    })
    .catch(() => {
        statusEl.textContent = "Error loading word system";
    });

// -------------------------------
// UTIL
// -------------------------------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function isBoss(word) {
    return wordPools.boss.includes(word);
}

// -------------------------------
// WORD SYSTEM
// -------------------------------
function getRandomWord() {
    const roll = Math.random();

    if (roll < 0.65) return pick(wordPools.easy);
    if (roll < 0.90) return pick(wordPools.medium);
    return pick(wordPools.boss);
}

// -------------------------------
// GAME START
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
// VISUAL SHAKE
// -------------------------------
function shake() {
    gameEl.classList.add("shake");
    setTimeout(() => gameEl.classList.remove("shake"), 300);
}

// -------------------------------
// WORD TRANSITION FEEL
// -------------------------------
function flashWord() {
    wordEl.classList.add("glow");
    setTimeout(() => wordEl.classList.remove("glow"), 120);
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

    flashWord();

    if (isBoss(currentWord)) {
        statusEl.textContent = "⚠ BOSS WORD";
        beep(320, 0.08, 0.05);
    } else {
        statusEl.textContent = combo > 0 ? `Combo: ${combo}` : "Keep going...";
    }
}

// -------------------------------
// INPUT LOGIC
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || !wordPools) return;

    typed = inputEl.value;

    flashWord();

    // FAIL CONDITION
    if (!currentWord.startsWith(typed)) {
        endGame();
        return;
    }

    // SUCCESS CONDITION
    if (typed === currentWord) {
        combo++;

        const pitch = 180 + combo * 12;
        beep(pitch, 0.03, 0.03);

        statusEl.textContent = `✔ ${combo} combo`;

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
