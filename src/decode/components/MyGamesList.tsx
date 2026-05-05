// MyGamesList: per-player game dashboard with status badges.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyGames, type DecodeGameSummary } from '../lib/api';

const STATUS_META: Record<string, { label: string; classes: string }> = {
  your_turn:           { label: 'Your turn',       classes: 'bg-j-accent/20 text-j-accent border-j-accent/40' },
  waiting_on_opponent: { label: 'Waiting on opp',  classes: 'bg-j-surface text-j-tertiary border-j-muted/30' },
  round_complete:      { label: 'Round complete',  classes: 'bg-j-success/20 text-j-success border-j-success/40' },
  waiting:             { label: 'Awaiting opp',    classes: 'bg-j-surface text-j-tertiary border-j-muted/30' },
  game_over:           { label: 'Abandoned',       classes: 'bg-j-error/20 text-j-error border-j-error/40' }
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, classes: 'bg-j-surface text-j-tertiary border-j-muted/30' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${meta.classes}`}>
      {meta.label}
    </span>
  );
}

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
  // Sort: your_turn first, then by recency
  const sorted = [...games].sort((a, b) => {
    const aTurn = a.status === 'your_turn' ? 0 : 1;
    const bTurn = b.status === 'your_turn' ? 0 : 1;
    if (aTurn !== bTurn) return aTurn - bTurn;
    return b.lastActivity - a.lastActivity;
  });
  return (
    <ul className="flex flex-col gap-2 w-full">
      {sorted.map((g) => (
        <li key={g.gameId}>
          <Link
            to={`/decode/game/${g.gameId}`}
            className="block p-4 bg-j-surface hover:bg-j-hover border border-j-muted/20 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-j-text font-medium truncate">{g.lobbyName}</span>
              <span className="text-j-tertiary text-xs font-mono shrink-0">
                {g.yourScore} – {g.opponentScore}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-j-tertiary text-xs truncate">
                vs {g.opponentName ?? 'waiting…'}
              </span>
              <StatusBadge status={g.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
