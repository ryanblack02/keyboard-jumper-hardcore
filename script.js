// ===============================
// NEON TYPING HARDCORE
// PRO DASHBOARD ANALYTICS ENGINE
// ===============================

// DOM
const gameEl = document.getElementById("game");
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");
const modeEl = document.getElementById("mode");

const wpmCanvas = document.getElementById("wpmChart");
const accCanvas = document.getElementById("accChart");

const wpmCtx = wpmCanvas.getContext("2d");
const accCtx = accCanvas.getContext("2d");

// STATE
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;

// TRAINING STATS
let startTime = Date.now();
let correctWords = 0;
let totalWords = 0;
let errorCount = 0;

// 📊 DASHBOARD DATA (rolling history)
let wpmHistory = [];
let accHistory = [];
const MAX_POINTS = 30;

// ANTI-REPEAT MEMORY
let recentWords = [];
const RECENT_LIMIT = 20;

// -------------------------------
// AUDIO (light trainer style)
// -------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration = 0.03, volume = 0.02) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
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
fetch("https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt")
    .then(res => res.text())
    .then(text => {

        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())
            .filter(w =>
                /^[a-z]+$/.test(w) &&
                w.length >= 2 &&
                w.length <= 16
            );

        startSession();
    });

// -------------------------------
// START SESSION
// -------------------------------
function startSession() {
    gameOver = false;

    startTime = Date.now();
    correctWords = 0;
    totalWords = 0;
    errorCount = 0;

    wpmHistory = [];
    accHistory = [];

    recentWords = [];

    statusEl.textContent = "Pro Trainer Mode — Build smooth accuracy";
    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// -------------------------------
// END SESSION
// -------------------------------
function endSession() {
    gameOver = true;

    statusEl.textContent =
        `Session Complete — WPM: ${getWPM()} | ACC: ${getAccuracy()}% | ERR: ${errorCount} — Press Enter`;
}

// -------------------------------
// WORD PICKER
// -------------------------------
function getWord() {
    const mode = modeEl.value;
    const len = allWords.length;

    let start = 0;
    let end = len;

    if (mode === "casual") end = len * 0.3;
    else if (mode === "standard") {
        start = len * 0.1;
        end = len * 0.75;
    }
    else if (mode === "hardcore") {
        start = len * 0.3;
    }

    const slice = allWords.slice(start, end);

    for (let i = 0; i < 20; i++) {
        const word = slice[Math.floor(Math.random() * slice.length)];
        if (!word) continue;

        if (recentWords.includes(word)) continue;

        recentWords.push(word);
        if (recentWords.length > RECENT_LIMIT) recentWords.shift();

        return word;
    }

    return slice[0] || "code";
}

// -------------------------------
// STATS CALC
// -------------------------------
function getWPM() {
    const minutes = (Date.now() - startTime) / 60000;
    return minutes > 0 ? Math.round(correctWords / minutes) : 0;
}

function getAccuracy() {
    return totalWords > 0
        ? Math.round((correctWords / totalWords) * 100)
        : 100;
}

// -------------------------------
// DASHBOARD UPDATE (CORE FEATURE)
// -------------------------------
function updateDashboard() {
    const wpm = getWPM();
    const acc = getAccuracy();

    wpmHistory.push(wpm);
    accHistory.push(acc);

    if (wpmHistory.length > MAX_POINTS) wpmHistory.shift();
    if (accHistory.length > MAX_POINTS) accHistory.shift();

    drawChart(wpmCtx, wpmHistory, "#00fff7");
    drawChart(accCtx, accHistory, "#ff00ff");
}

// -------------------------------
// SIMPLE LINE CHART (NO LIBRARIES)
// -------------------------------
function drawChart(ctx, data, color) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    ctx.beginPath();

    const step = canvas.width / (data.length - 1 || 1);
    const max = Math.max(...data, 1);

    data.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / max) * canvas.height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
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

    updateDashboard();
}

// -------------------------------
// INPUT LOGIC
// -------------------------------
inputEl.addEventListener("input", () => {
    if (gameOver || allWords.length === 0) return;

    typed = inputEl.value;

    if (!currentWord.startsWith(typed)) {
        errorCount++;
        endSession();
        return;
    }

    if (typed === currentWord) {
        totalWords++;
        correctWords++;

        beep(200, 0.03, 0.02);

        setTimeout(nextWord, 80);
    }

    updateDashboard();
});

// -------------------------------
// RESTART
// -------------------------------
document.addEventListener("keydown", (e) => {
    if (gameOver && e.key === "Enter") {
        startSession();
    }
});
