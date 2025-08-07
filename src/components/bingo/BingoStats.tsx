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

  const AchievementCard = ({ 
    unlocked, 
    icon, 
    title, 
    description, 
    color = 'emerald' 
  }: { 
    unlocked: boolean; 
    icon: string; 
    title: string; 
    description: string; 
    color?: string; 
  }) => (
    <div className={`apple-panel p-4 ${unlocked ? `border-${color}-500/30 bg-${color}-600/10` : 'border-apple-border bg-apple-darkest'}`}>
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{unlocked ? icon : '🔒'}</span>
        <div>
          <h4 className={`font-medium text-sm ${unlocked ? `text-${color}-400` : 'text-apple-secondary'}`}>
            {title}
          </h4>
          <p className="text-xs text-apple-tertiary">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Overall Stats */}
      <div className="apple-panel p-6">
        <h2 className="text-lg font-semibold text-apple-text mb-6">
          Statistics
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="apple-panel-elevated p-4 text-center">
            <div className="text-2xl font-semibold text-apple-accent font-mono mb-1">
              {stats.gamesPlayed}
            </div>
            <div className="text-apple-text font-medium text-sm mb-1">Games</div>
            <div className="text-xs text-apple-secondary">Meetings played</div>
          </div>
          
          <div className="apple-panel-elevated p-4 text-center">
            <div className="text-2xl font-semibold text-green-400 font-mono mb-1">
              {stats.wins}
            </div>
            <div className="text-green-400 font-medium text-sm mb-1">Wins</div>
            <div className="text-xs text-apple-secondary">Completed boards</div>
          </div>
          
          <div className="apple-panel-elevated p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-400 font-mono mb-1">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-yellow-400 font-medium text-sm mb-1">Win Rate</div>
            <div className="text-xs text-apple-secondary">Success rate</div>
          </div>
          
          <div className="apple-panel-elevated p-4 text-center">
            <div className="text-2xl font-semibold text-purple-400 font-mono mb-1">
              {averageSquares.toFixed(1)}
            </div>
            <div className="text-purple-400 font-medium text-sm mb-1">Average</div>
            <div className="text-xs text-apple-secondary">Squares per game</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="apple-panel p-6">
        <h3 className="text-lg font-semibold text-apple-text mb-4">
          Achievements
        </h3>
        
        <div className="space-y-3">
          <AchievementCard
            unlocked={stats.wins > 0}
            icon="🏆"
            title="First Victory"
            description="Get your first bingo"
            color="emerald"
          />

          <AchievementCard
            unlocked={stats.gamesPlayed >= 10}
            icon="🎖️"
            title="Meeting Veteran"
            description="Play 10 games"
            color="blue"
          />

          <AchievementCard
            unlocked={stats.totalSquares >= 100}
            icon="🎯"
            title="Buzzword Hunter"
            description="Mark 100 squares"
            color="yellow"
          />

          <AchievementCard
            unlocked={winRate >= 75 && stats.gamesPlayed >= 5}
            icon="💎"
            title="Perfect Score"
            description="75%+ win rate with 5+ games"
            color="purple"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="apple-panel p-6">
        <h3 className="text-lg font-semibold text-apple-text mb-4">
          Progress
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-apple-secondary">Meeting Endurance</span>
              <span className="text-apple-accent font-mono text-xs">
                {Math.min(stats.gamesPlayed * 10, 100)}%
              </span>
            </div>
            <div className="w-full bg-apple-darkest rounded-full h-2">
              <div 
                className="bg-apple-accent h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(stats.gamesPlayed * 10, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-apple-secondary">Buzzword Recognition</span>
              <span className="text-green-400 font-mono text-xs">
                {Math.min(stats.totalSquares, 100)}%
              </span>
            </div>
            <div className="w-full bg-apple-darkest rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(stats.totalSquares, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-apple-secondary">Victory Mastery</span>
              <span className="text-yellow-400 font-mono text-xs">
                {Math.min(winRate, 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-apple-darkest rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(winRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="apple-panel p-6">
        <h3 className="text-lg font-semibold text-apple-text mb-4">
          Pro Tips
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-apple-accent">•</span>
            <span className="text-apple-secondary">Keep card open in background tab</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-apple-accent">•</span>
            <span className="text-apple-secondary">Celebrate wins quietly</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-apple-accent">•</span>
            <span className="text-apple-secondary">Share room codes with teammates</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-apple-accent">•</span>
            <span className="text-apple-secondary">Notice which buzzwords repeat</span>
          </div>
        </div>
      </div>
    </div>
  );
}