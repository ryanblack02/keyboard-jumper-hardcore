
/* =========================
   RENDERER
========================= */

export class Renderer {
  constructor(game) {
    this.game = game;

    this.wordEl = document.getElementById("word");

    this.reportScreen = document.getElementById("reportScreen");
    this.gameContainer = document.getElementById("gameContainer");

    this.wpmEl = document.getElementById("wpm");
    this.accEl = document.getElementById("accuracy");
    this.timeEl = document.getElementById("time");
    this.wordsEl = document.getElementById("words");
    this.errEl = document.getElementById("errors");
    this.heightEl = document.getElementById("height");
    this.progressEl = document.getElementById("progressFill");

    this.finalWpmEl = document.getElementById("finalWpm");
    this.finalAccuracyEl = document.getElementById("finalAccuracy");
    this.finalTimeEl = document.getElementById("finalTime");
    this.finalWordsEl = document.getElementById("finalWords");
    this.finalHeightEl = document.getElementById("finalHeight");
    this.finalErrorsEl = document.getElementById("finalErrors");

    this.weakWordsListEl = document.getElementById("weakWordsList");
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
    this.heightEl.textContent = state.height + "m";
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

  renderReport() {
    const state = this.game.state;
    const stats = this.game.stats;

    this.finalWpmEl.textContent = stats.getWPM();
    this.finalAccuracyEl.textContent = stats.getAccuracy() + "%";
    this.finalTimeEl.textContent = stats.getTimeSeconds() + "s";
    this.finalWordsEl.textContent = state.wordsCompleted;
    this.finalHeightEl.textContent = state.height + "m";
    this.finalErrorsEl.textContent = state.errors;

    this.renderWeakWords();
  }

  renderWeakWords() {
    const weakWords = this.game.weakWords.getWeakestWords();

    this.weakWordsListEl.innerHTML = "";

    weakWords.forEach(([word, data]) => {
      const li = document.createElement("li");

      li.textContent =
        `${word} — ${data.difficulty} — ${data.mistakes} mistake(s)`;

      this.weakWordsListEl.appendChild(li);
    });
  }

  playJumpAnimation() {
    this.wordEl.classList.remove("jump");

    void this.wordEl.offsetWidth;

    this.wordEl.classList.add("jump");
  }

  showReport() {
    this.gameContainer.classList.add("hidden");
    this.reportScreen.classList.remove("hidden");
  }

  showGame() {
    this.reportScreen.classList.add("hidden");
    this.gameContainer.classList.remove("hidden");
  }
}
