# Nudge Partner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Nudge Partner" button to the square selection screen that lets you share a reminder link after locking in your squares.

**Architecture:** Add `pairCode` prop to SquareSelector, add a nudge button to the status panel that calls `navigator.share()` with clipboard fallback. No backend changes.

**Tech Stack:** React, navigator.share API, navigator.clipboard API

---

### Task 1: Add pairCode prop and nudge button to SquareSelector

**Files:**
- Modify: `src/components/bingo/LineSelector.tsx`
- Modify: `src/App.tsx:295-300`

- [ ] **Step 1: Add pairCode to SquareSelectorProps and pass it from App.tsx**

In `src/components/bingo/LineSelector.tsx`, update the interface and destructure:

```tsx
interface SquareSelectorProps {
  onSelect: (squares: number[]) => void;
  myReady: boolean;
  partnerReady: boolean;
  pairCode: string | null;
  disabled?: boolean;
}

export function SquareSelector({
  onSelect,
  myReady,
  partnerReady,
  pairCode,
  disabled = false,
}: SquareSelectorProps) {
```

In `src/App.tsx`, pass the prop (around line 295):

```tsx
<SquareSelector
  onSelect={handleSquaresSelect}
  myReady={myReady}
  partnerReady={partnerReady}
  pairCode={pairCode}
  disabled={myReady}
/>
```

`pairCode` is already destructured from `useDuoStore` in App.tsx.

- [ ] **Step 2: Add nudge handler and button to the status panel**

In `src/components/bingo/LineSelector.tsx`, add state and handler inside the component (after the existing `handleLockIn`):

```tsx
const [nudgeCopied, setNudgeCopied] = useState(false);

const handleNudge = async () => {
  const url = `https://playjargon.com?join=${pairCode}`;
  const text = "I'm ready — pick your squares! 🎯";

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Jargon', text, url });
      return;
    } catch {
      // User cancelled share sheet — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setNudgeCopied(true);
    setTimeout(() => setNudgeCopied(false), 2000);
  } catch {
    // Clipboard failed — no action needed
  }
};
```

Replace the status panel section (lines 112-123) with:

```tsx
{myReady && (
  <div className="text-center p-3 bg-j-accent/10 rounded-lg border border-j-accent/20 space-y-2">
    <p className="text-j-accent font-medium text-sm">
      Your squares are locked in!
    </p>
    {!partnerReady && (
      <>
        <p className="text-j-tertiary text-xs font-mono">
          Waiting for partner...
        </p>
        {pairCode && (
          <button
            onClick={handleNudge}
            className="mt-1 px-4 py-1.5 bg-j-accent/20 hover:bg-j-accent/30 text-j-accent text-xs font-semibold rounded-lg transition-colors"
          >
            {nudgeCopied ? 'Copied!' : 'Nudge Partner'}
          </button>
        )}
      </>
    )}
  </div>
)}
```

- [ ] **Step 3: Verify build passes**

Run: `cd /c/Users/Ryan/CC/Projects/Jargon && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Verify tests pass**

Run: `cd /c/Users/Ryan/CC/Projects/Jargon && npm test`
Expected: All existing tests pass (no test changes needed — this is a UI-only addition with no testable logic).

- [ ] **Step 5: Commit**

```bash
git add src/components/bingo/LineSelector.tsx src/App.tsx
git commit -m "feat: nudge partner button after locking in squares"
```
