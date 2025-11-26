# Corporate Bingo Session Resume - November 24, 2025

## Session Overview
This session began with a comprehensive 20-minute evaluation of the Corporate Bingo project, followed by extensive user feedback discussion, planning, and the start of implementation.

---

## Phase 1: Project Evaluation (Completed)

### Evaluation Scores Given:
- Idea/Concept: 8.5/10 - Strong niche, universal appeal
- Technical Implementation: 7.5/10 - Solid but some complexity
- Code Quality: 7/10 - Good structure, some over-engineering
- UX/Design: 7/10 - Professional but mobile needs work
- Long-term Viability: 7/10 - Needs differentiation
- Overall: 7.4/10

### Key Findings:
- Too complex for what should be simple fun
- Scoring system over-engineered (3/4/5-in-a-row bonuses)
- Anti-cheat penalty (-50 points) is frustrating
- Mobile UX cramped
- Solo mode feels disconnected from multiplayer
- Tutorial mentions FREE SPACE that doesn't exist
- Share format doesn't show what buzzwords were heard

---

## Phase 2: User Feedback (14 Points Discussed)

### User Clarifications:
1. **No subscription model** - Will remain free
2. **Not worried about low activity** - Natural usage patterns during meetings
3. **User tracking** - Device-persistent identity is fine (no accounts needed)
4. **Host Mode** - NEW feature where speaker tries to SAY buzzwords
5. **Solo mode** - Can be removed, replaced by "Play" flow
6. **Verification** - Move to Host Mode only (not standard play)
7. **Scoring** - Simplify, remove 3/4-in-a-row bonuses
8. **Anti-cheat** - REMOVE the -50 penalty entirely
9. **Connection issues** - Known SSL/reconnection problems to investigate
10. **Room types** - Simplify to single type (auto-expire)
11. **Mobile UX** - Needs full overhaul (Phase 5)
12. **Rebrand** - Want new name (exploring options, not locked to "Synergy")
13. **Tutorial bug** - Mentions FREE SPACE that doesn't exist
14. **Share format** - Should show emoji grid + winning buzzwords

### Key Decisions Made:
- **Host Mode Scoring**: Points (1 per verified square) + BINGO count
- **Play Mode**: No points, no verification - just celebrate BINGOs
- **Brand Name**: Still exploring (user not sold on "Synergy")
- **Implementation Order**: Backend first → Architecture → Connection → Content → UX → Rebrand

---

## Phase 3: Buzzword Updates Agreed

### Remove (6 terms):
- "Ninja"
- "Guru"  
- "Rockstar"
- "Drink the Kool-Aid"
- "Throw Spaghetti"
- "Color Commentary"

### Keep (user requested):
- "Boil the Ocean"
- "Run it Up the Flagpole"

### Add (7 new terms):
- "Can everyone see my screen?"
- "I'll drop it in the chat"
- "Do more with less"
- "Double down"
- "Sorry, go ahead"
- "I have a hard stop at..."
- "Friendly reminder"

---

## Phase 4: Implementation Plan Created

Full plan saved at: `C:\Users\Ryan\.claude\plans\breezy-humming-flask.md`

### Sprint Structure:
1. **Sprint 1**: Backend & Core Logic Cleanup (worker.js, stores, bingoEngine)
2. **Sprint 2**: Game Mode Architecture (EntryScreen, Play/Join/Host modes)
3. **Sprint 3**: Connection Stability (SSL fixes, state machine)
4. **Sprint 4**: Content & Data Updates (buzzwords, tutorial, sharing)
5. **Sprint 5**: UX Overhaul (mobile-first redesign)
6. **Sprint 6**: Rebrand (name, logo, domain)

---

## Phase 5: Implementation Started (Current)

### What We Were Working On:
Tutorial rewrite (WelcomeTutorial.tsx) with these changes needed:

1. **Step 1 (Welcome)**: Update stats to "170+" buzzwords, remove "Advanced scoring with bonuses"

2. **Step 2 (How to Play)**: Change pro tip from FREE SPACE mention to "Pay attention to the meeting - the best buzzwords come when you least expect them!"

3. **Step 3**: Change from "Solo or Multiplayer?" to "Game Modes" with:
   - Play mode (▶️): Jump in, click squares, invite friends, celebrate BINGOs
   - Host mode (🎤): You're the speaker, say buzzwords, audience verifies

4. **Step 4 (Scoring)**: REMOVE ENTIRELY - delete 3-in-a-row, 4-in-a-row bonuses AND the anti-cheat warning

5. **Step 5 (Share)**: Update example to show:
   ```
   🎯 Corporate Bingo
   BINGO!
   
   🟩🟩🟨⬜⬜
   ⬜🟩🟨⬜🟩
   🟩⬜🟨🟩⬜
   ⬜⬜🟨⬜⬜
   🟩⬜🟨⬜🟩
   
   Winning line:
   🟨 "Circle Back"
   🟨 "Synergy"
   🟨 "Deep Dive"
   🟨 "Moving Forward"
   🟨 "Let's Take This Offline"
   ```

6. **Step 6 (Ready)**: Update call-to-action for Play/Join/Host modes

### Files Still To Modify:
- `src/components/shared/WelcomeTutorial.tsx` - Tutorial rewrite (started)
- `src/data/buzzwords.ts` - Remove 6, add 7 terms
- `src/components/bingo/RoomManager.tsx` - Remove -50 penalty display (line ~113)
- `worker.js` - Remove anti-cheat penalty, scoring multipliers, add gameMode/hostId
- `src/stores/gameStore.ts` - Remove appliedBonuses Map
- `src/lib/bingoEngine.ts` - Remove 3/4-in-a-row detection

---

## Technical Issue Discovered & Fixed

### Problem:
Edit tool kept failing with "File has been unexpectedly modified" error on EVERY file.

### Investigation:
- Confirmed file wasn't actually changing (md5sum stable)
- Git showed no modifications
- Killed Vite dev server (wasn't the cause)
- Found Cursor IDE TypeScript servers running (not the cause)
- Researched Claude Code GitHub issues - known bug on Windows

### Root Cause Found:
User's `.bashrc` had `cd /f/CC` which ran on every Bash command Claude Code executes (because it spawns login shells). This caused file system activity that confused Edit tool's timestamp verification.

### Fix Applied:
Changed .bashrc to only auto-navigate for interactive sessions:
```bash
[[ $- == *i* ]] && cd /f/CC 2>/dev/null || cd ~
```

### Status:
Fix applied but needs shell restart to take effect. That's why we're saving this resume file.

---

## To Resume After Restart

Say: **"Resume Corporate Bingo overhaul - read SESSION_RESUME.md in the Corporate Bingo folder"**

The assistant should:
1. Read this file and the plan at `C:\Users\Ryan\.claude\plans\breezy-humming-flask.md`
2. Test that Edit tool now works
3. Continue with WelcomeTutorial.tsx changes
4. Then proceed to buzzwords.ts, then other files

---

## Important Context

- **Production URL**: https://corporate-bingo-ai.netlify.app
- **User tests on production**, doesn't need Vite dev server
- **Project location**: F:/CC/Projects/Corporate Bingo
- **Plan location**: C:\Users\Ryan\.claude\plans\breezy-humming-flask.md
- **CLAUDE.md**: Has detailed project context and file structure
