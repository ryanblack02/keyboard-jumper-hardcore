/* =========================
   WEAK WORD TRACKER
========================= */

export class WeakWordTracker {
  constructor() {
     this.storageKey = "keyboardJumperWeakWords";
     this.maxWords = 30;
     this.mistakes = {};
   
     this.load();
   }

   recordMistake(word, difficulty) {
     if (!this.mistakes[word]) {
       this.mistakes[word] = {
         difficulty: difficulty,
         mistakes: 0
       };
     }
   
     this.mistakes[word].mistakes++;
   
     const words = Object.entries(this.mistakes);
   
     if (words.length > this.maxWords) {
       words.sort((a, b) => a[1].mistakes - b[1].mistakes);
   
       const weakestWord = words[0][0];
   
       delete this.mistakes[weakestWord];
     }
   
     this.save();
   }

  getWeakestWords() {
    return Object.entries(this.mistakes)
      .sort((a, b) => b[1].mistakes - a[1].mistakes)
      .slice(0, 10);
  }

  load() {
    const savedWords = localStorage.getItem(this.storageKey);

    if (savedWords) {
      this.mistakes = JSON.parse(savedWords);
    }
  }

  save() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.mistakes)
    );
  }
}
