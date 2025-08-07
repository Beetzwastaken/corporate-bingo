import { useState } from 'react';
import type { BingoRoom } from '../../types';

interface RoomManagerProps {
  currentRoom: BingoRoom | null;
  onCreateRoom: (roomName: string) => string;
  onJoinRoom: (code: string) => boolean;
  onLeaveRoom: () => void;
}

export function RoomManager({ currentRoom, onCreateRoom, onJoinRoom, onLeaveRoom }: RoomManagerProps) {
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    
    setIsCreating(true);
    setTimeout(() => {
      onCreateRoom(roomName);
      setRoomName('');
      setIsCreating(false);
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setTimeout(() => {
      const success = onJoinRoom(joinCode.toUpperCase());
      if (success) {
        setJoinCode('');
      }
      setIsJoining(false);
    }, 1000);
  };

  const mockRooms: BingoRoom[] = [
    { id: '1', name: 'Daily Standup', code: 'STAND1', players: 5, isActive: true },
    { id: '2', name: 'Sprint Planning', code: 'SPRINT', players: 8, isActive: true },
    { id: '3', name: 'Architecture Review', code: 'ARCH99', players: 3, isActive: true },
    { id: '4', name: 'All Hands Meeting', code: 'HANDS2', players: 12, isActive: true }
  ];

  return (
    <div className="space-y-6">
      {/* Current Room Status */}
      {currentRoom && (
        <div className="glass-panel rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                <span className="terminal-accent">&gt;</span> Current Room
              </h2>
              <div className="mt-2">
                <p className="text-lg text-blue-300 font-medium">{currentRoom.name}</p>
                <p className="text-gray-400">
                  <span className="terminal-accent">Room Code:</span> {currentRoom.code} 
                  <span className="mx-2">|</span>
                  <span className="terminal-accent">Players:</span> {currentRoom.players}
                </p>
              </div>
            </div>
            <button
              onClick={onLeaveRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}

      {/* Create or Join Room */}
      {!currentRoom && (
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
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || isCreating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isCreating ? (
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
                  className="control-input w-full p-3 border border-gray-600 rounded-lg text-sm font-mono"
                  placeholder="ABCD12"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!joinCode.trim() || isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isJoining ? (
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

      {/* Active Rooms List */}
      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          <span className="terminal-accent">&gt;</span> Active Rooms
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockRooms.map((room) => (
            <div key={room.id} className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{room.name}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="terminal-accent">Code:</span> {room.code}
                    <span className="mx-2">•</span>
                    <span className="terminal-accent">{room.players}</span> players
                  </div>
                </div>
                <button
                  onClick={() => onJoinRoom(room.code)}
                  disabled={!!currentRoom}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          <p><span className="terminal-accent">//</span> Mock rooms for demonstration</p>
          <p><span className="terminal-accent">//</span> Real-time multiplayer coming soon</p>
        </div>
      </div>

      {/* Room Features */}
      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          <span className="terminal-accent">&gt;</span> Room Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-medium text-white mb-1">Synchronized Play</h3>
            <p className="text-sm text-gray-400">Everyone gets the same card for fair competition</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-medium text-white mb-1">Live Leaderboard</h3>
            <p className="text-sm text-gray-400">See who's surviving the meeting best</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔕</div>
            <h3 className="font-medium text-white mb-1">Silent Mode</h3>
            <p className="text-sm text-gray-400">No notifications to blow your cover</p>
          </div>
        </div>
      </div>
    </div>
  );
}