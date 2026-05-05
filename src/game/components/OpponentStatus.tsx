// Per-opponent activity hint during active round.
import type { RoundView, Player } from '../lib/api';

export function OpponentStatus({ round, opponents }: { round: RoundView; opponents: Player[] }) {
  if (opponents.length === 0 || round.opponents.length === 0) return null;
  const byId = new Map(round.opponents.map((o) => [o.playerId, o]));
  return (
    <div className="flex flex-col gap-0.5">
      {opponents.map((p) => {
        const o = byId.get(p.playerId) as { guessCount?: number; solved: boolean } | undefined;
        if (!o) return null;
        const guesses = o.guessCount ?? 0;
        const txt = o.solved ? 'solved!' : guesses === 0 ? 'thinking…' : `on guess ${guesses + 1}`;
        return (
          <p key={p.playerId} className="text-j-tertiary text-xs font-mono">
            {p.name}: {txt}
          </p>
        );
      })}
    </div>
  );
}
