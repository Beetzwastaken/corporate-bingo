# Corporate Bingo Session Recovery - November 24, 2025

**Recovered from**: Bricked chat session (Playwright screenshot API error)
**Session ID**: 46c42b6e-ec28-494a-8b87-2f6e1ef23ee7

---

## What Was Being Worked On

You were in the middle of implementing the **Corporate Bingo Overhaul Plan**. The session crashed while I was attempting to take a screenshot with Playwright (using wrong path format).

### Key Decisions Made This Session:

1. **Scoring Simplified**:
   - Keep scoring (not just bingo wins)
   - Remove multipliers (3-in-row, 4-in-row bonuses)
   - Bingo = 10 points total (5 squares × 2 points each, option A chosen)
   - Keep all-time stats

2. **Features to Remove**:
   - Anti-cheat penalty (-50 points)
   - Verification system from standard play (keep for Host mode only)
   - Scoring multipliers
   - Persistent room type (single room type only)
   - Solo mode as distinct concept
   - Multi-room support from multiRoomStore.ts

3. **Features to Add/Keep**:
   - Monthly leaderboards (maybe)
   - Light mode option
   - Custom words (down the line, possibly paid)
   - All-time stats
   - Host Mode (speaker tries to SAY buzzwords - multiplayer with validation)

4. **Mobile UX**: Needs overhaul - cramped and awful

5. **Tutorial Issues**: Mentions FREE SPACE that doesn't exist - needs fix

6. **Share Format**: Should show what buzzwords were heard, not just bingo squares

7. **Rebranding**: New name needed - "Synergy" was mentioned but not confirmed

---

## Files That Were Being Modified

1. `src/lib/bingo-engine.ts` - Simplifying scoring (removing multipliers)
2. `src/stores/multiRoomStore.ts` - Removing multi-room support

---

## Plan Document Location

The full overhaul plan was saved to:
- `/c/Users/Ryan/.claude/plans/breezy-humming-flask.md`

---

## Where to Resume

1. Continue simplifying `bingo-engine.ts` (remove 3-in-row, 4-in-row bonuses)
2. Remove multi-room support
3. Fix tutorial (remove FREE SPACE reference)
4. Update share format
5. Mobile UX overhaul

---

*Recovered from chat logs at: C:/Users/Ryan/.claude/projects/F--CC/46c42b6e-ec28-494a-8b87-2f6e1ef23ee7.jsonl*
