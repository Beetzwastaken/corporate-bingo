// Extended message types for the connection store
import { MESSAGE_TYPES as BASE_MESSAGE_TYPES } from './websocket';

export const MESSAGE_TYPES = {
  ...BASE_MESSAGE_TYPES,
  // Additional message types
  ROOM_UPDATE: 'ROOM_UPDATE',
  GAME_WON: 'GAME_WON', 
  GAME_RESET: 'GAME_RESET'
} as const;