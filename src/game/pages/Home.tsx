// Jargon landing. Lists user's games + entry to create new.
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { JargonLogo } from '../../components/JargonLogo';
import { MyGamesList } from '../components/MyGamesList';
import { getOrCreateUserId, getUserName, setUserName } from '../lib/identity';

export function Home() {
  // Touch identity on landing — ensures userId exists before any API call.
  getOrCreateUserId();
  const [name, setName] = useState<string>(getUserName() ?? '');
  const [editing, setEditing] = useState<boolean>(!getUserName());
  const [draft, setDraft] = useState<string>(name);

  function save() {
    const trimmed = draft.trim().slice(0, 40);
    if (!trimmed) return;
    setUserName(trimmed);
    setName(trimmed);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-j-bg text-j-text font-display flex flex-col items-center px-6 py-10">
      <header className="text-center mb-10">
        <div className="w-12 h-12 mx-auto mb-3"><JargonLogo size={48} /></div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-j-accent">Jargon</span>
        </h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider">
          {editing ? (
            <>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(name); setEditing(false); } }}
                maxLength={40}
                placeholder="Your name"
                autoFocus
                className="bg-j-surface border border-j-muted/30 rounded px-2 py-1 text-j-text outline-none focus:border-j-accent/60 tracking-normal text-sm"
              />
              <button
                type="button"
                onClick={save}
                disabled={!draft.trim()}
                aria-label="Save name"
                className="p-1.5 rounded hover:bg-j-surface text-j-accent hover:text-j-accent-hover disabled:opacity-40 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => { setDraft(name); setEditing(false); }}
                aria-label="Cancel"
                className="p-1.5 rounded hover:bg-j-surface text-j-tertiary hover:text-j-text transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { setDraft(name); setEditing(true); }}
              className="group flex items-center gap-2 text-j-tertiary hover:text-j-text transition-colors"
              aria-label="Edit your name"
            >
              <span>Playing as {name}</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50 group-hover:opacity-100 transition-opacity"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
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
