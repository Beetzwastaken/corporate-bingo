// HTTP polling service as WebSocket alternative for multiplayer updates
// Provides basic real-time functionality when WebSocket SSL fails

import { getApiBaseUrl } from './config';
import type { BingoPlayer } from '../utils/store';

export interface GameStateUpdate {
  players?: BingoPlayer[];
  playerCount?: number;
  roomName?: string;
  isActive?: boolean;
}

export interface PollingOptions {
  roomCode: string;
  playerId: string;
  onUpdate: (gameState: GameStateUpdate) => void;
  onError?: (error: Error) => void;
  pollInterval?: number;
}

export class BingoPollingClient {
  private options: PollingOptions;
  private polling = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private lastStateHash = '';

  constructor(options: PollingOptions) {
    this.options = {
      pollInterval: 2000, // Poll every 2 seconds
      ...options
    };
  }

  // Start polling for game state updates
  startPolling(): void {
    if (this.polling) return;
    
    this.polling = true;
    console.log('🔄 Starting HTTP polling for multiplayer updates');
    
    // Poll immediately, then at intervals
    this.poll();
    this.scheduleNextPoll();
  }

  // Stop polling
  stopPolling(): void {
    this.polling = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('⏹️ Stopped HTTP polling');
  }

  // Single poll request
  private async poll(): Promise<void> {
    if (!this.polling) return;

    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl ? 
        `${baseUrl}/api/room/${this.options.roomCode}/players` :
        `/api/room/${this.options.roomCode}/players`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        }
      });

      if (response.ok) {
        const gameState = await response.json();
        
        // Only trigger update if state actually changed
        const stateHash = JSON.stringify(gameState);
        if (stateHash !== this.lastStateHash) {
          this.lastStateHash = stateHash;
          this.options.onUpdate(gameState);
        }
      } else if (response.status === 404) {
        // Room might not exist or endpoint not available
        // Try alternative polling endpoint
        await this.pollAlternative();
      }
    } catch (error) {
      console.error('Polling error:', error);
      this.options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Alternative polling method if main endpoint doesn't exist
  private async pollAlternative(): Promise<void> {
    try {
      // Try to get room info by making a dummy join request
      // This will return current room state without actually joining
      const baseUrl = getApiBaseUrl();
      const url = baseUrl ? 
        `${baseUrl}/api/room/info` :
        `/api/room/info`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomCode: this.options.roomCode,
          playerId: this.options.playerId,
          checkOnly: true // Flag to indicate we just want room info
        })
      });

      if (response.ok) {
        const gameState = await response.json();
        const stateHash = JSON.stringify(gameState);
        if (stateHash !== this.lastStateHash) {
          this.lastStateHash = stateHash;
          this.options.onUpdate(gameState);
        }
      }
    } catch (error) {
      // Silent fail for alternative method
      console.debug('Alternative polling failed:', error);
    }
  }

  // Schedule next poll
  private scheduleNextPoll(): void {
    if (!this.polling) return;
    
    this.pollTimer = setTimeout(() => {
      if (this.polling) {
        this.poll().then(() => {
          this.scheduleNextPoll();
        });
      }
    }, this.options.pollInterval);
  }

  // Send player action (marks, etc.)
  async sendAction(action: string, payload: Record<string, unknown>): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl ?
        `${baseUrl}/api/room/${this.options.roomCode}/action` :
        `/api/room/${this.options.roomCode}/action`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        },
        body: JSON.stringify({
          action,
          payload,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        // Trigger immediate poll to get updated state
        this.poll();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Action send error:', error);
      return false;
    }
  }

  // Mark a square
  async markSquare(squareIndex: number): Promise<boolean> {
    return this.sendAction('MARK_SQUARE', { squareIndex });
  }

  // Update polling interval
  setPollInterval(intervalMs: number): void {
    this.options.pollInterval = intervalMs;
    
    if (this.polling) {
      // Restart with new interval
      this.stopPolling();
      this.startPolling();
    }
  }

  // Check if currently polling
  isPolling(): boolean {
    return this.polling;
  }
}

// Create polling client
export function createPollingClient(options: PollingOptions): BingoPollingClient {
  return new BingoPollingClient(options);
}