// Jargon landing. Lists user's games + entry to create new.
import { Link } from 'react-router-dom';
import { JargonLogo } from '../../components/JargonLogo';
import { MyGamesList } from '../components/MyGamesList';
import { getOrCreateUserId, getUserName } from '../lib/identity';

export function Home() {
  // Touch identity on landing — ensures userId exists before any API call.
  getOrCreateUserId();
  const name = getUserName();

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <header className="text-center mb-10">
        <div className="w-12 h-12 mx-auto mb-3"><JargonLogo size={48} /></div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-j-accent">Jargon</span>
        </h1>
        <p className="text-j-tertiary text-xs font-mono uppercase tracking-wider mt-1">
          {name ? `Playing as ${name}` : '2 players · async'}
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col gap-6">
        <section>
          <h2 className="text-sm font-mono uppercase tracking-wider text-j-secondary mb-3">My Games</h2>
          <MyGamesList />
        </section>

        <Link
          to="/new"
          className="block p-4 bg-j-accent/10 hover:bg-j-accent/20 border border-j-accent/30 rounded-xl text-center text-j-accent transition-colors"
        >
          + Create New Game
        </Link>
      </main>
    </div>
  );
}
