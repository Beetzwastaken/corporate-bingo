// Game view — state-driven: lobby vs round vs results.
// Polling: refresh every 15s while visible + on focus/visibility change.
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDecodeStore } from '../stores/decodeStore';
import { readyForNextRound, submitGuess } from '../lib/api';
import { Scoreboard } from '../components/Scoreboard';
import { Lobby } from '../components/Lobby';
import { ClueCard } from '../components/ClueCard';
import { GuessInput } from '../components/GuessInput';
import { GuessHistory } from '../components/GuessHistory';
import { OpponentStatus } from '../components/OpponentStatus';
import { RoundResults } from '../components/RoundResults';

const POLL_INTERVAL_MS = 15000;

export function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, error, loading, setGame, refresh, setState } = useDecodeStore();
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    setGame(gameId);
    refresh();
  }, [gameId, setGame, refresh]);

  // Poll while visible
  useEffect(() => {
    if (!gameId) return;
    let interval: number | undefined;
    function startPoll() {
      stopPoll();
      interval = window.setInterval(() => { refresh(); }, POLL_INTERVAL_MS);
    }
    function stopPoll() {
      if (interval !== undefined) {
        window.clearInterval(interval);
        interval = undefined;
      }
    }
    function onVis() {
      if (document.visibilityState === 'visible') {
        refresh();
        startPoll();
      } else {
        stopPoll();
      }
    }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', refresh);
    if (document.visibilityState === 'visible') startPoll();
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', refresh);
      stopPoll();
    };
  }, [gameId, refresh]);

  const onReady = useCallback(async () => {
    if (!gameId) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const res = await readyForNextRound(gameId);
      setState(res.state);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionBusy(false);
    }
  }, [gameId, setState]);

  const onGuess = useCallback(async (guess: string) => {
    if (!gameId) return;
    setActionError(null);
    try {
      const res = await submitGuess(gameId, guess);
      setState(res.state);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Guess failed');
    }
  }, [gameId, setState]);

  if (!gameId) return <NotFound />;
  if (!state && loading) return <Centered>Loading…</Centered>;
  if (!state && error) return <Centered>{error}</Centered>;
  if (!state) return <Centered>—</Centered>;

  const round = state.currentRound;
  const isResults = round && round.bothComplete;
  const isActiveRound = round && !round.bothComplete;

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-8">
      <header className="w-full max-w-md mb-5 flex flex-col gap-1">
        <Link to="/decode" className="text-j-muted text-xs font-mono hover:text-j-tertiary self-start">← My Games</Link>
        <h1 className="text-xl font-bold mt-1">{state.lobbyName}</h1>
      </header>

      <main className="w-full max-w-md flex flex-col gap-5">
        <Scoreboard state={state} />

        {actionError && <p className="text-j-error text-xs font-mono">{actionError}</p>}

        {state.players.length < 2 || !round ? (
          <Lobby state={state} gameId={gameId} onReady={onReady} busy={actionBusy} />
        ) : isResults ? (
          <RoundResults round={round} state={state} onReady={onReady} busy={actionBusy} />
        ) : isActiveRound && round.you ? (
          <ActiveRound round={round} state={state} onGuess={onGuess} />
        ) : (
          <Lobby state={state} gameId={gameId} onReady={onReady} busy={actionBusy} />
        )}
      </main>
    </div>
  );
}

function ActiveRound({
  round,
  state,
  onGuess
}: {
  round: NonNullable<typeof state.currentRound>;
  state: import('../lib/api').DecodeStateView;
  onGuess: (g: string) => Promise<void>;
}) {
  const you = round.you!;
  const guessesRemaining = 4 - you.guesses.length;
  const opponent = state.players.find((p) => p.playerId !== state.you) ?? null;
  const currentClue = you.revealedClues[you.revealedClues.length - 1] ?? '…';
  const finishedSelf = you.solved || you.guesses.length >= 4;

  return (
    <div className="flex flex-col gap-4 w-full">
      <ClueCard clue={currentClue} clueNumber={you.revealedClues.length} totalClues={4} />
      <GuessHistory guesses={you.guesses} solvedOnGuess={you.solvedOnGuess} />
      {finishedSelf ? (
        <p className="text-j-secondary text-sm">
          {you.solved
            ? `Solved on guess ${you.solvedOnGuess}. Waiting on ${opponent?.name ?? 'opponent'}…`
            : `Out of guesses. Waiting on ${opponent?.name ?? 'opponent'} to finish.`}
        </p>
      ) : (
        <GuessInput
          guessesRemaining={guessesRemaining}
          onSubmit={onGuess}
          disabled={false}
        />
      )}
      <OpponentStatus round={round} opponent={opponent} />
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

function NotFound() {
  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center justify-center gap-3">
      <p>Game not found.</p>
      <Link to="/decode" className="text-j-accent text-xs font-mono">← Back</Link>
    </div>
  );
}
