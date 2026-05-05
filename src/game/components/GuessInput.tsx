import { useState } from 'react';

export function GuessInput({
  guessesRemaining,
  onSubmit,
  disabled
}: {
  guessesRemaining: number;
  onSubmit: (guess: string) => Promise<void>;
  disabled: boolean;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || busy || disabled) return;
    setBusy(true);
    try {
      await onSubmit(value.trim());
      setValue('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Your guess…"
        maxLength={80}
        disabled={disabled || busy}
        className="bg-j-surface border border-j-muted/20 rounded-lg px-3 py-3 text-j-text outline-none focus:border-j-accent/60 disabled:opacity-40"
        autoFocus
      />
      <div className="flex items-center justify-between">
        <span className="text-j-tertiary text-xs font-mono">{guessesRemaining} guess{guessesRemaining === 1 ? '' : 'es'} left</span>
        <button
          type="submit"
          disabled={!value.trim() || busy || disabled}
          className="px-4 py-2 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent text-sm disabled:opacity-40 transition-colors"
        >
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
