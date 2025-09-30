import { describe, it, expect } from 'vitest';
import { BingoEngine } from './bingoEngine';

describe('BingoEngine', () => {
  describe('generateCard', () => {
    it('should generate a card with 25 squares', () => {
      const card = BingoEngine.generateCard();
      expect(card).toHaveLength(25);
    });

    it('should have 25 unique buzzwords', () => {
      const card = BingoEngine.generateCard();
      const buzzwords = card.map(square => square.text);

      const uniqueBuzzwords = new Set(buzzwords);
      expect(uniqueBuzzwords.size).toBe(25);
    });

    it('should load buzzwords from JSON file', () => {
      const card = BingoEngine.generateCard();

      // Verify all squares have valid text
      card.forEach(square => {
        expect(square.text).toBeDefined();
        expect(square.text.length).toBeGreaterThan(0);
      });
    });

    it('should have all squares initially unmarked', () => {
      const card = BingoEngine.generateCard();
      card.forEach(square => {
        expect(square.isMarked).toBe(false);
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
      // Mark main diagonal (all 5 squares)
      [0, 6, 12, 18, 24].forEach(i => {
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

      // Initially no squares are marked
      let percentage = BingoEngine.getCompletionPercentage(card);
      expect(percentage).toBe(0); // 0/25 = 0%

      // Mark 5 squares
      for (let i = 0; i < 5; i++) {
        card[i].isMarked = true;
      }

      percentage = BingoEngine.getCompletionPercentage(card);
      expect(percentage).toBe(20); // 5/25 = 20%
    });
  });
});
