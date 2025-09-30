// Multi-Room Store - Manages multiple simultaneous room connections
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { BingoPlayer, BingoRoom } from './roomStore';
import type { GameState } from './gameStore';
import { createBingoRoom, joinBingoRoom, type BackendRoom, type BackendPlayer } from '../lib/api';

// Room type enumeration
export type RoomType = 'single' | 'persistent';

// Extended room interface with type and metadata
export interface MultiRoom extends BingoRoom {
  roomType: RoomType;
  createdAt: Date;
  lastActivity: Date;
  expiresAt?: Date; // For single meeting rooms
  cumulativeScores?: Record<string, number>; // For persistent rooms
  weeklyLeaderboard?: Array<{ playerId: string; playerName: string; score: number; }>;
  monthlyLeaderboard?: Array<{ playerId: string; playerName: string; score: number; }>;
}

// Room state for each room including game state
export interface RoomState {
  room: MultiRoom;
  gameState: GameState;
  isActive: boolean;
  lastSync: Date;
}

// Multi-room store interface
interface MultiRoomStore {
  // State
  rooms: Record<string, RoomState>; // roomCode -> RoomState
  activeRoomCode: string | null;
  currentPlayer: BingoPlayer | null;
  
  // Actions
  createRoom: (roomName: string, playerName: string, roomType: RoomType) => Promise<{ success: boolean; error?: string; roomCode?: string }>;
  joinRoom: (roomCode: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: (roomCode: string) => void;
  leaveAllRooms: () => void;
  setActiveRoom: (roomCode: string | null) => void;
  updateRoomState: (roomCode: string, updates: Partial<RoomState>) => void;
  updateRoomPlayers: (roomCode: string, players: BingoPlayer[]) => void;
  updateGameState: (roomCode: string, gameState: GameState) => void;
  updateCumulativeScores: (roomCode: string, playerId: string, scoreIncrement: number) => void;
  cleanupExpiredRooms: () => void;
  getRoomsOfType: (roomType: RoomType) => RoomState[];
  getActiveRoom: () => RoomState | null;
  setCurrentPlayer: (player: BingoPlayer | null) => void;
}

// Generate simple random room code (no prefixes)
export const generateRoomCode = (): string => {
  // Generate 4-character alphanumeric code
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return randomPart;
};

// Check if a room is expired (for single meeting rooms)
export const isRoomExpired = (room: MultiRoom): boolean => {
  if (room.roomType !== 'single' || !room.expiresAt) return false;
  return new Date() > room.expiresAt;
};

// Check if a room should be cleaned up due to inactivity
export const shouldCleanupRoom = (room: MultiRoom): boolean => {
  if (room.roomType === 'persistent') return false; // Continuous rooms NEVER cleanup
  
  // Only single meeting rooms cleanup after 2 hours of inactivity
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return room.lastActivity < twoHoursAgo;
};

export const useMultiRoomStore = create<MultiRoomStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        rooms: {},
        activeRoomCode: null,
        currentPlayer: null,
        
        // Create a new room with specified type
        createRoom: async (roomName: string, playerName: string, roomType: RoomType) => {
          try {
            // Generate simple room code
            const roomCode = generateRoomCode();
            
            // Create room via API (updated to include roomType)
            const response = await createBingoRoom(roomName, playerName, roomType);
            
            if (!response.success || !response.data) {
              return { 
                success: false, 
                error: response.error || 'Failed to create room' 
              };
            }
            
            const now = new Date();
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: response.data.isHost,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            const room: MultiRoom = {
              id: response.data.playerId,
              name: roomName,
              code: response.data.roomCode || roomCode,
              players: [player],
              isActive: true,
              createdAt: now,
              lastActivity: now,
              roomType,
              maxPlayers: 10,
              // Set expiration ONLY for single meeting rooms (24 hours from creation)
              // Continuous rooms NEVER expire
              expiresAt: roomType === 'single' ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : undefined,
              // Initialize empty cumulative scores for persistent rooms
              cumulativeScores: roomType === 'persistent' ? {} : undefined,
              weeklyLeaderboard: roomType === 'persistent' ? [] : undefined,
              monthlyLeaderboard: roomType === 'persistent' ? [] : undefined,
            };
            
            const roomState: RoomState = {
              room,
              gameState: {
                board: [],
                markedSquares: Array(25).fill(false),
                hasWon: false,
                winningPattern: undefined,
                appliedBonuses: []
              },
              isActive: true,
              lastSync: now
            };
            
            set(state => ({
              rooms: {
                ...state.rooms,
                [room.code]: roomState
              },
              activeRoomCode: room.code,
              currentPlayer: player
            }));
            
            return { success: true, roomCode: room.code };
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
            
            const now = new Date();
            const player: BingoPlayer = {
              id: response.data.playerId,
              name: playerName,
              isHost: false,
              isConnected: true,
              joinedAt: Date.now()
            };
            
            // Extract room type from nested room object (backend sends response.data.room.type)
            const backendRoom = response.data.room as BackendRoom | undefined;
            const roomType: RoomType = (backendRoom?.type === 'persistent' ? 'persistent' : 'single') as RoomType;

            // Extract all existing players from backend response
            const existingPlayers = Array.isArray(backendRoom?.players)
              ? backendRoom.players.map((p: BackendPlayer) => ({
                  id: p.id,
                  name: p.name,
                  isHost: p.isHost || false,
                  isConnected: true,
                  joinedAt: p.joinedAt ? new Date(p.joinedAt).getTime() : Date.now(),
                  currentScore: p.score || 0
                }))
              : [player];

            const room: MultiRoom = {
              id: roomCode,
              name: response.data.roomName || backendRoom?.name || roomCode,
              code: roomCode,
              players: existingPlayers, // Use all players from backend
              isActive: true,
              createdAt: backendRoom?.createdAt ? new Date(backendRoom.createdAt) : now,
              lastActivity: now,
              roomType,
              maxPlayers: 10,
              // Continuous rooms NEVER expire, only single meeting rooms do
              expiresAt: roomType === 'single' ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : undefined,
              cumulativeScores: roomType === 'persistent' ? {} : undefined,
              weeklyLeaderboard: roomType === 'persistent' ? [] : undefined,
              monthlyLeaderboard: roomType === 'persistent' ? [] : undefined,
            };
            
            const roomState: RoomState = {
              room,
              gameState: {
                board: [],
                markedSquares: Array(25).fill(false),
                hasWon: false,
                winningPattern: undefined,
                appliedBonuses: []
              },
              isActive: true,
              lastSync: now
            };
            
            set(state => ({
              rooms: {
                ...state.rooms,
                [roomCode]: roomState
              },
              activeRoomCode: roomCode,
              currentPlayer: state.currentPlayer || player // Keep existing player if set
            }));
            
            return { success: true };
          } catch (error) {
            console.error('Join room error:', error);
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to join room' 
            };
          }
        },
        
        // Leave a specific room
        leaveRoom: (roomCode: string) => {
          set(state => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [roomCode]: _, ...remainingRooms } = state.rooms;
            const newActiveRoomCode = state.activeRoomCode === roomCode 
              ? Object.keys(remainingRooms)[0] || null 
              : state.activeRoomCode;
            
            return {
              rooms: remainingRooms,
              activeRoomCode: newActiveRoomCode
            };
          });
        },
        
        // Leave all rooms
        leaveAllRooms: () => {
          set({
            rooms: {},
            activeRoomCode: null
          });
        },
        
        // Set the active room tab
        setActiveRoom: (roomCode: string | null) => {
          const state = get();
          if (roomCode && state.rooms[roomCode]) {
            set({ activeRoomCode: roomCode });
          } else {
            set({ activeRoomCode: null });
          }
        },
        
        // Update room state
        updateRoomState: (roomCode: string, updates: Partial<RoomState>) => {
          set(state => {
            if (!state.rooms[roomCode]) return state;
            
            return {
              rooms: {
                ...state.rooms,
                [roomCode]: {
                  ...state.rooms[roomCode],
                  ...updates,
                  room: {
                    ...state.rooms[roomCode].room,
                    ...(updates.room || {}),
                    lastActivity: new Date()
                  }
                }
              }
            };
          });
        },
        
        // Update players in a specific room
        updateRoomPlayers: (roomCode: string, players: BingoPlayer[]) => {
          set(state => {
            if (!state.rooms[roomCode]) return state;
            
            return {
              rooms: {
                ...state.rooms,
                [roomCode]: {
                  ...state.rooms[roomCode],
                  room: {
                    ...state.rooms[roomCode].room,
                    players,
                    lastActivity: new Date()
                  }
                }
              }
            };
          });
        },
        
        // Update game state for a specific room
        updateGameState: (roomCode: string, gameState: GameState) => {
          set(state => {
            if (!state.rooms[roomCode]) return state;
            
            return {
              rooms: {
                ...state.rooms,
                [roomCode]: {
                  ...state.rooms[roomCode],
                  gameState,
                  room: {
                    ...state.rooms[roomCode].room,
                    lastActivity: new Date()
                  }
                }
              }
            };
          });
        },
        
        // Update cumulative scores for persistent rooms
        updateCumulativeScores: (roomCode: string, playerId: string, scoreIncrement: number) => {
          set(state => {
            if (!state.rooms[roomCode] || state.rooms[roomCode].room.roomType !== 'persistent') {
              return state;
            }
            
            const room = state.rooms[roomCode].room;
            const currentScores = room.cumulativeScores || {};
            const newCumulativeScores = {
              ...currentScores,
              [playerId]: (currentScores[playerId] || 0) + scoreIncrement
            };
            
            return {
              rooms: {
                ...state.rooms,
                [roomCode]: {
                  ...state.rooms[roomCode],
                  room: {
                    ...room,
                    cumulativeScores: newCumulativeScores,
                    lastActivity: new Date()
                  }
                }
              }
            };
          });
        },
        
        // Clean up expired rooms
        cleanupExpiredRooms: () => {
          set(state => {
            const activeRooms: Record<string, RoomState> = {};
            let newActiveRoomCode = state.activeRoomCode;
            
            Object.entries(state.rooms).forEach(([roomCode, roomState]) => {
              const { room } = roomState;
              
              // Keep room if it's not expired and not inactive
              if (!isRoomExpired(room) && !shouldCleanupRoom(room)) {
                activeRooms[roomCode] = roomState;
              } else {
                // If we're removing the active room, clear it
                if (newActiveRoomCode === roomCode) {
                  newActiveRoomCode = null;
                }
              }
            });
            
            // Set new active room if current was removed
            if (!newActiveRoomCode && Object.keys(activeRooms).length > 0) {
              newActiveRoomCode = Object.keys(activeRooms)[0];
            }
            
            return {
              rooms: activeRooms,
              activeRoomCode: newActiveRoomCode
            };
          });
        },
        
        // Get rooms of a specific type
        getRoomsOfType: (roomType: RoomType) => {
          const state = get();
          return Object.values(state.rooms).filter(roomState => 
            roomState.room.roomType === roomType
          );
        },
        
        // Get the currently active room
        getActiveRoom: () => {
          const state = get();
          return state.activeRoomCode ? state.rooms[state.activeRoomCode] || null : null;
        },
        
        // Set current player
        setCurrentPlayer: (player: BingoPlayer | null) => {
          set({ currentPlayer: player });
        }
      }),
      {
        name: 'multi-room-storage',
        partialize: (state) => ({
          rooms: state.rooms,
          activeRoomCode: state.activeRoomCode,
          currentPlayer: state.currentPlayer
        }),
        // Custom deserialization to handle dates
        onRehydrateStorage: () => (state) => {
          if (state?.rooms) {
            // Convert date strings back to Date objects
            Object.values(state.rooms).forEach((roomState) => {
              if (roomState.room.createdAt && typeof roomState.room.createdAt === 'string') {
                roomState.room.createdAt = new Date(roomState.room.createdAt);
              }
              if (roomState.room.lastActivity && typeof roomState.room.lastActivity === 'string') {
                roomState.room.lastActivity = new Date(roomState.room.lastActivity);
              }
              if (roomState.room.expiresAt && typeof roomState.room.expiresAt === 'string') {
                roomState.room.expiresAt = new Date(roomState.room.expiresAt);
              }
              if (roomState.lastSync && typeof roomState.lastSync === 'string') {
                roomState.lastSync = new Date(roomState.lastSync);
              }
            });
          }
        }
      }
    )
  )
);