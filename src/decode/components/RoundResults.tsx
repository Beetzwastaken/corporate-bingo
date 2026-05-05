// Round-end view. Phase 6 stub renders answer + both guess histories + ready button.
// Phase 7 polishes copy, animations, and ready-up flow.
import type { DecodeRoundView, DecodeStateView } from '../lib/api';

export function RoundResults({
  round,
  state,
  onReady,
  busy
}: {
  round: DecodeRoundView;
  state: DecodeStateView;
  onReady: () => void;
  busy: boolean;
}) {
  const me = state.players.find((p) => p.playerId === state.you);
  const opp = state.players.find((p) => p.playerId !== state.you);
  const word = round.word;

  const myState = round.you;
  const oppState = round.opponent && 'guesses' in round.opponent ? round.opponent : null;

  const meReady = !!me?.readyForNextRound;
  const oppReady = !!opp?.readyForNextRound;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="text-center">
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider">Answer</p>
        <h2 className="text-3xl font-bold text-j-accent mt-1">{word?.display ?? '—'}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-j-surface border border-j-muted/20 rounded-xl p-3">
          <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mb-2">{me?.name ?? 'You'}</p>
          {myState && myState.guesses.length > 0 ? (
            <ul className="text-xs font-mono text-j-text flex flex-col gap-1">
              {myState.guesses.map((g, i) => (
                <li key={i} className={myState.solvedOnGuess === i + 1 ? 'text-j-success' : ''}>
                  {i + 1}. {g}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-j-tertiary text-xs">No guesses</p>
          )}
          <p className="text-j-secondary text-sm font-mono mt-2">+{myState?.pointsEarned ?? 0}</p>
        </div>
        <div className="bg-j-surface border border-j-muted/20 rounded-xl p-3">
          <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mb-2">{opp?.name ?? 'Opponent'}</p>
          {oppState && oppState.guesses.length > 0 ? (
            <ul className="text-xs font-mono text-j-text flex flex-col gap-1">
              {oppState.guesses.map((g, i) => (
                <li key={i} className={oppState.solvedOnGuess === i + 1 ? 'text-j-success' : ''}>
                  {i + 1}. {g}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-j-tertiary text-xs">No guesses</p>
          )}
          <p className="text-j-secondary text-sm font-mono mt-2">+{oppState?.pointsEarned ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        {oppReady && !meReady && (
          <p className="text-j-secondary text-xs font-mono">{opp?.name ?? 'Opponent'} is ready — waiting on you.</p>
        )}
        {meReady && !oppReady && (
          <p className="text-j-secondary text-xs font-mono">Waiting on {opp?.name ?? 'opponent'}.</p>
        )}
        <button
          type="button"
          onClick={onReady}
          disabled={meReady || busy}
          className="px-5 py-2.5 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent text-sm disabled:opacity-40 transition-colors"
        >
          {meReady ? 'Ready ✓' : busy ? 'Loading…' : 'Ready for Next Round'}
        </button>
      </div>
    </div>
  );
}
