import { useState, useEffect } from 'react';
import { useBingoStore } from '../../utils/store';

export function RoomManager() {
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerNameInput] = useState('');
  const [error, setError] = useState('');
  
  const {
    currentRoom,
    currentPlayer,
    playerName: storedPlayerName,
    isConnecting,
    isConnected,
    connectionError,
    setPlayerName,
    createRoom,
    joinRoom,
    leaveRoom
  } = useBingoStore();

  // Initialize player name input with stored value if empty
  useEffect(() => {
    if (!playerName && storedPlayerName) {
      setPlayerNameInput(storedPlayerName);
    }
  }, [storedPlayerName, playerName]);

  const validateRoomCode = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    return /^[A-Z0-9]{6}$/.test(cleaned);
  };

  const handleSetPlayerName = () => {
    const trimmed = playerName.trim();
    if (trimmed.length >= 2 && trimmed.length <= 30) {
      setPlayerName(trimmed);
      setError('');
    } else {
      setError('Name must be 2-30 characters');
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    
    if (!storedPlayerName) {
      setError('Set your name first');
      return;
    }

    setError('');
    const result = await createRoom(roomName.trim());
    
    if (!result.success) {
      setError(result.error || 'Could not create room');
    } else {
      setRoomName('');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError('Room code is required');
      return;
    }
    
    if (!validateRoomCode(joinCode)) {
      setError('Code must be 6 characters');
      return;
    }
    
    if (!storedPlayerName) {
      setError('Set your name first');
      return;
    }

    setError('');
    const result = await joinRoom(joinCode.toUpperCase());
    
    if (!result.success) {
      setError(result.error || 'Could not join room');
    } else {
      setJoinCode('');
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setError('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Error Display */}
      {(error || connectionError) && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <p className="text-red-300 text-sm font-medium">{error || connectionError}</p>
          </div>
        </div>
      )}

      {/* Player Name Setup */}
      {!storedPlayerName && (
        <div className="apple-panel p-6 bg-yellow-900/10 border-yellow-500/30">
          <h2 className="text-lg font-semibold text-apple-text mb-3">
            Player Setup
          </h2>
          <p className="text-apple-secondary text-sm mb-4">Set your name to continue</p>
          <div className="space-y-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerNameInput(e.target.value)}
              className="apple-input w-full"
              placeholder="Your name"
              maxLength={30}
              onKeyPress={(e) => e.key === 'Enter' && handleSetPlayerName()}
            />
            <button
              onClick={handleSetPlayerName}
              disabled={!playerName.trim() || isConnecting}
              className="apple-button w-full justify-center"
            >
              Set Name
            </button>
          </div>
        </div>
      )}

      {/* Current Room Status */}
      {currentRoom && (
        <div className="apple-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-apple-text">
                Current Room
              </h2>
              <p className="text-apple-accent font-medium text-lg">{currentRoom.name}</p>
            </div>
            <button
              onClick={handleLeaveRoom}
              disabled={isConnecting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-apple-darkest disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors text-sm"
            >
              Leave
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-apple-secondary">Room Code</span>
              <span className="font-mono text-apple-accent bg-apple-darkest px-3 py-1 rounded-md text-base">{currentRoom.code}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-apple-secondary">Players</span>
              <span className="text-apple-text">{currentRoom.players.length}/{currentRoom.maxPlayers || 10}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-apple-secondary">Your Name</span>
              <div className="flex items-center space-x-2">
                <span className="text-apple-text">{currentPlayer?.name}</span>
                {currentPlayer?.isHost && <span className="text-yellow-400 text-xs">(Host)</span>}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-apple-secondary">Status</span>
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs">{isConnected ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Player List */}
          <div className="mt-6 pt-4 border-t border-apple-border">
            <h3 className="text-sm font-medium text-apple-secondary mb-3">Players ({currentRoom.players.length})</h3>
            <div className="space-y-2">
              {currentRoom.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-apple-darkest rounded-lg p-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-apple-text font-medium text-sm">{player.name}</span>
                      {player.isHost && <span className="text-yellow-400 text-xs">(Host)</span>}
                      {player.id === currentPlayer?.id && <span className="text-apple-accent text-xs">(You)</span>}
                    </div>
                    <div className="text-xs text-apple-secondary">
                      Score: {player.currentScore || 0}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-apple-secondary'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create or Join Room */}
      {!currentRoom && storedPlayerName && (
        <div className="space-y-6">
          {/* Create Room */}
          <div className="apple-panel p-6">
            <h2 className="text-lg font-semibold text-apple-text mb-4">Create Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-secondary mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="apple-input w-full"
                  placeholder="Meeting name"
                  maxLength={50}
                  disabled={isConnecting}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || isConnecting}
                className="apple-button w-full justify-center bg-emerald-600 hover:bg-emerald-700"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="apple-panel p-6">
            <h2 className="text-lg font-semibold text-apple-text mb-4">Join Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-secondary mb-2">Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="apple-input w-full text-center font-mono tracking-wider text-lg"
                  placeholder="ROOM123"
                  maxLength={6}
                  disabled={isConnecting}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || isConnecting}
                className="apple-button w-full justify-center"
              >
                {isConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Join Room'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Info */}
      {!currentRoom && (
        <div className="apple-panel p-6">
          <h2 className="text-lg font-semibold text-apple-text mb-4">Game Features</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-medium text-apple-text text-sm mb-1">Unique Boards</h3>
              <p className="text-xs text-apple-secondary">Unique cards for each player</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-medium text-apple-text text-sm mb-1">Real-time</h3>
              <p className="text-xs text-apple-secondary">Instant synchronization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🔕</span>
              </div>
              <h3 className="font-medium text-apple-text text-sm mb-1">Silent Mode</h3>
              <p className="text-xs text-apple-secondary">Play without interrupting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🌐</span>
              </div>
              <h3 className="font-medium text-apple-text text-sm mb-1">Global</h3>
              <p className="text-xs text-apple-secondary">Low latency worldwide</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}