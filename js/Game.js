
/* =========================
   GAME CONTROLLER
========================= */

import { GameState } from "./classes/GameState.js";
import { WordManager } from "./classes/WordManager.js";
import { TypingEngine } from "./classes/TypingEngine.js";
import { StatsEngine } from "./classes/StatsEngine.js";
import { WeakWordTracker } from "./classes/WeakWordTracker.js";
import { Renderer } from "./classes/Renderer.js";

export class Game {
  constructor(words) {
    this.state = new GameState();
    this.wordManager = new WordManager(words);
    this.stats = new StatsEngine(this.state);
    this.weakWords = new WeakWordTracker();
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

    this.renderer.showGame();

    this.state.status = "running";
    this.state.sessionStart = Date.now();

    this.nextWord();

    this.renderer.render();
  }

  restart() {
    this.start();
  }

  nextWord() {
    const selected = this.wordManager.getNextWord(this.state.difficulty);

    this.state.currentWord = selected.word;
    this.state.currentWordDifficulty = selected.difficulty;
    this.state.typed = "";
  }

  completeWord() {
    this.state.wordsCompleted++;
    this.state.height++;
    this.state.typed = "";

    this.renderer.playJumpAnimation();

    setTimeout(() => {
      this.nextWord();
      this.renderer.render();
    }, 350);
  }

  fail() {
    this.state.errors++;

    this.weakWords.recordMistake(
      this.state.currentWord,
      this.state.currentWordDifficulty
    );

    this.state.status = "gameover";

    this.endGame();
  }

  endGame() {
    this.state.sessionEnd = Date.now();

    this.renderer.renderReport();
    this.renderer.showReport();
  }

  loop() {
    setInterval(() => {
      this.renderer.render();
    }, 50);
  }
}
