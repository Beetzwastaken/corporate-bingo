// Create new Decode game. Posts to backend, redirects to game view.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createGame } from '../lib/api';
import { getUserName, setUserName } from '../lib/identity';

export function CreateGame() {
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState('');
  const [creatorName, setCreatorName] = useState(getUserName() ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lobbyName.trim() || !creatorName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setUserName(creatorName);
      const res = await createGame(lobbyName.trim(), creatorName.trim());
      navigate(`/decode/game/${res.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">New Decode Game</h1>
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mt-1">
          Pick a lobby name + your name
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
            placeholder="Q4 Standup vs Kevin"
            className="bg-j-surface border border-j-muted/20 rounded-lg px-3 py-2 text-j-text outline-none focus:border-j-accent/60"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-j-secondary text-xs font-mono uppercase tracking-wider">Your name</span>
          <input
            type="text"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            maxLength={40}
            placeholder="Ryan"
            className="bg-j-surface border border-j-muted/20 rounded-lg px-3 py-2 text-j-text outline-none focus:border-j-accent/60"
            required
          />
        </label>

        {error && <p className="text-j-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={busy || !lobbyName.trim() || !creatorName.trim()}
          className="p-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
        >
          {busy ? 'Creating…' : 'Create Game'}
        </button>

        <Link to="/decode" className="text-center text-j-muted text-xs font-mono">← Back</Link>
      </form>
    </div>
  );
}
