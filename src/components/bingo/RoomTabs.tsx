import type { RoomState, GameMode } from '../../stores/multiRoomStore';

interface RoomTabsProps {
  rooms: Record<string, RoomState>;
  activeRoomCode: string | null;
  onRoomChange: (roomCode: string) => void;
  onRoomClose: (roomCode: string) => void;
}

// Helper function to get game mode icon
const getGameModeIcon = (gameMode: GameMode): string => {
  return gameMode === 'play' ? '🎮' : '👑';
};

// Helper function to get game mode color
const getGameModeColor = (gameMode: GameMode): string => {
  return gameMode === 'play' ? 'text-blue-400' : 'text-yellow-400';
};

export function RoomTabs({ rooms, activeRoomCode, onRoomClose }: RoomTabsProps) {
  const roomEntries = Object.entries(rooms);

  if (roomEntries.length === 0) {
    return null;
  }

  // Only show single room display (no tabs for multiple rooms)
  const [roomCode, roomState] = roomEntries[0];
  const { room } = roomState;
  // Suppress unused variable warning
  void activeRoomCode;

  return (
    <div className="border-b border-apple-border bg-apple-darkest">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getGameModeColor(room.gameMode)}`}>
              {getGameModeIcon(room.gameMode)}
            </span>
            <span className="text-sm font-medium text-apple-text">
              {room.name}
            </span>
            <span className="text-xs text-apple-secondary font-mono bg-apple-darkest px-2 py-1 rounded">
              {room.code}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              room.gameMode === 'play'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {room.gameMode === 'play' ? 'Casual' : 'Competitive'}
            </span>
          </div>

          {/* Leave room button */}
          <button
            onClick={() => onRoomClose(roomCode)}
            className="w-6 h-6 rounded-full flex items-center justify-center
              transition-all duration-200 hover:bg-red-500/20 hover:text-red-400
              text-apple-secondary"
            title="Leave room"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Player count indicator */}
        <div className="flex items-center space-x-1 mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            room.players.some(p => p.isConnected)
              ? 'bg-green-400'
              : 'bg-apple-secondary'
          }`}></div>
          <span className="text-xs text-apple-secondary">
            {room.players.length} player{room.players.length !== 1 ? 's' : ''} connected
          </span>
        </div>
      </div>
    </div>
  );
}
