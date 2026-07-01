// ===============================
// NEON TYPING TRAINER
// WITH SESSION REPORT SCREEN
// ===============================

// DOM
const wordEl = document.getElementById("word");
const inputEl = document.getElementById("input");
const statusEl = document.getElementById("status");

const reportEl = document.getElementById("report");
const reportStatsEl = document.getElementById("reportStats");
const reportWeakList = document.getElementById("reportWeakList");
const restartBtn = document.getElementById("restartBtn");

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

// DATA TRACKING
let wpmHistory = [];
let accHistory = [];

const wordStats = {};
let recentWords = [];

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
    recentWords = [];

    reportEl.classList.add("hidden");

    statusEl.textContent = "Training Session Active";
    inputEl.value = "";
    inputEl.focus();

    nextWord();
}

// ===============================
// WORD PICKER
// ===============================
function getWord() {
    const word = allWords[Math.floor(Math.random() * allWords.length)];
    return word;
}

// ===============================
function nextWord() {
    currentWord = getWord();
    typed = "";

    wordEl.textContent = currentWord;
    inputEl.value = "";
    inputEl.focus();

    updateStats();
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
// INPUT
// ===============================
inputEl.addEventListener("input", () => {
    if (gameOver) return;

    typed = inputEl.value;

    if (!currentWord.startsWith(typed)) {
        errorCount++;

        wordStats[currentWord] =
            (wordStats[currentWord] || 0) + 1;

        endSession();
        return;
    }

    if (typed === currentWord) {
        totalWords++;
        correctWords++;

        setTimeout(nextWord, 50);
    }

    updateStats();
});

// ===============================
// END SESSION → SHOW REPORT
// ===============================
function endSession() {
    gameOver = true;

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    const weakWords = Object.entries(wordStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // STATS TEXT
    reportStatsEl.textContent =
        `WPM: ${getWPM()} | ACC: ${getACC()}% | TIME: ${duration}s | ERR: ${errorCount}`;

    // WEAK WORDS LIST
    reportWeakList.innerHTML = "";
    weakWords.forEach(([word, count]) => {
        const li = document.createElement("li");
        li.textContent = `${word} (${count})`;
        reportWeakList.appendChild(li);
    });

    // SHOW REPORT
    reportEl.classList.remove("hidden");
}

// ===============================
// RESTART BUTTON
// ===============================
restartBtn.addEventListener("click", start);

// ===============================
function updateStats() {
    statusEl.textContent =
        `WPM: ${getWPM()} | ACC: ${getACC()}% | ERR: ${errorCount}`;
}
