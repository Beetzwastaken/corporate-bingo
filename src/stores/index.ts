// Central export for all stores
export { useGameStore } from './gameStore';
export { useUIStore } from './uiStore';
export { useRoomStore } from './roomStore';
export { useConnectionStore } from './connectionStore';

// Export types
export type { BingoSquare, GameState } from './gameStore';
export type { BingoPlayer, BingoRoom } from './roomStore';