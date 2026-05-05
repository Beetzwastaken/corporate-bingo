// Create new game. Posts to backend, redirects to game view.
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createGame } from '../lib/api';
import { getUserName } from '../lib/identity';

export function CreateGame() {
  const navigate = useNavigate();
  const userName = getUserName();
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No username → bounce to home so user can set one.
  if (!userName) return <Navigate to="/" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lobbyName.trim() || !userName) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createGame(lobbyName.trim(), userName, maxPlayers);
      navigate(`/game/${res.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">New Game</h1>
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mt-1">
          Playing as {userName}
        </p>
      </header>

      <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-j-secondary text-xs font-mono uppercase tracking-wider">Lobby name</span>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            maxLength={80}
            className="bg-j-surface border border-j-muted/20 rounded-lg px-3 py-2 text-j-text outline-none focus:border-j-accent/60"
            required
            autoFocus
          />
        </label>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-j-secondary text-xs font-mono uppercase tracking-wider mb-1">Players</legend>
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxPlayers(n)}
                className={`flex-1 py-2 rounded-lg border font-mono text-sm transition-colors ${
                  maxPlayers === n
                    ? 'bg-j-accent/20 border-j-accent/40 text-j-accent'
                    : 'bg-j-surface border-j-muted/20 text-j-tertiary hover:text-j-text'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-j-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={busy || !lobbyName.trim()}
          className="p-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
        >
          {busy ? 'Creating…' : 'Create Game'}
        </button>

        <Link to="/" className="text-center text-j-muted text-xs font-mono">← Back</Link>
      </form>
    </div>
  );
}
