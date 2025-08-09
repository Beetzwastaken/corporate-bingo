import { useState, useEffect } from 'react';
import { useBingoStore } from '../../utils/store';
import { useMultiRoomStore, type RoomType } from '../../stores/multiRoomStore';
import { Leaderboard } from './Leaderboard';
import { RoomTabs } from './RoomTabs';
import { RoomTypeSelector } from './RoomTypeSelector';
import { showScoreToast, showGameToast } from '../shared/ToastNotification';

export function RoomManager() {
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerNameInput] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('single');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [previousScores, setPreviousScores] = useState<Record<string, number>>({});
  
  const {
    playerName: storedPlayerName,
    isConnecting,
    isConnected,
    connectionError,
    setPlayerName
  } = useBingoStore();
  
  const {
    rooms,
    activeRoomCode,
    currentPlayer,
    createRoom: createMultiRoom,
    joinRoom: joinMultiRoom,
    leaveRoom: leaveMultiRoom,
    setActiveRoom,
    getActiveRoom,
    cleanupExpiredRooms
  } = useMultiRoomStore();
  
  const currentRoom = getActiveRoom()?.room || null;
  const hasRooms = Object.keys(rooms).length > 0;

  // Initialize player name input with stored value if empty
  useEffect(() => {
    if (!playerName && storedPlayerName) {
      setPlayerNameInput(storedPlayerName);
    }
  }, [storedPlayerName, playerName]);
  
  // Cleanup expired rooms periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredRooms();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [cleanupExpiredRooms]);

  // Track score changes and show notifications
  useEffect(() => {
    if (!currentRoom?.players) return;

    currentRoom.players.forEach(player => {
      const currentScore = player.currentScore || 0;
      const previousScore = previousScores[player.id] || 0;
      const scoreDiff = currentScore - previousScore;

      if (scoreDiff !== 0 && previousScore !== undefined && previousScores[player.id] !== undefined) {
        // Show toast notification for score changes
        if (player.id === currentPlayer?.id) {
          // Show notification for current player
          const reason = getScoreChangeReason(scoreDiff);
          showScoreToast(scoreDiff, reason);
        } else {
          // Show notification for other players (less prominent)
          if (scoreDiff > 0) {
            showGameToast(`${player.name} scored ${scoreDiff} points!`, undefined, 'success');
          }
        }
      }
    });

    // Update previous scores
    const newPreviousScores: Record<string, number> = {};
    currentRoom.players.forEach(player => {
      newPreviousScores[player.id] = player.currentScore || 0;
    });
    setPreviousScores(newPreviousScores);
  }, [currentRoom?.players, currentPlayer?.id, previousScores]);

  // Helper function to determine score change reason
  const getScoreChangeReason = (scoreDiff: number): string => {
    if (scoreDiff === 10) return "Square verified!";
    if (scoreDiff === 50) return "3-in-a-row bonus!";
    if (scoreDiff === 100) return "4-in-a-row bonus!";
    if (scoreDiff === 200) return "BINGO achieved!";
    if (scoreDiff === -50) return "Self-claim penalty";
    if (scoreDiff > 0) return `+${scoreDiff} points earned`;
    return `${scoreDiff} points penalty`;
  };

  const validateRoomCode = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    // Accept both old format (6 chars) and new format (MTG-XXXX or TEAM-XXXX)
    return /^[A-Z0-9]{6}$/.test(cleaned) || /^(MTG|TEAM)-[A-Z0-9]{4}$/.test(cleaned);
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
    const result = await createMultiRoom(roomName.trim(), storedPlayerName, roomType);
    
    if (!result.success) {
      setError(result.error || 'Could not create room');
    } else {
      setRoomName('');
      setShowCreateForm(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError('Room code is required');
      return;
    }
    
    if (!validateRoomCode(joinCode)) {
      setError('Code must be 6 characters or MTG-/TEAM- format');
      return;
    }
    
    if (!storedPlayerName) {
      setError('Set your name first');
      return;
    }

    setError('');
    const result = await joinMultiRoom(joinCode.toUpperCase(), storedPlayerName);
    
    if (!result.success) {
      setError(result.error || 'Could not join room');
    } else {
      setJoinCode('');
    }
  };

  const handleLeaveRoom = (roomCode?: string) => {
    if (roomCode) {
      leaveMultiRoom(roomCode);
    } else if (activeRoomCode) {
      leaveMultiRoom(activeRoomCode);
    }
    setError('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room Tabs */}
      {hasRooms && (
        <RoomTabs
          rooms={rooms}
          activeRoomCode={activeRoomCode}
          onRoomChange={setActiveRoom}
          onRoomClose={handleLeaveRoom}
        />
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <div className="apple-panel p-4 bg-yellow-900/10 border-yellow-500/30">
            <h2 className="text-lg font-semibold text-apple-text mb-2">
              Player Setup
            </h2>
            <p className="text-apple-secondary text-sm mb-3">Set your name to continue</p>
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
          <div className="apple-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`text-base ${
                  currentRoom.roomType === 'single' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {currentRoom.roomType === 'single' ? '⏱️' : '♾️'}
                </span>
                <h2 className="text-base font-semibold text-apple-text">
                  Current Room
                </h2>
                <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                  currentRoom.roomType === 'single' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {currentRoom.roomType === 'single' ? 'Meeting' : 'Team'}
                </span>
              </div>
              <button
                onClick={() => handleLeaveRoom()}
                disabled={isConnecting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-apple-darkest disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors text-xs"
              >
                Leave
              </button>
            </div>
            
            <div className="mb-3">
              <p className="text-apple-accent font-medium text-base">{currentRoom.name}</p>
              {currentRoom.roomType === 'single' && currentRoom.expiresAt && (
                <p className="text-xs text-apple-secondary mt-0.5">
                  Expires: {new Date(currentRoom.expiresAt).toLocaleDateString()} at{' '}
                  {new Date(currentRoom.expiresAt).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-apple-secondary">Room Code</span>
                  <span className="font-mono text-apple-accent bg-apple-darkest px-2 py-0.5 rounded text-sm">{currentRoom.code}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-apple-secondary text-xs">Players</span>
                <span className="text-apple-text text-xs">{currentRoom.players.length}/{currentRoom.maxPlayers || 10}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-apple-secondary text-xs">Status</span>
                <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs">{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-apple-secondary text-xs">Your Name</span>
                <div className="flex items-center space-x-1">
                  <span className="text-apple-text text-xs">{currentPlayer?.name}</span>
                  {currentPlayer?.isHost && <span className="text-yellow-400 text-xs">(Host)</span>}
                </div>
              </div>
            </div>

            {/* Enhanced Leaderboard */}
            <div className="mt-4 pt-3 border-t border-apple-border">
              <Leaderboard 
                players={currentRoom.players} 
                currentPlayerId={currentPlayer?.id}
                compact={true}
              />
            </div>
          </div>
        )}

        {/* Create or Join Room */}
        {(!hasRooms || showCreateForm) && storedPlayerName && (
          <div className="space-y-4">
            {/* Create Room */}
            <div className="apple-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-apple-text">Create Room</h2>
                {hasRooms && (
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-apple-secondary hover:text-apple-text transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <RoomTypeSelector
                  selectedType={roomType}
                  onTypeChange={setRoomType}
                  disabled={isConnecting}
                  compact={true}
                />
                <div>
                  <label className="block text-sm font-medium text-apple-secondary mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="apple-input w-full"
                    placeholder={roomType === 'single' ? 'Meeting name' : 'Team name'}
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
                    `Create ${roomType === 'single' ? 'Meeting' : 'Team'} Room`
                  )}
                </button>
              </div>
            </div>

            {/* Join Room */}
            <div className="apple-panel p-4">
              <h2 className="text-base font-semibold text-apple-text mb-3">Join Room</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-apple-secondary mb-2">Room Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="apple-input w-full text-center font-mono tracking-wider"
                    placeholder="MTG-A1B2 or TEAM-C3D4"
                    maxLength={9}
                    disabled={isConnecting}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <p className="text-xs text-apple-secondary mt-1">
                    Enter a meeting code (MTG-XXXX) or team code (TEAM-XXXX)
                  </p>
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
        
        {/* Show Create Room Button for Multi-Room */}
        {hasRooms && !showCreateForm && storedPlayerName && (
          <div className="apple-panel p-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="apple-button w-full justify-center bg-emerald-600 hover:bg-emerald-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Another Room
            </button>
          </div>
        )}

        {/* Features Info */}
        {!hasRooms && (
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
                  <span className="text-xl">⏱️</span>
                </div>
                <h3 className="font-medium text-apple-text text-sm mb-1">Meeting Rooms</h3>
                <p className="text-xs text-apple-secondary">Auto-expire after meetings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-apple-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">♾️</span>
                </div>
                <h3 className="font-medium text-apple-text text-sm mb-1">Team Rooms</h3>
                <p className="text-xs text-apple-secondary">Persistent with leaderboards</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}