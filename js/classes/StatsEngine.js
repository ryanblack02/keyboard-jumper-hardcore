
/* =========================
   STATS ENGINE
========================= */

export class StatsEngine {
  constructor(state) {
    this.state = state;
  }

  getTimeSeconds() {
    if (!this.state.sessionStart) {
      return 0;
    }

    const endTime = this.state.sessionEnd ?? Date.now();

    return Math.floor(
      (endTime - this.state.sessionStart) / 1000
    );
  }

  getWPM() {
    const minutes = this.getTimeSeconds() / 60;

    if (minutes === 0) {
      return 0;
    }

    return Math.round(this.state.wordsCompleted / minutes);
  }

  getAccuracy() {
    const total = this.state.wordsCompleted + this.state.errors;

    if (total === 0) {
      return 100;
    }

    return Math.round(
      (this.state.wordsCompleted / total) * 100
    );
  }
}
