# Phase 4: Room-Wide Board Reset After BINGO

## Overview

When a player achieves BINGO in a multiplayer room, all players should receive fresh boards for a new round while maintaining their cumulative scores.

## Current Behavior (Problem)

- Player gets BINGO → `player_won` message broadcast
- Winner's board resets via BingoModal "Play Again" button
- **Other players' boards remain unchanged** (can continue marking)
- **No synchronized reset** across the room
- Creates unfair advantage for non-winners with partially marked boards

## Desired Behavior (Solution)

1. Player achieves BINGO → `player_won` broadcast
2. Winner sees modal (3 seconds) then board auto-resets
3. **All other players** get fresh boards simultaneously
4. **Scores preserved** across reset
5. Toast notification: "[Winner] won with [Score] points! New round starting..."

## Implementation Plan

### Backend Changes (worker.js)

**Step 4A: Add `resetRoomBoards()` method**
```javascript
async resetRoomBoards(winnerPlayer) {
  // Generate new boards for all players
  for (const player of this.room.players) {
    player.markedSquares.clear();
    // Scores are preserved (not modified)
  }

  // Broadcast reset to all players
  this.broadcastToRoom({
    type: 'board_reset',
    winner: { id: winnerPlayer.id, name: winnerPlayer.name },
    finalScore: winnerPlayer.score,
    timestamp: Date.now()
  });

  await this.state.storage.put('room', this.room);
}
```

**Step 4B: Trigger reset after BINGO**
- After broadcasting `player_won`, add 3-second delay
- Call `resetRoomBoards(player)`
- Ensures winner sees BINGO modal before reset

### Frontend Changes

**Step 4C: Add `board_reset` handler in connectionStore.ts**
```javascript
case 'board_reset':
  if (message.winner && message.finalScore) {
    // Show toast notification
    showGameToast(
      `${message.winner.name} Won!`,
      `Scored ${message.finalScore} points. New round starting...`,
      'success'
    );

    // Reset game board (keep score)
    gameStore.resetBoard(); // New method: clears board/marks but not score
  }
  break;
```

**Step 4D: Add `resetBoard()` method to gameStore**
- Clear `markedSquares` array
- Generate new board (shuffle buzzwords)
- Set `hasWon` to false
- **Do NOT reset score** (preserve across rounds)

**Step 4E: Update BingoModal**
- Reduce auto-close delay to 3 seconds (currently manual close)
- Show countdown: "New round in 3... 2... 1..."

## Testing Plan

### Functional Tests
- [ ] Player A gets BINGO in 3-player room
- [ ] All 3 players receive new boards after 3 seconds
- [ ] Scores preserved: Player A keeps BINGO score
- [ ] Toast shows: "[Player A] Won! Scored 15 points. New round starting..."
- [ ] Winner sees modal for 3 seconds before reset

### Edge Cases
- [ ] Player disconnects during reset → room continues with remaining players
- [ ] Multiple simultaneous BINGOs → first detected triggers reset
- [ ] Solo mode → no room reset (existing behavior preserved)
- [ ] 2-player room → both get fresh boards

### Performance
- [ ] Reset latency < 500ms after 3-second delay
- [ ] No memory leaks from repeated resets
- [ ] WebSocket broadcast efficiency with 10+ players

## Files to Modify

1. **worker.js** (~line 565): Add `resetRoomBoards()` call after `player_won`
2. **worker.js** (~line 907): Same for verification-approved BINGO
3. **worker.js** (~line 950): Add new `resetRoomBoards()` method
4. **connectionStore.ts** (~line 300): Add `board_reset` case handler
5. **gameStore.ts**: Add `resetBoard()` method
6. **BingoModal.tsx**: Add 3-second auto-close with countdown

## Success Criteria

- ✅ All players get fresh boards after BINGO
- ✅ Scores persist across rounds
- ✅ 3-second delay for winner to see modal
- ✅ Toast notification shows winner and score
- ✅ No race conditions or memory leaks
- ✅ Solo mode unaffected

## Rollback Plan

If issues arise, revert commit and redeploy:
```bash
git revert HEAD
git push origin main
npx wrangler deploy
```

## Timeline

- **Implementation**: ~30 minutes
- **Testing**: ~15 minutes (manual with 3+ players)
- **Deployment**: ~5 minutes
- **Total**: ~50 minutes

---

**Phase**: 4 of 6
**Dependencies**: Phase 3 (Verification System)
**Blocks**: Phase 6 (Comprehensive Testing)
