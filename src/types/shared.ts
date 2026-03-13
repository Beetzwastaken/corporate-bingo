// Shared types for Jargon
// This file provides common interfaces used across stores and components

export interface BingoPlayer {
  id: string;
  name: string;
  isHost?: boolean;
  currentScore?: number;
  totalScore?: number;
  isConnected?: boolean;
  joinedAt?: number;
}

export interface BingoRoom {
  id: string;
  name: string;
  code: string;
  players: BingoPlayer[];
  isActive: boolean;
  roundNumber?: number;
  createdAt?: Date;
  maxPlayers?: number;
}
