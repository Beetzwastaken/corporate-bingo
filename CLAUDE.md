# Corporate Bingo - Duo Mode

> **Status**: Duo mode refactor complete, needs deploy + testing

## Quick Reference

| Item | Value |
|------|-------|
| **Project Path** | `C:\Users\Ryan\CC\Projects\Corporate Bingo` |
| **Version** | v2.0.0 (Duo Mode) |
| **Status** | Refactor Complete - Needs Deploy |
| **Frontend URL** | https://corporate-bingo-ai.netlify.app |
| **Backend URL** | https://corporate-bingo-api.ryanwixon15.workers.dev |

---

## What Changed (Jan 2026 Refactor)

**Old**: Solo play + multiplayer rooms with verification voting
**New**: Duo Mode - 2 players pair up, each picks a secret line, compete for score

### Duo Mode Flow
1. **Unpaired** → Enter name, create room OR join with partner's code
2. **Waiting** → Host waits, shares 4-char code with partner
3. **Selecting** → Both players secretly pick a line (row/col/diagonal)
4. **Playing** → Same card revealed, mark squares, race to BINGO

### Scoring
- +1 point per square in YOUR line marked
- +5 bonus for completing your line (BINGO)
- Same 25 buzzwords globally per day (seeded by date)
- Daily reset at midnight in user's timezone

---

## Architecture

### Zustand Stores (Current)

| Store | File | Purpose |
|-------|------|---------|
| `duoStore` | `src/stores/duoStore.ts` | **Main store** - pairing, lines, scores, game state |
| `connectionStore` | `src/stores/connectionStore.ts` | WebSocket/polling, routes messages to duoStore |
| `uiStore` | `src/stores/uiStore.ts` | UI state (modals, sidebar) |

**Legacy (unused but present)**:
- `gameStore.ts` - Old solo mode (kept for localStorage compat)

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `App.tsx` | `src/App.tsx` | Main app, phase-based rendering |
| `RoomManager` | `src/components/bingo/RoomManager.tsx` | Create/join room UI |
| `LineSelector` | `src/components/bingo/LineSelector.tsx` | Pick your line (12 options) |
| `BingoCard` | `src/components/bingo/BingoCard.tsx` | 5x5 grid with line highlighting |
| `DuoScoreboard` | `src/components/bingo/DuoScoreboard.tsx` | Live scores display |
| `BingoModal` | `src/components/bingo/BingoModal.tsx` | BINGO celebration + share |
| `WelcomeTutorial` | `src/components/shared/WelcomeTutorial.tsx` | 5-step duo tutorial |

### Backend (worker.js ~1000 lines)

**Duo API Routes**:
```
POST /api/duo/create     - Create room, returns { code, odId }
POST /api/duo/join       - Join room with code
POST /api/duo/:code/select - Pick your line
POST /api/duo/:code/mark   - Mark a square
POST /api/duo/:code/leave  - Leave game
GET  /api/duo/:code/state  - Polling endpoint
GET  /api/duo/:code/ws     - WebSocket upgrade
```

**WebSocket Message Types** (see `src/lib/websocket.ts`):
- `connected`, `partner_joined`, `partner_left`
- `partner_selected`, `line_conflict`
- `card_revealed`, `square_marked`, `bingo`, `daily_reset`

### Daily Card System

`src/lib/dailyCard.ts`:
- Seeded PRNG (Mulberry32) for deterministic shuffle
- Same date → same 25 phrases globally
- `generateDailyCard(dateString)` returns BingoSquare[]
- `getLineIndices(line)` returns array of 5 indices for a line

---

## Directory Structure

```
Corporate Bingo/
├── src/
│   ├── components/
│   │   ├── bingo/
│   │   │   ├── BingoCard.tsx      # 5x5 grid + line highlighting
│   │   │   ├── BingoModal.tsx     # BINGO celebration
│   │   │   ├── DuoScoreboard.tsx  # Live scores
│   │   │   ├── LineSelector.tsx   # Pick row/col/diag
│   │   │   ├── RoomManager.tsx    # Create/join UI
│   │   │   ├── Leaderboard.tsx    # LEGACY (unused)
│   │   │   └── ScoreDisplay.tsx   # LEGACY (unused)
│   │   └── shared/
│   │       ├── WelcomeTutorial.tsx
│   │       └── ToastNotification.tsx
│   ├── stores/
│   │   ├── duoStore.ts        # Main game state
│   │   ├── connectionStore.ts # WebSocket management
│   │   ├── uiStore.ts         # UI state
│   │   ├── gameStore.ts       # LEGACY (unused)
│   │   └── index.ts           # Exports
│   ├── lib/
│   │   ├── api.ts             # Duo API client
│   │   ├── websocket.ts       # WebSocket client + message types
│   │   ├── polling.ts         # HTTP polling fallback
│   │   ├── dailyCard.ts       # Seeded card generation
│   │   ├── messageTypes.ts    # Message type constants
│   │   └── bingoEngine.ts     # LEGACY (line logic now in dailyCard)
│   ├── types/
│   │   ├── index.ts           # BingoSquare, BingoPlayer, etc.
│   │   └── shared.ts          # Shared types
│   ├── data/
│   │   └── buzzwords.ts       # 172 corporate buzzwords
│   ├── App.tsx                # Main app container
│   └── main.tsx
├── worker.js                  # Cloudflare Worker (~1000 lines)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── netlify.toml
└── wrangler.toml
```

---

## Next Steps (Resume Here)

### 1. Deploy Backend
```bash
npx wrangler deploy
```

### 2. Test Locally
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npx wrangler dev --port 8787
```

### 3. Test Flow
1. Open http://localhost:5175 in two browser tabs
2. Tab 1: Enter name, click "Create Room"
3. Tab 2: Enter name, paste code, click "Join"
4. Both: Pick different lines
5. Both: Mark squares, verify scoring works
6. Verify BINGO triggers correctly

### 4. Optional Cleanup
Delete unused legacy files:
- `src/stores/gameStore.ts`
- `src/components/bingo/Leaderboard.tsx`
- `src/components/bingo/ScoreDisplay.tsx`

---

## Development Commands

```bash
npm run dev              # Frontend dev server (port 5175)
npm run build            # Production build
npx wrangler dev --port 8787  # Local backend
npx wrangler deploy      # Deploy backend
npx wrangler tail        # Stream backend logs
```

---

## Line Selection Reference

Grid layout (indices 0-24):
```
 0  1  2  3  4   ← Row 0
 5  6  7  8  9   ← Row 1
10 11 12 13 14   ← Row 2
15 16 17 18 19   ← Row 3
20 21 22 23 24   ← Row 4
 ↑  ↑  ↑  ↑  ↑
Col Col Col Col Col
 0   1   2   3   4
```

12 possible lines:
- 5 rows: `{ type: 'row', index: 0-4 }`
- 5 cols: `{ type: 'col', index: 0-4 }`
- 2 diags: `{ type: 'diag', index: 0 }` (↘) and `{ type: 'diag', index: 1 }` (↙)

---

## Color Coding (Duo Mode)

| Color | Meaning |
|-------|---------|
| Cyan ring | Your line |
| Orange ring | Partner's line |
| Purple ring | Overlap (both have this square) |
| Green checkmark | Square is marked |

---

## Known Issues

### Not Yet Tested
- Full end-to-end duo flow
- WebSocket reconnection
- Daily reset across midnight
- Line conflict handling

### Potential Issues
- Backend not deployed yet (still has old multiplayer code in production)
- No error handling UI for failed API calls
- No loading states during API calls

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind
- **State**: Zustand with persist middleware
- **Backend**: Cloudflare Workers + Durable Objects
- **Real-time**: WebSocket + HTTP polling fallback
- **Hosting**: Netlify (frontend) + Cloudflare (backend)

---

*Last updated: January 6, 2026 | v2.0.0 Duo Mode*
