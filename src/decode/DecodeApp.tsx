import { Routes, Route, Link } from 'react-router-dom';

function Placeholder({ title }: { title: string }) {
  return (
    <div className="h-screen bg-j-bg text-j-text font-display flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-3">
        <span className="text-j-accent">Decode</span>
      </h1>
      <p className="text-j-secondary mb-8 text-sm font-mono uppercase tracking-wider">{title}</p>
      <p className="text-j-tertiary text-sm mb-10 max-w-md text-center">
        Decode coming soon. A 2-player asynchronous buzzword guessing game.
      </p>
      <Link to="/" className="text-j-accent hover:text-j-accent-hover text-sm font-mono">
        ← Back
      </Link>
    </div>
  );
}

export function DecodeApp() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Home" />} />
      <Route path="new" element={<Placeholder title="New Game" />} />
      <Route path="join/:gameId" element={<Placeholder title="Join Game" />} />
      <Route path="game/:gameId" element={<Placeholder title="Game" />} />
      <Route path="game/:gameId/history" element={<Placeholder title="History" />} />
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}
