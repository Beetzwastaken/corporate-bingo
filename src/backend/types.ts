// Backend Types for Multiplayer Buzzword Bingo
// Cloudflare Workers + Durable Objects Implementation

export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface Player {
  id: string;
  name: string;
  connectionId: string;
  isHost: boolean;
  isConnected: boolean;
  joinedAt: Date;
  lastActivity: Date;
  card: BingoSquare[];
  hasClaimedBingo: boolean;
  winCount: number;
}

export interface BingoRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  isGameActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  players: Map<string, Player>;
  sharedCard: BingoSquare[];
  gameState: GameState;
  votingSession: VotingSession | null;
  settings: RoomSettings;
  statistics: RoomStatistics;
}

export interface GameState {
  currentRound: number;
  roundStartTime: Date | null;
  totalRounds: number;
  isRoundActive: boolean;
  winnerHistory: WinRecord[];
}

export interface VotingSession {
  id: string;
  claimantId: string;
  claimantName: string;
  winningPattern: 'row' | 'column' | 'diagonal';
  winningCells: number[];
  votesFor: string[]; // Player IDs who voted for
  votesAgainst: string[]; // Player IDs who voted against
  abstained: string[]; // Player IDs who abstained
  expiresAt: Date;
  isCompleted: boolean;
  result: 'approved' | 'denied' | 'pending';
}

export interface WinRecord {
  playerId: string;
  playerName: string;
  timestamp: Date;
  winningPattern: 'row' | 'column' | 'diagonal';
  winningCells: number[];
  votesFor: number;
  votesAgainst: number;
  wasApproved: boolean;
}

export interface RoomSettings {
  requireMajorityForWin: boolean;
  voteTimeoutSeconds: number;
  maxPlayersPerRoom: number;
  autoCleanupMinutes: number;
  allowSpectators: boolean;
  democraticWinThreshold: number; // Percentage required for approval (0.5 = 50%)
}

export interface RoomStatistics {
  gamesPlayed: number;
  totalWins: number;
  averageGameDuration: number;
  mostActivePlayer: string;
  popularSquares: { [text: string]: number };
  winPatternCounts: {
    row: number;
    column: number;
    diagonal: number;
  };
}

// WebSocket Message Types
export type WebSocketMessage = 
  | PlayerJoinMessage
  | PlayerLeaveMessage
  | SquareMarkedMessage
  | SquareUnmarkedMessage
  | BingoClaimMessage
  | WinVoteMessage
  | RoomUpdateMessage
  | GameStateUpdateMessage
  | PlayerListUpdateMessage
  | VotingStartMessage
  | VotingEndMessage
  | NewGameMessage
  | PlayerKickMessage
  | RoomSettingsUpdateMessage
  | ChatMessage
  | ErrorMessage;

export interface BaseMessage {
  type: string;
  timestamp: Date;
  playerId?: string;
  playerName?: string;
}

export interface PlayerJoinMessage extends BaseMessage {
  type: 'PLAYER_JOIN';
  playerId: string;
  playerName: string;
  isHost: boolean;
}

export interface PlayerLeaveMessage extends BaseMessage {
  type: 'PLAYER_LEAVE';
  playerId: string;
  playerName: string;
  reason: 'disconnect' | 'kick' | 'left';
}

export interface SquareMarkedMessage extends BaseMessage {
  type: 'SQUARE_MARKED';
  squareId: string;
  squareText: string;
  playerId: string;
  playerName: string;
}

export interface SquareUnmarkedMessage extends BaseMessage {
  type: 'SQUARE_UNMARKED';
  squareId: string;
  squareText: string;
  playerId: string;
  playerName: string;
}

export interface BingoClaimMessage extends BaseMessage {
  type: 'BINGO_CLAIM';
  playerId: string;
  playerName: string;
  winningPattern: 'row' | 'column' | 'diagonal';
  winningCells: number[];
  requiresVoting: boolean;
}

export interface WinVoteMessage extends BaseMessage {
  type: 'WIN_VOTE';
  votingSessionId: string;
  playerId: string;
  playerName: string;
  vote: 'for' | 'against' | 'abstain';
}

export interface RoomUpdateMessage extends BaseMessage {
  type: 'ROOM_UPDATE';
  room: {
    id: string;
    code: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    isGameActive: boolean;
  };
}

export interface GameStateUpdateMessage extends BaseMessage {
  type: 'GAME_STATE_UPDATE';
  gameState: GameState;
  sharedCard: BingoSquare[];
}

export interface PlayerListUpdateMessage extends BaseMessage {
  type: 'PLAYER_LIST_UPDATE';
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isConnected: boolean;
    hasClaimedBingo: boolean;
    winCount: number;
  }>;
}

export interface VotingStartMessage extends BaseMessage {
  type: 'VOTING_START';
  votingSession: VotingSession;
}

export interface VotingEndMessage extends BaseMessage {
  type: 'VOTING_END';
  votingSessionId: string;
  result: 'approved' | 'denied' | 'timeout';
  winnerName?: string;
  votesFor: number;
  votesAgainst: number;
  abstained: number;
}

export interface NewGameMessage extends BaseMessage {
  type: 'NEW_GAME';
  sharedCard: BingoSquare[];
  initiatedBy: string;
}

export interface PlayerKickMessage extends BaseMessage {
  type: 'PLAYER_KICK';
  kickedPlayerId: string;
  kickedPlayerName: string;
  kickedBy: string;
  reason: string;
}

export interface RoomSettingsUpdateMessage extends BaseMessage {
  type: 'ROOM_SETTINGS_UPDATE';
  settings: RoomSettings;
  updatedBy: string;
}

export interface ChatMessage extends BaseMessage {
  type: 'CHAT_MESSAGE';
  playerId: string;
  playerName: string;
  message: string;
}

export interface ErrorMessage extends BaseMessage {
  type: 'ERROR';
  error: string;
  details?: string;
}

// API Request/Response Types
export interface CreateRoomRequest {
  roomName: string;
  playerName: string;
  maxPlayers?: number;
  settings?: Partial<RoomSettings>;
}

export interface CreateRoomResponse {
  success: boolean;
  roomCode?: string;
  roomId?: string;
  error?: string;
}

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
}

export interface JoinRoomResponse {
  success: boolean;
  roomId?: string;
  playerId?: string;
  error?: string;
}

export interface RoomStatusResponse {
  success: boolean;
  room?: {
    id: string;
    code: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    isGameActive: boolean;
    players: Array<{
      id: string;
      name: string;
      isHost: boolean;
      isConnected: boolean;
    }>;
  };
  error?: string;
}

// Error Types
export class RoomError extends Error {
  constructor(
    message: string,
    public code: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'INVALID_CODE' | 'PLAYER_EXISTS' | 'UNAUTHORIZED' | 'GAME_IN_PROGRESS' | 'INVALID_REQUEST'
  ) {
    super(message);
    this.name = 'RoomError';
  }
}

// Configuration Constants
export const ROOM_CONFIG = {
  CODE_LENGTH: 6,
  DEFAULT_MAX_PLAYERS: 10,
  DEFAULT_VOTE_TIMEOUT_SECONDS: 30,
  DEFAULT_CLEANUP_MINUTES: 60,
  DEFAULT_WIN_THRESHOLD: 0.5, // 50% approval required
  MAX_ROOM_NAME_LENGTH: 50,
  MAX_PLAYER_NAME_LENGTH: 30,
  MAX_CHAT_MESSAGE_LENGTH: 200,
  HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds
  INACTIVE_PLAYER_TIMEOUT_MS: 120000, // 2 minutes
  ROOM_CLEANUP_INTERVAL_MS: 300000, // 5 minutes
} as const;

// Utility Types
export type RoomEventType = 
  | 'room:created'
  | 'room:destroyed'
  | 'player:joined'
  | 'player:left'
  | 'player:disconnected'
  | 'game:started'
  | 'game:ended'
  | 'bingo:claimed'
  | 'vote:started'
  | 'vote:ended'
  | 'square:marked'
  | 'square:unmarked';

export interface RoomEvent {
  type: RoomEventType;
  roomId: string;
  playerId?: string;
  data?: any;
  timestamp: Date;
}

export interface DurableObjectState {
  room: BingoRoom;
  connections: Map<string, WebSocket>; // connectionId -> WebSocket
  playerConnections: Map<string, string>; // playerId -> connectionId
  lastCleanup: Date;
  eventLog: RoomEvent[];
}