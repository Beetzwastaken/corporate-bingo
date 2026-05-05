// Pre-round lobby: waiting for opponent OR both ready-up.
import type { GameStateView } from '../lib/api';

export function Lobby({ state, gameId, onReady, busy }: {
  state: GameStateView;
  gameId: string;
  onReady: () => void;
  busy: boolean;
}) {
  const me = state.players.find((p) => p.playerId === state.you);
  const opp = state.players.find((p) => p.playerId !== state.you);

  if (state.players.length === 1) {
    const inviteUrl = `${window.location.origin}/join/${gameId}`;
    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="text-j-secondary text-sm">Waiting for opponent. Share invite link:</p>
        <code className="block p-3 bg-j-surface rounded-lg text-j-accent text-xs break-all select-all">
          {inviteUrl}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(inviteUrl)}
          className="text-j-accent text-xs font-mono hover:text-j-accent-hover self-start"
        >
          Copy link
        </button>
      </div>
    );
  }

  const meReady = !!me?.readyForNextRound;
  const oppReady = !!opp?.readyForNextRound;

  return (
    <div className="flex flex-col gap-3 w-full items-center">
      <p className="text-j-secondary text-sm text-center">
        {meReady && oppReady
          ? 'Starting round…'
          : meReady
            ? `Waiting on ${opp?.name ?? 'opponent'} to ready up.`
            : oppReady
              ? `${opp?.name ?? 'Opponent'} is ready. Your turn.`
              : 'Both players need to ready up to start.'}
      </p>
      <button
        type="button"
        onClick={onReady}
        disabled={meReady || busy}
        className="px-6 py-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
      >
        {meReady ? 'Ready ✓' : busy ? 'Loading…' : 'Ready Up'}
      </button>
    </div>
  );
}
