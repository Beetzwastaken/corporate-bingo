// Shared API functions for Corporate Bingo - Real Backend Integration

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Room creation response from backend
export interface CreateRoomResponse {
  success: boolean;
  roomCode: string;
  playerId: string;
  board: string[];
  isHost: boolean;
}

// Room join response from backend
export interface JoinRoomResponse {
  success: boolean;
  playerId: string;
  board: string[];
  roomName: string;
  playerCount: number;
  roundNumber: number;
}

import { getApiBaseUrl } from './config';

// Generic API request handler with error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${getApiBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      return {
        success: false,
        error: errorData.error || `Request failed with status ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

// Create a new bingo room
export async function createBingoRoom(roomName: string, playerName: string, roomType: 'single' | 'persistent' = 'single'): Promise<ApiResponse<CreateRoomResponse>> {
  return apiRequest<CreateRoomResponse>('/api/room/create', {
    method: 'POST',
    body: JSON.stringify({ roomName, playerName, roomType }),
  });
}

// Join an existing room
export async function joinBingoRoom(roomCode: string, playerName: string): Promise<ApiResponse<JoinRoomResponse>> {
  return apiRequest<JoinRoomResponse>('/api/room/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode, playerName }),
  });
}

// Test API connection
export async function testApiConnection(): Promise<ApiResponse<{ message: string; buzzwordCount: number }>> {
  return apiRequest<{ message: string; buzzwordCount: number }>('/api/test');
}

// Buzzword suggestions API (keep for compatibility)
export async function suggestBuzzwords(): Promise<ApiResponse<{ suggestions: string[] }>> {
  try {
    const suggestions = [
      'Synergy', 'Leverage', 'Deep Dive', 'Circle Back', 'Touch Base',
      'Low-hanging Fruit', 'Move the Needle', 'Paradigm Shift', 'Think Outside the Box',
      'Best Practice', 'Core Competency', 'Value-add', 'Game Changer', 'Win-win'
    ];
    
    return {
      success: true,
      data: { suggestions }
    };
  } catch {
    return {
      success: false,
      error: 'Failed to get buzzword suggestions'
    };
  }
}

// Analytics API
export async function trackBuzzwordUsage(buzzwordData: {
  word: string;
  gameId: string;
  timestamp: Date;
}): Promise<ApiResponse<void>> {
  try {
    // TODO: Send to analytics service
    console.log('Tracking buzzword usage:', buzzwordData);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Failed to track analytics'
    };
  }
}

export async function trackBingoPlay(gameData: {
  squaresMarked: number;
  gameWon: boolean;
  roomId?: string;
}): Promise<ApiResponse<void>> {
  try {
    // TODO: Send to analytics service
    console.log('Tracking bingo play:', gameData);
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Failed to track analytics'
    };
  }
}