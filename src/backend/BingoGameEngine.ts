// Bingo Game Engine for Multiplayer Buzzword Bingo
// Handles game logic, card generation, and win verification

import { BingoSquare, Player, BingoResult, WinRecord } from './types';
import { BuzzwordLibrary, Buzzword } from './BuzzwordLibrary';

export interface BingoCardGenerationOptions {
  cardSize?: number; // Number of squares (default: 25 for 5x5)
  theme?: 'meetings' | 'technology' | 'agile' | 'strategy' | 'mixed';
  difficulty?: 'easy' | 'normal' | 'hard'; // Affects buzzword selection
  excludeCategories?: string[];
  favorCategories?: string[];
  seed?: string; // For reproducible card generation
}

export interface WinValidationResult {
  isValid: boolean;
  pattern: 'row' | 'column' | 'diagonal' | null;
  cells: number[];
  confidence: number; // 0-100, how confident we are this is a valid win
}

export class BingoGameEngine {
  private static buzzwordLibrary = BuzzwordLibrary.getInstance();

  /**
   * Generate a shared bingo card for all players in a room
   */
  static generateSharedCard(options: BingoCardGenerationOptions = {}): BingoSquare[] {
    const {
      cardSize = 25,
      theme = 'mixed',
      difficulty = 'normal',
      excludeCategories = [],
      favorCategories = [],
      seed,
    } = options;

    // Set random seed for reproducible generation
    if (seed) {
      this.setSeed(seed);
    }

    const gridSize = Math.sqrt(cardSize);
    if (gridSize !== Math.floor(gridSize)) {
      throw new Error('Card size must be a perfect square (9, 16, 25, etc.)');
    }

    // Generate buzzwords based on options
    let selectedBuzzwords: Buzzword[];

    if (theme !== 'mixed') {
      selectedBuzzwords = this.buzzwordLibrary.createThemedCard(theme, cardSize - 1);
    } else {
      selectedBuzzwords = this.selectBuzzwordsByDifficulty(difficulty, cardSize - 1, excludeCategories, favorCategories);
    }

    // Create bingo squares
    const squares: BingoSquare[] = [];
    const centerIndex = Math.floor(cardSize / 2);

    for (let i = 0; i < cardSize; i++) {
      if (i === centerIndex) {
        // Center square is always free
        squares.push({
          id: `square-${i}`,
          text: 'FREE SPACE',
          isMarked: true,
          isFree: true,
        });
      } else {
        const buzzwordIndex = i < centerIndex ? i : i - 1;
        const buzzword = selectedBuzzwords[buzzwordIndex];
        
        squares.push({
          id: `square-${i}`,
          text: buzzword?.text || `Buzzword ${i}`,
          isMarked: false,
        });
      }
    }

    return squares;
  }

  /**
   * Generate individual player card (copy of shared card)
   */
  static generatePlayerCard(sharedCard: BingoSquare[]): BingoSquare[] {
    return sharedCard.map(square => ({
      ...square,
      isMarked: square.isFree || false, // Only free space starts marked
    }));
  }

  /**
   * Verify if a bingo claim is valid
   */
  static verifyBingo(card: BingoSquare[], pattern: 'row' | 'column' | 'diagonal', cells: number[]): boolean {
    const gridSize = Math.sqrt(card.length);
    
    // Check if all claimed cells are actually marked
    const allCellsMarked = cells.every(cellIndex => {
      const square = card[cellIndex];
      return square && square.isMarked;
    });

    if (!allCellsMarked) {
      return false;
    }

    // Verify the pattern is correct
    switch (pattern) {
      case 'row':
        return this.verifyRowPattern(cells, gridSize);
      case 'column':
        return this.verifyColumnPattern(cells, gridSize);
      case 'diagonal':
        return this.verifyDiagonalPattern(cells, gridSize);
      default:
        return false;
    }
  }

  /**
   * Check all possible bingo patterns for a card
   */
  static checkAllBingos(card: BingoSquare[]): BingoResult[] {
    const results: BingoResult[] = [];
    const gridSize = Math.sqrt(card.length);

    // Check rows
    for (let row = 0; row < gridSize; row++) {
      const rowCells = this.getRowCells(row, gridSize);
      if (rowCells.every(cellIndex => card[cellIndex]?.isMarked)) {
        results.push({
          hasWon: true,
          winningPattern: 'row',
          winningCells: rowCells,
        });
      }
    }

    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const colCells = this.getColumnCells(col, gridSize);
      if (colCells.every(cellIndex => card[cellIndex]?.isMarked)) {
        results.push({
          hasWon: true,
          winningPattern: 'column',
          winningCells: colCells,
        });
      }
    }

    // Check diagonals
    const diagonal1 = this.getDiagonal1Cells(gridSize);
    const diagonal2 = this.getDiagonal2Cells(gridSize);

    if (diagonal1.every(cellIndex => card[cellIndex]?.isMarked)) {
      results.push({
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal1,
      });
    }

    if (diagonal2.every(cellIndex => card[cellIndex]?.isMarked)) {
      results.push({
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal2,
      });
    }

    return results;
  }

  /**
   * Get the first valid bingo from a card
   */
  static getFirstBingo(card: BingoSquare[]): BingoResult {
    const results = this.checkAllBingos(card);
    return results.length > 0 ? results[0] : { hasWon: false };
  }

  /**
   * Calculate card completion percentage
   */
  static getCompletionPercentage(card: BingoSquare[]): number {
    const markedCount = card.filter(square => square.isMarked).length;
    return Math.round((markedCount / card.length) * 100);
  }

  /**
   * Get statistics about a player's card
   */
  static getCardStats(card: BingoSquare[]) {
    const marked = card.filter(s => s.isMarked && !s.isFree);
    const total = card.filter(s => !s.isFree).length;
    const free = card.filter(s => s.isFree).length;
    
    return {
      marked: marked.length,
      total,
      free,
      percentage: Math.round((marked.length / total) * 100),
      remaining: total - marked.length,
      completedRows: this.getCompletedPatterns(card, 'row'),
      completedColumns: this.getCompletedPatterns(card, 'column'),
      completedDiagonals: this.getCompletedPatterns(card, 'diagonal'),
    };
  }

  /**
   * Suggest next moves for a player
   */
  static suggestNextMoves(card: BingoSquare[], maxSuggestions: number = 3): string[] {
    const gridSize = Math.sqrt(card.length);
    const suggestions: Array<{ text: string; score: number }> = [];

    // Check each unmarked square and score it based on how close it gets to a bingo
    card.forEach((square, index) => {
      if (square.isMarked || square.isFree) return;

      let score = 0;
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      // Score based on row completion
      const rowCells = this.getRowCells(row, gridSize);
      const rowMarked = rowCells.filter(i => card[i].isMarked).length;
      score += rowMarked * 10;

      // Score based on column completion
      const colCells = this.getColumnCells(col, gridSize);
      const colMarked = colCells.filter(i => card[i].isMarked).length;
      score += colMarked * 10;

      // Score based on diagonal completion (if applicable)
      const diagonal1 = this.getDiagonal1Cells(gridSize);
      const diagonal2 = this.getDiagonal2Cells(gridSize);

      if (diagonal1.includes(index)) {
        const diag1Marked = diagonal1.filter(i => card[i].isMarked).length;
        score += diag1Marked * 15; // Diagonals are worth more
      }

      if (diagonal2.includes(index)) {
        const diag2Marked = diagonal2.filter(i => card[i].isMarked).length;
        score += diag2Marked * 15;
      }

      // Get buzzword popularity as tie-breaker
      const buzzword = this.buzzwordLibrary.searchBuzzwords(square.text)[0];
      const popularityBonus = buzzword ? buzzword.popularity / 10 : 0;
      score += popularityBonus;

      suggestions.push({ text: square.text, score });
    });

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(s => s.text);
  }

  /**
   * Generate game statistics for a room
   */
  static generateRoomStats(players: Map<string, Player>, winHistory: WinRecord[]) {
    const playerStats = Array.from(players.values()).map(player => ({
      id: player.id,
      name: player.name,
      winCount: player.winCount,
      completionPercentage: this.getCompletionPercentage(player.card),
      isActive: player.isConnected,
    }));

    const totalGames = winHistory.length;
    const winsByPattern = winHistory.reduce(
      (acc, win) => {
        acc[win.winningPattern]++;
        return acc;
      },
      { row: 0, column: 0, diagonal: 0 }
    );

    const avgVotesFor = totalGames > 0 
      ? winHistory.reduce((sum, win) => sum + win.votesFor, 0) / totalGames
      : 0;

    const mostActivePlayer = playerStats.reduce((prev, current) => 
      current.completionPercentage > prev.completionPercentage ? current : prev,
      playerStats[0] || null
    );

    return {
      totalPlayers: players.size,
      connectedPlayers: playerStats.filter(p => p.isActive).length,
      totalGames,
      winsByPattern,
      averageVotesFor: Math.round(avgVotesFor * 10) / 10,
      mostActivePlayer: mostActivePlayer?.name || 'None',
      leaderboard: playerStats
        .sort((a, b) => b.winCount - a.winCount)
        .slice(0, 5),
    };
  }

  // Private helper methods

  private static selectBuzzwordsByDifficulty(
    difficulty: 'easy' | 'normal' | 'hard',
    count: number,
    excludeCategories: string[],
    favorCategories: string[]
  ): Buzzword[] {
    const allBuzzwords = this.buzzwordLibrary.getAllBuzzwords();
    let filteredBuzzwords = allBuzzwords.filter(b => !excludeCategories.includes(b.category));

    // Apply difficulty filter
    switch (difficulty) {
      case 'easy':
        // High popularity, low pain level
        filteredBuzzwords = filteredBuzzwords.filter(b => b.popularity >= 80 && b.painLevel <= 6);
        break;
      case 'hard':
        // Lower popularity, high pain level
        filteredBuzzwords = filteredBuzzwords.filter(b => b.popularity <= 75 || b.painLevel >= 8);
        break;
      case 'normal':
      default:
        // Mixed selection
        break;
    }

    // Favor certain categories if specified
    if (favorCategories.length > 0) {
      const favoredBuzzwords = filteredBuzzwords.filter(b => favorCategories.includes(b.category));
      const otherBuzzwords = filteredBuzzwords.filter(b => !favorCategories.includes(b.category));
      
      // Use 70% favored, 30% other
      const favoredCount = Math.floor(count * 0.7);
      const otherCount = count - favoredCount;
      
      const selectedFavored = this.getRandomSelection(favoredBuzzwords, favoredCount);
      const selectedOther = this.getRandomSelection(otherBuzzwords, otherCount);
      
      return [...selectedFavored, ...selectedOther].slice(0, count);
    }

    return this.getRandomSelection(filteredBuzzwords, count);
  }

  private static getRandomSelection<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private static verifyRowPattern(cells: number[], gridSize: number): boolean {
    if (cells.length !== gridSize) return false;
    
    const row = Math.floor(cells[0] / gridSize);
    return cells.every(cellIndex => Math.floor(cellIndex / gridSize) === row);
  }

  private static verifyColumnPattern(cells: number[], gridSize: number): boolean {
    if (cells.length !== gridSize) return false;
    
    const col = cells[0] % gridSize;
    return cells.every(cellIndex => cellIndex % gridSize === col);
  }

  private static verifyDiagonalPattern(cells: number[], gridSize: number): boolean {
    if (cells.length !== gridSize) return false;
    
    const diagonal1 = this.getDiagonal1Cells(gridSize);
    const diagonal2 = this.getDiagonal2Cells(gridSize);
    
    const isDiag1 = cells.every(cell => diagonal1.includes(cell));
    const isDiag2 = cells.every(cell => diagonal2.includes(cell));
    
    return isDiag1 || isDiag2;
  }

  private static getRowCells(row: number, gridSize: number): number[] {
    const cells: number[] = [];
    for (let col = 0; col < gridSize; col++) {
      cells.push(row * gridSize + col);
    }
    return cells;
  }

  private static getColumnCells(col: number, gridSize: number): number[] {
    const cells: number[] = [];
    for (let row = 0; row < gridSize; row++) {
      cells.push(row * gridSize + col);
    }
    return cells;
  }

  private static getDiagonal1Cells(gridSize: number): number[] {
    const cells: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      cells.push(i * gridSize + i);
    }
    return cells;
  }

  private static getDiagonal2Cells(gridSize: number): number[] {
    const cells: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      cells.push(i * gridSize + (gridSize - 1 - i));
    }
    return cells;
  }

  private static getCompletedPatterns(card: BingoSquare[], patternType: 'row' | 'column' | 'diagonal'): number {
    const gridSize = Math.sqrt(card.length);
    let completed = 0;

    switch (patternType) {
      case 'row':
        for (let row = 0; row < gridSize; row++) {
          const rowCells = this.getRowCells(row, gridSize);
          if (rowCells.every(cellIndex => card[cellIndex]?.isMarked)) {
            completed++;
          }
        }
        break;
      case 'column':
        for (let col = 0; col < gridSize; col++) {
          const colCells = this.getColumnCells(col, gridSize);
          if (colCells.every(cellIndex => card[cellIndex]?.isMarked)) {
            completed++;
          }
        }
        break;
      case 'diagonal':
        const diagonal1 = this.getDiagonal1Cells(gridSize);
        const diagonal2 = this.getDiagonal2Cells(gridSize);
        
        if (diagonal1.every(cellIndex => card[cellIndex]?.isMarked)) {
          completed++;
        }
        if (diagonal2.every(cellIndex => card[cellIndex]?.isMarked)) {
          completed++;
        }
        break;
    }

    return completed;
  }

  private static setSeed(seed: string): void {
    // Simple seedable random number generator
    let seedNum = 0;
    for (let i = 0; i < seed.length; i++) {
      seedNum += seed.charCodeAt(i);
    }
    
    // Override Math.random for this operation
    const originalRandom = Math.random;
    let currentSeed = seedNum;
    
    Math.random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    // Restore original random after use
    setTimeout(() => {
      Math.random = originalRandom;
    }, 0);
  }
}