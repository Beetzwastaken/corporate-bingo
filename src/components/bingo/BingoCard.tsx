import { useCallback, useRef } from 'react';
import type { BingoSquare } from '../../types';

interface BingoCardProps {
  squares: BingoSquare[];
  onSquareClick: (squareId: string) => void;
  hasBingo: boolean;
  // Duo mode props
  isDuoMode?: boolean;
  myLineIndices?: number[];
  partnerLineIndices?: number[];
  myScore?: number;
  partnerScore?: number;
}

export function BingoCard({
  squares,
  onSquareClick,
  hasBingo,
  isDuoMode = false,
  myLineIndices = [],
  partnerLineIndices = [],
  myScore = 0,
  partnerScore = 0
}: BingoCardProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const getSquareClasses = (square: BingoSquare, index: number) => {
    let classes = 'bingo-square';

    // Line highlighting for duo mode
    if (isDuoMode) {
      const isMyLine = myLineIndices.includes(index);
      const isPartnerLine = partnerLineIndices.includes(index);

      if (isMyLine && isPartnerLine) {
        // Overlap - both have this square in their line
        classes += ' ring-2 ring-purple-500 bg-purple-900/30';
      } else if (isMyLine) {
        classes += ' ring-2 ring-cyan-500 bg-cyan-900/20';
      } else if (isPartnerLine) {
        classes += ' ring-2 ring-orange-500 bg-orange-900/20';
      }
    }

    if (square.isMarked) {
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

    let lineInfo = '';
    if (isDuoMode) {
      const isMyLine = myLineIndices.includes(index);
      const isPartnerLine = partnerLineIndices.includes(index);
      if (isMyLine && isPartnerLine) {
        lineInfo = ', in both your and partner line';
      } else if (isMyLine) {
        lineInfo = ', in your line';
      } else if (isPartnerLine) {
        lineInfo = ', in partner line';
      }
    }

    const status = square.isMarked ? 'marked' : 'unmarked';
    return `${square.text}, ${position}, ${status}${lineInfo}`;
  }, [isDuoMode, myLineIndices, partnerLineIndices]);

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

      {/* Duo Mode Legend */}
      {isDuoMode && (
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-cyan-500 bg-cyan-900/40"></div>
            <span className="text-cyan-400">Your line</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-orange-500 bg-orange-900/40"></div>
            <span className="text-orange-400">Partner</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-purple-500 bg-purple-900/40"></div>
            <span className="text-purple-400">Overlap</span>
          </div>
        </div>
      )}

      {/* Perfect 5x5 Bingo Grid */}
      <div
        className="bingo-grid"
        ref={gridRef}
        role="grid"
        aria-label="Corporate Bingo Card - 5x5 grid"
        aria-describedby="bingo-instructions"
      >
        {squares.map((square, index) => {

          return (
            <button
              key={square.id}
              data-square-index={index}
              onClick={() => onSquareClick(square.id)}
              onKeyDown={(e) => handleKeyDown(e, square.id, index)}

              className={getSquareClasses(square, index)}
              role="gridcell"
              aria-label={getAriaLabel(square, index)}
              aria-pressed={square.isMarked}
              tabIndex={index === 0 ? 0 : -1}
            >
              {/* Checkmark overlay for marked squares */}
              {square.isMarked && (
                <div className="absolute top-1 right-1 z-10">
                  <div className="w-5 h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Line indicator dots for duo mode */}
              {isDuoMode && (myLineIndices.includes(index) || partnerLineIndices.includes(index)) && (
                <div className="absolute bottom-1 left-1 flex gap-0.5 z-10">
                  {myLineIndices.includes(index) && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  )}
                  {partnerLineIndices.includes(index) && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </div>
              )}

              {/* Square text - Always visible */}
              <span className="relative z-0 pointer-events-none">
                {square.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hidden instructions for screen readers */}
      <div id="bingo-instructions" className="sr-only">
        Use arrow keys to navigate the bingo grid. Press Enter or Space to mark a square when you hear the phrase mentioned. Mark squares when you hear the phrases mentioned.
      </div>

      {/* Game Progress - Different for duo mode */}
      <div className="mt-6 flex items-center justify-between">
        {isDuoMode ? (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-cyan-400">
              You: {myScore}
            </span>
            <span className="text-apple-tertiary">vs</span>
            <span className="text-orange-400">
              Partner: {partnerScore}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-sm text-apple-secondary">
            <span aria-live="polite">
              Marked: {squares.filter(s => s.isMarked).length}/25
            </span>
            {hasBingo && (
              <span className="text-yellow-400 font-semibold animate-pulse" role="alert" aria-live="assertive">
                BINGO!
              </span>
            )}
          </div>
        )}
        <div className="text-xs text-apple-tertiary font-mono">
          {isDuoMode ? 'Tap matching phrases' : 'Tap when you hear these'}
        </div>
      </div>

      {/* Progress Bar - Dual bars for duo mode */}
      {isDuoMode ? (
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyan-400 w-12">You</span>
            <div className="flex-1 bg-apple-darkest rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${(myScore / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-400 w-12">Partner</span>
            <div className="flex-1 bg-apple-darkest rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                style={{ width: `${(partnerScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-apple-darkest rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-apple-accent to-green-500 transition-all duration-500"
            style={{ width: `${(squares.filter(s => s.isMarked).length / 25) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
