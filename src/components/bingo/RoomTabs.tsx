import type { RoomState, RoomType } from '../../stores/multiRoomStore';

interface RoomTabsProps {
  rooms: Record<string, RoomState>;
  activeRoomCode: string | null;
  onRoomChange: (roomCode: string) => void;
  onRoomClose: (roomCode: string) => void;
}

// Helper function to get room type icon
const getRoomTypeIcon = (roomType: RoomType): string => {
  return roomType === 'single' ? '⏱️' : '♾️';
};

// Helper function to get room type color
const getRoomTypeColor = (roomType: RoomType): string => {
  return roomType === 'single' ? 'text-blue-400' : 'text-green-400';
};

// Helper function to truncate room name for mobile
const truncateRoomName = (name: string, maxLength: number = 12): string => {
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export function RoomTabs({ rooms, activeRoomCode, onRoomChange, onRoomClose }: RoomTabsProps) {
  const roomEntries = Object.entries(rooms);
  
  if (roomEntries.length === 0) {
    return null;
  }
  
  // Don't show tabs if there's only one room
  if (roomEntries.length === 1) {
    return (
      <div className="border-b border-apple-border bg-apple-darkest">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getRoomTypeColor(roomEntries[0][1].room.roomType)}`}>
              {getRoomTypeIcon(roomEntries[0][1].room.roomType)}
            </span>
            <span className="text-sm font-medium text-apple-text">
              {roomEntries[0][1].room.name}
            </span>
            <span className="text-xs text-apple-secondary font-mono bg-apple-darkest px-2 py-1 rounded">
              {roomEntries[0][1].room.code}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-b border-apple-border bg-apple-darkest">
      <div className="flex overflow-x-auto scrollbar-hide">
        {roomEntries.map(([roomCode, roomState]) => {
          const isActive = activeRoomCode === roomCode;
          const { room } = roomState;
          
          return (
            <div
              key={roomCode}
              className={`
                group relative flex items-center space-x-2 px-4 py-3 cursor-pointer
                border-b-2 transition-all duration-200 flex-shrink-0 min-w-0
                ${isActive 
                  ? 'border-apple-accent bg-apple-accent/5' 
                  : 'border-transparent hover:bg-apple-darkest/80'
                }
              `}
              onClick={() => onRoomChange(roomCode)}
            >
              {/* Room type icon */}
              <span className={`text-sm flex-shrink-0 ${getRoomTypeColor(room.roomType)}`}>
                {getRoomTypeIcon(room.roomType)}
              </span>
              
              {/* Room info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium truncate ${isActive ? 'text-apple-accent' : 'text-apple-text'}`}>
                    <span className="hidden sm:inline">{room.name}</span>
                    <span className="sm:hidden">{truncateRoomName(room.name)}</span>
                  </span>
                  <span className={`text-xs font-mono px-2 py-1 rounded flex-shrink-0 ${
                    isActive 
                      ? 'bg-apple-accent/20 text-apple-accent' 
                      : 'bg-apple-darkest text-apple-secondary'
                  }`}>
                    {room.code}
                  </span>
                </div>
                
                {/* Player count indicator */}
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`w-1 h-1 rounded-full ${
                    room.players.some(p => p.isConnected) 
                      ? 'bg-green-400' 
                      : 'bg-apple-secondary'
                  }`}></div>
                  <span className="text-xs text-apple-secondary">
                    {room.players.length} player{room.players.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRoomClose(roomCode);
                }}
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  transition-all duration-200 opacity-0 group-hover:opacity-100
                  hover:bg-red-500/20 hover:text-red-400
                  ${isActive ? 'opacity-100' : ''}
                `}
                title="Leave room"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Active tab indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-accent"></div>
              )}
            </div>
          );
        })}
        
        {/* Add new room button */}
        <div className="flex-shrink-0 border-l border-apple-border/50">
          <button
            className={`
              h-full px-4 py-3 text-apple-secondary hover:text-apple-accent
              hover:bg-apple-darkest/80 transition-all duration-200
              flex items-center space-x-2
            `}
            title="Create or join another room"
            onClick={() => {
              // This could trigger a modal or navigate to room creation
              // For now, we'll handle this in the parent component
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium hidden lg:inline">
              Add Room
            </span>
          </button>
        </div>
      </div>
      
      {/* Mobile scroll indicator */}
      <div className="sm:hidden flex justify-center py-1">
        <div className="flex space-x-1">
          {roomEntries.map(([roomCode]) => (
            <div
              key={roomCode}
              className={`w-1 h-1 rounded-full transition-colors ${
                activeRoomCode === roomCode ? 'bg-apple-accent' : 'bg-apple-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}