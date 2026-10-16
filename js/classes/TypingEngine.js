
/* =========================
   TYPING ENGINE
========================= */

export class TypingEngine {
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

      this.game.state.typed += e.key;

      this.handleInput(this.game.state.typed);
    });
  }

  handleInput(value) {
    const target = this.game.state.currentWord;

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
