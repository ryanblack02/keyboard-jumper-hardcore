"use strict";

/* =========================
   GAME STATE
========================= */
class GameState {
  constructor() {
    this.status = "idle"; // idle | running | gameover
    this.currentWord = "";
    this.typed = "";
    this.difficulty = "easy";

    this.sessionStart = null;

    this.errors = 0;
    this.wordsCompleted = 0;
  }

  reset() {
    this.status = "idle";
    this.currentWord = "";
    this.typed = "";
    this.sessionStart = null;
    this.errors = 0;
    this.wordsCompleted = 0;
  }
}

/* =========================
   WORD MANAGER
========================= */
class WordManager {
  constructor(words) {
    this.words = words;

    this.index = {
      easy: [],
      medium: [],
      hard: [],
      all: []
    };

    this.recentWords = [];
    this.maxHistory = 20;
  }

  init() {
    for (const w of this.words) {
      this.index[w.difficulty].push(w.word);
      this.index.all.push(w.word);
    }
  }

  getPool(difficulty) {
    return this.index[difficulty] || this.index.all;
  }

  getNextWord(difficulty) {
    const pool = this.getPool(difficulty);

    let word;

    do {
      word = pool[Math.floor(Math.random() * pool.length)];
    } while (this.recentWords.includes(word));

    this.recentWords.push(word);

    if (this.recentWords.length > this.maxHistory) {
      this.recentWords.shift();
    }

    return word;
  }
}

/* =========================
   TYPING ENGINE
========================= */
class TypingEngine {
  constructor(game) {
    this.game = game;
    this.input = document.getElementById("hiddenInput");
  }

  init() {
    this.input.addEventListener("input", (e) => {
      this.handleInput(e.target.value);
    });

    window.addEventListener("keydown", () => {
      if (this.game.state.status === "running") {
        this.input.focus();
      }
    });
  }

  handleInput(value) {
    const target = this.game.state.currentWord;

    // store typed value
    this.game.state.typed = value;

    // HARDCORE RULE: instant fail on mismatch
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== target[i]) {
        this.game.fail();
        return;
      }
    }

    // word completed
    if (value === target) {
      this.game.completeWord();
      this.input.value = "";
    }
  }
}

/* =========================
   STATS ENGINE
========================= */
class StatsEngine {
  constructor(state) {
    this.state = state;
  }

  getTimeSeconds() {
    if (!this.state.sessionStart) return 0;
    return Math.floor((Date.now() - this.state.sessionStart) / 1000);
  }

  getWPM() {
    const minutes = this.getTimeSeconds() / 60;
    if (minutes === 0) return 0;
    return Math.round(this.state.wordsCompleted / minutes);
  }

  getAccuracy() {
    const total =
      this.state.wordsCompleted + this.state.errors;

    if (total === 0) return 100;
    return Math.round((this.state.wordsCompleted / total) * 100);
  }
}

/* =========================
   RENDERER
========================= */
class Renderer {
  constructor(game) {
    this.game = game;

    this.wordEl = document.getElementById("word");

    this.wpmEl = document.getElementById("wpm");
    this.accEl = document.getElementById("accuracy");
    this.timeEl = document.getElementById("time");
    this.wordsEl = document.getElementById("words");
    this.errEl = document.getElementById("errors");
  }

  render() {
    const state = this.game.state;
    const stats = this.game.stats;

    // word display
    this.wordEl.textContent = state.currentWord;

    // dashboard
    this.wpmEl.textContent = stats.getWPM();
    this.accEl.textContent = stats.getAccuracy() + "%";
    this.timeEl.textContent = stats.getTimeSeconds() + "s";
    this.wordsEl.textContent = state.wordsCompleted;
    this.errEl.textContent = state.errors;
  }
}

/* =========================
   MAIN GAME CONTROLLER
========================= */
class Game {
  constructor(words) {
    this.state = new GameState();
    this.wordManager = new WordManager(words);
    this.stats = new StatsEngine(this.state);
    this.renderer = new Renderer(this);
    this.typing = new TypingEngine(this);
  }

  init() {
    this.wordManager.init();
    this.typing.init();

    document
      .getElementById("startBtn")
      .addEventListener("click", () => this.start());

    document
      .getElementById("restartBtn")
      .addEventListener("click", () => this.restart());

    this.loop();
  }

  start() {
    this.state.status = "running";
    this.state.sessionStart = Date.now();

    this.nextWord();
  }

  restart() {
    this.state.reset();
    this.start();
  }

  nextWord() {
    const word = this.wordManager.getNextWord(this.state.difficulty);

    this.state.currentWord = word;
    this.state.typed = "";
  }

  completeWord() {
    this.state.wordsCompleted++;
    this.nextWord();
  }

  fail() {
    this.state.errors++;
    this.state.status = "gameover";

    alert("Game Over!");
    this.state.reset();
  }

  loop() {
    setInterval(() => {
      this.renderer.render();
    }, 50);
  }
}

/* =========================
   BOOTSTRAP
========================= */
fetch("words.json")
  .then(res => res.json())
  .then(words => {
    const game = new Game(words);
    game.init();
  });
