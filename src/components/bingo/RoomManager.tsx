// RoomManager - Duo pairing UI
import { useState } from 'react';
import { useDuoStore } from '../../stores/duoStore';
import { showGameToast } from '../shared/ToastNotification';

type View = 'main' | 'create' | 'join';

export function RoomManager() {
  const [view, setView] = useState<View>('main');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    phase,
    pairCode,
    odName,
    partnerName,
    isPaired,
    isHost,
    createGame,
    joinGame,
    leaveGame
  } = useDuoStore();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createGame(playerName.trim());

    setIsLoading(false);

    if (result.success) {
      showGameToast('Game Created', `Share code: ${result.code}`, 'success');
    } else {
      setError(result.error || 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim() || joinCode.length !== 4) {
      setError('Please enter a 4-character code');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await joinGame(joinCode.trim().toUpperCase(), playerName.trim());

    setIsLoading(false);

    if (result.success) {
      showGameToast('Joined Game', 'Connecting to partner...', 'success');
    } else {
      setError(result.error || 'Failed to join game');
    }
  };

  const handleCopyCode = () => {
    if (pairCode) {
      navigator.clipboard.writeText(pairCode);
      showGameToast('Copied!', 'Code copied to clipboard', 'success');
    }
  };

  const handleCopyLink = () => {
    if (pairCode) {
      const link = `${window.location.origin}?join=${pairCode}`;
      navigator.clipboard.writeText(link);
      showGameToast('Link Copied!', 'Share this link with your partner', 'success');
    }
  };

  const handleLeave = () => {
    if (confirm('Leave this game?')) {
      leaveGame();
      setView('main');
      setPlayerName('');
      setJoinCode('');
    }
  };

  // If already paired or waiting
  if (phase !== 'unpaired') {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        {/* Status Card */}
        <div className="apple-panel p-6">
          {/* Paired State */}
          {isPaired ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
              <h2 className="text-lg font-semibold text-apple-text">
                Paired with {partnerName}
              </h2>
              <p className="text-apple-secondary text-sm">
                {phase === 'selecting'
                  ? 'Time to pick your bingo line!'
                  : phase === 'playing'
                  ? 'Game in progress'
                  : 'Connected'}
              </p>
            </div>
          ) : (
            /* Waiting State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-apple-accent/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-apple-accent border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-apple-text">
                Waiting for Partner
              </h2>
              <p className="text-apple-secondary text-sm">
                Share the code below with your teammate
              </p>
            </div>
          )}
        </div>

        {/* Code Display (when hosting) */}
        {isHost && pairCode && !isPaired && (
          <div className="apple-panel p-6 space-y-4">
            <div className="text-center">
              <p className="text-apple-secondary text-xs uppercase tracking-wider mb-2">
                Your Game Code
              </p>
              <div className="text-4xl font-mono font-bold text-cyan-400 tracking-widest">
                {pairCode}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 px-4 py-2 bg-apple-darkest hover:bg-apple-hover text-apple-text rounded-lg transition-colors text-sm font-medium"
              >
                📋 Copy Code
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-apple-accent hover:bg-apple-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
              >
                🔗 Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="apple-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-apple-secondary text-xs">Playing as</p>
              <p className="text-apple-text font-medium">{odName}</p>
            </div>
            {pairCode && (
              <div className="text-right">
                <p className="text-apple-secondary text-xs">Room</p>
                <p className="text-apple-text font-mono">{pairCode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Button */}
        <button
          onClick={handleLeave}
          className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
        >
          Leave Game
        </button>
      </div>
    );
  }

  // Main Menu
  if (view === 'main') {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="apple-panel p-6 text-center">
          <h2 className="text-lg font-semibold text-apple-text mb-2">
            Duo Mode
          </h2>
          <p className="text-apple-secondary text-sm">
            Play bingo with a partner. Same card, different lines.
          </p>
        </div>

        <button
          onClick={() => setView('create')}
          className="apple-panel p-6 text-left hover:bg-apple-hover transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h3 className="text-apple-text font-medium">Create Game</h3>
              <p className="text-apple-secondary text-sm">Start a new game and invite a partner</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView('join')}
          className="apple-panel p-6 text-left hover:bg-apple-hover transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h3 className="text-apple-text font-medium">Join Game</h3>
              <p className="text-apple-secondary text-sm">Enter a code to join your partner</p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Create Game Form
  if (view === 'create') {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <button
          onClick={() => { setView('main'); setError(null); }}
          className="flex items-center space-x-2 text-apple-secondary hover:text-apple-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="apple-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-apple-text">Create Game</h2>

          <div>
            <label className="block text-apple-secondary text-sm mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-apple-darkest border border-apple-border rounded-lg text-apple-text placeholder-apple-tertiary focus:border-apple-accent focus:outline-none"
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-apple-accent hover:bg-apple-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </div>
    );
  }

  // Join Game Form
  if (view === 'join') {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <button
          onClick={() => { setView('main'); setError(null); }}
          className="flex items-center space-x-2 text-apple-secondary hover:text-apple-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="apple-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-apple-text">Join Game</h2>

          <div>
            <label className="block text-apple-secondary text-sm mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-apple-darkest border border-apple-border rounded-lg text-apple-text placeholder-apple-tertiary focus:border-apple-accent focus:outline-none"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-apple-secondary text-sm mb-2">
              Game Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="XXXX"
              className="w-full px-4 py-3 bg-apple-darkest border border-apple-border rounded-lg text-apple-text placeholder-apple-tertiary focus:border-apple-accent focus:outline-none font-mono text-center text-2xl tracking-widest uppercase"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleJoinGame}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default RoomManager;
