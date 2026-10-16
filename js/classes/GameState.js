
/* =========================
   GAME STATE
========================= */

export class GameState {
  constructor() {
    this.status = "idle";
    this.currentWord = "";
    this.currentWordDifficulty = "";
    this.typed = "";
    this.difficulty = "easy";

    this.sessionStart = null;
    this.sessionEnd = null;

    this.errors = 0;
    this.wordsCompleted = 0;
    this.height = 0;
  }

  reset() {
    this.status = "idle";
    this.currentWord = "";
    this.currentWordDifficulty = "";
    this.typed = "";

    this.sessionStart = null;
    this.sessionEnd = null;

    this.errors = 0;
    this.wordsCompleted = 0;
    this.height = 0;
  }
}
