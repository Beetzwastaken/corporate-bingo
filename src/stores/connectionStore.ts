// Connection Store - Manages WebSocket and HTTP polling for Duo Mode
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BingoWebSocketClient, DUO_MESSAGE_TYPES } from '../lib/websocket';
import type { DuoWebSocketMessage } from '../lib/websocket';
import { BingoPollingClient } from '../lib/polling';
import type { DuoStateUpdate } from '../lib/polling';
import { useDuoStore } from './duoStore';
import type { BingoSquare } from '../types';

interface ConnectionStore {
  // State
  isConnected: boolean;
  connectionError: string | null;
  wsClient: BingoWebSocketClient | null;
  pollingClient: BingoPollingClient | null;
  usePolling: boolean;

  // Actions
  connect: (roomCode: string, playerId: string) => Promise<void>;
  disconnect: () => void;
  setConnectionError: (error: string | null) => void;
  switchToPolling: () => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connectionError: null,
      wsClient: null,
      pollingClient: null,
      usePolling: false,

      // Connect to duo room
      connect: async (roomCode: string, playerId: string) => {
        const state = get();

        // Disconnect existing connections
        if (state.wsClient) {
          state.wsClient.disconnect();
        }
        if (state.pollingClient) {
          state.pollingClient.stopPolling();
        }

        // Create WebSocket client
        const wsClient = new BingoWebSocketClient({
          roomCode,
          playerId,
          onMessage: handleWebSocketMessage,
          onConnect: () => {
            set({ isConnected: true, connectionError: null });
          },
          onDisconnect: () => {
            set({ isConnected: false });

            // Switch to polling as fallback
            const currentState = get();
            if (!currentState.usePolling) {
              currentState.switchToPolling();
            }
          },
          onError: (error) => {
            set({ connectionError: error.message });

            // Switch to polling on error
            const currentState = get();
            if (!currentState.usePolling) {
              currentState.switchToPolling();
            }
          }
        });

        set({ wsClient });

        try {
          await wsClient.connect();
        } catch {
          get().switchToPolling();
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
          connectionError: null,
          usePolling: false
        });
      },

      // Set connection error
      setConnectionError: (error: string | null) => {
        set({ connectionError: error });
      },

      // Switch to HTTP polling
      switchToPolling: () => {
        const duoState = useDuoStore.getState();

        if (!duoState.pairCode || !duoState.odId) {
          return;
        }

        const pollingClient = new BingoPollingClient({
          roomCode: duoState.pairCode,
          playerId: duoState.odId,
          onUpdate: handlePollingUpdate,
          onError: (error) => {
            set({ connectionError: error.message });
          },
          pollInterval: 2000
        });

        pollingClient.startPolling();

        set({
          pollingClient,
          usePolling: true,
          isConnected: true // Polling counts as "connected"
        });
      }
    })
  )
);

// Handle WebSocket messages from server
function handleWebSocketMessage(message: DuoWebSocketMessage): void {
  const duoStore = useDuoStore.getState();

  switch (message.type) {
    case DUO_MESSAGE_TYPES.CONNECTED:
      break;

    case DUO_MESSAGE_TYPES.PARTNER_JOINED:
      if (message.partnerId && message.partnerName) {
        duoStore.handlePartnerJoined({
          id: message.partnerId,
          name: message.partnerName
        });
      }
      break;

    case DUO_MESSAGE_TYPES.PARTNER_LEFT:
      // Reset to waiting state
      useDuoStore.setState({
        partnerId: null,
        partnerName: null,
        isPaired: false,
        phase: 'waiting',
        partnerLine: null,
        partnerHasSelected: false,
        myLine: null,
        markedSquares: Array(25).fill(false),
        myScore: 0,
        partnerScore: 0,
        myBingo: false,
        partnerBingo: false
      });
      break;

    case DUO_MESSAGE_TYPES.PARTNER_SELECTED:
      duoStore.handlePartnerSelected();
      break;

    case DUO_MESSAGE_TYPES.LINE_CONFLICT:
      if (message.takenLine) {
        // Reset own selection and show taken line
        useDuoStore.setState({
          myLine: null,
          partnerLine: message.takenLine,
          partnerHasSelected: true
        });
      }
      break;

    case DUO_MESSAGE_TYPES.CARD_REVEALED:
      if (message.hostLine && message.partnerLine && message.card) {
        const duoState = useDuoStore.getState();
        const isHost = duoState.isHost;

        // Map host/partner lines to my/partner
        const myLine = isHost ? message.hostLine : message.partnerLine;
        const theirLine = isHost ? message.partnerLine : message.hostLine;

        // Generate card from phrases
        const card: BingoSquare[] = message.card.map((text, index) => ({
          id: `square-${index}`,
          text,
          isMarked: false
        }));

        useDuoStore.setState({
          myLine,
          partnerLine: theirLine,
          dailyCard: card,
          phase: 'playing',
          myScore: 0,
          partnerScore: 0
        });
      }
      break;

    case DUO_MESSAGE_TYPES.SQUARE_MARKED:
      if (typeof message.index === 'number') {
        const duoState = useDuoStore.getState();
        const isHost = duoState.isHost;

        // Update marked squares
        const newMarked = [...duoState.markedSquares];
        newMarked[message.index] = true;

        // Map scores based on host/partner role
        const myScore = isHost ? (message.hostScore ?? duoState.myScore) : (message.partnerScore ?? duoState.myScore);
        const partnerScore = isHost ? (message.partnerScore ?? duoState.partnerScore) : (message.hostScore ?? duoState.partnerScore);
        const myBingo = isHost ? (message.hostBingo ?? duoState.myBingo) : (message.partnerBingo ?? duoState.myBingo);
        const partnerBingo = isHost ? (message.partnerBingo ?? duoState.partnerBingo) : (message.hostBingo ?? duoState.partnerBingo);

        useDuoStore.setState({
          markedSquares: newMarked,
          myScore,
          partnerScore,
          myBingo,
          partnerBingo
        });
      }
      break;

    case DUO_MESSAGE_TYPES.BINGO:
      if (message.player && message.playerName) {
        const duoState = useDuoStore.getState();
        const isHost = duoState.isHost;
        const isMine = (message.player === 'host' && isHost) || (message.player === 'partner' && !isHost);

        if (isMine) {
          useDuoStore.setState({ myBingo: true });
        } else {
          useDuoStore.setState({ partnerBingo: true });
        }

      }
      break;

    case DUO_MESSAGE_TYPES.DAILY_RESET:
      if (message.dailySeed) {
        duoStore.handleDailyReset();
      }
      break;

    default:
  }
}

// Handle polling state updates
function handlePollingUpdate(state: DuoStateUpdate): void {
  const duoState = useDuoStore.getState();

  // Update pairing state
  if (state.isPaired && !duoState.isPaired && state.partnerName) {
    useDuoStore.setState({
      partnerName: state.partnerName,
      isPaired: true
    });
  }

  // Update phase
  if (state.phase !== duoState.phase) {
    useDuoStore.setState({ phase: state.phase as 'unpaired' | 'waiting' | 'selecting' | 'playing' });
  }

  // Update selection state
  if (state.phase === 'selecting') {
    const partnerHasSelected = state.isHost
      ? state.partnerHasSelected
      : state.myHasSelected; // Flip perspective

    useDuoStore.setState({
      partnerHasSelected: partnerHasSelected ?? false
    });
  }

  // Update playing state
  if (state.phase === 'playing') {
    const isHost = state.isHost;

    // Map lines
    const myLine = isHost ? state.hostLine : state.partnerLine;
    const theirLine = isHost ? state.partnerLine : state.hostLine;

    // Map scores
    const myScore = isHost ? (state.hostScore ?? 0) : (state.partnerScore ?? 0);
    const partnerScore = isHost ? (state.partnerScore ?? 0) : (state.hostScore ?? 0);
    const myBingo = isHost ? (state.hostBingo ?? false) : (state.partnerBingo ?? false);
    const partnerBingo = isHost ? (state.partnerBingo ?? false) : (state.hostBingo ?? false);

    // Generate card if we have it
    let dailyCard = duoState.dailyCard;
    if (state.card && dailyCard.length === 0) {
      dailyCard = state.card.map((text, index) => ({
        id: `square-${index}`,
        text,
        isMarked: false
      }));
    }

    useDuoStore.setState({
      myLine: myLine ?? null,
      partnerLine: theirLine ?? null,
      markedSquares: state.markedSquares ?? Array(25).fill(false),
      myScore,
      partnerScore,
      myBingo,
      partnerBingo,
      dailyCard
    });
  }

  // Check for daily reset
  if (state.dailySeed !== duoState.dailySeed) {
    useDuoStore.setState({ dailySeed: state.dailySeed });
    if (duoState.dailySeed && state.dailySeed !== duoState.dailySeed) {
      useDuoStore.getState().handleDailyReset();
    }
  }
}
