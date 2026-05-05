// Letter-square guess input. Renders one box per letter, separators inline.
// Pattern from server: '_' = letter slot, anything else = visible separator.
import { useEffect, useMemo, useRef, useState } from 'react';

export function LetterGrid({
  pattern,
  guessesRemaining,
  onSubmit,
  disabled
}: {
  pattern: string;
  guessesRemaining: number;
  onSubmit: (guess: string) => Promise<void>;
  disabled: boolean;
}) {
  // Indices in `pattern` that are letter slots.
  const letterIndices = useMemo(
    () => Array.from(pattern).map((c, i) => (c === '_' ? i : -1)).filter((i) => i >= 0),
    [pattern]
  );
  const [chars, setChars] = useState<string[]>(() => Array(letterIndices.length).fill(''));
  const [busy, setBusy] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Reset on pattern change (new round / new guess attempt).
  useEffect(() => {
    setChars(Array(letterIndices.length).fill(''));
    // Focus first slot
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }, [pattern, letterIndices.length]);

  function buildGuess(): string {
    let li = 0;
    let out = '';
    for (const ch of pattern) {
      if (ch === '_') {
        out += chars[li] || ' '; // empty stays as space, server normalizes
        li++;
      } else {
        out += ch;
      }
    }
    return out;
  }

  const allFilled = chars.every((c) => c.length === 1);

  async function submit() {
    if (!allFilled || busy || disabled) return;
    setBusy(true);
    try {
      await onSubmit(buildGuess());
      // Clearing handled by useEffect on pattern change if word advances; otherwise clear here.
      setChars(Array(letterIndices.length).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }

  function setCharAt(i: number, value: string) {
    setChars((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function focusSlot(i: number) {
    const el = inputRefs.current[i];
    if (el) el.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === 'Backspace') {
      if (chars[i]) {
        setCharAt(i, '');
      } else if (i > 0) {
        focusSlot(i - 1);
        setCharAt(i - 1, '');
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      focusSlot(i - 1);
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && i < letterIndices.length - 1) {
      focusSlot(i + 1);
      e.preventDefault();
    }
  }

  function onChange(i: number, raw: string) {
    // Take last typed alpha char only, store uppercase.
    const match = raw.match(/[A-Za-z]/g);
    const ch = match ? match[match.length - 1].toUpperCase() : '';
    if (!ch) {
      setCharAt(i, '');
      return;
    }
    setCharAt(i, ch);
    if (i < letterIndices.length - 1) focusSlot(i + 1);
  }

  // Render: walk pattern, emit either an input or a separator.
  const cells: React.ReactNode[] = [];
  let li = 0;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '_') {
      const slotIdx = li;
      cells.push(
        <input
          key={`s-${i}`}
          ref={(el) => { inputRefs.current[slotIdx] = el; }}
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={1}
          value={chars[slotIdx] ?? ''}
          onChange={(e) => onChange(slotIdx, e.target.value)}
          onKeyDown={(e) => onKeyDown(slotIdx, e)}
          onFocus={(e) => e.currentTarget.select()}
          disabled={disabled || busy}
          className="w-8 h-10 sm:w-9 sm:h-11 text-center font-mono uppercase text-lg bg-j-surface border border-j-muted/30 rounded text-j-text outline-none focus:border-j-accent/60 focus:bg-j-surface/80 disabled:opacity-40"
        />
      );
      li++;
    } else if (ch === ' ') {
      // visible word break — flex-basis full forces wrap
      cells.push(<span key={`sep-${i}`} className="basis-full h-0" aria-hidden />);
    } else {
      // hyphen, apostrophe, etc. — render as glyph
      cells.push(
        <span key={`sep-${i}`} className="self-center px-0.5 text-j-tertiary font-mono text-lg" aria-hidden>
          {ch}
        </span>
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-1 justify-center">
        {cells}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-j-tertiary text-xs font-mono">
          {guessesRemaining} guess{guessesRemaining === 1 ? '' : 'es'} left
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!allFilled || busy || disabled}
          className="px-4 py-2 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent text-sm disabled:opacity-40 transition-colors"
        >
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
