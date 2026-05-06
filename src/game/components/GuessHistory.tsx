// Active-round guess history: renders past guesses as colored letter rows.
import type { LetterFeedback } from '../lib/api';
import { GuessRow } from './GuessRow';

export function GuessHistory({
  guesses,
  feedbacks,
  pattern
}: {
  guesses: string[];
  feedbacks: LetterFeedback[][];
  pattern: string;
}) {
  if (guesses.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 w-full">
      {guesses.map((g, i) => (
        <GuessRow key={i} pattern={pattern} guess={g} feedback={feedbacks[i] ?? []} />
      ))}
    </div>
  );
}
