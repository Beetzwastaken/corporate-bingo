// History: reverse-chron list of completed rounds.
// Reads state.rounds from store (already populated by polling on Game page).
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDecodeStore } from '../stores/decodeStore';
import type { DecodeRoundView, DecodeStateView } from '../lib/api';

export function History() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, error, loading, setGame, refresh } = useDecodeStore();

  useEffect(() => {
    if (!gameId) return;
    setGame(gameId);
    refresh();
  }, [gameId, setGame, refresh]);

  if (!gameId) return <Centered>Invalid game.</Centered>;
  if (!state && loading) return <Centered>Loading…</Centered>;
  if (!state && error) return <Centered>{error}</Centered>;
  if (!state) return <Centered>—</Centered>;

  const completed = state.rounds.filter((r) => r.bothComplete);

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-8">
      <header className="w-full max-w-md mb-5 flex flex-col gap-1">
        <Link to={`/decode/game/${gameId}`} className="text-j-muted text-xs font-mono hover:text-j-tertiary self-start">← Game</Link>
        <h1 className="text-xl font-bold mt-1">{state.lobbyName} · History</h1>
      </header>

      <main className="w-full max-w-md flex flex-col gap-3">
        {completed.length === 0 ? (
          <p className="text-j-tertiary text-sm font-mono">No completed rounds yet.</p>
        ) : (
          [...completed].reverse().map((r) => <RoundCard key={r.roundNumber} round={r} state={state} />)
        )}
      </main>
    </div>
  );
}

function RoundCard({ round, state }: { round: DecodeRoundView; state: DecodeStateView }) {
  const me = state.players.find((p) => p.playerId === state.you);
  const opp = state.players.find((p) => p.playerId !== state.you);
  const myState = round.you;
  const oppState = round.opponent && 'guesses' in round.opponent ? round.opponent : null;

  return (
    <div className="bg-j-surface border border-j-muted/20 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">
          Round {round.roundNumber}
        </span>
        <span className="text-j-accent text-sm font-bold">{round.word?.display ?? '—'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <PlayerColumn name={me?.name ?? 'You'} guesses={myState?.guesses ?? []} solvedOn={myState?.solvedOnGuess ?? null} points={myState?.pointsEarned ?? 0} />
        <PlayerColumn name={opp?.name ?? 'Opp'} guesses={oppState?.guesses ?? []} solvedOn={oppState?.solvedOnGuess ?? null} points={oppState?.pointsEarned ?? 0} />
      </div>
    </div>
  );
}

function PlayerColumn({ name, guesses, solvedOn, points }: {
  name: string;
  guesses: string[];
  solvedOn: number | null;
  points: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{name}</p>
      {guesses.length > 0 ? (
        <ul className="text-xs font-mono text-j-text flex flex-col gap-0.5">
          {guesses.map((g, i) => (
            <li key={i} className={solvedOn === i + 1 ? 'text-j-success' : ''}>
              {i + 1}. {g}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-j-tertiary text-xs">No guesses</p>
      )}
      <p className="text-j-secondary text-xs font-mono mt-1">+{points}</p>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex items-center justify-center text-j-tertiary text-sm font-mono">
      {children}
    </div>
  );
}
