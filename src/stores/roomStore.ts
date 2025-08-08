// Room Store - Manages room and player state
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createBingoRoom, joinBingoRoom } from '../lib/api';

// Player interface
export interface BingoPlayer {
  id: string;
  name: string;
  isHost?: boolean;
  currentScore?: number;
  totalScore?: number;
  isConnected?: boolean;
  joinedAt?: number;
}

// Room interface
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

interface RoomStore {
  // State
  currentRoom: BingoRoom | null;
  currentPlayer: BingoPlayer | null;
  availableRooms: BingoRoom[];
  
  // Actions
  setCurrentRoom: (room: BingoRoom | null) => void;
  setCurrentPlayer: (player: BingoPlayer | null) => void;
  updateRoomPlayers: (players: BingoPlayer[]) => void;
  createRoom: (roomName: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (roomCode: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  updatePlayerStatus: (playerId: string, isConnected: boolean) => void;
}

export const useRoomStore = create<RoomStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentRoom: null,
        currentPlayer: null,
        availableRooms: [],
        
        // Set current room
        setCurrentRoom: (room: BingoRoom | null) => {
          set({ currentRoom: room });
        },
        
        // Set current player
        setCurrentPlayer: (player: BingoPlayer | null) => {
          set({ currentPlayer: player });
        },
        
        // Update room players
        updateRoomPlayers: (players: BingoPlayer[]) => {
          const state = get();
          if (state.currentRoom) {
            set({
              currentRoom: {
                ...state.currentRoom,
                players
              }
            });
          }
        },
        
        // Create a new room
        createRoom: async (roomName: string, playerName: string) => {
          try {
            const response = await createBingoRoom(roomName, playerName);
            
            if (!response.success || !response.data) {
              return { 
                success: false, 
                error: response.error || 'Failed to create room' 
              };
            }
            
            const room: BingoRoom = {
              id: response.data.playerId,
              name: roomName,
              code: response.data.roomCode,
              players: [],
              isActive: true,
              createdAt: new Date()
            };
            
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: response.data.isHost,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            set({
              currentRoom: room,
              currentPlayer: player
            });
            
            return { success: true };
          } catch (error) {
            console.error('Create room error:', error);
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to create room' 
            };
          }
        },
        
        // Join an existing room
        joinRoom: async (roomCode: string, playerName: string) => {
          try {
            const response = await joinBingoRoom(roomCode, playerName);
            
            if (!response.success || !response.data) {
              return { 
                success: false, 
                error: response.error || 'Failed to join room' 
              };
            }
            
            const room: BingoRoom = {
              id: roomCode,
              name: response.data.roomName,
              code: roomCode,
              players: [],
              isActive: true
            };
            
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: false,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            set({
              currentRoom: room,
              currentPlayer: player
            });
            
            return { success: true };
          } catch (error) {
            console.error('Join room error:', error);
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to join room' 
            };
          }
        },
        
        // Leave the current room
        leaveRoom: () => {
          set({
            currentRoom: null,
            currentPlayer: null
          });
        },
        
        // Update player connection status
        updatePlayerStatus: (playerId: string, isConnected: boolean) => {
          const state = get();
          if (state.currentRoom) {
            const updatedPlayers = state.currentRoom.players.map(player => 
              player.id === playerId 
                ? { ...player, isConnected }
                : player
            );
            
            set({
              currentRoom: {
                ...state.currentRoom,
                players: updatedPlayers
              }
            });
          }
        }
      }),
      {
        name: 'bingo-room-storage',
        partialize: (state) => ({
          currentPlayer: state.currentPlayer
        })
      }
    )
  )
);