// Connection Store - Manages WebSocket and HTTP polling connections
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BingoWebSocketClient, createWebSocketClient } from '../lib/websocket';
import { BingoPollingClient, createPollingClient, type GameStateUpdate } from '../lib/polling';
import { MESSAGE_TYPES } from '../lib/messageTypes';
import { useMultiRoomStore } from './multiRoomStore';
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
  handleMessage: (message: IncomingMessage) => Promise<void>;
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
        console.log('🔌 [ConnectionStore] connect() called');
        const multiRoomStore = useMultiRoomStore.getState();
        const gameStore = useGameStore.getState();

        // Get active room and current player from multiRoomStore
        const activeRoomState = multiRoomStore.getActiveRoom();
        const currentPlayer = multiRoomStore.currentPlayer;

        if (!activeRoomState || !currentPlayer) {
          console.error('❌ [ConnectionStore] No room or player to connect');
          return;
        }

        const currentRoom = activeRoomState.room;
        console.log('✅ [ConnectionStore] Room and player found:', { roomCode: currentRoom.code, playerId: currentPlayer.id });
        
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
          console.log('🌐 [ConnectionStore] Attempting WebSocket connection...');
          console.log('🌐 [ConnectionStore] Room code:', currentRoom.code, 'Player ID:', currentPlayer.id);
          const wsClient = createWebSocketClient({
            roomCode: currentRoom.code,
            playerId: currentPlayer.id,
            onMessage: handleMessage,
            onConnect: () => {
              console.log('✅ [WebSocket] Connected successfully');
            },
            onDisconnect: () => {
              console.log('🔌 [WebSocket] Disconnected');
            },
            onError: (error) => {
              console.error('❌ [WebSocket] Error:', error);
            }
          });

          console.log('🌐 [ConnectionStore] WebSocket client created, calling connect()...');
          await wsClient.connect();
          console.log('✅ [ConnectionStore] WebSocket connect() completed');
          
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
        const multiRoomStore = useMultiRoomStore.getState();

        const activeRoomState = multiRoomStore.getActiveRoom();
        const currentPlayer = multiRoomStore.currentPlayer;

        if (!activeRoomState || !currentPlayer) {
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
      handleMessage: async (message: IncomingMessage) => {
        const multiRoomStore = useMultiRoomStore.getState();
        const gameStore = useGameStore.getState();

        set({ lastMessageTime: Date.now() });

        // Get active room code for message handling
        const activeRoomCode = multiRoomStore.activeRoomCode;
        if (!activeRoomCode) {
          console.warn('No active room for handling message');
          return;
        }

        switch (message.type) {
          case MESSAGE_TYPES.PLAYER_JOINED:
          case MESSAGE_TYPES.PLAYER_LEFT:
          case MESSAGE_TYPES.ROOM_UPDATE:
            if (message.players && Array.isArray(message.players)) {
              console.log(`🏠 Room update received: ${message.players.length} players`);
              multiRoomStore.updateRoomPlayers(activeRoomCode, message.players);
            } else if (message.type === MESSAGE_TYPES.PLAYER_JOINED && message.player) {
              // Handle single player join
              const activeRoomState = multiRoomStore.getActiveRoom();
              if (activeRoomState) {
                const updatedPlayers = [...activeRoomState.room.players];
                // Only add if not already in list
                if (message.player && !updatedPlayers.find(p => p.id === message.player?.id)) {
                  updatedPlayers.push(message.player);
                  multiRoomStore.updateRoomPlayers(activeRoomCode, updatedPlayers);
                  console.log(`👋 Player joined: ${message.player?.name || 'Unknown'} (${updatedPlayers.length} total)`);
                }
              }
            } else if (message.type === MESSAGE_TYPES.PLAYER_LEFT && message.playerId) {
              // Handle single player leave
              const activeRoomState = multiRoomStore.getActiveRoom();
              if (activeRoomState) {
                const updatedPlayers = activeRoomState.room.players.filter(p => p.id !== message.playerId);
                multiRoomStore.updateRoomPlayers(activeRoomCode, updatedPlayers);
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
              multiRoomStore.updateRoomPlayers(activeRoomCode, update.players);
            }
            if (update.playerCount !== undefined) {
              console.log(`🔢 Polling update: player count ${update.playerCount}`);
            }
            // Note: markedSquares sync would be handled here if needed
            break;
          }
            
          case 'verification_request': {
            // Someone wants to claim a square - show verification modal
            const { useVerificationStore } = await import('./verificationStore');
            const verificationStore = useVerificationStore.getState();

            if (message.verification) {
              const verification = message.verification as {
                id: string;
                playerId: string;
                playerName: string;
                squareIndex: number;
                buzzword: string;
                expiresAt: number;
              };

              // Add to pending verifications
              verificationStore.addVerification({
                id: verification.id,
                playerId: verification.playerId,
                playerName: verification.playerName,
                squareIndex: verification.squareIndex,
                buzzword: verification.buzzword,
                votes: new Map(),
                createdAt: Date.now(),
                expiresAt: verification.expiresAt,
                resolved: false
              });

              // Show modal immediately
              verificationStore.setActiveVerification({
                id: verification.id,
                playerName: verification.playerName,
                buzzword: verification.buzzword,
                squareIndex: verification.squareIndex,
                expiresAt: verification.expiresAt
              });

              console.log(`📋 Verification request from ${verification.playerName} for "${verification.buzzword}"`);
            }
            break;
          }

          case 'verification_resolved': {
            // Verification complete - update UI
            const { useVerificationStore } = await import('./verificationStore');
            const verificationStore = useVerificationStore.getState();

            if (message.verificationId) {
              verificationStore.resolveVerification(message.verificationId as string);

              if (message.approved) {
                // Square was approved - mark it and show success
                if (typeof message.squareIndex === 'number') {
                  gameStore.markSquare(message.squareIndex);
                  console.log(`✅ Claim approved: ${message.player?.name} scored ${message.score} points`);

                  // Show success toast
                  if (message.player?.name && message.bonusPoints) {
                    console.log(`🎉 +${message.bonusPoints} bonus points!`);
                  }
                }
              } else {
                // Square was rejected
                console.log(`❌ Claim rejected: ${message.message}`);
                if (message.voteBreakdown && typeof message.voteBreakdown === 'object') {
                  const breakdown = message.voteBreakdown as { approves: number; rejects: number; missing: number };
                  console.log(`  Votes: ${breakdown.approves} approve, ${breakdown.rejects} reject, ${breakdown.missing} missing`);
                }
              }
            }
            break;
          }

          case 'board_reset': {
            // Phase 4: Room-wide board reset after BINGO
            if (message.winner && typeof message.finalScore === 'number') {
              const winner = message.winner as { id: string; name: string };

              // Show toast notification
              const { showGameToast } = await import('../components/shared/ToastNotification');
              showGameToast(
                `${winner.name} Won!`,
                `Scored ${message.finalScore} points. New round starting...`,
                'success'
              );

              // Reset game board (keep score)
              gameStore.resetBoard();
            }
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