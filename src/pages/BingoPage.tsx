import { useState, useEffect } from 'react';
import { BingoCard } from '../components/bingo/BingoCard';
import { RoomManager } from '../components/bingo/RoomManager';
import { BingoStats } from '../components/bingo/BingoStats';
import { useBingoStore } from '../utils/store';

export function BingoPage() {
  const [currentTab, setCurrentTab] = useState<'play' | 'rooms' | 'stats'>('play');
  
  const {
    currentRoom,
    gameState,
    gamesPlayed,
    wins,
    totalSquares,
    isConnected,
    connectionError,
    markSquare,
    resetGame,
    incrementGamesPlayed,
    incrementWins,
    incrementTotalSquares,
    setGameWon
  } = useBingoStore();

  // Check for bingo winning condition
  const checkBingo = (markedSquares: boolean[]): { hasBingo: boolean; pattern?: number[] } => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      const start = row * 5;
      const rowSquares = [start, start + 1, start + 2, start + 3, start + 4];
      if (rowSquares.every(i => markedSquares[i])) {
        return { hasBingo: true, pattern: rowSquares };
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      const colSquares = [col, col + 5, col + 10, col + 15, col + 20];
      if (colSquares.every(i => markedSquares[i])) {
        return { hasBingo: true, pattern: colSquares };
      }
    }
    
    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24];
    const diagonal2 = [4, 8, 12, 16, 20];
    
    if (diagonal1.every(i => markedSquares[i])) {
      return { hasBingo: true, pattern: diagonal1 };
    }
    
    if (diagonal2.every(i => markedSquares[i])) {
      return { hasBingo: true, pattern: diagonal2 };
    }
    
    return { hasBingo: false };
  };

  // Watch for bingo condition
  useEffect(() => {
    const { hasBingo, pattern } = checkBingo(gameState.markedSquares);
    if (hasBingo && !gameState.hasWon) {
      setGameWon(true, pattern);
    } else if (!hasBingo && gameState.hasWon) {
      setGameWon(false);
    }
  }, [gameState.markedSquares, gameState.hasWon, setGameWon]);

  const handleSquareClick = (squareId: string) => {
    const squareIndex = parseInt(squareId.split('-')[1]);
    markSquare(squareIndex);
    incrementTotalSquares();
  };

  const handleNewGame = () => {
    resetGame();
    incrementGamesPlayed();
  };

  const handleBingo = () => {
    incrementWins();
    
    // Show celebration
    alert('🎉 BINGO! You survived another corporate meeting!');
    handleNewGame();
  };

  // Game stats for compatibility with BingoStats component
  const gameStats = {
    gamesPlayed,
    wins,
    totalSquares,
    favoriteSquares: [] as string[]
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Tabs */}
      <div className="glass-panel border-b border-gray-600/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'play', label: 'Play Bingo', icon: '🎯' },
              { key: 'rooms', label: 'Rooms', icon: '🏢' },
              { key: 'stats', label: 'Stats', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as typeof currentTab)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  currentTab === tab.key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'play' && (
          <div className="space-y-6">
            {/* Connection Status */}
            {connectionError && (
              <div className="glass-panel rounded-lg p-4 bg-red-900/20 border border-red-500/30">
                <div className="flex items-center space-x-2">
                  <div className="text-red-400">⚠️</div>
                  <p className="text-red-300">Connection Error: {connectionError}</p>
                </div>
              </div>
            )}
            
            {/* Game Header */}
            <div className="glass-panel rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    <span className="terminal-accent">&gt;</span> Buzzword Bingo
                  </h1>
                  <p className="text-gray-400 terminal-accent">// Corporate survival game</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {currentRoom && (
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Room: {currentRoom.code}</div>
                      <div className="text-xs text-gray-400">
                        {currentRoom.players.length} players
                        {isConnected ? (
                          <span className="text-green-400 ml-2">🟢 Connected</span>
                        ) : (
                          <span className="text-red-400 ml-2">🔴 Disconnected</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleNewGame}
                    disabled={gameState.board.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    New Game
                  </button>
                  
                  {gameState.hasWon && (
                    <button
                      onClick={handleBingo}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-bold animate-pulse"
                    >
                      🎉 BINGO!
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bingo Card */}
            {gameState.board.length > 0 ? (
              <BingoCard 
                squares={gameState.board}
                onSquareClick={handleSquareClick}
                hasBingo={gameState.hasWon}
              />
            ) : (
              <div className="glass-panel rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">No Game Board</h3>
                <p className="text-gray-400 mb-6">Create or join a room to start playing multiplayer bingo!</p>
                <button
                  onClick={() => setCurrentTab('rooms')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Rooms
                </button>
              </div>
            )}

            {/* Game Instructions */}
            <div className="glass-panel rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <span className="terminal-accent">&gt;</span> How to Play Multiplayer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">🎯 Unique Boards</h4>
                  <p className="text-sm">Each player gets a different board with different buzzwords for fair competition.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">🏢 Room Mode</h4>
                  <p className="text-sm">Create or join rooms to play with colleagues during the same meeting.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">📊 Winning Patterns</h4>
                  <p className="text-sm">Win with any row, column, or diagonal. Center space (FREE SPACE) is always marked.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">⚡ Real-time Sync</h4>
                  <p className="text-sm">See other players' actions instantly and compete in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rooms' && (
          <RoomManager />
        )}

        {currentTab === 'stats' && (
          <BingoStats stats={gameStats} />
        )}
      </main>
    </div>
  );
}