// Corporate Bingo - TypeScript Type Definitions
// Multiplayer Bingo Game Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Buzzword Management
export interface Buzzword {
  id: string;
  text: string;
  category: BuzzwordCategory;
  popularity: number;
  isActive: boolean;
  createdAt: Date;
}

export type BuzzwordCategory = 
  | 'classic' 
  | 'technical' 
  | 'meeting' 
  | 'management' 
  | 'culture'
  | 'general';

export interface BuzzwordSet {
  id: string;
  name: string;
  description: string;
  buzzwords: Buzzword[];
  isDefault: boolean;
}

// Room Management
export interface RoomSettings {
  maxPlayers: number;
  autoStart: boolean;
  gameMode: 'standard' | 'speed' | 'blackout';
  buzzwordSet: string;
  isPrivate: boolean;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'game' | 'system';
}

// Game Analytics
export interface GameAnalytics {
  totalGames: number;
  totalPlayers: number;
  averageGameDuration: number;
  popularBuzzwords: Array<{
    word: string;
    usage: number;
  }>;
  peakConcurrentPlayers: number;
  gameCompletionRate: number;
}

// WebSocket Messages
export interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'square_marked' | 'game_won' | 'chat_message' | 'room_update';
  payload: unknown;
  playerId?: string;
  roomCode?: string;
  timestamp: Date;
}

export interface RoomUpdateMessage {
  roomId: string;
  players: BingoPlayer[];
  gameState: 'waiting' | 'active' | 'finished';
  currentGame?: BingoGame;
}

// Store Types for State Management
export interface BingoStore {
  // Current game state
  currentGame: BingoGame | null;
  currentPlayer: BingoPlayer | null;
  currentRoom: BingoRoom | null;
  
  // Buzzwords and sets
  availableBuzzwordSets: BuzzwordSet[];
  selectedBuzzwordSet: string;
  
  // Statistics
  playerStats: BingoStats;
  gameAnalytics: GameAnalytics | null;
  
  // UI state
  isConnected: boolean;
  lastUpdate: Date | null;
  
  // Actions
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => void;
  createRoom: (roomName: string, settings: RoomSettings) => Promise<string>;
  markSquare: (squareId: string) => void;
  sendChatMessage: (message: string) => void;
  updateStats: (stats: Partial<BingoStats>) => void;
  setConnected: (connected: boolean) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Error Types
export interface BingoError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// Configuration Types
export interface AppConfig {
  maxRoomSize: number;
  gameTimeoutMinutes: number;
  buzzwordSets: BuzzwordSet[];
  defaultRoomSettings: RoomSettings;
}

// Bingo Game Types
export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface BingoRoom {
  id: string;
  name: string;
  code: string;
  players: number;
  isActive: boolean;
  createdAt?: Date;
  maxPlayers?: number;
}

export interface BingoPlayer {
  id: string;
  name: string;
  board: BingoSquare[];
  score: number;
  isHost?: boolean;
  joinedAt?: Date;
}

export interface BingoGame {
  id: string;
  roomId: string;
  players: BingoPlayer[];
  winner?: string;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
}

export interface BingoStats {
  gamesPlayed: number;
  wins: number;
  totalSquares: number;
  favoriteSquares: string[];
  averageGameDuration?: number;
  winRate?: number;
}