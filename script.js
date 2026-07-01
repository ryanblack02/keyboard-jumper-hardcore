// ===============================
// NEON TYPING TRAINER
// SPACED REPETITION SYSTEM (DUOLINGO STYLE)
// ===============================

// DOM
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

const wpmCanvas = document.getElementById("wpmChart");
const accCanvas = document.getElementById("accChart");
const weakListEl = document.getElementById("weakList");

const wpmCtx = wpmCanvas.getContext("2d");
const accCtx = accCanvas.getContext("2d");

// ===============================
// STATE
// ===============================
let allWords = [];
let currentWord = "";
let typed = "";
let gameOver = false;

let startTime = Date.now();

let correctWords = 0;
let totalWords = 0;
let errorCount = 0;

// 📊 analytics
let wpmHistory = [];
let accHistory = [];
const MAX_POINTS = 30;

// 🧠 SPACED REPETITION MEMORY
const wordData = {};
let sessionTick = 0;

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

        start();
    });

// ===============================
function start() {
    gameOver = false;

    startTime = Date.now();
    correctWords = 0;
    totalWords = 0;
    errorCount = 0;

    wpmHistory = [];
    accHistory = [];

    sessionTick = 0;

    statusEl.textContent = "Spaced Repetition Mode — Training memory system active";
    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// ===============================
// INIT WORD DATA
// ===============================
function initWord(word) {
    if (!wordData[word]) {
        wordData[word] = {
            interval: 1,     // when it should reappear
            ease: 2.5,       // difficulty modifier
            lastSeen: 0,
            mistakes: 0,
            mastery: 0       // 0–5
        };
    }
}

// ===============================
// SCHEDULER (SPACED REPETITION ENGINE)
// ===============================
function getNextWord() {

    let candidates = [];

    for (let word of allWords) {
        initWord(word);

        const data = wordData[word];

        // eligible if due OR never seen
        if (sessionTick >= data.lastSeen + data.interval) {
            const weight = 1 + data.mistakes * 2 + (5 - data.mastery);

            const count = Math.min(Math.floor(weight), 6);

            for (let i = 0; i < count; i++) {
                candidates.push(word);
            }
        }
    }

    // fallback safety
    if (candidates.length === 0) {
        return allWords[Math.floor(Math.random() * allWords.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}

// ===============================
// NEXT WORD
// ===============================
function nextWord() {
    sessionTick++;

    currentWord = getNextWord();
    typed = "";

    initWord(currentWord);
    wordData[currentWord].lastSeen = sessionTick;

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    updateDashboard();
}

// ===============================
// UPDATE WORD LEARNING STATE
// ===============================
function markCorrect(word) {
    const d = wordData[word];

    d.mastery = Math.min(5, d.mastery + 1);
    d.ease = Math.min(3.0, d.ease + 0.1);

    // increase spacing (longer delay next time)
    d.interval = Math.floor(d.interval * d.ease);
}

function markWrong(word) {
    const d = wordData[word];

    d.mistakes++;
    d.mastery = Math.max(0, d.mastery - 1);

    // bring it back FAST
    d.interval = 1;
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
// DASHBOARD
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
// WEAK WORD LIST
// ===============================
function updateWeakWords() {
    weakListEl.innerHTML = "";

    const weak = Object.entries(wordData)
        .sort((a, b) => b[1].mistakes - a[1].mistakes)
        .slice(0, 6);

    for (let [word, data] of weak) {
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

    // ❌ mistake
    if (!currentWord.startsWith(typed)) {
        errorCount++;

        markWrong(currentWord);

        return;
    }

    // ✅ complete word
    if (typed === currentWord) {
        totalWords++;
        correctWords++;

        markCorrect(currentWord);

        setTimeout(nextWord, 40);
    }

    updateDashboard();
});
