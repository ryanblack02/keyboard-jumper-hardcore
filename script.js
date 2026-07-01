// ===============================
// NEON TYPING TRAINER
// OPTIMIZED SPACED REPETITION ENGINE (O(1)-STYLE)
// ===============================

// DOM
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");
const weakListEl = document.getElementById("weakList");

const wpmCanvas = document.getElementById("wpmChart");
const accCanvas = document.getElementById("accChart");

const wpmCtx = wpmCanvas.getContext("2d");
const accCtx = accCanvas.getContext("2d");

// ===============================
// STATE
// ===============================
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;

let tick = 0;

// stats
let startTime = Date.now();
let correctWords = 0;
let totalWords = 0;
let errorCount = 0;

// 📊 charts
let wpmHistory = [];
let accHistory = [];
const MAX_POINTS = 30;

// 🧠 OPTIMIZED SPACING SYSTEM
const scheduleMap = {}; // word -> next available tick
const dueWords = [];    // active queue (small, fast)

// weak tracking
const wordStats = {};

// ===============================
// LOAD WORDS
// ===============================
fetch("https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt")
    .then(r => r.text())
    .then(text => {

        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())
            .filter(w => /^[a-z]+$/.test(w));

        initSchedule();
        start();
    });

// ===============================
// INIT (CRITICAL OPTIMIZATION STEP)
// ===============================
function initSchedule() {
    for (let w of allWords) {
        scheduleMap[w] = 0; // all words available at start
    }
}

// ===============================
function start() {
    gameOver = false;
    tick = 0;

    startTime = Date.now();
    correctWords = 0;
    totalWords = 0;
    errorCount = 0;

    wpmHistory = [];
    accHistory = [];

    dueWords.length = 0;

    statusEl.textContent = "Optimized Training Mode — Scalable Engine Active";

    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// ===============================
// FAST QUEUE UPDATE (NO FULL SCAN)
// ===============================
function refreshDueQueue() {
    dueWords.length = 0;

    for (let i = 0; i < 200; i++) {
        const w = allWords[Math.floor(Math.random() * allWords.length)];

        if (scheduleMap[w] <= tick) {
            dueWords.push(w);
        }
    }

    if (dueWords.length === 0) {
        dueWords.push(allWords[Math.floor(Math.random() * allWords.length)]);
    }
}

// ===============================
// NEXT WORD (O(1)-STYLE PICK)
// ===============================
function nextWord() {
    tick++;

    refreshDueQueue();

    currentWord = dueWords[Math.floor(Math.random() * dueWords.length)];
    typed = "";

    // ensure stats exist
    if (!wordStats[currentWord]) {
        wordStats[currentWord] = { mistakes: 0, mastery: 0 };
    }

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    scheduleMap[currentWord] = tick + getInterval(currentWord);

    updateDashboard();
}

// ===============================
// SPACING LOGIC (FAST)
// ===============================
function getInterval(word) {
    const stats = wordStats[word];

    if (!stats) return 2;

    // mastery increases spacing
    return 2 + stats.mastery * 3 + stats.mistakes * 2;
}

// ===============================
// STATS
// ===============================
function getWPM() {
    const min = (Date.now() - startTime) / 60000;
    return min > 0 ? Math.round(correctWords / min) : 0;
}

function getACC() {
    return totalWords > 0
        ? Math.round((correctWords / totalWords) * 100)
        : 100;
}

// ===============================
// UPDATE DASHBOARD
// ===============================
function updateDashboard() {
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

// ===============================
// WEAK WORD DETECTOR (FAST)
// ===============================
function updateWeakWords() {
    weakListEl.innerHTML = "";

    const sorted = Object.entries(wordStats)
        .sort((a, b) => b[1].mistakes - a[1].mistakes)
        .slice(0, 6);

    for (let [word, data] of sorted) {
        const li = document.createElement("li");
        li.textContent = `${word} (M:${data.mistakes}, L:${data.mastery})`;
        weakListEl.appendChild(li);
    }
}

// ===============================
// DRAW CHART
// ===============================
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

// ===============================
// INPUT LOGIC
// ===============================
inputEl.addEventListener("input", () => {
    if (gameOver) return;

    typed = inputEl.value;

    if (!currentWord.startsWith(typed)) {
        errorCount++;

        wordStats[currentWord].mistakes++;

        return;
    }

    if (typed === currentWord) {
        totalWords++;
        correctWords++;

        wordStats[currentWord].mastery =
            Math.min(5, (wordStats[currentWord].mastery || 0) + 1);

        setTimeout(nextWord, 40);
    }

    updateDashboard();
});
