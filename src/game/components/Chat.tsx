// Per-lobby async chat panel. Polling refresh comes from the parent Game page.
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/api';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const ageMs = now - ts;
  if (ageMs < 60_000) return 'just now';
  if (ageMs < 3_600_000) return `${Math.floor(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.floor(ageMs / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Chat({
  messages,
  you,
  onSend
}: {
  messages: ChatMessage[];
  you: string;
  onSend: (text: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages while open.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSend(text);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full bg-j-surface border border-j-muted/20 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-j-surface/60 transition-colors"
      >
        <span className="text-j-secondary text-xs font-mono uppercase tracking-wider">
          Chat {messages.length > 0 && <span className="text-j-tertiary">({messages.length})</span>}
        </span>
        <span className="text-j-tertiary text-xs font-mono">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="border-t border-j-muted/20 flex flex-col gap-2 p-3">
          <div ref={scrollRef} className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
            {messages.length === 0 ? (
              <p className="text-j-tertiary text-xs font-mono py-4 text-center">No messages yet.</p>
            ) : (
              messages.map((m) => {
                const isMe = m.playerId === you;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <span className={isMe ? 'text-j-accent' : 'text-j-secondary'}>{m.name}</span>
                      <span className="text-j-tertiary">{formatTime(m.createdAt)}</span>
                    </div>
                    <p className={`text-sm break-words max-w-[85%] mt-0.5 px-3 py-1.5 rounded-lg ${isMe ? 'bg-j-accent/15 text-j-text' : 'bg-j-bg/60 text-j-text'}`}>
                      {m.body}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={submit} className="flex gap-2 mt-1">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="Send a message…"
              disabled={busy}
              className="flex-1 bg-j-bg border border-j-muted/30 rounded-lg px-3 py-2 text-sm text-j-text outline-none focus:border-j-accent/60 disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              className="px-3 py-2 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent text-sm disabled:opacity-40 transition-colors"
            >
              {busy ? '…' : 'Send'}
            </button>
          </form>
          {error && <p className="text-j-error text-xs font-mono">{error}</p>}
        </div>
      )}
    </section>
  );
}
