
/* =========================
   WORD MANAGER
========================= */

export class WordManager {
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
        this.index[w.difficulty].push(w);
      }

      this.index.all.push(w);
    }
  }

  getPool(difficulty) {
    return this.index[difficulty] || this.index.all;
  }

  getNextWord(difficulty) {
    const pool = this.getPool(difficulty);

    let selected;

    do {
      selected = pool[Math.floor(Math.random() * pool.length)];
    } while (this.recentWords.includes(selected.word));

    this.recentWords.push(selected.word);

    if (this.recentWords.length > this.maxHistory) {
      this.recentWords.shift();
    }

    return selected;
  }
}
