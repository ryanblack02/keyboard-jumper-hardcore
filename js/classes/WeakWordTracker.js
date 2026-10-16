
/* =========================
   WEAK WORD TRACKER
========================= */

export class WeakWordTracker {
  constructor() {
    this.mistakes = {};
  }

  recordMistake(word, difficulty) {
    if (!this.mistakes[word]) {
      this.mistakes[word] = {
        difficulty: difficulty,
        mistakes: 0
      };
    }

    this.mistakes[word].mistakes++;
  }

  getWeakestWords() {
    return Object.entries(this.mistakes)
      .sort((a, b) => b[1].mistakes - a[1].mistakes)
      .slice(0, 10);
  }
}
