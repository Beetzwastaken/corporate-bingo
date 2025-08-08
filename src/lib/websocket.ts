// WebSocket service for real-time multiplayer communication
// Handles connections to Cloudflare Workers Durable Objects

import { getWebSocketBaseUrl } from './config';

interface WebSocketMessage {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

interface ConnectionOptions {
  roomCode: string;
  playerId: string;
  onMessage: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class BingoWebSocketClient {
  private socket: WebSocket | null = null;
  private options: ConnectionOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(options: ConnectionOptions) {
    this.options = options;
  }

  // Get WebSocket URL based on environment
  private getWebSocketUrl(): string {
    const { roomCode, playerId } = this.options;
    
    const baseUrl = getWebSocketBaseUrl();
    
    return `${baseUrl}/api/room/${roomCode}/ws?playerId=${playerId}`;
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        const url = this.getWebSocketUrl();
        this.socket = new WebSocket(url);

        const timeout = setTimeout(() => {
          if (this.socket?.readyState !== WebSocket.OPEN) {
            this.socket?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.socket.onopen = () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');
          this.options.onConnect?.();
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.options.onMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.options.onDisconnect?.();
          
          // Auto-reconnect unless it was a manual close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (event) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error('WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.options.onError?.(error);
          
          if (this.socket?.readyState !== WebSocket.OPEN) {
            reject(error);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Schedule reconnect with exponential backoff
  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      } else {
        console.error('Max reconnection attempts reached');
        this.options.onError?.(new Error('Max reconnection attempts reached'));
      }
    }, delay);
  }

  // Send message to server
  send(type: string, payload?: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now()
      };

      try {
        this.socket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Mark a square (with validation)
  markSquare(squareIndex: number): Promise<void> {
    return this.send('MARK_SQUARE', { 
      squareIndex,
      timestamp: Date.now()
    });
  }

  // Verify another player's claim
  verifySquare(playerId: string, squareIndex: number, verification: boolean): Promise<void> {
    return this.send('VERIFY_SQUARE', { 
      playerId,
      squareIndex,
      verification,
      timestamp: Date.now()
    });
  }

  // Send chat message
  sendChatMessage(message: string): Promise<void> {
    return this.send('CHAT_MESSAGE', { 
      message: message.trim().slice(0, 500), // Limit message length
      timestamp: Date.now()
    });
  }

  // Claim bingo
  claimBingo(winningPattern: number[]): Promise<void> {
    return this.send('CLAIM_BINGO', { 
      winningPattern,
      timestamp: Date.now()
    });
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Disconnect gracefully
  disconnect(): void {
    if (this.socket) {
      // Set to max attempts to prevent auto-reconnect
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
  }

  // Update connection options (for switching rooms)
  updateOptions(newOptions: Partial<ConnectionOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Utility function to create WebSocket client
export function createWebSocketClient(options: ConnectionOptions): BingoWebSocketClient {
  return new BingoWebSocketClient(options);
}

// Message type constants for type safety
export const MESSAGE_TYPES = {
  // Player actions
  MARK_SQUARE: 'MARK_SQUARE',
  VERIFY_SQUARE: 'VERIFY_SQUARE',
  CLAIM_BINGO: 'CLAIM_BINGO',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  
  // Server broadcasts
  SQUARE_MARKED: 'SQUARE_MARKED',
  SQUARE_VERIFIED: 'SQUARE_VERIFIED',
  BINGO_CLAIMED: 'BINGO_CLAIMED',
  PLAYER_JOINED: 'PLAYER_JOINED',
  PLAYER_LEFT: 'PLAYER_LEFT',
  GAME_STATE_UPDATE: 'GAME_STATE_UPDATE',
  VERIFICATION_REQUEST: 'VERIFICATION_REQUEST',
  CHAT_MESSAGE_BROADCAST: 'CHAT_MESSAGE_BROADCAST',
  
  // New scoring system messages
  LINE_MULTIPLIER: 'LINE_MULTIPLIER',
  CLAIM_APPROVED: 'CLAIM_APPROVED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  
  // System messages
  ERROR: 'ERROR',
  PING: 'PING',
  PONG: 'PONG'
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];