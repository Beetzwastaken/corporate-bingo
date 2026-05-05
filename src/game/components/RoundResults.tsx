// Round-end view. Reveals answer + every player's guesses + ready button.
import type { RoundView, GameStateView } from '../lib/api';

export function RoundResults({
  round,
  state,
  onReady,
  busy
}: {
  round: RoundView;
  state: GameStateView;
  onReady: () => void;
  busy: boolean;
}) {
  const me = state.players.find((p) => p.playerId === state.you);
  const others = state.players.filter((p) => p.playerId !== state.you);
  const word = round.word;

  const myState = round.you;
  // After bothComplete, opponents have full guess data.
  const oppById = new Map(
    round.opponents
      .filter((o): o is { playerId: string; guesses: string[]; solved: boolean; solvedOnGuess: number | null; pointsEarned: number } => 'guesses' in o)
      .map((o) => [o.playerId, o])
  );

  const meReady = !!me?.readyForNextRound;
  const notReadyOthers = others.filter((p) => !p.readyForNextRound);

  // Layout: 2-player keeps grid-cols-2, 3+ goes single-column list.
  const colsClass = state.players.length === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="text-center">
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider">Answer</p>
        <h2 className="text-3xl font-bold text-j-accent mt-1">{word?.display ?? '—'}</h2>
      </div>

      <div className={`grid gap-3 ${colsClass}`}>
        <PlayerCard
          name={me?.name ?? 'You'}
          guesses={myState?.guesses ?? []}
          solvedOnGuess={myState?.solvedOnGuess ?? null}
          pointsEarned={myState?.pointsEarned ?? 0}
        />
        {others.map((p) => {
          const opp = oppById.get(p.playerId);
          return (
            <PlayerCard
              key={p.playerId}
              name={p.name}
              guesses={opp?.guesses ?? []}
              solvedOnGuess={opp?.solvedOnGuess ?? null}
              pointsEarned={opp?.pointsEarned ?? 0}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-2 items-center">
        {meReady && notReadyOthers.length > 0 && (
          <p className="text-j-secondary text-xs font-mono">
            Waiting on {notReadyOthers.map((p) => p.name).join(', ')}.
          </p>
        )}
        {!meReady && others.some((p) => p.readyForNextRound) && (
          <p className="text-j-secondary text-xs font-mono">
            {others.filter((p) => p.readyForNextRound).map((p) => p.name).join(', ')} ready — your turn.
          </p>
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

function PlayerCard({
  name,
  guesses,
  solvedOnGuess,
  pointsEarned
}: {
  name: string;
  guesses: string[];
  solvedOnGuess: number | null;
  pointsEarned: number;
}) {
  return (
    <div className="bg-j-surface border border-j-muted/20 rounded-xl p-3">
      <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mb-2">{name}</p>
      {guesses.length > 0 ? (
        <ul className="text-xs font-mono text-j-text flex flex-col gap-1">
          {guesses.map((g, i) => (
            <li key={i} className={solvedOnGuess === i + 1 ? 'text-j-success' : ''}>
              {i + 1}. {g}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-j-tertiary text-xs">No guesses</p>
      )}
      <p className="text-j-secondary text-sm font-mono mt-2">+{pointsEarned}</p>
    </div>
  );
}
