# Jargon — Launch Plan

**Target:** Friday March 20, 2026
**Updated:** March 14, 2026
**Days remaining:** 7
**Audience:** Friends / small group
**Goal:** Validate the game is fun during real meetings

---

## What Is Jargon?

A web game you play during real work meetings. You get a 5x5 card of corporate buzzwords. When someone in the meeting says one, you tap it. Complete a line and you win.

**Two modes:**
- **Solo** — play during any meeting, track your score, no setup needed
- **Duo** — pair with a colleague in the same meeting, each secretly pick a line on a shared daily card, race to complete yours first

**Design decisions:**
- Daily card (Wordle-style) — one card per day, same globally, plays across all your meetings
- Web-first — sharing a URL is how people join, no app download
- Meeting-based — tapping only makes sense when you're hearing the words live
- Trust-based — playing with friends, no anti-cheat needed

---

## Phase 1: Clean Slate + Rebrand (Claude — now)

Everything here is stale file deletion, dead code removal, and renaming from "Corporate Bingo" to "Jargon." No feature work — just clearing the ground.

### Protect the work
- [ ] Create branch `jargon-launch` and commit all current v2.0 work
- [ ] Push to GitHub as backup

### Delete stale files
- [ ] `worker-optimized.js`
- [ ] `worker-backup.js`
- [ ] `CURRENT_STATUS.md`
- [ ] `QUICK_START.md`
- [ ] `SESSION_RECOVERY_2025-11-24.md`
- [ ] `SESSION_RESUME.md`
- [ ] `tutorial-integration.patch`
- [ ] `docs/` — entire folder (all outdated handoffs, old architecture, old reports)
- [ ] `src/data/buzzwords.js` — duplicate of .ts version, verify worker doesn't need it first
- [ ] `logo-preview.html`

### Remove dead code
- [ ] Uninstall `react-router-dom` and `@types/react-router-dom`
- [ ] Evaluate `src/stores/gameStore.ts` — re-wire for solo mode or delete and rebuild
- [ ] Evaluate `src/components/bingo/Leaderboard.tsx` — old multiplayer, not used
- [ ] Evaluate `src/components/bingo/ScoreDisplay.tsx` — may not be wired up
- [ ] Strip all `console.log` from src/ and worker.js

### Fix build
- [ ] Clean install (`rm -rf node_modules && npm install`)
- [ ] Fix lint errors (dailyCard.ts, connectionStore.ts)
- [ ] Verify `npm run build` passes
- [ ] Run tests, remove/update stale ones

### Rebrand to Jargon
- [ ] `package.json` — name: "jargon"
- [ ] `index.html` — title, meta description, apple-mobile-web-app-title
- [ ] `public/manifest.json` — name, short_name, description
- [ ] `wrangler.toml` — worker name (note: this creates a NEW worker on deploy)
- [ ] `worker.js` — CORS origins (keep old Netlify URL for now, add new one later)
- [ ] `netlify.toml` — update VITE env vars if worker name changes
- [ ] All UI strings in components — header, tutorial, modals, toasts
- [ ] Logo/SVG assets — update or create new Jargon logo
- [ ] `README.md` — full rewrite for Jargon

### Target file tree after cleanup
```
Jargon/
├── src/
│   ├── components/bingo/    # BingoCard, BingoModal, DuoScoreboard, LineSelector, RoomManager
│   ├── components/shared/   # ToastNotification, WelcomeTutorial
│   ├── stores/              # duoStore, gameStore (solo), uiStore, connectionStore
│   ├── lib/                 # bingoEngine, dailyCard, api, websocket, polling, config
│   ├── data/                # buzzwords.ts
│   ├── types/               # index.ts, shared.ts
│   ├── utils/               # shareUtils, version
│   └── assets/              # SVGs
├── public/                  # manifest, SW, logo
├── tests/                   # relevant tests only
├── worker.js                # Cloudflare Worker
├── analytics-worker.js      # Analytics (keep for now)
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig*.json
├── tailwind.config.js
├── eslint.config.js
├── netlify.toml
├── wrangler.toml
├── README.md
├── LAUNCH_PLAN.md
└── CLAUDE.md
```

---

## Phase 2: Game Changes (Claude — testable on current URL)

All playable features. Solo mode, duo fixes, UX clarity. Test everything on the existing Netlify URL.

### Solo mode
- [ ] Add mode selector to landing screen (Solo / Duo)
- [ ] Solo mode: random card, mark squares, detect BINGO, new card on win, persist score
- [ ] Pure client-side — no backend, no WebSocket
- [ ] Clear framing: "Open during your next meeting. Tap buzzwords as you hear them."

### Duo mode fixes
- [ ] Deep link handling — parse `?join=CODE` from URL, auto-populate join form
- [ ] Error boundary — wrap App so runtime errors show recovery message, not white screen
- [ ] Stale state handling — if persisted duo state is from a dead room, reset gracefully
- [ ] "Today's Card" header with date — make the daily mechanic obvious
- [ ] Line progress indicator ("3/5 in your line")
- [ ] Decide + implement post-BINGO behavior (game over for today? allow replay?)

### Backend verification
- [ ] Hit deployed worker health endpoint — is it alive?
- [ ] If stale: redeploy with `npx wrangler deploy`
- [ ] Verify Netlify `/api/*` proxy works
- [ ] Two-tab end-to-end test: create → join → select lines → play → BINGO
- [ ] Test WebSocket connection through Cloudflare
- [ ] Test HTTP polling fallback
- [ ] Test partner disconnect/reconnect

### Tutorial + onboarding
- [ ] Rewrite WelcomeTutorial for current game (solo + duo, daily card, meeting context)
- [ ] Landing screen must communicate "use during meetings" within 5 seconds

### Mobile
- [ ] iPhone Safari — full flow both modes
- [ ] Android Chrome — full flow both modes
- [ ] Small screen (375px) — grid must fit with readable text
- [ ] Test share link copy on mobile (clipboard API restrictions on Safari)

---

## Phase 3: Domain + Polish (Ryan + Claude)

Ryan buys domain and updates DNS. Claude wires it into the app.

### Ryan
- [ ] Buy domain (playjargon.com, jargon.game, etc.)
- [ ] Point DNS to Netlify (CNAME or Netlify DNS)
- [ ] Configure custom domain in Netlify dashboard
- [ ] Netlify handles SSL automatically

### Claude (once domain is live)
- [ ] Update CORS origin in `wrangler.toml` and `worker.js` to include new domain
- [ ] Update CSP header in `netlify.toml`
- [ ] Update WebSocket URL in `src/lib/config.ts` production config
- [ ] Update share link generation (if hardcoded anywhere)
- [ ] Redeploy worker + push to trigger Netlify rebuild
- [ ] Verify everything works on the new domain

### Launch polish
- [ ] OG meta tags (og:title, og:description, og:image, twitter:card)
- [ ] Create OG image (1200x630) — Jargon logo + one-liner
- [ ] Verify favicon in browser tabs
- [ ] Create new Jargon logo/wordmark if not done in Phase 1

---

## Phase 4: Launch (March 20)

- [ ] Final smoke test on live domain — solo + duo
- [ ] Send link to friends with a one-line pitch
- [ ] Watch: do they play? Do they play again? What breaks?
- [ ] Collect feedback

---

## Post-Launch Questions (don't block on these)

- What happens after duo BINGO? Game over for today, or allow line re-pick?
- Is 172 buzzwords enough variety for daily cards over weeks?
- Daily seed timezone behavior — per-room or global UTC?
- Group mode (3+ players) — worth building if duo validates?
- Analytics — what to measure once you know people play?
- GitHub repo rename from corporate-bingo to jargon
