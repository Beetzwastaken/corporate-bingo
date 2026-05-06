// History: reverse-chron list of completed rounds.
// Reads state.rounds from store (already populated by polling on Game page).
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import type { RoundView, GameStateView, LetterFeedback } from '../lib/api';
import { GuessRow } from '../components/GuessRow';

function maskDisplay(display: string): string {
  return display.replace(/[A-Za-z]/g, '_');
}

export function History() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, error, loading, setGame, refresh } = useGameStore();

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
        <Link to={`/game/${gameId}`} className="text-j-muted text-xs font-mono hover:text-j-tertiary self-start">← Game</Link>
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

function RoundCard({ round, state }: { round: RoundView; state: GameStateView }) {
  const me = state.players.find((p) => p.playerId === state.you);
  const others = state.players.filter((p) => p.playerId !== state.you);
  const myState = round.you;
  const oppById = new Map(
    round.opponents
      .filter((o): o is { playerId: string; guesses: string[]; feedbacks: LetterFeedback[][]; solved: boolean; solvedOnGuess: number | null; pointsEarned: number } => 'guesses' in o)
      .map((o) => [o.playerId, o])
  );
  const colsClass = state.players.length === 2 ? 'grid-cols-2' : 'grid-cols-1';
  const pattern = round.word ? maskDisplay(round.word.display) : '';

  return (
    <div className="bg-j-surface border border-j-muted/20 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-j-tertiary text-xs font-mono uppercase tracking-wider">
          Round {round.roundNumber}
        </span>
        <span className="text-j-accent text-sm font-bold">{round.word?.display ?? '—'}</span>
      </div>
      <div className={`grid gap-3 ${colsClass}`}>
        <PlayerColumn name={me?.name ?? 'You'} guesses={myState?.guesses ?? []} feedbacks={myState?.feedbacks ?? []} pattern={pattern} points={myState?.pointsEarned ?? 0} />
        {others.map((p) => {
          const o = oppById.get(p.playerId);
          return (
            <PlayerColumn
              key={p.playerId}
              name={p.name}
              guesses={o?.guesses ?? []}
              feedbacks={o?.feedbacks ?? []}
              pattern={pattern}
              points={o?.pointsEarned ?? 0}
            />
          );
        })}
      </div>
    </div>
  );
}

function PlayerColumn({ name, guesses, feedbacks, pattern, points }: {
  name: string;
  guesses: string[];
  feedbacks: LetterFeedback[][];
  pattern: string;
  points: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider">{name}</p>
      {guesses.length > 0 && pattern ? (
        <div className="flex flex-col gap-1">
          {guesses.map((g, i) => (
            <GuessRow key={i} pattern={pattern} guess={g} feedback={feedbacks[i] ?? []} />
          ))}
        </div>
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
