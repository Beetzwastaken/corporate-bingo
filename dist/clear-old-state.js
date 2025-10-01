// Migration script to fix FREE SPACE bug in cached state
// Run this once in browser console or add to index.html temporarily

(function() {
  try {
    // Clear only the game state, preserve stats
    const storageKey = 'bingo-game-storage';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data = JSON.parse(stored);
      console.log('[Migration] Found old game state, clearing to fix FREE SPACE bug');

      // Keep only the stats, clear the game state
      const newData = {
        state: {
          ...data.state,
          gameState: {
            board: [],
            markedSquares: Array(25).fill(false),
            hasWon: false,
            winningPattern: undefined,
            appliedBonuses: new Map()
          }
        },
        version: data.version
      };

      localStorage.setItem(storageKey, JSON.stringify(newData));
      console.log('[Migration] Game state cleared, stats preserved. Refresh the page.');
    }
  } catch (e) {
    console.error('[Migration] Failed:', e);
  }
})();
