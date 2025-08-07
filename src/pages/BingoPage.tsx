import { useState, useEffect } from 'react';
import { BingoCard } from '../components/bingo/BingoCard';
import { RoomManager } from '../components/bingo/RoomManager';
import { BingoStats } from '../components/bingo/BingoStats';
import type { BingoSquare, BingoRoom } from '../types';

const BUZZWORDS = [
  // Classic corporate buzzwords
  'Synergy', 'Leverage', 'Deep Dive', 'Circle Back', 'Touch Base', 
  'Low-hanging Fruit', 'Move the Needle', 'Paradigm Shift', 'Think Outside the Box',
  'Best Practice', 'Core Competency', 'Value-add', 'Game Changer', 'Win-win',
  
  // Engineering specific
  'Technical Debt', 'Scalability', 'Microservices', 'DevOps', 'Agile Transformation',
  'Digital Transformation', 'AI/ML Integration', 'Cloud Migration', 'API Gateway',
  'Containerization', 'Infrastructure as Code', 'CI/CD Pipeline', 'Kubernetes',
  
  // Meeting favorites  
  'Actionable Items', 'Take it Offline', 'Ping Me', 'Loop In', 'Bandwidth',
  'On My Radar', 'Ideate', 'Stakeholder Buy-in', 'Scope Creep', 'Timeline',
  
  // Management classics
  'KPI', 'ROI', 'Optimization', 'Streamline', 'Right-size', 'Iterate',
  'Pivot', 'Disrupt', 'Innovation', 'Growth Hacking', 'Metrics-driven',
  
  // Corporate culture
  'Culture Fit', 'Team Player', 'Proactive', 'Own It', 'Drive Results',
  'Customer-centric', 'Data-driven', 'Results-oriented', 'Solution-focused'
];

export function BingoPage() {
  const [currentCard, setCurrentCard] = useState<BingoSquare[]>([]);
  const [currentRoom, setCurrentRoom] = useState<BingoRoom | null>(null);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    totalSquares: 0,
    favoriteSquares: [] as string[]
  });
  const [currentTab, setCurrentTab] = useState<'play' | 'rooms' | 'stats'>('play');

  // Generate a new bingo card
  const generateCard = (): BingoSquare[] => {
    const shuffled = [...BUZZWORDS].sort(() => Math.random() - 0.5);
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
  };

  // Initialize card on component mount
  useEffect(() => {
    setCurrentCard(generateCard());
    
    // Load stats from localStorage
    const savedStats = localStorage.getItem('bingoStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  const handleSquareClick = (squareId: string) => {
    setCurrentCard(prev => prev.map(square => 
      square.id === squareId 
        ? { ...square, isMarked: !square.isMarked }
        : square
    ));

    // Update stats
    setGameStats(prev => {
      const newStats = { ...prev, totalSquares: prev.totalSquares + 1 };
      localStorage.setItem('bingoStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const checkBingo = (): boolean => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      if (currentCard.slice(row * 5, row * 5 + 5).every(square => square.isMarked)) {
        return true;
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      if (currentCard.filter((_, index) => index % 5 === col).every(square => square.isMarked)) {
        return true;
      }
    }
    
    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24].map(i => currentCard[i]);
    const diagonal2 = [4, 8, 12, 16, 20].map(i => currentCard[i]);
    
    if (diagonal1.every(square => square.isMarked) || diagonal2.every(square => square.isMarked)) {
      return true;
    }
    
    return false;
  };

  const handleNewGame = () => {
    setCurrentCard(generateCard());
    setGameStats(prev => {
      const newStats = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      localStorage.setItem('bingoStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const handleBingo = () => {
    setGameStats(prev => {
      const newStats = { ...prev, wins: prev.wins + 1 };
      localStorage.setItem('bingoStats', JSON.stringify(newStats));
      return newStats;
    });
    
    // Show celebration
    alert('🎉 BINGO! You survived another corporate meeting!');
    handleNewGame();
  };

  const createRoom = (roomName: string): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: BingoRoom = {
      id: Date.now().toString(),
      name: roomName,
      code,
      players: 1,
      isActive: true
    };
    setCurrentRoom(newRoom);
    return code;
  };

  const joinRoom = (code: string): boolean => {
    // Simulate joining room
    const mockRoom: BingoRoom = {
      id: Date.now().toString(),
      name: `Meeting Room ${code}`,
      code: code.toUpperCase(),
      players: Math.floor(Math.random() * 8) + 2,
      isActive: true
    };
    setCurrentRoom(mockRoom);
    return true;
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  const hasBingo = checkBingo();

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
                      <div className="text-xs text-gray-400">{currentRoom.players} players</div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleNewGame}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    New Game
                  </button>
                  
                  {hasBingo && (
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
            <BingoCard 
              squares={currentCard}
              onSquareClick={handleSquareClick}
              hasBingo={hasBingo}
            />

            {/* Game Instructions */}
            <div className="glass-panel rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <span className="terminal-accent">&gt;</span> How to Play
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">🎯 Objective</h4>
                  <p className="text-sm">Mark off buzzwords as they're mentioned in meetings. Get 5 in a row to win!</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">🏢 Room Mode</h4>
                  <p className="text-sm">Create or join rooms to play with colleagues during the same meeting.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">📊 Patterns</h4>
                  <p className="text-sm">Win with any row, column, or diagonal. Center space is always free!</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">🎉 Winning</h4>
                  <p className="text-sm">Click "BINGO!" when you get 5 in a row. Try not to celebrate too loudly!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rooms' && (
          <RoomManager 
            currentRoom={currentRoom}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onLeaveRoom={leaveRoom}
          />
        )}

        {currentTab === 'stats' && (
          <BingoStats stats={gameStats} />
        )}
      </main>
    </div>
  );
}