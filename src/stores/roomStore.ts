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
  syncRoomState: (roomCode: string, playerId: string) => Promise<void>;
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
            
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: response.data.isHost,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            const room: BingoRoom = {
              id: response.data.playerId,
              name: roomName,
              code: response.data.roomCode,
              players: [player], // Initialize with the creating player
              isActive: true,
              createdAt: new Date()
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
            
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: false,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            // Initialize with minimal room data - real-time sync will populate other players
            const room: BingoRoom = {
              id: roomCode,
              name: response.data.roomName,
              code: roomCode,
              players: [player], // Start with joining player, sync will update this
              isActive: true
            };
            
            set({
              currentRoom: room,
              currentPlayer: player
            });
            
            // Request immediate room state sync to get other players
            setTimeout(async () => {
              try {
                await get().syncRoomState(roomCode, response.data!.playerId);
              } catch (error) {
                console.warn('Failed to sync room state after joining:', error);
              }
            }, 100); // Small delay to ensure connection is established
            
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
        },
        
        // Sync room state to get current players list
        syncRoomState: async (roomCode: string, playerId: string) => {
          try {
            console.log(`🔄 Syncing room state for ${roomCode} with player ${playerId}`);
            
            // Use polling client's method to get room state
            const response = await fetch(`/api/room/${roomCode}/players`, {
              headers: {
                'Content-Type': 'application/json',
                'X-Player-ID': playerId
              }
            });

            console.log(`🔄 Players endpoint response: ${response.status} ${response.statusText}`);

            if (response.ok) {
              const gameState = await response.json();
              console.log('🔄 Players endpoint returned:', gameState);
              
              if (gameState.players && Array.isArray(gameState.players)) {
                console.log(`🔄 Room sync: Found ${gameState.players.length} players:`, gameState.players.map((p: BingoPlayer) => p.name));
                get().updateRoomPlayers(gameState.players);
              }
            } else {
              console.log('🔄 Players endpoint failed, trying info endpoint...');
              // If dedicated endpoint doesn't exist, try alternative approach
              const infoResponse = await fetch('/api/room/info', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  roomCode,
                  playerId,
                  checkOnly: true
                })
              });
              
              console.log(`🔄 Info endpoint response: ${infoResponse.status} ${infoResponse.statusText}`);
              
              if (infoResponse.ok) {
                const roomInfo = await infoResponse.json();
                console.log('🔄 Info endpoint returned:', roomInfo);
                if (roomInfo.players && Array.isArray(roomInfo.players)) {
                  console.log(`🔄 Room sync (alt): Found ${roomInfo.players.length} players:`, roomInfo.players.map((p: BingoPlayer) => p.name));
                  get().updateRoomPlayers(roomInfo.players);
                }
              }
            }
          } catch (error) {
            console.error('Room state sync failed:', error);
            // Don't throw - this is a non-critical enhancement
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