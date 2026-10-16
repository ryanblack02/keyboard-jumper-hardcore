
/* =========================
   GAME ENTRY POINT
========================= */

import { Game } from "./Game.js";

fetch("words.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error("Failed to load words.json");
    }

    return res.json();
  })
  .then((words) => {
    console.log("Words loaded:", words.length);

    const game = new Game(words);

    // Keep a reference for debugging in the browser console.
    window.__game = game;

    game.init();
  })
  .catch((err) => {
    console.error("Game failed:", err);
    alert("Failed to load words.json — check console.");
  });
