import type { GameStateView } from '../lib/api';

export function Scoreboard({ state }: { state: GameStateView }) {
  const me = state.players.find((p) => p.playerId === state.you);
  const opp = state.players.find((p) => p.playerId !== state.you);
  const myScore = state.scores[state.you] ?? 0;
  const oppScore = opp ? (state.scores[opp.playerId] ?? 0) : 0;
  return (
    <div className="flex items-center justify-between w-full bg-j-surface border border-j-muted/20 rounded-xl px-4 py-3">
      <div className="flex flex-col">
        <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{me?.name ?? 'You'}</span>
        <span className="text-j-text text-2xl font-bold">{myScore}</span>
      </div>
      <span className="text-j-muted font-mono">vs</span>
      <div className="flex flex-col items-end">
        <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{opp?.name ?? 'Opponent'}</span>
        <span className="text-j-text text-2xl font-bold">{oppScore}</span>
      </div>
    </div>
  );
}
