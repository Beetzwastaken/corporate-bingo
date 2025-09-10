// Compatibility layer for the refactored stores
// This file maintains backward compatibility while delegating to the new modular stores

import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { useRoomStore } from '../stores/roomStore';
import { useConnectionStore } from '../stores/connectionStore';

// Re-export types for compatibility
export type { BingoSquare, GameState } from '../stores/gameStore';
export type { BingoPlayer, BingoRoom } from '../stores/roomStore';

// Combined store hook for backward compatibility
export const useBingoStore = () => {
  const gameStore = useGameStore();
  const uiStore = useUIStore();
  const roomStore = useRoomStore();
  const connectionStore = useConnectionStore();
  
  // Initialize game on first load
  if (gameStore.gameState.board.length === 0) {
    gameStore.initializeGame();
  }
  
  return {
    // Game state
    gameState: gameStore.gameState,
    gamesPlayed: gameStore.gamesPlayed,
    wins: gameStore.wins,
    totalSquares: gameStore.totalSquares,
    currentScore: gameStore.currentScore,
    
    // Room state
    currentRoom: roomStore.currentRoom,
    currentPlayer: roomStore.currentPlayer,
    availableRooms: roomStore.availableRooms,
    playerName: roomStore.currentPlayer?.name || '',  // Derive from current player
    
    // Connection state
    isConnected: connectionStore.isConnected,
    connectionError: connectionStore.connectionError,
    isConnecting: false,  // Simplified - connection is fast
    
    // UI state
    sidebarOpen: uiStore.sidebarOpen,
    activePanel: uiStore.activePanel,
    
    // Game actions
    markSquare: gameStore.markSquare,
    resetGame: gameStore.resetGame,
    setGameWon: gameStore.setGameWon,
    incrementGamesPlayed: gameStore.incrementGamesPlayed,
    incrementWins: gameStore.incrementWins,
    incrementTotalSquares: gameStore.incrementTotalSquares,
    
    // Player actions
    setPlayerName: (name: string) => {
      // Store in room store's current player
      if (roomStore.currentPlayer) {
        roomStore.setCurrentPlayer({ ...roomStore.currentPlayer, name });
      } else {
        roomStore.setCurrentPlayer({ 
          id: Math.random().toString(36).substr(2, 9),
          name,
          isConnected: false
        });
      }
    },
    
    // Room actions - simplified signatures for compatibility
    createRoom: async (roomName: string) => {
      const playerName = roomStore.currentPlayer?.name || 'Player';
      const result = await roomStore.createRoom(roomName, playerName);
      if (result.success) {
        await connectionStore.connect();
      }
      return result;
    },
    joinRoom: async (roomCode: string) => {
      const playerName = roomStore.currentPlayer?.name || 'Player';
      const result = await roomStore.joinRoom(roomCode, playerName);
      if (result.success) {
        await connectionStore.connect();
      }
      return result;
    },
    leaveRoom: () => {
      connectionStore.disconnect();
      roomStore.leaveRoom();
    },
    
    // Connection actions
    connectWebSocket: connectionStore.connect,
    disconnectWebSocket: connectionStore.disconnect,
    sendMessage: connectionStore.sendMessage,
    
    // UI actions
    setSidebarOpen: uiStore.setSidebarOpen,
    setActivePanel: uiStore.setActivePanel,
    togglePanel: uiStore.togglePanel,
    closeSidebar: uiStore.closeSidebar,
    
    // Emergency reset
    emergencyReset: () => {
      connectionStore.disconnect();
      roomStore.leaveRoom();
      gameStore.clearStats();
      gameStore.resetGame();
      uiStore.closeSidebar();
    }
  };
};

// Export for components that were using the old import
export default useBingoStore;