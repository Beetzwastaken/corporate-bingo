// Connection Store - Manages WebSocket and HTTP polling connections
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BingoWebSocketClient, createWebSocketClient } from '../lib/websocket';
import { BingoPollingClient, createPollingClient, type GameStateUpdate } from '../lib/polling';
import { MESSAGE_TYPES } from '../lib/messageTypes';
import { useRoomStore } from './roomStore';
import { useGameStore } from './gameStore';

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
  handleMessage: (message: any) => void;
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
        
        // Set up message handler
        const handleMessage = (message: any) => {
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
      handleMessage: (message: any) => {
        const roomStore = useRoomStore.getState();
        const gameStore = useGameStore.getState();
        
        set({ lastMessageTime: Date.now() });
        
        switch (message.type) {
          case MESSAGE_TYPES.PLAYER_JOINED:
          case MESSAGE_TYPES.PLAYER_LEFT:
          case MESSAGE_TYPES.ROOM_UPDATE:
            if (message.players) {
              roomStore.updateRoomPlayers(message.players);
            }
            break;
            
          case MESSAGE_TYPES.SQUARE_MARKED:
            if (message.squareIndex !== undefined) {
              gameStore.markSquare(message.squareIndex);
            }
            break;
            
          case MESSAGE_TYPES.GAME_WON:
            if (message.pattern) {
              gameStore.setGameWon(true, message.pattern);
            }
            break;
            
          case MESSAGE_TYPES.GAME_RESET:
            gameStore.resetGame();
            break;
            
          case 'gameState':
            // Handle polling game state updates
            const update = message as GameStateUpdate;
            if (update.players) {
              roomStore.updateRoomPlayers(update.players);
            }
            // Note: markedSquares sync would be handled here if needed
            break;
            
          case MESSAGE_TYPES.ERROR:
            set({ connectionError: message.error || 'Connection error occurred' });
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