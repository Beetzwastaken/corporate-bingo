// Game Store - Manages game state, board, and win conditions
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BingoEngine } from '../lib/bingoEngine';

export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface GameState {
  board: BingoSquare[];
  markedSquares: boolean[];
  hasWon: boolean;
  winningPattern?: number[];
}

interface GameStore {
  // State
  gameState: GameState;
  gamesPlayed: number;
  wins: number;
  totalSquares: number;
  
  // Actions
  initializeGame: () => void;
  markSquare: (index: number) => void;
  resetGame: () => void;
  setGameWon: (won: boolean, pattern?: number[]) => void;
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  incrementTotalSquares: () => void;
  clearStats: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        gameState: {
          board: [],
          markedSquares: Array(25).fill(false),
          hasWon: false,
          winningPattern: undefined
        },
        gamesPlayed: 0,
        wins: 0,
        totalSquares: 0,
        
        // Initialize a new game
        initializeGame: () => {
          const newBoard = BingoEngine.generateCard();
          const markedSquares = Array(25).fill(false);
          markedSquares[12] = true; // Free space
          
          set({
            gameState: {
              board: newBoard,
              markedSquares,
              hasWon: false,
              winningPattern: undefined
            }
          });
        },
        
        // Mark a square
        markSquare: (index: number) => {
          const state = get();
          const newMarkedSquares = [...state.gameState.markedSquares];
          newMarkedSquares[index] = !newMarkedSquares[index];
          
          set({
            gameState: {
              ...state.gameState,
              markedSquares: newMarkedSquares
            }
          });
        },
        
        // Reset the game
        resetGame: () => {
          get().initializeGame();
        },
        
        // Set game won status
        setGameWon: (won: boolean, pattern?: number[]) => {
          const state = get();
          set({
            gameState: {
              ...state.gameState,
              hasWon: won,
              winningPattern: pattern
            }
          });
        },
        
        // Statistics actions
        incrementGamesPlayed: () => set(state => ({ gamesPlayed: state.gamesPlayed + 1 })),
        incrementWins: () => set(state => ({ wins: state.wins + 1 })),
        incrementTotalSquares: () => set(state => ({ totalSquares: state.totalSquares + 1 })),
        
        // Clear all statistics
        clearStats: () => {
          set({
            gamesPlayed: 0,
            wins: 0,
            totalSquares: 0
          });
        }
      }),
      {
        name: 'bingo-game-storage',
        partialize: (state) => ({
          gamesPlayed: state.gamesPlayed,
          wins: state.wins,
          totalSquares: state.totalSquares
        })
      }
    )
  )
);