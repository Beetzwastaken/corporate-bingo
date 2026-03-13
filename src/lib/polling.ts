// HTTP polling service for Duo Mode as WebSocket fallback
// Provides real-time updates when WebSocket unavailable

import { getApiBaseUrl } from './config';
import type { LineSelection } from '../stores/duoStore';

export interface DuoStateUpdate {
  code: string;
  phase: 'waiting' | 'selecting' | 'playing';
  timezone: string;
  dailySeed: string;
  isHost: boolean;
  hostName: string;
  partnerName: string | null;
  isPaired: boolean;
  // Selection phase
  myHasSelected?: boolean;
  partnerHasSelected?: boolean;
  myLine?: LineSelection;
  // Playing phase
  hostLine?: LineSelection;
  partnerLine?: LineSelection;
  markedSquares?: boolean[];
  hostScore?: number;
  partnerScore?: number;
  hostBingo?: boolean;
  partnerBingo?: boolean;
  card?: string[];
}

export interface PollingOptions {
  roomCode: string;
  playerId: string;
  onUpdate: (state: DuoStateUpdate) => void;
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
      pollInterval: 2000,
      ...options
    };
  }

  // Start polling
  startPolling(): void {
    if (this.polling) return;

    this.polling = true;
    console.log('🔄 Starting HTTP polling for duo updates');

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
      const url = baseUrl
        ? `${baseUrl}/api/duo/${this.options.roomCode}/state`
        : `/api/duo/${this.options.roomCode}/state`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        }
      });

      if (response.ok) {
        const state: DuoStateUpdate = await response.json();

        // Only trigger update if state changed
        const stateHash = JSON.stringify(state);
        if (stateHash !== this.lastStateHash) {
          this.lastStateHash = stateHash;
          this.options.onUpdate(state);
        }
      } else if (response.status === 404) {
        console.warn('Room not found during polling');
        this.options.onError?.(new Error('Room not found'));
      }
    } catch (error) {
      console.error('Polling error:', error);
      this.options.onError?.(error instanceof Error ? error : new Error(String(error)));
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

  // Select line
  async selectLine(line: LineSelection): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl
        ? `${baseUrl}/api/duo/${this.options.roomCode}/select`
        : `/api/duo/${this.options.roomCode}/select`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        },
        body: JSON.stringify({ line })
      });

      if (response.ok) {
        this.poll(); // Immediate poll for updated state
        return true;
      }
      return false;
    } catch (error) {
      console.error('Select line error:', error);
      return false;
    }
  }

  // Mark square
  async markSquare(index: number): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl
        ? `${baseUrl}/api/duo/${this.options.roomCode}/mark`
        : `/api/duo/${this.options.roomCode}/mark`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        },
        body: JSON.stringify({ index })
      });

      if (response.ok) {
        this.poll();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mark square error:', error);
      return false;
    }
  }

  // Leave game
  async leaveGame(): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl
        ? `${baseUrl}/api/duo/${this.options.roomCode}/leave`
        : `/api/duo/${this.options.roomCode}/leave`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Player-ID': this.options.playerId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Leave game error:', error);
      return false;
    }
  }

  // Update polling interval
  setPollInterval(intervalMs: number): void {
    this.options.pollInterval = intervalMs;

    if (this.polling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  // Check if polling
  isPolling(): boolean {
    return this.polling;
  }
}

// Create polling client
export function createPollingClient(options: PollingOptions): BingoPollingClient {
  return new BingoPollingClient(options);
}
