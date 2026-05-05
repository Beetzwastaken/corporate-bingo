// Small unobtrusive opponent status during active round.
import type { RoundView, Player } from '../lib/api';

export function OpponentStatus({ round, opponent }: { round: RoundView; opponent: Player | null }) {
  if (!opponent || !round.opponent) return null;
  const opp = round.opponent as { guessCount?: number; solved: boolean };
  const guesses = opp.guessCount ?? 0;
  return (
    <p className="text-j-tertiary text-xs font-mono">
      {opponent.name}: {opp.solved ? 'solved!' : guesses === 0 ? 'thinking…' : `on guess ${guesses + 1}`}
    </p>
  );
}
