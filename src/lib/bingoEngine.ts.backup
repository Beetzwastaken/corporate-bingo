// Bingo game engine for corporate buzzword bingo
import { CORPORATE_BINGO } from '../data/buzzwords';

export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface BingoResult {
  hasWon: boolean;
  winningPattern?: 'row' | 'column' | 'diagonal';
  winningCells?: number[];
}

export interface LineBonus {
  type: '3-in-row' | '4-in-row' | 'bingo';
  points: number;
  pattern: 'row' | 'column' | 'diagonal';
  lineIndex: number;
  cells: number[];
}

export interface BingoAnalysis {
  bingoResult: BingoResult;
  lineBonuses: LineBonus[];
  totalBonusPoints: number;
}

export class BingoEngine {
  /**
   * Generate a new bingo card with random buzzwords
   */
  static generateCard(): BingoSquare[] {
    const shuffled = [...CORPORATE_BINGO].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 24); // 24 + 1 free space = 25
    
    const card: BingoSquare[] = [];
    
    for (let i = 0; i < 25; i++) {
      if (i === 12) { // Center square (free space)
        card.push({
          id: `square-${i}`,
          text: 'FREE SPACE',
          isMarked: true,
          isFree: true
        });
      } else {
        const textIndex = i < 12 ? i : i - 1;
        card.push({
          id: `square-${i}`,
          text: selected[textIndex],
          isMarked: false
        });
      }
    }
    
    return card;
  }

  /**
   * Check if the current card has a bingo
   */
  static checkBingo(squares: BingoSquare[]): BingoResult {
    // Check rows
    for (let row = 0; row < 5; row++) {
      const rowStart = row * 5;
      const rowSquares = squares.slice(rowStart, rowStart + 5);
      if (rowSquares.every(square => square.isMarked)) {
        return {
          hasWon: true,
          winningPattern: 'row',
          winningCells: Array.from({ length: 5 }, (_, i) => rowStart + i)
        };
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      const colSquares = squares.filter((_, index) => index % 5 === col);
      if (colSquares.every(square => square.isMarked)) {
        return {
          hasWon: true,
          winningPattern: 'column',
          winningCells: Array.from({ length: 5 }, (_, i) => i * 5 + col)
        };
      }
    }
    
    // Check diagonals
    const diagonal1Indices = [0, 6, 12, 18, 24];
    const diagonal2Indices = [4, 8, 12, 16, 20];
    
    const diagonal1 = diagonal1Indices.map(i => squares[i]);
    const diagonal2 = diagonal2Indices.map(i => squares[i]);
    
    if (diagonal1.every(square => square.isMarked)) {
      return {
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal1Indices
      };
    }
    
    if (diagonal2.every(square => square.isMarked)) {
      return {
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal2Indices
      };
    }
    
    return { hasWon: false };
  }

  /**
   * Analyze board for line bonuses (3-in-row, 4-in-row, BINGO)
   */
  static analyzeBoardForBonuses(squares: BingoSquare[]): BingoAnalysis {
    const lineBonuses: LineBonus[] = [];
    
    // Check rows for bonuses
    for (let row = 0; row < 5; row++) {
      const rowStart = row * 5;
      const rowSquares = squares.slice(rowStart, rowStart + 5);
      const markedCount = rowSquares.filter(s => s.isMarked).length;
      const cells = Array.from({ length: 5 }, (_, i) => rowStart + i);
      
      if (markedCount === 5) {
        lineBonuses.push({
          type: 'bingo',
          points: 5,
          pattern: 'row',
          lineIndex: row,
          cells
        });
      } else if (markedCount === 4) {
        lineBonuses.push({
          type: '4-in-row',
          points: 3,
          pattern: 'row',
          lineIndex: row,
          cells: cells.filter(i => squares[i].isMarked)
        });
      } else if (markedCount === 3) {
        lineBonuses.push({
          type: '3-in-row',
          points: 1,
          pattern: 'row',
          lineIndex: row,
          cells: cells.filter(i => squares[i].isMarked)
        });
      }
    }
    
    // Check columns for bonuses
    for (let col = 0; col < 5; col++) {
      const colSquares = squares.filter((_, index) => index % 5 === col);
      const markedCount = colSquares.filter(s => s.isMarked).length;
      const cells = Array.from({ length: 5 }, (_, i) => i * 5 + col);
      
      if (markedCount === 5) {
        lineBonuses.push({
          type: 'bingo',
          points: 5,
          pattern: 'column',
          lineIndex: col,
          cells
        });
      } else if (markedCount === 4) {
        lineBonuses.push({
          type: '4-in-row',
          points: 3,
          pattern: 'column',
          lineIndex: col,
          cells: cells.filter(i => squares[i].isMarked)
        });
      } else if (markedCount === 3) {
        lineBonuses.push({
          type: '3-in-row',
          points: 1,
          pattern: 'column',
          lineIndex: col,
          cells: cells.filter(i => squares[i].isMarked)
        });
      }
    }
    
    // Check diagonals for bonuses
    const diagonal1Indices = [0, 6, 12, 18, 24];
    const diagonal2Indices = [4, 8, 12, 16, 20];
    
    // Diagonal 1 (top-left to bottom-right)
    const diagonal1Squares = diagonal1Indices.map(i => squares[i]);
    const diagonal1MarkedCount = diagonal1Squares.filter(s => s.isMarked).length;
    
    if (diagonal1MarkedCount === 5) {
      lineBonuses.push({
        type: 'bingo',
        points: 5,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1Indices
      });
    } else if (diagonal1MarkedCount === 4) {
      lineBonuses.push({
        type: '4-in-row',
        points: 3,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1Indices.filter(i => squares[i].isMarked)
      });
    } else if (diagonal1MarkedCount === 3) {
      lineBonuses.push({
        type: '3-in-row',
        points: 1,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1Indices.filter(i => squares[i].isMarked)
      });
    }
    
    // Diagonal 2 (top-right to bottom-left)
    const diagonal2Squares = diagonal2Indices.map(i => squares[i]);
    const diagonal2MarkedCount = diagonal2Squares.filter(s => s.isMarked).length;
    
    if (diagonal2MarkedCount === 5) {
      lineBonuses.push({
        type: 'bingo',
        points: 5,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2Indices
      });
    } else if (diagonal2MarkedCount === 4) {
      lineBonuses.push({
        type: '4-in-row',
        points: 3,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2Indices.filter(i => squares[i].isMarked)
      });
    } else if (diagonal2MarkedCount === 3) {
      lineBonuses.push({
        type: '3-in-row',
        points: 1,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2Indices.filter(i => squares[i].isMarked)
      });
    }
    
    // Calculate total bonus points
    const totalBonusPoints = lineBonuses.reduce((sum, bonus) => sum + bonus.points, 0);
    
    // Get standard BINGO result
    const bingoResult = this.checkBingo(squares);
    
    return {
      bingoResult,
      lineBonuses,
      totalBonusPoints
    };
  }

  /**
   * Calculate completion percentage of the card
   */
  static getCompletionPercentage(squares: BingoSquare[]): number {
    const markedCount = squares.filter(square => square.isMarked).length;
    return (markedCount / squares.length) * 100;
  }

  /**
   * Get statistics about marked squares
   */
  static getSquareStats(squares: BingoSquare[]) {
    const marked = squares.filter(s => s.isMarked && !s.isFree);
    const total = squares.filter(s => !s.isFree).length;
    
    return {
      marked: marked.length,
      total,
      percentage: (marked.length / total) * 100,
      remaining: total - marked.length
    };
  }

  /**
   * Suggest squares that are commonly marked together
   */
  static getSuggestedSquares(squares: BingoSquare[]): string[] {
    const markedTexts = squares
      .filter(s => s.isMarked && !s.isFree)
      .map(s => s.text);
    
    // Common combinations in corporate meetings
    const combinations = [
      ['Synergy', 'Paradigm Shift', 'Game Changer'],
      ['Deep Dive', 'Circle Back', 'Touch Base'],
      ['AI/ML Integration', 'Digital Transformation', 'Cloud Migration'],
      ['Agile Transformation', 'Sprint Planning', 'Stand-up'],
      ['Low-hanging Fruit', 'Move the Needle', 'Think Outside the Box']
    ];
    
    const suggestions: string[] = [];
    
    for (const combo of combinations) {
      const markedInCombo = combo.filter(term => markedTexts.includes(term));
      if (markedInCombo.length > 0) {
        const unmarked = combo.filter(term => 
          !markedTexts.includes(term) && 
          squares.some(s => s.text === term && !s.isMarked)
        );
        suggestions.push(...unmarked);
      }
    }
    
    return [...new Set(suggestions)].slice(0, 3); // Return unique suggestions
  }
}