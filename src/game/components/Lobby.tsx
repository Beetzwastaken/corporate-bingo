// Pre-round lobby: invite, host-start, or ready-up between rounds.
import { useState } from 'react';
import type { GameStateView } from '../lib/api';

export function Lobby({ state, gameId, onReady, onStart, busy }: {
  state: GameStateView;
  gameId: string;
  onReady: () => void;
  onStart: () => void;
  busy: boolean;
}) {
  const me = state.players.find((p) => p.playerId === state.you);
  const isHost = me?.slot === 0;
  const others = state.players.filter((p) => p.playerId !== state.you);
  const canStart = state.status === 'waiting' && state.players.length >= 2;
  const [copied, setCopied] = useState(false);

  function copyInvite(url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Solo waiting → invite link
  if (state.players.length < 2) {
    const inviteUrl = `${window.location.origin}/join/${gameId}`;
    return (
      <div className="flex flex-col gap-3 w-full">
        <p className="text-j-secondary text-sm">
          Waiting for players ({state.players.length}/{state.maxPlayers}). Share invite link:
        </p>
        <code className="block p-3 bg-j-surface rounded-lg text-j-accent text-xs break-all select-all">
          {inviteUrl}
        </code>
        <button
          type="button"
          onClick={() => copyInvite(inviteUrl)}
          className={`text-xs font-mono self-start transition-colors ${copied ? 'text-j-success' : 'text-j-accent hover:text-j-accent-hover'}`}
        >
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
    );
  }

  // Pre-start (≥2 joined, not yet started): host can start; others wait.
  if (state.status === 'waiting') {
    const inviteUrl = `${window.location.origin}/join/${gameId}`;
    const roomNotFull = state.players.length < state.maxPlayers;
    return (
      <div className="flex flex-col gap-3 w-full items-center">
        <p className="text-j-secondary text-sm text-center">
          {state.players.length}/{state.maxPlayers} joined: {state.players.map((p) => p.name).join(', ')}
        </p>
        {roomNotFull && (
          <>
            <code className="block p-3 bg-j-surface rounded-lg text-j-accent text-xs break-all select-all w-full">
              {inviteUrl}
            </code>
            <button
              type="button"
              onClick={() => copyInvite(inviteUrl)}
              className={`text-xs font-mono self-start transition-colors ${copied ? 'text-j-success' : 'text-j-accent hover:text-j-accent-hover'}`}
            >
              {copied ? 'Copied ✓' : 'Copy link'}
            </button>
          </>
        )}
        {isHost ? (
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart || busy}
            className="px-6 py-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
          >
            {busy ? 'Starting…' : 'Start Game'}
          </button>
        ) : (
          <p className="text-j-tertiary text-xs font-mono">Waiting on host to start.</p>
        )}
      </div>
    );
  }

  // Between-round ready-up
  const meReady = !!me?.readyForNextRound;
  const notReadyOthers = others.filter((p) => !p.readyForNextRound);

  return (
    <div className="flex flex-col gap-3 w-full items-center">
      <p className="text-j-secondary text-sm text-center">
        {meReady && notReadyOthers.length === 0
          ? 'Starting round…'
          : meReady
            ? `Waiting on ${notReadyOthers.map((p) => p.name).join(', ')} to ready up.`
            : notReadyOthers.length < others.length
              ? `${others.filter((p) => p.readyForNextRound).map((p) => p.name).join(', ')} ready. Your turn.`
              : 'Everyone needs to ready up to start.'}
      </p>
      <button
        type="button"
        onClick={onReady}
        disabled={meReady || busy}
        className="px-6 py-3 bg-j-accent/20 hover:bg-j-accent/30 border border-j-accent/40 rounded-lg text-j-accent disabled:opacity-40 transition-colors"
      >
        {meReady ? 'Ready ✓' : busy ? 'Loading…' : 'Ready Up'}
      </button>
    </div>
  );
}
