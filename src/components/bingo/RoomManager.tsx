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
      setError('Player name must be 2-30 characters');
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    
    if (!storedPlayerName) {
      setError('Please set your player name first');
      return;
    }

    setError('');
    const result = await createRoom(roomName.trim());
    
    if (!result.success) {
      setError(result.error || 'Failed to create room');
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
      setError('Room code must be 6 characters (letters and numbers)');
      return;
    }
    
    if (!storedPlayerName) {
      setError('Please set your player name first');
      return;
    }

    setError('');
    const result = await joinRoom(joinCode.toUpperCase());
    
    if (!result.success) {
      setError(result.error || 'Failed to join room');
    } else {
      setJoinCode('');
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {(error || connectionError) && (
        <div className="glass-panel rounded-lg p-4 bg-red-900/20 border border-red-500/30">
          <div className="flex items-center space-x-2">
            <div className="text-red-400">⚠️</div>
            <p className="text-red-300 font-medium">{error || connectionError}</p>
          </div>
        </div>
      )}

      {/* Player Name Setup */}
      {!storedPlayerName && (
        <div className="glass-panel rounded-lg p-6 border border-yellow-500/30 bg-yellow-900/10">
          <h2 className="text-xl font-bold text-white mb-4">
            <span className="terminal-accent">&gt;</span> Player Setup
          </h2>
          <p className="text-gray-300 mb-4">Set your player name to create or join rooms:</p>
          <div className="flex space-x-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerNameInput(e.target.value)}
              className="control-input flex-1 p-3 border border-gray-600 rounded-lg text-sm"
              placeholder="Enter your name (2-30 characters)"
              maxLength={30}
              onKeyPress={(e) => e.key === 'Enter' && handleSetPlayerName()}
            />
            <button
              onClick={handleSetPlayerName}
              disabled={!playerName.trim() || isConnecting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Set Name
            </button>
          </div>
        </div>
      )}

      {/* Current Room Status */}
      {currentRoom && (
        <div className="glass-panel rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                <span className="terminal-accent">&gt;</span> Current Room
              </h2>
              <div className="mt-2">
                <p className="text-lg text-blue-300 font-medium">{currentRoom.name}</p>
                <div className="text-gray-400 space-y-1">
                  <p>
                    <span className="terminal-accent">Room Code:</span> 
                    <span className="font-mono text-yellow-300 mx-2 text-lg">{currentRoom.code}</span>
                    <span className="mx-2">|</span>
                    <span className="terminal-accent">Players:</span> {currentRoom.players.length}/{currentRoom.maxPlayers || 10}
                  </p>
                  <p>
                    <span className="terminal-accent">Your Name:</span> {currentPlayer?.name}
                    {currentPlayer?.isHost && <span className="text-yellow-300 ml-2">(Host)</span>}
                    <span className="mx-2">|</span>
                    <span className={`terminal-accent ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              disabled={isConnecting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>

          {/* Player List */}
          <div className="mt-6 border-t border-gray-600/50 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Players in Room</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentRoom.players.map((player) => (
                <div key={player.id} className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {player.name}
                        {player.isHost && <span className="text-yellow-300 text-sm ml-1">(Host)</span>}
                        {player.id === currentPlayer?.id && <span className="text-blue-300 text-sm ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        Score: {player.currentScore || 0}
                        <span className="mx-2">•</span>
                        <span className={player.isConnected ? 'text-green-400' : 'text-red-400'}>
                          {player.isConnected ? 'Online' : 'Offline'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create or Join Room */}
      {!currentRoom && storedPlayerName && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              <span className="terminal-accent">&gt;</span> Create Room
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="control-input w-full p-3 border border-gray-600 rounded-lg text-sm"
                  placeholder="e.g., Daily Standup, Sprint Planning"
                  maxLength={50}
                  disabled={isConnecting}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || isConnecting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    Create Room
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              <p><span className="terminal-accent">//</span> Share the room code with colleagues</p>
              <p><span className="terminal-accent">//</span> Perfect for synchronized meeting bingo</p>
            </div>
          </div>

          {/* Join Room */}
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              <span className="terminal-accent">&gt;</span> Join Room
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="control-input w-full p-3 border border-gray-600 rounded-lg text-sm font-mono tracking-wider text-center"
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={isConnecting}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || isConnecting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  <>
                    Join Room
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              <p><span className="terminal-accent">//</span> Enter the 6-character room code</p>
              <p><span className="terminal-accent">//</span> Get it from your meeting organizer</p>
            </div>
          </div>
        </div>
      )}

      {/* Room Features */}
      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          <span className="terminal-accent">&gt;</span> Multiplayer Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-medium text-white mb-1">Unique Boards</h3>
            <p className="text-sm text-gray-400">Each player gets a unique board with different buzzwords</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-medium text-white mb-1">Real-time Sync</h3>
            <p className="text-sm text-gray-400">See player actions instantly across all devices</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-medium text-white mb-1">Democratic Verification</h3>
            <p className="text-sm text-gray-400">Players vote to verify buzzword claims</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-medium text-white mb-1">Anti-cheat System</h3>
            <p className="text-sm text-gray-400">Prevents self-verification and maintains fair play</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔕</div>
            <h3 className="font-medium text-white mb-1">Silent Mode</h3>
            <p className="text-sm text-gray-400">No notifications to blow your cover in meetings</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-medium text-white mb-1">Edge Network</h3>
            <p className="text-sm text-gray-400">Global Cloudflare deployment for low latency</p>
          </div>
        </div>
      </div>
    </div>
  );
}