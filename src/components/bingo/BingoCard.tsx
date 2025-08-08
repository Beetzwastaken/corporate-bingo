import { useCallback, useRef } from 'react';
import type { BingoSquare } from '../../types';

interface BingoCardProps {
  squares: BingoSquare[];
  onSquareClick: (squareId: string) => void;
  hasBingo: boolean;
}

export function BingoCard({ squares, onSquareClick, hasBingo }: BingoCardProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const getSquareClasses = (square: BingoSquare) => {
    let classes = 'bingo-square';
    
    if (square.isFree) {
      classes += ' free';
    } else if (square.isMarked) {
      classes += ' marked';
    }
    
    if (hasBingo && square.isMarked) {
      classes += ' winning';
    }
    
    return classes;
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent, squareId: string, index: number) => {
    const gridSize = 5;
    let newIndex = index;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(0, index - gridSize);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(squares.length - 1, index + gridSize);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (index % gridSize > 0) newIndex = index - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index % gridSize < gridSize - 1) newIndex = index + 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!squares[index].isFree) onSquareClick(squareId);
        return;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = squares.length - 1;
        break;
      default:
        return;
    }

    // Focus the new square
    const newSquareElement = document.querySelector(`button[data-square-index="${newIndex}"]`) as HTMLButtonElement;
    newSquareElement?.focus();
  }, [squares, onSquareClick]);

  // Accessibility: Get square description for screen readers
  const getAriaLabel = useCallback((square: BingoSquare, index: number) => {
    const row = Math.floor(index / 5) + 1;
    const col = (index % 5) + 1;
    const position = `Row ${row}, Column ${col}`;
    
    if (square.isFree) {
      return `Free space, ${position}, always marked`;
    }
    
    const status = square.isMarked ? 'marked' : 'unmarked';
    return `${square.text}, ${position}, ${status}`;
  }, []);

  return (
    <div className="apple-panel p-6 max-w-2xl mx-auto">
      {/* BINGO Header */}
      <div className="bingo-header">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div key={letter} className="bingo-letter">
            {letter}
          </div>
        ))}
      </div>

      {/* Perfect 5x5 Bingo Grid */}
      <div 
        className="bingo-grid"
        ref={gridRef}
        role="grid"
        aria-label="Corporate Bingo Card - 5x5 grid"
        aria-describedby="bingo-instructions"
      >
        {squares.map((square, index) => {
          const isCenter = index === 12; // Center square (position 12 in 0-indexed array)
          
          return (
            <button
              key={square.id}
              data-square-index={index}
              onClick={() => !square.isFree && onSquareClick(square.id)}
              onKeyDown={(e) => handleKeyDown(e, square.id, index)}
              disabled={square.isFree}
              className={getSquareClasses(square)}
              role="gridcell"
              aria-label={getAriaLabel(square, index)}
              aria-pressed={square.isMarked}
              tabIndex={index === 0 ? 0 : -1} // Only first square is focusable initially
            >
              {/* Checkmark overlay for marked squares */}
              {square.isMarked && !square.isFree && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Star overlay for FREE center square */}
              {square.isFree && isCenter && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Square text */}
              <span className={`relative z-0 ${square.isMarked && !square.isFree ? 'opacity-60' : ''}`}>
                {square.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hidden instructions for screen readers */}
      <div id="bingo-instructions" className="sr-only">
        Use arrow keys to navigate the bingo grid. Press Enter or Space to mark a square when you hear the phrase mentioned. The center square is always free.
      </div>

      {/* Game Progress */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-apple-secondary">
          <span aria-live="polite">
            Marked: {squares.filter(s => s.isMarked).length}/25
          </span>
          {hasBingo && (
            <span className="text-yellow-400 font-semibold animate-pulse" role="alert" aria-live="assertive">
              🎉 BINGO!
            </span>
          )}
        </div>
        <div className="text-xs text-apple-tertiary font-mono">
          Tap when you hear these
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-apple-darkest rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-apple-accent to-green-500 transition-all duration-500"
          style={{ width: `${(squares.filter(s => s.isMarked).length / 25) * 100}%` }}
        />
      </div>
    </div>
  );
}