import type { BingoSquare } from '../../types';

interface BingoCardProps {
  squares: BingoSquare[];
  onSquareClick: (squareId: string) => void;
  hasBingo: boolean;
}

export function BingoCard({ squares, onSquareClick, hasBingo }: BingoCardProps) {
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
      <div className="bingo-grid">
        {squares.map((square, index) => {
          const isCenter = index === 12; // Center square (position 12 in 0-indexed array)
          
          return (
            <button
              key={square.id}
              onClick={() => !square.isFree && onSquareClick(square.id)}
              disabled={square.isFree}
              className={getSquareClasses(square)}
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

      {/* Game Progress */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-apple-secondary">
          <span>
            Marked: {squares.filter(s => s.isMarked).length}/25
          </span>
          {hasBingo && (
            <span className="text-yellow-400 font-semibold animate-pulse">
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