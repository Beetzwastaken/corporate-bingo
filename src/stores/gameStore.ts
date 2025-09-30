// Game Store - Manages game state, board, and win conditions
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { BingoEngine, type LineBonus } from '../lib/bingoEngine';

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
  appliedBonuses: Map<string, { type: string; points: number }>; // Track bonuses by line (pattern|lineIndex)
}

interface GameStore {
  // State
  gameState: GameState;
  gamesPlayed: number;
  wins: number;
  totalSquares: number;
  currentScore: number;
  recentBonuses: LineBonus[];
  
  // Actions
  initializeGame: () => void;
  markSquare: (index: number) => void;
  resetGame: () => void;
  resetBoard: () => void; // Phase 4: Reset board but keep score
  resetScore: () => void;
  setGameWon: (won: boolean, pattern?: number[]) => void;
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  incrementTotalSquares: () => void;
  clearStats: () => void;
  clearRecentBonuses: () => void;
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
          winningPattern: undefined,
          appliedBonuses: new Map()
        },
        gamesPlayed: 0,
        wins: 0,
        totalSquares: 0,
        currentScore: 0,
        recentBonuses: [],
        
        // Initialize a new game (preserve currentScore)
        initializeGame: () => {
          const newBoard = BingoEngine.generateCard();
          const markedSquares = Array(25).fill(false);
          markedSquares[12] = true; // Free space
          
          // Ensure board squares have correct isMarked properties
          const boardWithMarkedState = newBoard.map((square, index) => ({
            ...square,
            isMarked: markedSquares[index] || false
          }));
          
          set({
            gameState: {
              board: boardWithMarkedState,
              markedSquares,
              hasWon: false,
              winningPattern: undefined,
              appliedBonuses: new Map() // Reset bonus tracking for new game
            }
            // Note: currentScore is preserved through BINGOs
          });
        },
        
        // Mark a square
        markSquare: (index: number) => {
          const state = get();
          const newMarkedSquares = [...state.gameState.markedSquares];
          const wasMarked = newMarkedSquares[index];
          newMarkedSquares[index] = !newMarkedSquares[index];
          
          // Also update the board's isMarked properties to keep both sources in sync
          const newBoard = state.gameState.board.map((square, i) => ({
            ...square,
            isMarked: newMarkedSquares[i] || false
          }));
          
          // Base score: +1 for marking, -1 for unmarking (but don't go below 0)
          let newScore = state.currentScore;
          if (!wasMarked && newMarkedSquares[index]) {
            // Marking a square
            newScore += 1;
          } else if (wasMarked && !newMarkedSquares[index]) {
            // Unmarking a square
            newScore = Math.max(0, newScore - 1);
          }
          
          // Check for bonus points
          const analysis = BingoEngine.analyzeBoardForBonuses(newBoard);
          let bonusPoints = 0;
          const newAppliedBonuses = new Map(state.gameState.appliedBonuses);
          const newBonuses: LineBonus[] = [];

          // Group bonuses by line (pattern + lineIndex) and keep only the highest tier
          const bonusByLine = new Map<string, LineBonus>();
          for (const bonus of analysis.lineBonuses) {
            const lineKey = `${bonus.pattern}|${bonus.lineIndex}`;
            const existing = bonusByLine.get(lineKey);

            // Keep only the highest tier bonus for each line
            if (!existing || bonus.points > existing.points) {
              bonusByLine.set(lineKey, bonus);
            }
          }

          // Process each line: compare current bonus with previously applied bonus
          for (const [lineKey, currentBonus] of bonusByLine.entries()) {
            const previousBonus = newAppliedBonuses.get(lineKey);

            if (!previousBonus) {
              // New bonus line - add full points
              bonusPoints += currentBonus.points;
              newAppliedBonuses.set(lineKey, { type: currentBonus.type, points: currentBonus.points });
              newBonuses.push(currentBonus);
            } else if (currentBonus.type !== previousBonus.type) {
              // Upgraded bonus (e.g., 3-in-row → 4-in-row) - add only the difference
              const pointDifference = currentBonus.points - previousBonus.points;
              bonusPoints += pointDifference;
              newAppliedBonuses.set(lineKey, { type: currentBonus.type, points: currentBonus.points });
              newBonuses.push(currentBonus);
            }
            // If same bonus type, do nothing (already counted)
          }

          // Remove bonuses for lines that no longer qualify (when unmarking)
          for (const [lineKey, previousBonus] of newAppliedBonuses.entries()) {
            if (!bonusByLine.has(lineKey)) {
              // Line no longer qualifies - subtract the points
              bonusPoints -= previousBonus.points;
              newAppliedBonuses.delete(lineKey);
            }
          }

          // Apply bonus points to score
          newScore = Math.max(0, newScore + bonusPoints);
          
          set({
            gameState: {
              ...state.gameState,
              board: newBoard,
              markedSquares: newMarkedSquares,
              appliedBonuses: newAppliedBonuses
            },
            currentScore: newScore,
            recentBonuses: newBonuses
          });
        },
        
        // Reset the game
        resetGame: () => {
          get().initializeGame();
        },

        // Phase 4: Reset board but keep score (for multiplayer room resets)
        resetBoard: () => {
          get().initializeGame();
          // currentScore is automatically preserved (not reset by initializeGame)
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
        },
        
        // Reset current score (separate from game reset)
        resetScore: () => {
          set({ currentScore: 0 });
        },
        
        // Clear recent bonuses (for animation tracking)
        clearRecentBonuses: () => {
          set({ recentBonuses: [] });
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