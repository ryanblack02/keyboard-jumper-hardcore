
/* =========================
   PERSISTENT STATS
========================= */

export class PersistentStats {
  constructor() {
    this.storageKey = "keyboardJumperStats";

    this.records = {
      personalBestWPM: 0,
      highestHeight: 0,
      lifetimeWordsCompleted: 0,
      longestRun: 0
    };
  }

  load() {
    const savedStats = localStorage.getItem(this.storageKey);

    if (savedStats) {
      this.records = {
        ...this.records,
        ...JSON.parse(savedStats)
      };
    }
  }

  save() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.records)
    );
  }
}
