// Opponent landing from invite link. Prompts name, posts join, redirects.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { joinGame } from '../lib/api';
import { getUserName, setUserName } from '../lib/identity';

export function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState(getUserName() ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gameId || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setUserName(name);
      await joinGame(gameId, name.trim());
      navigate(`/decode/game/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
      setBusy(false);
    }
  }

  if (!gameId) {
    return <div className="min-h-screen bg-j-bg text-j-text flex items-center justify-center">Invalid link.</div>;
  }

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">Join Decode Game</h1>
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mt-1">
          Enter your name to join
        </p>
      </header>

      <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-j-secondary text-xs font-mono uppercase tracking-wider">Your name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Kevin"
            className="bg-j-surface border border-j-muted/20 rounded-lg px-3 py-2 text-j-text outline-none focus:border-j-accent/60"
            required
            autoFocus
          />
        </label>

        {error && <p className="text-j-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="p-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
        >
          {busy ? 'Joining…' : 'Join Game'}
        </button>

        <Link to="/decode" className="text-center text-j-muted text-xs font-mono">← Cancel</Link>
      </form>
    </div>
  );
}
