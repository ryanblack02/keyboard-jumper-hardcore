"use strict";

/* =========================
   GAME STATE
========================= */
class GameState {
  constructor() {
    this.status = "idle";
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
      if (this.index[w.difficulty]) {
        this.index[w.difficulty].push(w.word);
      }
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
  }

  init() {
    window.addEventListener("keydown", (e) => {
      if (this.game.state.status !== "running") {
        return;
      }

      // Ignore special keys
      if (e.key.length !== 1) {
        return;
      }

      this.typed += e.key;

      this.handleInput(this.typed);
    });
  }

  handleInput(value) {
    const target = this.game.state.currentWord;

    console.log("Typed:", value);
    console.log("Target:", target);

    this.game.state.typed = value;

    for (let i = 0; i < value.length; i++) {
      if (value[i] !== target[i]) {
        this.game.fail();
        return;
      }
    }

    if (value === target) {
  this.game.completeWord();
}
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
    const total = this.state.wordsCompleted + this.state.errors;
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
     
     this.progressEl = document.getElementById("progressFill");
  }

  render() {
  const state = this.game.state;
  const stats = this.game.stats;

  this.renderWord(state.currentWord, state.typed);
  this.renderProgress(state.currentWord, state.typed);

  this.wpmEl.textContent = stats.getWPM();
  this.accEl.textContent = stats.getAccuracy() + "%";
  this.timeEl.textContent = stats.getTimeSeconds() + "s";
  this.wordsEl.textContent = state.wordsCompleted;
  this.errEl.textContent = state.errors;
}
renderWord(word, typed) {
  if (!word) {
    this.wordEl.textContent = "";
    return;
  }

  this.wordEl.innerHTML = "";

  [...word].forEach((letter, index) => {
    const span = document.createElement("span");

    span.textContent = letter;

    if (index < typed.length) {
      if (typed[index] === letter) {
        span.classList.add("correct");
      } else {
        span.classList.add("wrong");
      }
    } else if (index === typed.length) {
      span.classList.add("current");
    }

    this.wordEl.appendChild(span);
  });
}

renderProgress(word, typed) {
  if (!word || word.length === 0) {
    this.progressEl.style.width = "0%";
    return;
  }

  const percent = (typed.length / word.length) * 100;
  this.progressEl.style.width = `${percent}%`;
}

}

playJumpAnimation() {
  this.wordEl.classList.remove("jump");

  // Force browser to restart animation
  void this.wordEl.offsetWidth;

  this.wordEl.classList.add("jump");
}

/* =========================
   GAME CONTROLLER
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

    const difficultySelect = document.getElementById("difficultySelect");

    difficultySelect.addEventListener("change", (e) => {
      this.state.difficulty = e.target.value;
    });

    document.getElementById("startBtn")
      .addEventListener("click", () => this.start());

    document.getElementById("restartBtn")
      .addEventListener("click", () => this.restart());

    this.loop();
  }

  start() {
    this.state.reset();

    this.state.status = "running";
    this.state.sessionStart = Date.now();

    this.nextWord();

    this.renderer.render();
  }

  restart() {
    this.start();
  }

  nextWord() {
    const word = this.wordManager.getNextWord(this.state.difficulty);

    this.state.currentWord = word;
    this.state.typed = "";
  }

  completeWord() {
  this.state.wordsCompleted++;
  this.state.typed = "";

  this.renderer.playJumpAnimation();

  setTimeout(() => {
    this.nextWord();
  }, 350);
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
  .then(res => {
    if (!res.ok) throw new Error("Failed to load words.json");
    return res.json();
  })
  .then(words => {
    console.log("Words loaded:", words.length);

    const game = new Game(words);
    window.__game = game;

    game.init();
  })
  .catch(err => {
    console.error("Game failed:", err);
    alert("Failed to load words.json — check console.");
  });
