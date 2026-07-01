// ===============================
// NEON TYPING TRAINER PRO SYSTEM
// WITH WEAK WORD DETECTOR + ANALYTICS
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

const wpmCanvas = document.getElementById("wpmChart");
const accCanvas = document.getElementById("accChart");

const weakListEl = document.getElementById("weakList");

const wpmCtx = wpmCanvas.getContext("2d");
const accCtx = accCanvas.getContext("2d");

// STATE
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;

// STATS
let startTime = Date.now();
let correctWords = 0;
let totalWords = 0;
let errorCount = 0;

// 📊 HISTORY
let wpmHistory = [];
let accHistory = [];
const MAX_POINTS = 30;

// 🧠 WEAK WORD TRACKING
const wordErrors = {}; // {word: mistakes}
let recentWords = [];
const RECENT_LIMIT = 20;

// -------------------------------
// LOAD WORDS
// -------------------------------
fetch("https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt")
    .then(res => res.text())
    .then(text => {
        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())
            .filter(w => /^[a-z]+$/.test(w));

        startGame();
    });

// -------------------------------
// START
// -------------------------------
function startGame() {
    gameOver = false;

    startTime = Date.now();
    correctWords = 0;
    totalWords = 0;
    errorCount = 0;

    wpmHistory = [];
    accHistory = [];
    recentWords = [];

    statusEl.textContent = "Pro Trainer Active — Build consistency";
    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// -------------------------------
// WORD PICKER (SMOOTH FLOW)
// -------------------------------
function getWord() {
    const slice = allWords;

    for (let i = 0; i < 20; i++) {
        const word = slice[Math.floor(Math.random() * slice.length)];

        if (!word) continue;
        if (recentWords.includes(word)) continue;

        recentWords.push(word);
        if (recentWords.length > RECENT_LIMIT) recentWords.shift();

        return word;
    }

    return "code";
}

// -------------------------------
// STATS
// -------------------------------
function getWPM() {
    const min = (Date.now() - startTime) / 60000;
    return min > 0 ? Math.round(correctWords / min) : 0;
}

function getACC() {
    return totalWords > 0
        ? Math.round((correctWords / totalWords) * 100)
        : 100;
}

// -------------------------------
// UPDATE DASHBOARD
// -------------------------------
function updateCharts() {
    const wpm = getWPM();
    const acc = getACC();

    wpmHistory.push(wpm);
    accHistory.push(acc);

    if (wpmHistory.length > MAX_POINTS) wpmHistory.shift();
    if (accHistory.length > MAX_POINTS) accHistory.shift();

    draw(wpmCtx, wpmHistory, "#00fff7");
    draw(accCtx, accHistory, "#ff00ff");

    updateWeakWords();
}

// -------------------------------
// DRAW LINE CHART
// -------------------------------
function draw(ctx, data, color) {
    const c = ctx.canvas;
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.strokeStyle = color;
    ctx.beginPath();

    const step = c.width / (data.length - 1 || 1);
    const max = Math.max(...data, 1);

    data.forEach((v, i) => {
        const x = i * step;
        const y = c.height - (v / max) * c.height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

// -------------------------------
// WEAK WORD DETECTOR (KEY FEATURE)
// -------------------------------
function updateWeakWords() {
    weakListEl.innerHTML = "";

    const sorted = Object.entries(wordErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    sorted.forEach(([word, count]) => {
        const li = document.createElement("li");
        li.textContent = `${word} (${count} mistakes)`;
        weakListEl.appendChild(li);
    });
}

// -------------------------------
// NEXT WORD
// -------------------------------
function nextWord() {
    currentWord = getWord();
    typed = "";

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    updateCharts();
}

// -------------------------------
// INPUT LOGIC
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver) return;

    typed = inputEl.value;

    // ERROR
    if (!currentWord.startsWith(typed)) {
        errorCount++;

        wordErrors[currentWord] =
            (wordErrors[currentWord] || 0) + 1;

        return;
    }

    // COMPLETE WORD
    if (typed === currentWord) {
        totalWords++;
        correctWords++;

        setTimeout(nextWord, 60);
    }

    updateCharts();
});
