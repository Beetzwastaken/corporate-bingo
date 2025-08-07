// Zustand Store for Corporate Bingo
// Simple state management for bingo game functionality

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BingoStore {
  // Basic state
  currentRoom: string | null;
  playerName: string;
  
  // Stats
  gamesPlayed: number;
  wins: number;
  totalSquares: number;
  
  // Actions
  setCurrentRoom: (room: string | null) => void;
  setPlayerName: (name: string) => void;
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  incrementTotalSquares: () => void;
}

export const useBingoStore = create<BingoStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentRoom: null,
        playerName: '',
        gamesPlayed: 0,
        wins: 0,
        totalSquares: 0,

        // Actions
        setCurrentRoom: (room) => set({ currentRoom: room }),
        setPlayerName: (name) => set({ playerName: name }),
        incrementGamesPlayed: () => set((state) => ({ gamesPlayed: state.gamesPlayed + 1 })),
        incrementWins: () => set((state) => ({ wins: state.wins + 1 })),
        incrementTotalSquares: () => set((state) => ({ totalSquares: state.totalSquares + 1 }))
      }),
      {
        name: 'corporate-bingo-store',
      }
    ),
    { name: 'BingoStore' }
  )
);