// Renders a single past guess as Wordle-style colored boxes aligned to the
// word pattern. `pattern` chars: '_' = letter slot, anything else = separator.
// `guess` is the raw submitted string (with separators); we extract letters in
// order. `feedback` is per-letter status from server.
import type { LetterFeedback } from '../lib/api';

const COLOR: Record<LetterFeedback, string> = {
  correct: 'bg-j-success/30 border-j-success/60 text-j-text',
  present: 'bg-yellow-400/25 border-yellow-400/50 text-j-text',
  absent: 'bg-j-surface border-j-muted/30 text-j-tertiary'
};

export function GuessRow({
  pattern,
  guess,
  feedback
}: {
  pattern: string;
  guess: string;
  feedback: LetterFeedback[];
}) {
  // Letters typed by the user, in order.
  const letters = Array.from(guess).filter((c) => /[A-Za-z]/.test(c));
  const cells: React.ReactNode[] = [];
  let li = 0;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '_') {
      const letter = (letters[li] ?? '').toUpperCase();
      const fb = feedback[li] ?? 'absent';
      cells.push(
        <span
          key={`l-${i}`}
          className={`w-6 h-7 sm:w-7 sm:h-8 inline-flex items-center justify-center font-mono text-sm font-bold border rounded ${COLOR[fb]}`}
        >
          {letter}
        </span>
      );
      li++;
    } else if (ch === ' ') {
      cells.push(<span key={`sep-${i}`} className="basis-full h-0" aria-hidden />);
    } else {
      cells.push(
        <span key={`sep-${i}`} className="self-center px-0.5 text-j-tertiary font-mono text-sm" aria-hidden>
          {ch}
        </span>
      );
    }
  }
  return <div className="flex flex-wrap gap-1 justify-center">{cells}</div>;
}
