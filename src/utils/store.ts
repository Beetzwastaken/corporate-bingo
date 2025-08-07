// Zustand Store for Corporate Bingo - Enhanced Multiplayer State Management
// Handles room state, player management, and WebSocket connections

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BingoWebSocketClient, createWebSocketClient, MESSAGE_TYPES } from '../lib/websocket';
import { createBingoRoom, joinBingoRoom } from '../lib/api';
import { APP_VERSION, needsStateMigration, logVersionInfo } from './version';

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

// Square interface
export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

// Game state interface
export interface GameState {
  board: BingoSquare[];
  markedSquares: boolean[];
  hasWon: boolean;
  winningPattern?: number[];
}

// Store interface
interface BingoStore {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  isConnecting: boolean;
  
  // Player state  
  currentPlayer: BingoPlayer | null;
  playerName: string;
  
  // Room state
  currentRoom: BingoRoom | null;
  
  // Game state
  gameState: GameState;
  
  // WebSocket client
  wsClient: BingoWebSocketClient | null;
  
  // Stats (persisted)
  gamesPlayed: number;
  wins: number;
  totalSquares: number;
  
  // Version tracking for cache-busting
  appVersion: string;
  
  // Actions - Connection Management
  setConnectionStatus: (connected: boolean, error?: string) => void;
  setConnecting: (connecting: boolean) => void;
  
  // Actions - Player Management
  setPlayerName: (name: string) => void;
  setCurrentPlayer: (player: BingoPlayer | null) => void;
  
  // Actions - Room Management
  setCurrentRoom: (room: BingoRoom | null) => void;
  updateRoomPlayers: (players: BingoPlayer[]) => void;
  addPlayerToRoom: (player: BingoPlayer) => void;
  removePlayerFromRoom: (playerId: string) => void;
  
  // Actions - Game Management
  setBoard: (board: string[]) => void;
  markSquare: (squareIndex: number) => void;
  setGameWon: (won: boolean, pattern?: number[]) => void;
  resetGame: () => void;
  
  // Actions - WebSocket Management
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  sendMessage: (type: string, payload?: Record<string, unknown>) => Promise<void>;
  
  // Actions - Room Operations
  createRoom: (roomName: string) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (roomCode: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  
  // Actions - Stats
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  incrementTotalSquares: () => void;
  
  // Actions - Version Management
  emergencyReset: () => void;
}

// Create the store
export const useBingoStore = create<BingoStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial connection state
        isConnected: false,
        connectionError: null,
        isConnecting: false,
        
        // Initial player state
        currentPlayer: null,
        playerName: '',
        
        // Initial room state
        currentRoom: null,
        
        // Initial game state
        gameState: {
          board: [],
          markedSquares: new Array(25).fill(false),
          hasWon: false,
        },
        
        // WebSocket client
        wsClient: null,
        
        // Initial stats
        gamesPlayed: 0,
        wins: 0,
        totalSquares: 0,
        
        // Version tracking
        appVersion: APP_VERSION,
        
        // Connection Management
        setConnectionStatus: (connected, error) => 
          set({ isConnected: connected, connectionError: error || null }),
          
        setConnecting: (connecting) => 
          set({ isConnecting: connecting }),
        
        // Player Management
        setPlayerName: (name) => 
          set({ playerName: name.trim() }),
          
        setCurrentPlayer: (player) => 
          set({ currentPlayer: player }),
        
        // Room Management
        setCurrentRoom: (room) => 
          set({ currentRoom: room }),
          
        updateRoomPlayers: (players) => 
          set((state) => ({
            currentRoom: state.currentRoom ? {
              ...state.currentRoom,
              players
            } : null
          })),
          
        addPlayerToRoom: (player) => 
          set((state) => ({
            currentRoom: state.currentRoom ? {
              ...state.currentRoom,
              players: [...state.currentRoom.players, player]
            } : null
          })),
          
        removePlayerFromRoom: (playerId) => 
          set((state) => ({
            currentRoom: state.currentRoom ? {
              ...state.currentRoom,
              players: state.currentRoom.players.filter(p => p.id !== playerId)
            } : null
          })),
        
        // Game Management
        setBoard: (board) => {
          const squares: BingoSquare[] = board.map((text, index) => ({
            id: `square-${index}`,
            text,
            isMarked: index === 12, // Center square (FREE SPACE) is pre-marked
            isFree: index === 12
          }));
          
          set({
            gameState: {
              board: squares,
              markedSquares: new Array(25).fill(false).map((_, i) => i === 12),
              hasWon: false,
            }
          });
        },
        
        markSquare: (squareIndex) => {
          const state = get();
          if (squareIndex < 0 || squareIndex >= 25) return;
          
          const newBoard = [...state.gameState.board];
          const newMarkedSquares = [...state.gameState.markedSquares];
          
          // Toggle the square
          newBoard[squareIndex] = {
            ...newBoard[squareIndex],
            isMarked: !newBoard[squareIndex].isMarked
          };
          newMarkedSquares[squareIndex] = !newMarkedSquares[squareIndex];
          
          set({
            gameState: {
              ...state.gameState,
              board: newBoard,
              markedSquares: newMarkedSquares
            }
          });
          
          // Send to WebSocket if connected
          if (state.wsClient?.isConnected()) {
            state.wsClient.markSquare(squareIndex).catch(console.error);
          }
        },
        
        setGameWon: (won, pattern) => 
          set((state) => ({
            gameState: {
              ...state.gameState,
              hasWon: won,
              winningPattern: pattern
            }
          })),
        
        resetGame: () => 
          set((state) => ({
            gameState: {
              board: state.gameState.board.map(square => ({
                ...square,
                isMarked: square.isFree || false
              })),
              markedSquares: new Array(25).fill(false).map((_, i) => i === 12),
              hasWon: false,
              winningPattern: undefined
            }
          })),
        
        // WebSocket Management
        connectWebSocket: async () => {
          const state = get();
          if (!state.currentRoom || !state.currentPlayer) {
            throw new Error('Must be in a room with a player to connect WebSocket');
          }
          
          if (state.wsClient) {
            state.wsClient.disconnect();
          }
          
          set({ isConnecting: true, connectionError: null });
          
          const wsClient = createWebSocketClient({
            roomCode: state.currentRoom.code,
            playerId: state.currentPlayer.id,
            onMessage: (message) => {
              const currentState = get();
              
              switch (message.type) {
                case MESSAGE_TYPES.PLAYER_JOINED:
                  if (message.payload && typeof message.payload === 'object' && 'player' in message.payload) {
                    const player = message.payload.player as BingoPlayer;
                    if (player && typeof player === 'object' && 'id' in player && 'name' in player) {
                      currentState.addPlayerToRoom(player);
                    }
                  }
                  break;
                  
                case MESSAGE_TYPES.PLAYER_LEFT:
                  if (message.payload && typeof message.payload === 'object' && 'playerId' in message.payload) {
                    const playerId = message.payload.playerId as string;
                    if (typeof playerId === 'string') {
                      currentState.removePlayerFromRoom(playerId);
                    }
                  }
                  break;
                  
                case MESSAGE_TYPES.SQUARE_MARKED:
                  // Handle other players marking squares
                  // This would be for verification requests or score updates
                  console.log('Player marked square:', message.payload);
                  break;
                  
                case MESSAGE_TYPES.GAME_STATE_UPDATE:
                  // Handle game state synchronization
                  if (message.payload && typeof message.payload === 'object' && 'playerCount' in message.payload) {
                    const players = message.payload.players as BingoPlayer[] | undefined;
                    set((state) => ({
                      currentRoom: state.currentRoom ? {
                        ...state.currentRoom,
                        players: Array.isArray(players) ? players : state.currentRoom.players
                      } : null
                    }));
                  }
                  break;
                  
                case MESSAGE_TYPES.ERROR: {
                  console.error('WebSocket error:', message.payload);
                  const errorMessage = message.payload && typeof message.payload === 'object' && 'message' in message.payload 
                    ? String(message.payload.message)
                    : 'WebSocket error';
                  set({ connectionError: errorMessage });
                  break;
                }
              }
            },
            onConnect: () => {
              set({ isConnected: true, isConnecting: false, connectionError: null });
            },
            onDisconnect: () => {
              set({ isConnected: false, isConnecting: false });
            },
            onError: (error) => {
              set({ 
                isConnected: false, 
                isConnecting: false, 
                connectionError: error.message 
              });
            }
          });
          
          try {
            await wsClient.connect();
            set({ wsClient });
          } catch (error) {
            set({ 
              isConnecting: false, 
              connectionError: error instanceof Error ? error.message : 'Connection failed' 
            });
            throw error;
          }
        },
        
        disconnectWebSocket: () => {
          const state = get();
          if (state.wsClient) {
            state.wsClient.disconnect();
            set({ wsClient: null, isConnected: false });
          }
        },
        
        sendMessage: async (type, payload) => {
          const state = get();
          if (!state.wsClient?.isConnected()) {
            throw new Error('WebSocket not connected');
          }
          await state.wsClient.send(type, payload);
        },
        
        // Room Operations
        createRoom: async (roomName) => {
          const state = get();
          if (!state.playerName) {
            return { success: false, error: 'Player name is required' };
          }
          
          try {
            set({ isConnecting: true });
            const response = await createBingoRoom(roomName, state.playerName);
            
            if (response.success && response.data) {
              const player: BingoPlayer = {
                id: response.data.playerId,
                name: state.playerName,
                isHost: response.data.isHost,
                currentScore: 0,
                totalScore: 0,
                isConnected: true,
                joinedAt: Date.now()
              };
              
              const room: BingoRoom = {
                id: response.data.playerId, // Use player ID as room ID for now
                name: roomName,
                code: response.data.roomCode,
                players: [player],
                isActive: true,
                roundNumber: 1,
                createdAt: new Date(),
                maxPlayers: 10
              };
              
              set({ 
                currentPlayer: player,
                currentRoom: room,
                isConnecting: false
              });
              
              // Set the board
              get().setBoard(response.data.board);
              
              // Connect WebSocket
              await get().connectWebSocket();
              
              return { success: true };
            } else {
              set({ isConnecting: false });
              return { success: false, error: response.error || 'Failed to create room' };
            }
          } catch (error) {
            set({ isConnecting: false });
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to create room' 
            };
          }
        },
        
        joinRoom: async (roomCode) => {
          const state = get();
          if (!state.playerName) {
            return { success: false, error: 'Player name is required' };
          }
          
          try {
            set({ isConnecting: true });
            const response = await joinBingoRoom(roomCode, state.playerName);
            
            if (response.success && response.data) {
              const player: BingoPlayer = {
                id: response.data.playerId,
                name: state.playerName,
                isHost: false,
                currentScore: 0,
                totalScore: 0,
                isConnected: true,
                joinedAt: Date.now()
              };
              
              const room: BingoRoom = {
                id: roomCode,
                name: response.data.roomName,
                code: roomCode,
                players: [player], // Backend will send full player list via WebSocket
                isActive: true,
                roundNumber: response.data.roundNumber || 1,
                createdAt: new Date(),
                maxPlayers: 10
              };
              
              set({ 
                currentPlayer: player,
                currentRoom: room,
                isConnecting: false
              });
              
              // Set the board
              get().setBoard(response.data.board);
              
              // Connect WebSocket
              await get().connectWebSocket();
              
              return { success: true };
            } else {
              set({ isConnecting: false });
              return { success: false, error: response.error || 'Failed to join room' };
            }
          } catch (error) {
            set({ isConnecting: false });
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to join room' 
            };
          }
        },
        
        leaveRoom: () => {
          const state = get();
          
          // Disconnect WebSocket
          state.disconnectWebSocket();
          
          // Clear room and player state
          set({
            currentRoom: null,
            currentPlayer: null,
            gameState: {
              board: [],
              markedSquares: new Array(25).fill(false),
              hasWon: false,
            },
            isConnected: false,
            connectionError: null
          });
        },
        
        // Stats Management
        incrementGamesPlayed: () => 
          set((state) => ({ gamesPlayed: state.gamesPlayed + 1 })),
          
        incrementWins: () => 
          set((state) => ({ wins: state.wins + 1 })),
          
        incrementTotalSquares: () => 
          set((state) => ({ totalSquares: state.totalSquares + 1 })),
        
        // Version Management - Emergency Reset
        emergencyReset: () => {
          try {
            // Clear localStorage directly
            localStorage.removeItem('corporate-bingo-store');
            console.log('[Corporate Bingo] Emergency reset completed - reloading page...');
            
            // Force hard reload
            window.location.reload();
          } catch (error) {
            console.error('[Corporate Bingo] Emergency reset failed:', error);
            // Fallback: Reset store state to defaults
            set({
              isConnected: false,
              connectionError: null,
              isConnecting: false,
              currentPlayer: null,
              playerName: '',
              currentRoom: null,
              gameState: {
                board: [],
                markedSquares: new Array(25).fill(false),
                hasWon: false,
              },
              wsClient: null,
              gamesPlayed: 0,
              wins: 0,
              totalSquares: 0,
              appVersion: APP_VERSION
            });
          }
        }
      }),
      {
        name: 'corporate-bingo-store',
        // Only persist stats, player name, and version for cache-busting
        partialize: (state) => ({
          playerName: state.playerName,
          gamesPlayed: state.gamesPlayed,
          wins: state.wins,
          totalSquares: state.totalSquares,
          appVersion: state.appVersion
        }),
        // Migration function to handle version changes
        migrate: (persistedState: any) => {
          const storedVersion = persistedState?.appVersion;
          
          logVersionInfo(storedVersion);
          
          // If we need migration (version changed), clear state and start fresh
          if (needsStateMigration(storedVersion)) {
            console.log('[Corporate Bingo] App version changed - clearing persisted state for fresh start');
            
            // Return only the app version, clearing all other persisted data
            return {
              playerName: '',
              gamesPlayed: 0,
              wins: 0,
              totalSquares: 0,
              appVersion: APP_VERSION
            };
          }
          
          // No migration needed, return state as-is with updated version
          return {
            ...persistedState,
            appVersion: APP_VERSION
          };
        },
      }
    ),
    { name: 'BingoStore' }
  )
);