// Message types for Duo Mode - re-exports from websocket
import { DUO_MESSAGE_TYPES } from './websocket';

// Re-export for backward compatibility
export const MESSAGE_TYPES = {
  ...DUO_MESSAGE_TYPES,
  // Additional message types for room updates
  ROOM_UPDATE: 'room_update',
  GAME_WON: 'game_won',
  GAME_RESET: 'game_reset'
} as const;
