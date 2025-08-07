// WebSocket Client for Multiplayer Buzzword Bingo
// Handles real-time communication with backend Durable Objects

import { WebSocketMessage, BingoRoom, Player } from '../backend/types';

export interface BingoClientConfig {
  wsUrl: string;
  apiUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface BingoClientEventHandlers {
  onPlayerJoin?: (playerId: string, playerName: string, isHost: boolean) => void;
  onPlayerLeave?: (playerId: string, playerName: string, reason: string) => void;
  onSquareMarked?: (squareId: string, squareText: string, playerId: string, playerName: string) => void;
  onSquareUnmarked?: (squareId: string, squareText: string, playerId: string, playerName: string) => void;
  onBingoClaim?: (playerId: string, playerName: string, winningPattern: string, winningCells: number[], requiresVoting: boolean) => void;
  onVotingStart?: (votingSession: any) => void;
  onVotingEnd?: (result: string, winnerName?: string, votesFor?: number, votesAgainst?: number) => void;
  onGameStateUpdate?: (gameState: any, sharedCard: any) => void;
  onPlayerListUpdate?: (players: any[]) => void;
  onNewGame?: (sharedCard: any, initiatedBy: string) => void;
  onChatMessage?: (playerId: string, playerName: string, message: string) => void;
  onRoomUpdate?: (room: any) => void;
  onError?: (error: string, details?: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: (attempt: number) => void;
}

export interface CreateRoomOptions {
  roomName: string;
  playerName: string;
  maxPlayers?: number;
  settings?: {
    requireMajorityForWin?: boolean;
    voteTimeoutSeconds?: number;
    democraticWinThreshold?: number;
  };
}

export interface JoinRoomOptions {
  roomCode: string;
  playerName: string;
}

export class BingoWebSocketClient {
  private ws: WebSocket | null = null;
  private config: BingoClientConfig;
  private handlers: BingoClientEventHandlers;
  private reconnectAttempts = 0;
  private isReconnecting = false;
  private heartbeatTimer: number | null = null;
  private messageQueue: string[] = [];
  
  // Current state
  private roomCode: string | null = null;
  private playerId: string | null = null;
  private isConnected = false;

  constructor(config: BingoClientConfig, handlers: BingoClientEventHandlers = {}) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config,
    };
    this.handlers = handlers;
  }

  /**
   * Create a new room and join it
   */
  async createRoom(options: CreateRoomOptions): Promise<{ success: boolean; roomCode?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/bingo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();
      
      if (result.success && result.roomCode) {
        this.roomCode = result.roomCode;
        // Note: playerId would be returned from the API in a real implementation
        this.playerId = this.generatePlayerId();
        return { success: true, roomCode: result.roomCode };
      }

      return { success: false, error: result.error || 'Failed to create room' };
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  /**
   * Join an existing room
   */
  async joinRoom(options: JoinRoomOptions): Promise<{ success: boolean; playerId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/bingo/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();
      
      if (result.success) {
        this.roomCode = options.roomCode.toUpperCase();
        this.playerId = result.playerId || this.generatePlayerId();
        return { success: true, playerId: this.playerId };
      }

      return { success: false, error: result.error || 'Failed to join room' };
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  async connect(): Promise<void> {
    if (!this.roomCode || !this.playerId) {
      throw new Error('Must join/create room before connecting');
    }

    const wsUrl = `${this.config.wsUrl}/api/bingo/room/${this.roomCode}/ws?playerId=${this.playerId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the room
   */
  async disconnect(): Promise<void> {
    this.isReconnecting = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.handlers.onDisconnected?.();
  }

  /**
   * Leave the current room
   */
  async leaveRoom(): Promise<{ success: boolean; error?: string }> {
    if (!this.roomCode || !this.playerId) {
      return { success: false, error: 'Not in a room' };
    }

    try {
      await this.disconnect();

      const response = await fetch(`${this.config.apiUrl}/api/bingo/room/${this.roomCode}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: this.playerId }),
      });

      const result = await response.json();
      
      this.roomCode = null;
      this.playerId = null;
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  /**
   * Get room status
   */
  async getRoomStatus(): Promise<{ success: boolean; room?: any; error?: string }> {
    if (!this.roomCode) {
      return { success: false, error: 'Not in a room' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/bingo/status?roomCode=${this.roomCode}`);
      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  /**
   * Mark or unmark a bingo square
   */
  markSquare(squareId: string, isMarked: boolean): void {
    this.sendMessage({
      type: 'MARK_SQUARE',
      squareId,
      isMarked,
    });
  }

  /**
   * Claim bingo with winning pattern
   */
  claimBingo(winningPattern: 'row' | 'column' | 'diagonal', winningCells: number[]): void {
    this.sendMessage({
      type: 'CLAIM_BINGO',
      winningPattern,
      winningCells,
    });
  }

  /**
   * Vote on a bingo claim
   */
  vote(votingSessionId: string, vote: 'for' | 'against' | 'abstain'): void {
    this.sendMessage({
      type: 'VOTE',
      votingSessionId,
      vote,
    });
  }

  /**
   * Start a new game (host only)
   */
  startNewGame(): void {
    this.sendMessage({
      type: 'NEW_GAME',
    });
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    this.sendMessage({
      type: 'CHAT_MESSAGE',
      message: message.substring(0, 200), // Limit message length
    });
  }

  /**
   * Kick a player (host only)
   */
  async kickPlayer(playerId: string, reason: string = 'Kicked by host'): Promise<{ success: boolean; error?: string }> {
    if (!this.roomCode || !this.playerId) {
      return { success: false, error: 'Not in a room' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/bingo/room/${this.roomCode}/kick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hostId: this.playerId,
          playerId,
          reason,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  /**
   * Update room settings (host only)
   */
  async updateRoomSettings(settings: any): Promise<{ success: boolean; error?: string }> {
    if (!this.roomCode || !this.playerId) {
      return { success: false, error: 'Not in a room' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/bingo/room/${this.roomCode}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hostId: this.playerId,
          settings,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  // Private methods

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      
      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.ws?.send(message);
        }
      }

      // Start heartbeat
      this.startHeartbeat();
      
      this.handlers.onConnected?.();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      // Attempt reconnection if not intentionally closed
      if (!this.isReconnecting && event.code !== 1000) {
        this.attemptReconnection();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handlers.onError?.('WebSocket connection error', error.toString());
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        this.handlers.onError?.('Failed to parse message', error.message);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'PLAYER_JOIN':
        this.handlers.onPlayerJoin?.(message.playerId!, message.playerName!, message.isHost!);
        break;
      
      case 'PLAYER_LEAVE':
        this.handlers.onPlayerLeave?.(message.playerId!, message.playerName!, message.reason!);
        break;
      
      case 'SQUARE_MARKED':
        this.handlers.onSquareMarked?.(message.squareId!, message.squareText!, message.playerId!, message.playerName!);
        break;
      
      case 'SQUARE_UNMARKED':
        this.handlers.onSquareUnmarked?.(message.squareId!, message.squareText!, message.playerId!, message.playerName!);
        break;
      
      case 'BINGO_CLAIM':
        this.handlers.onBingoClaim?.(
          message.playerId!, 
          message.playerName!, 
          message.winningPattern!, 
          message.winningCells!, 
          message.requiresVoting!
        );
        break;
      
      case 'VOTING_START':
        this.handlers.onVotingStart?.(message.votingSession!);
        break;
      
      case 'VOTING_END':
        this.handlers.onVotingEnd?.(
          message.result!, 
          message.winnerName, 
          message.votesFor, 
          message.votesAgainst
        );
        break;
      
      case 'GAME_STATE_UPDATE':
        this.handlers.onGameStateUpdate?.(message.gameState!, message.sharedCard!);
        break;
      
      case 'PLAYER_LIST_UPDATE':
        this.handlers.onPlayerListUpdate?.(message.players!);
        break;
      
      case 'NEW_GAME':
        this.handlers.onNewGame?.(message.sharedCard!, message.initiatedBy!);
        break;
      
      case 'CHAT_MESSAGE':
        this.handlers.onChatMessage?.(message.playerId!, message.playerName!, message.message!);
        break;
      
      case 'ROOM_UPDATE':
        this.handlers.onRoomUpdate?.(message.room!);
        break;
      
      case 'ERROR':
        this.handlers.onError?.(message.error!, message.details);
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private sendMessage(data: any): void {
    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
    });

    if (this.isConnected && this.ws) {
      this.ws.send(message);
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      
      // Limit queue size
      if (this.messageQueue.length > 50) {
        this.messageQueue.shift();
      }
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({ type: 'HEARTBEAT' });
    }, this.config.heartbeatInterval) as any;
  }

  private async attemptReconnection(): Promise<void> {
    if (this.isReconnecting || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.handlers.onError?.('Max reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    this.handlers.onReconnecting?.(this.reconnectAttempts);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnection(); // Try again
      }
    }, this.config.reconnectInterval * this.reconnectAttempts);
  }

  private generatePlayerId(): string {
    return 'player_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Getters
  get currentRoomCode(): string | null {
    return this.roomCode;
  }

  get currentPlayerId(): string | null {
    return this.playerId;
  }

  get connectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    if (this.isReconnecting) return 'reconnecting';
    return this.isConnected ? 'connected' : 'disconnected';
  }

  get queuedMessages(): number {
    return this.messageQueue.length;
  }
}