// MyGamesList: per-player active game dashboard. Stub for Phase 5.
// Phase 8 will add status logic and richer rendering.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyGames, type DecodeGameSummary } from '../lib/api';

export function MyGamesList() {
  const [games, setGames] = useState<DecodeGameSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyGames()
      .then((g) => { if (!cancelled) setGames(g); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <p className="text-j-error text-xs font-mono">Couldn't load games: {error}</p>;
  }
  if (games === null) {
    return <p className="text-j-tertiary text-xs font-mono">Loading…</p>;
  }
  if (games.length === 0) {
    return <p className="text-j-tertiary text-xs font-mono">No games yet. Create one below.</p>;
  }
  return (
    <ul className="flex flex-col gap-2 w-full">
      {games.map((g) => (
        <li key={g.gameId}>
          <Link
            to={`/decode/game/${g.gameId}`}
            className="block p-4 bg-j-surface hover:bg-j-hover border border-j-muted/20 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-j-text font-medium">{g.lobbyName}</span>
              <span className="text-j-tertiary text-xs font-mono">
                {g.yourScore} – {g.opponentScore}
              </span>
            </div>
            <div className="text-j-tertiary text-xs mt-1">
              vs {g.opponentName ?? 'waiting…'} · {g.status}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
