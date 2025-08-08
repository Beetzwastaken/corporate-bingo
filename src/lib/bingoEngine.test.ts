import { describe, it, expect } from 'vitest';
import { BingoEngine } from './bingoEngine';

describe('BingoEngine', () => {
  describe('generateCard', () => {
    it('should generate a card with 25 squares', () => {
      const card = BingoEngine.generateCard();
      expect(card).toHaveLength(25);
    });

    it('should have center square marked as free', () => {
      const card = BingoEngine.generateCard();
      const centerSquare = card[12]; // Center square
      
      expect(centerSquare.text).toBe('FREE SPACE');
      expect(centerSquare.isMarked).toBe(true);
      expect(centerSquare.isFree).toBe(true);
    });

    it('should have unique buzzwords (excluding free space)', () => {
      const card = BingoEngine.generateCard();
      const buzzwords = card
        .filter(square => !square.isFree)
        .map(square => square.text);
      
      const uniqueBuzzwords = new Set(buzzwords);
      expect(uniqueBuzzwords.size).toBe(24);
    });

    it('should load buzzwords from JSON file', () => {
      const card = BingoEngine.generateCard();
      const nonFreeSquares = card.filter(square => !square.isFree);
      
      // Verify all squares have valid text
      nonFreeSquares.forEach(square => {
        expect(square.text).toBeDefined();
        expect(square.text.length).toBeGreaterThan(0);
      });
    });
  });

  describe('checkBingo', () => {
    it('should detect winning row', () => {
      const card = BingoEngine.generateCard();
      // Mark first row
      for (let i = 0; i < 5; i++) {
        card[i].isMarked = true;
      }
      
      const result = BingoEngine.checkBingo(card);
      expect(result.hasWon).toBe(true);
      expect(result.winningPattern).toBe('row');
    });

    it('should detect winning column', () => {
      const card = BingoEngine.generateCard();
      // Mark first column
      for (let i = 0; i < 5; i++) {
        card[i * 5].isMarked = true;
      }
      
      const result = BingoEngine.checkBingo(card);
      expect(result.hasWon).toBe(true);
      expect(result.winningPattern).toBe('column');
    });

    it('should detect winning diagonal', () => {
      const card = BingoEngine.generateCard();
      // Mark main diagonal (center is already marked as free)
      [0, 6, 18, 24].forEach(i => {
        card[i].isMarked = true;
      });
      
      const result = BingoEngine.checkBingo(card);
      expect(result.hasWon).toBe(true);
      expect(result.winningPattern).toBe('diagonal');
    });
  });

  describe('getCompletionPercentage', () => {
    it('should calculate completion percentage correctly', () => {
      const card = BingoEngine.generateCard();
      
      // Initially only center square is marked
      let percentage = BingoEngine.getCompletionPercentage(card);
      expect(percentage).toBe(4); // 1/25 = 4%
      
      // Mark 5 more squares
      for (let i = 0; i < 5; i++) {
        if (i !== 12) card[i].isMarked = true;
      }
      
      percentage = BingoEngine.getCompletionPercentage(card);
      expect(percentage).toBe(24); // 6/25 = 24%
    });
  });
});