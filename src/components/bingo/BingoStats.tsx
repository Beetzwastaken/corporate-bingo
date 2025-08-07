interface BingoStatsProps {
  stats: {
    gamesPlayed: number;
    wins: number;
    totalSquares: number;
    favoriteSquares: string[];
  };
}

export function BingoStats({ stats }: BingoStatsProps) {
  const winRate = stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed * 100) : 0;
  const averageSquares = stats.gamesPlayed > 0 ? (stats.totalSquares / stats.gamesPlayed) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          <span className="terminal-accent">&gt;</span> Your Bingo Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-300 terminal-accent">{stats.gamesPlayed}</div>
            <div className="text-blue-400 font-medium mt-1">Games Played</div>
            <div className="text-xs text-gray-400 mt-2">Total meetings survived</div>
          </div>
          
          <div className="bg-emerald-600/20 border border-emerald-500/30 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-emerald-300 terminal-accent">{stats.wins}</div>
            <div className="text-emerald-400 font-medium mt-1">Wins</div>
            <div className="text-xs text-gray-400 mt-2">Successful bingos</div>
          </div>
          
          <div className="bg-yellow-600/20 border border-yellow-500/30 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-yellow-300 terminal-accent">{winRate.toFixed(1)}%</div>
            <div className="text-yellow-400 font-medium mt-1">Win Rate</div>
            <div className="text-xs text-gray-400 mt-2">Meeting mastery level</div>
          </div>
          
          <div className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-300 terminal-accent">{averageSquares.toFixed(1)}</div>
            <div className="text-purple-400 font-medium mt-1">Avg. Squares</div>
            <div className="text-xs text-gray-400 mt-2">Per meeting</div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="glass-panel rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          <span className="terminal-accent">&gt;</span> Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Win */}
          <div className={`p-4 rounded-lg border-2 ${stats.wins > 0 ? 'bg-emerald-600/20 border-emerald-500/30' : 'bg-gray-600/20 border-gray-500/30'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stats.wins > 0 ? '🏆' : '🔒'}</span>
              <div>
                <h4 className={`font-medium ${stats.wins > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  First Victory
                </h4>
                <p className="text-xs text-gray-400">Get your first bingo</p>
              </div>
            </div>
          </div>

          {/* Meeting Veteran */}
          <div className={`p-4 rounded-lg border-2 ${stats.gamesPlayed >= 10 ? 'bg-blue-600/20 border-blue-500/30' : 'bg-gray-600/20 border-gray-500/30'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stats.gamesPlayed >= 10 ? '🎖️' : '🔒'}</span>
              <div>
                <h4 className={`font-medium ${stats.gamesPlayed >= 10 ? 'text-blue-400' : 'text-gray-400'}`}>
                  Meeting Veteran
                </h4>
                <p className="text-xs text-gray-400">Survive 10 meetings</p>
              </div>
            </div>
          </div>

          {/* Buzzword Hunter */}
          <div className={`p-4 rounded-lg border-2 ${stats.totalSquares >= 100 ? 'bg-yellow-600/20 border-yellow-500/30' : 'bg-gray-600/20 border-gray-500/30'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stats.totalSquares >= 100 ? '🎯' : '🔒'}</span>
              <div>
                <h4 className={`font-medium ${stats.totalSquares >= 100 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  Buzzword Hunter
                </h4>
                <p className="text-xs text-gray-400">Mark 100 squares</p>
              </div>
            </div>
          </div>

          {/* Perfect Score */}
          <div className={`p-4 rounded-lg border-2 ${winRate >= 75 && stats.gamesPlayed >= 5 ? 'bg-purple-600/20 border-purple-500/30' : 'bg-gray-600/20 border-gray-500/30'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{winRate >= 75 && stats.gamesPlayed >= 5 ? '💎' : '🔒'}</span>
              <div>
                <h4 className={`font-medium ${winRate >= 75 && stats.gamesPlayed >= 5 ? 'text-purple-400' : 'text-gray-400'}`}>
                  Perfect Score
                </h4>
                <p className="text-xs text-gray-400">75%+ win rate (5+ games)</p>
              </div>
            </div>
          </div>

          {/* Speed Demon */}
          <div className="p-4 rounded-lg border-2 bg-gray-600/20 border-gray-500/30">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-medium text-gray-400">Speed Demon</h4>
                <p className="text-xs text-gray-400">Win within 5 minutes</p>
              </div>
            </div>
          </div>

          {/* Room Master */}
          <div className="p-4 rounded-lg border-2 bg-gray-600/20 border-gray-500/30">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-medium text-gray-400">Room Master</h4>
                <p className="text-xs text-gray-400">Win 3 multiplayer games</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          <span className="terminal-accent">&gt;</span> Meeting Survival Guide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">🎯 Pro Tips</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p><span className="terminal-accent">•</span> Position card discretely on your laptop</p>
              <p><span className="terminal-accent">•</span> Use muted reactions to celebrate</p>
              <p><span className="terminal-accent">•</span> Create rooms for team building</p>
              <p><span className="terminal-accent">•</span> Track buzzword patterns over time</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">📈 Your Progress</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Meeting Endurance</span>
                  <span className="text-blue-300 terminal-accent">{Math.min(stats.gamesPlayed * 10, 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(stats.gamesPlayed * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Buzzword Recognition</span>
                  <span className="text-emerald-300 terminal-accent">{Math.min(stats.totalSquares, 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(stats.totalSquares, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Victory Mastery</span>
                  <span className="text-yellow-300 terminal-accent">{Math.min(winRate, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(winRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}