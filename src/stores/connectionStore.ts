// Connection Store - Manages WebSocket and HTTP polling connections
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BingoWebSocketClient, createWebSocketClient } from '../lib/websocket';
import { BingoPollingClient, createPollingClient, type GameStateUpdate } from '../lib/polling';
import { MESSAGE_TYPES } from '../lib/messageTypes';
import { useRoomStore } from './roomStore';
import { useGameStore } from './gameStore';

// Message type definitions - Compatible with WebSocketMessage
interface BaseMessage {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
  [key: string]: unknown;
}

interface PlayerMessage extends BaseMessage {
  player?: {
    id: string;
    name: string;
  };
  playerId?: string;
}

interface RoomUpdateMessage extends BaseMessage {
  players?: Array<{
    id: string;
    name: string;
    isHost?: boolean;
    isConnected?: boolean;
    currentScore?: number;
  }>;
}

interface GameMessage extends BaseMessage {
  squareIndex?: number;
  pattern?: number[];
  error?: string;
}

type IncomingMessage = BaseMessage & PlayerMessage & RoomUpdateMessage & GameMessage;

interface ConnectionStore {
  // State
  isConnected: boolean;
  connectionError: string | null;
  wsClient: BingoWebSocketClient | null;
  pollingClient: BingoPollingClient | null;
  lastMessageTime: number;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (type: string, payload?: Record<string, unknown>) => Promise<void>;
  handleMessage: (message: IncomingMessage) => void;
  setConnectionError: (error: string | null) => void;
  clearConnection: () => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connectionError: null,
      wsClient: null,
      pollingClient: null,
      lastMessageTime: Date.now(),
      
      // Connect to room (WebSocket with polling fallback)
      connect: async () => {
        const roomStore = useRoomStore.getState();
        const gameStore = useGameStore.getState();
        
        if (!roomStore.currentRoom || !roomStore.currentPlayer) {
          console.error('No room or player to connect');
          return;
        }
        
        const { currentRoom, currentPlayer } = roomStore;
        
        // Clear any existing connections
        get().disconnect();
        
        // Initialize game board if needed
        if (!gameStore.gameState.board.length) {
          gameStore.initializeGame();
        }
        
        // Set up message handler - flexible for both WebSocket and polling messages
        const handleMessage = (incomingMessage: unknown) => {
          // Convert to IncomingMessage format with proper type handling
          const msgData = incomingMessage as Record<string, unknown>;
          const message: IncomingMessage = {
            type: (msgData.type as string) || 'unknown',
            timestamp: (msgData.timestamp as number) || Date.now(),
            payload: msgData.payload as Record<string, unknown>,
            ...msgData // Spread all other properties
          };
          get().handleMessage(message);
        };
        
        try {
          // Try WebSocket first
          console.log('Attempting WebSocket connection...');
          const wsClient = createWebSocketClient({
            roomCode: currentRoom.code,
            playerId: currentPlayer.id,
            onMessage: handleMessage,
            onConnect: () => {
              console.log('WebSocket connected');
            },
            onDisconnect: () => {
              console.log('WebSocket disconnected');
            },
            onError: (error) => {
              console.error('WebSocket error:', error);
            }
          });
          
          await wsClient.connect();
          
          set({
            wsClient,
            isConnected: true,
            connectionError: null,
            lastMessageTime: Date.now()
          });
          
          console.log('WebSocket connected successfully');
          
          // Request immediate room state to sync other players
          setTimeout(() => {
            const roomStore = useRoomStore.getState();
            if (roomStore.currentRoom && roomStore.currentPlayer) {
              roomStore.syncRoomState(roomStore.currentRoom.code, roomStore.currentPlayer.id);
            }
          }, 200); // Small delay to ensure WebSocket is fully ready
        } catch (wsError) {
          console.warn('WebSocket failed, falling back to polling:', wsError);
          
          // Fall back to polling
          try {
            const pollingClient = createPollingClient({
              roomCode: currentRoom.code,
              playerId: currentPlayer.id,
              onUpdate: (gameState) => {
                // Convert polling update to message format
                handleMessage({ type: 'gameState', ...gameState });
              },
              onError: (error) => {
                console.error('Polling error:', error);
                set({ connectionError: error.message });
              },
              pollInterval: 3000
            });
            
            pollingClient.startPolling();
            
            set({
              pollingClient,
              isConnected: true,
              connectionError: null,
              lastMessageTime: Date.now()
            });
            
            console.log('Polling connected successfully');
            
            // Request immediate room state to sync other players
            setTimeout(() => {
              const roomStore = useRoomStore.getState();
              if (roomStore.currentRoom && roomStore.currentPlayer) {
                roomStore.syncRoomState(roomStore.currentRoom.code, roomStore.currentPlayer.id);
              }
            }, 300); // Slightly longer delay for polling to be ready
          } catch (pollError) {
            console.error('Both WebSocket and polling failed:', pollError);
            set({
              isConnected: false,
              connectionError: 'Unable to connect to room. Please check your connection.'
            });
          }
        }
      },
      
      // Disconnect from room
      disconnect: () => {
        const state = get();
        
        if (state.wsClient) {
          state.wsClient.disconnect();
        }
        
        if (state.pollingClient) {
          state.pollingClient.stopPolling();
        }
        
        set({
          wsClient: null,
          pollingClient: null,
          isConnected: false,
          connectionError: null
        });
      },
      
      // Send message through active connection
      sendMessage: async (type: string, payload?: Record<string, unknown>) => {
        const state = get();
        const roomStore = useRoomStore.getState();
        
        if (!roomStore.currentRoom || !roomStore.currentPlayer) {
          console.error('No room or player for sending message');
          return;
        }
        
        // Message is constructed but not used directly since we pass type and payload separately
        
        try {
          if (state.wsClient) {
            await state.wsClient.send(type, payload);
          } else if (state.pollingClient) {
            // Polling client doesn't have a general send method, only specific actions
            if (type === 'MARK_SQUARE' && payload?.squareIndex !== undefined) {
              await state.pollingClient.markSquare(payload.squareIndex as number);
            }
          } else {
            console.error('No active connection for sending message');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          set({ connectionError: 'Failed to send message' });
        }
      },
      
      // Handle incoming messages
      handleMessage: (message: IncomingMessage) => {
        const roomStore = useRoomStore.getState();
        const gameStore = useGameStore.getState();
        
        set({ lastMessageTime: Date.now() });
        
        switch (message.type) {
          case MESSAGE_TYPES.PLAYER_JOINED:
          case MESSAGE_TYPES.PLAYER_LEFT:
          case MESSAGE_TYPES.ROOM_UPDATE:
            if (message.players && Array.isArray(message.players)) {
              console.log(`🏠 Room update received: ${message.players.length} players`);
              roomStore.updateRoomPlayers(message.players);
            } else if (message.type === MESSAGE_TYPES.PLAYER_JOINED && message.player) {
              // Handle single player join
              const currentRoom = roomStore.currentRoom;
              if (currentRoom) {
                const updatedPlayers = [...currentRoom.players];
                // Only add if not already in list
                if (message.player && !updatedPlayers.find(p => p.id === message.player?.id)) {
                  updatedPlayers.push(message.player);
                  roomStore.updateRoomPlayers(updatedPlayers);
                  console.log(`👋 Player joined: ${message.player?.name || 'Unknown'} (${updatedPlayers.length} total)`);
                }
              }
            } else if (message.type === MESSAGE_TYPES.PLAYER_LEFT && message.playerId) {
              // Handle single player leave
              const currentRoom = roomStore.currentRoom;
              if (currentRoom) {
                const updatedPlayers = currentRoom.players.filter(p => p.id !== message.playerId);
                roomStore.updateRoomPlayers(updatedPlayers);
                console.log(`👋 Player left: ${message.playerId} (${updatedPlayers.length} remaining)`);
              }
            }
            break;
            
          case MESSAGE_TYPES.SQUARE_MARKED:
            if (typeof message.squareIndex === 'number') {
              gameStore.markSquare(message.squareIndex);
            }
            break;
            
          case MESSAGE_TYPES.GAME_WON:
            if (Array.isArray(message.pattern)) {
              gameStore.setGameWon(true, message.pattern);
            }
            break;
            
          case MESSAGE_TYPES.GAME_RESET:
            gameStore.resetGame();
            break;
            
          case MESSAGE_TYPES.LINE_MULTIPLIER:
            // Handle line multiplier bonus notifications
            if (message.playerName && message.bonusPoints && message.message) {
              console.log(`🎉 ${message.playerName} earned ${message.bonusPoints} bonus points for ${message.lineType}`);
              // You could show a notification here or update the UI state
              // For now, we'll just log it - could extend to show toast notifications
            }
            break;
            
          case MESSAGE_TYPES.CLAIM_APPROVED:
            // Handle approved claims
            if (message.claimerName && message.points) {
              console.log(`✅ ${message.claimerName} scored ${message.points} points for "${message.buzzword}"`);
            }
            break;
            
          case MESSAGE_TYPES.CLAIM_REJECTED:
            // Handle rejected claims
            if (message.claimerName && message.reason) {
              console.log(`❌ ${message.claimerName}'s claim rejected: ${message.reason}`);
            }
            break;
            
          case 'gameState': {
            // Handle polling game state updates
            const update = message as GameStateUpdate;
            if (update.players) {
              console.log(`🔄 Polling update: ${update.players.length} players`);
              roomStore.updateRoomPlayers(update.players);
            }
            if (update.playerCount !== undefined) {
              console.log(`🔢 Polling update: player count ${update.playerCount}`);
            }
            // Note: markedSquares sync would be handled here if needed
            break;
          }
            
          case MESSAGE_TYPES.ERROR:
            set({ connectionError: (typeof message.error === 'string' ? message.error : 'Connection error occurred') });
            break;
        }
      },
      
      // Set connection error
      setConnectionError: (error: string | null) => {
        set({ connectionError: error });
      },
      
      // Clear connection state
      clearConnection: () => {
        get().disconnect();
        set({
          isConnected: false,
          connectionError: null,
          lastMessageTime: Date.now()
        });
      }
    })
  )
);