import { Routes, Route, Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DecodeHome } from './pages/DecodeHome';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { useDecodeStore } from './stores/decodeStore';

// Game view placeholder for Phase 5 — full UI in Phase 6.
function GamePlaceholder() {
  const { gameId } = useParams<{ gameId: string }>();
  const { state, error, setGame, refresh } = useDecodeStore();

  useEffect(() => {
    if (gameId) {
      setGame(gameId);
      refresh();
    }
  }, [gameId, setGame, refresh]);

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">{state?.lobbyName ?? 'Loading…'}</h1>
      <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mb-6">
        Status: {state?.status ?? '…'}
      </p>

      {error && <p className="text-j-error text-xs font-mono mb-4">{error}</p>}

      {state && (
        <div className="w-full max-w-md flex flex-col gap-2">
          <p className="text-j-secondary text-sm">
            {state.players.length === 1
              ? 'Waiting for opponent. Share invite link:'
              : `Players: ${state.players.map((p) => p.name).join(' vs ')}`}
          </p>

          {state.players.length === 1 && gameId && (
            <code className="block p-3 bg-j-surface rounded-lg text-j-accent text-xs break-all">
              {`${window.location.origin}/decode/join/${gameId}`}
            </code>
          )}

          {state.players.length === 2 && (
            <p className="text-j-tertiary text-xs font-mono">Round UI coming in Phase 6.</p>
          )}
        </div>
      )}

      <Link to="/decode" className="mt-8 text-j-muted text-xs font-mono">← Back</Link>
    </div>
  );
}

export function DecodeApp() {
  return (
    <Routes>
      <Route path="/" element={<DecodeHome />} />
      <Route path="new" element={<CreateGame />} />
      <Route path="join/:gameId" element={<JoinGame />} />
      <Route path="game/:gameId" element={<GamePlaceholder />} />
      <Route path="game/:gameId/history" element={<GamePlaceholder />} />
      <Route path="*" element={<DecodeHome />} />
    </Routes>
  );
}
