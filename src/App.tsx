// Corporate Bingo - Single-page Apple Dark Mode Experience  
// Version: 2.0.1 - Performance optimized with accessibility enhancements

import { useState, useEffect, lazy, Suspense } from 'react';
import { BingoCard } from './components/bingo/BingoCard';
import { SoloScoreDisplay } from './components/bingo/SoloScoreDisplay';
import { useBingoStore } from './utils/store';
import { APP_VERSION } from './utils/version';
import { BingoEngine } from './lib/bingoEngine';
import { ToastContainer } from './components/shared/ToastNotification';
import corporateBingoLogo from './assets/corporate-bingo-logo.svg';
import './App.css';

// Lazy load non-critical components
const RoomManager = lazy(() => import('./components/bingo/RoomManager').then(module => ({ default: module.RoomManager })));
const BingoStats = lazy(() => import('./components/bingo/BingoStats').then(module => ({ default: module.BingoStats })));

// Loading component for lazy loaded components
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin w-6 h-6 border-2 border-apple-accent border-t-transparent rounded-full"></div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'rooms' | 'stats' | null>(null);
  
  const {
    currentRoom,
    currentPlayer,
    gameState,
    gamesPlayed,
    wins,
    totalSquares,
    currentScore,
    isConnected,
    connectionError,
    markSquare,
    resetGame,
    resetScore,
    incrementGamesPlayed,
    incrementWins,
    incrementTotalSquares,
    setGameWon,
    emergencyReset
  } = useBingoStore();

  // Watch for bingo condition using BingoEngine
  useEffect(() => {
    // Convert marked squares array to board format for BingoEngine
    const boardSquares = gameState.board.map((square, index) => ({
      ...square,
      isMarked: gameState.markedSquares[index] || false
    }));
    
    const result = BingoEngine.checkBingo(boardSquares);
    if (result.hasWon && !gameState.hasWon) {
      setGameWon(true, result.winningCells);
    } else if (!result.hasWon && gameState.hasWon) {
      setGameWon(false);
    }
  }, [gameState.markedSquares, gameState.hasWon, gameState.board, setGameWon]);

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

  const closeSidebar = () => {
    setActivePanel(null);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-black text-white font-system flex flex-col overflow-hidden">
      {/* Apple-style Header */}
      <header className="bg-apple-dark border-b border-apple-border z-50 backdrop-blur-xl bg-opacity-80 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center shadow-lg border border-purple-400/30 relative overflow-hidden">
                {/* Background grid pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <defs>
                      <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="40" height="40" fill="url(#grid)" />
                  </svg>
                </div>
                {/* Professional Corporate Bingo Logo */}
                <img 
                  src={corporateBingoLogo} 
                  alt="Corporate Bingo" 
                  className="w-6 h-6 relative z-10"
                />
                {/* Subtle highlight */}
                <div className="absolute top-1 left-1 right-1 h-3 bg-gradient-to-b from-white/20 to-transparent rounded-lg"></div>
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
                  {/* Current Player Score */}
                  {currentPlayer && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-apple-darkest rounded-md">
                      <span className="text-apple-secondary">Your Score:</span>
                      <span className="font-bold text-cyan-400">{currentPlayer.currentScore || 0}</span>
                    </div>
                  )}
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

              {/* Reset Score button for solo mode */}
              {!currentRoom && currentScore > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Reset your score to 0?')) {
                      resetScore();
                    }
                  }}
                  className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
                >
                  Reset Score
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

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeSidebar}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
        )}

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
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium text-apple-text mb-2">Solo Play Mode</h2>
                      <p className="text-apple-secondary text-sm">Play solo or create/join a room for multiplayer</p>
                    </div>
                    
                    {/* Solo Score Display */}
                    <div className="mb-8">
                      <SoloScoreDisplay score={currentScore || 0} className="py-6" />
                    </div>
                  </>
                )}
                
                <BingoCard 
                  squares={gameState.board.map((square, index) => ({
                    ...square,
                    isMarked: gameState.markedSquares[index] || false
                  }))}
                  onSquareClick={handleSquareClick}
                  hasBingo={gameState.hasWon}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - Mobile overlay on small screens, side panel on larger */}
        {sidebarOpen && (
          <aside className={`
            w-80 bg-apple-sidebar border-l border-apple-border overflow-hidden h-full max-h-full z-50
            md:relative md:translate-x-0
            fixed right-0 top-0 transform transition-transform duration-300 ease-in-out
          `}>
            {/* Mobile Close Button */}
            <div className="md:hidden sticky top-0 z-10 bg-apple-sidebar border-b border-apple-border p-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-apple-text">
                {activePanel === 'rooms' ? 'Rooms' : 'Stats'}
              </h3>
              <button 
                onClick={closeSidebar}
                className="p-2 hover:bg-apple-hover rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-full max-h-full overflow-auto">
              <Suspense fallback={<ComponentLoader />}>
                {activePanel === 'rooms' && <RoomManager />}
                {activePanel === 'stats' && <BingoStats stats={gameStats} />}
              </Suspense>
            </div>
          </aside>
        )}
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
