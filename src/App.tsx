// Corporate Bingo - Single-page Apple Dark Mode Experience  
// Version: 2.0.0 - Complete Apple Dark Mode redesign with single-page functionality

import { useState, useEffect } from 'react';
import { BingoCard } from './components/bingo/BingoCard';
import { RoomManager } from './components/bingo/RoomManager';
import { BingoStats } from './components/bingo/BingoStats';
import { useBingoStore } from './utils/store';
import { APP_VERSION } from './utils/version';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'rooms' | 'stats' | null>(null);
  
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
    setGameWon,
    emergencyReset
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
    alert('🎉 BINGO!');
    handleNewGame();
  };

  const gameStats = {
    gamesPlayed,
    wins,
    totalSquares,
    favoriteSquares: [] as string[]
  };

  const togglePanel = (panel: 'rooms' | 'stats') => {
    if (activePanel === panel) {
      setActivePanel(null);
      setSidebarOpen(false);
    } else {
      setActivePanel(panel);
      setSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-system">
      {/* Apple-style Header */}
      <header className="bg-apple-dark border-b border-apple-border sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-apple-accent flex items-center justify-center">
                <span className="text-white text-sm font-semibold">B</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-apple-text">Corporate Bingo</h1>
              </div>
            </div>

            {/* Center Status */}
            <div className="hidden md:flex items-center space-x-6">
              {currentRoom && (
                <div className="flex items-center space-x-4 text-sm text-apple-secondary">
                  <div>
                    <span className="font-medium">{currentRoom.code}</span>
                    <span className="mx-2">•</span>
                    <span>{currentRoom.players.length} players</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>{isConnected ? 'Connected' : 'Offline'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => togglePanel('rooms')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activePanel === 'rooms' 
                    ? 'bg-apple-accent text-white' 
                    : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
                }`}
              >
                Rooms
              </button>
              
              <button
                onClick={() => togglePanel('stats')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activePanel === 'stats' 
                    ? 'bg-apple-accent text-white' 
                    : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
                }`}
              >
                Stats
              </button>

              {gameState.board.length > 0 && (
                <button
                  onClick={handleNewGame}
                  className="px-4 py-1.5 text-sm bg-apple-accent hover:bg-apple-accent-hover text-white rounded-md transition-colors font-medium"
                >
                  New Game
                </button>
              )}

              {gameState.hasWon && (
                <button
                  onClick={handleBingo}
                  className="px-4 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium animate-pulse"
                >
                  BINGO!
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm('Reset all data?')) {
                    emergencyReset();
                  }
                }}
                className="p-2 text-apple-secondary hover:text-apple-text transition-colors"
                title="Reset data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <div className="text-xs text-apple-secondary font-mono">
                v{APP_VERSION}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Error Display */}
            {connectionError && (
              <div className="mx-4 mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <p className="text-red-300 text-sm font-medium">{connectionError}</p>
                </div>
              </div>
            )}

            {/* Game Content */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="max-w-2xl mx-auto">
                {/* Solo Play Mode - Always Ready */}
                {!currentRoom && (
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-medium text-apple-text mb-2">Solo Play Mode</h2>
                    <p className="text-apple-secondary text-sm">Play solo or create/join a room for multiplayer</p>
                  </div>
                )}
                
                <BingoCard 
                  squares={gameState.board}
                  onSquareClick={handleSquareClick}
                  hasBingo={gameState.hasWon}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-apple-sidebar border-l border-apple-border overflow-hidden">
            <div className="h-full overflow-auto">
              {activePanel === 'rooms' && <RoomManager />}
              {activePanel === 'stats' && <BingoStats stats={gameStats} />}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
