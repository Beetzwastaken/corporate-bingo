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
  appliedBonuses: string[]; // Track applied bonuses to prevent duplicates
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
          appliedBonuses: []
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
              appliedBonuses: [] // Reset bonus tracking for new game
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
          const newAppliedBonuses = [...state.gameState.appliedBonuses];

          // Apply new bonuses that haven't been applied yet
          // IMPORTANT: Only apply the HIGHEST tier bonus per line (bingo > 4-in-row > 3-in-row)
          const newBonuses: LineBonus[] = [];

          // Group bonuses by line (pattern + lineIndex)
          const bonusByLine = new Map<string, LineBonus>();
          for (const bonus of analysis.lineBonuses) {
            const lineKey = `${bonus.pattern}|${bonus.lineIndex}`;
            const existing = bonusByLine.get(lineKey);

            // Keep only the highest tier bonus for each line
            if (!existing || bonus.points > existing.points) {
              bonusByLine.set(lineKey, bonus);
            }
          }

          // Apply bonuses from the highest tier only
          for (const bonus of bonusByLine.values()) {
            const bonusId = `${bonus.pattern}|${bonus.lineIndex}|${bonus.type}`;
            if (!newAppliedBonuses.includes(bonusId)) {
              bonusPoints += bonus.points;
              newAppliedBonuses.push(bonusId);
              newBonuses.push(bonus);
            }
          }
          
          // Remove bonuses for lines that no longer qualify (when unmarking)
          if (wasMarked && !newMarkedSquares[index]) {
            // When unmarking, need to check what bonuses should be removed
            const filteredBonuses: string[] = [];
            for (const bonusId of newAppliedBonuses) {
              const parts = bonusId.split('|');
              if (parts.length < 3) continue;
              const bonusType = parts.slice(2).join('|'); // Handle types with dashes like '3-in-row'

              // Check if this bonus still applies
              const stillQualifies = analysis.lineBonuses.some(bonus =>
                `${bonus.pattern}|${bonus.lineIndex}|${bonus.type}` === bonusId
              );

              if (stillQualifies) {
                filteredBonuses.push(bonusId);
              } else {
                // Remove bonus points when line no longer qualifies
                const points = bonusType === '3-in-row' ? 1 : bonusType === '4-in-row' ? 3 : bonusType === 'bingo' ? 5 : 0;
                bonusPoints -= points;
              }
            }
            newAppliedBonuses.splice(0, newAppliedBonuses.length, ...filteredBonuses);
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