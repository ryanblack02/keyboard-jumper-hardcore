// ===============================
// NEON HARDCORE KEYBOARD JUMPER
// FINAL REMOTE WORD ENGINE + QUALITY UPGRADE
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
let usedWords = new Set();
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
// LOAD WORDS (REMOTE)
// -------------------------------
fetch("https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt")
    .then(res => res.text())
    .then(text => {
        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 1 && /^[a-z]+$/.test(w)); // QUALITY FILTER

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
    usedWords.clear();

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
// WORD PICKER (IMPROVED QUALITY SYSTEM)
// -------------------------------
function getRandomWord() {
    const mode = modeEl.value;
    const difficulty = Number(difficultyEl.value);

    const len = allWords.length;

    let start = 0;
    let end = len;

    // MODE determines word frequency range
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
    else if (mode === "chaos") {
        start = 0;
        end = len;
    }

    // attempt to find unused word
    for (let i = 0; i < 10; i++) {
        const index = Math.floor(start + Math.random() * (end - start));
        let word = allWords[index];

        if (!word) continue;

        // prevent repeats in a session
        if (usedWords.has(word)) continue;

        // difficulty filtering
        if (difficulty === 1 && word.length > 6) continue;
        if (difficulty === 3 && word.length < 4) continue;

        usedWords.add(word);
        return word;
    }

    // fallback safety
    return "code";
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
