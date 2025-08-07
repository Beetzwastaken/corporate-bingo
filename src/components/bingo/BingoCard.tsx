import type { BingoSquare } from '../../types';

interface BingoCardProps {
  squares: BingoSquare[];
  onSquareClick: (squareId: string) => void;
  hasBingo: boolean;
}

export function BingoCard({ squares, onSquareClick, hasBingo }: BingoCardProps) {
  return (
    <div className="glass-panel rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          <span className="terminal-accent">&gt;</span> Your Bingo Card
        </h2>
        {hasBingo && (
          <div className="text-yellow-400 font-bold animate-pulse">
            🎉 BINGO! 🎉
          </div>
        )}
      </div>

      {/* BINGO Header */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div key={letter} className="text-center py-3 bg-blue-600/30 border border-blue-500/50 rounded-lg">
            <span className="text-xl font-bold text-blue-300 terminal-accent">{letter}</span>
          </div>
        ))}
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-5 gap-2">
        {squares.map((square) => (
          <button
            key={square.id}
            onClick={() => !square.isFree && onSquareClick(square.id)}
            disabled={square.isFree}
            className={`
              aspect-square p-2 rounded-lg text-xs font-medium transition-all duration-200 border-2
              ${square.isMarked 
                ? square.isFree 
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300' 
                  : 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                : 'bg-gray-700/30 border-gray-600/50 text-gray-300 hover:bg-gray-600/30 hover:border-gray-500/50'
              }
              ${!square.isFree && 'cursor-pointer hover:scale-105'}
              ${square.isFree && 'cursor-not-allowed'}
            `}
          >
            <div className="flex items-center justify-center h-full text-center">
              {square.isMarked && !square.isFree && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
              )}
              {square.isFree && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">★</span>
                  </div>
                </div>
              )}
              <span className={`${square.isMarked && !square.isFree ? 'opacity-50' : ''} leading-tight`}>
                {square.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Game Stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
        <div>
          <span className="terminal-accent">
            Marked: {squares.filter(s => s.isMarked).length}/25
          </span>
        </div>
        <div>
          <span className="terminal-accent">
            // Click squares as buzzwords are mentioned
          </span>
        </div>
      </div>
    </div>
  );
}