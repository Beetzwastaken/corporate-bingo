// Small unobtrusive opponent status during active round.
import type { DecodeRoundView, DecodePlayer } from '../lib/api';

export function OpponentStatus({ round, opponent }: { round: DecodeRoundView; opponent: DecodePlayer | null }) {
  if (!opponent || !round.opponent) return null;
  const opp = round.opponent as { guessCount?: number; solved: boolean };
  const guesses = opp.guessCount ?? 0;
  return (
    <p className="text-j-tertiary text-xs font-mono">
      {opponent.name}: {opp.solved ? 'solved!' : guesses === 0 ? 'thinking…' : `on guess ${guesses + 1}`}
    </p>
  );
}
