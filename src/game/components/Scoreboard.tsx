import type { GameStateView } from '../lib/api';

export function Scoreboard({ state }: { state: GameStateView }) {
  // Ranked list, descending. You highlighted.
  const rows = state.players
    .map((p) => ({ ...p, score: state.scores[p.playerId] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  // 2-player → keep compact head-to-head layout
  if (rows.length === 2) {
    const me = rows.find((r) => r.playerId === state.you);
    const opp = rows.find((r) => r.playerId !== state.you);
    return (
      <div className="flex items-center justify-between w-full bg-j-surface border border-j-muted/20 rounded-xl px-4 py-3">
        <div className="flex flex-col">
          <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{me?.name ?? 'You'}</span>
          <span className="text-j-text text-2xl font-bold">{me?.score ?? 0}</span>
        </div>
        <span className="text-j-muted font-mono">vs</span>
        <div className="flex flex-col items-end">
          <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{opp?.name ?? 'Opponent'}</span>
          <span className="text-j-text text-2xl font-bold">{opp?.score ?? 0}</span>
        </div>
      </div>
    );
  }

  // 3-4 players → ranked grid
  return (
    <div className="flex flex-col gap-1 w-full bg-j-surface border border-j-muted/20 rounded-xl px-4 py-3">
      {rows.map((r, i) => {
        const isMe = r.playerId === state.you;
        return (
          <div key={r.playerId} className="flex items-center justify-between gap-3">
            <span className="text-j-tertiary text-xs font-mono w-5">#{i + 1}</span>
            <span className={`flex-1 truncate text-sm ${isMe ? 'text-j-accent font-semibold' : 'text-j-text'}`}>
              {r.name}{isMe ? ' (you)' : ''}
            </span>
            <span className="text-j-text text-lg font-bold tabular-nums">{r.score}</span>
          </div>
        );
      })}
    </div>
  );
}
