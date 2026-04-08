# Nudge Partner — Design Spec

## Problem

After daily reset, both players enter the "selecting" phase. If you lock in your squares but your partner hasn't opened the app, there's no way to remind them. You're stuck on "Waiting for partner..." with no action available.

## Solution

Add a "Nudge Partner" button to the SquareSelector status panel that appears after locking in squares. Uses `navigator.share()` (native share sheet) with clipboard fallback.

## Behavior

1. Button appears in `LineSelector.tsx` status panel, only when `myReady && !partnerReady`
2. On tap:
   - If `navigator.share` supported: opens native share sheet with message + join URL
   - If not supported: copies message + URL to clipboard, shows inline confirmation
3. Share content:
   - **Title:** `Jargon`
   - **Text:** `I'm ready — pick your squares!`
   - **URL:** `https://playjargon.com?join={pairCode}`

## UI

- Button sits below the "Your squares are locked in. Waiting for partner..." text
- Styled consistently with existing buttons in the component
- After clipboard fallback: brief inline "Copied!" confirmation (no external toast dependency)

## Scope

- **Changed:** `LineSelector.tsx` — add nudge button + share/clipboard logic
- **No backend changes**
- **No new components**
- **No new dependencies**
