import { useMemo } from 'react';
import type { BingoPlayer } from '../../stores/roomStore';
import { ScoreDisplay } from './ScoreDisplay';

interface LeaderboardProps {
  players: BingoPlayer[];
  currentPlayerId?: string;
  className?: string;
  compact?: boolean;
}

export function Leaderboard({ 
  players, 
  currentPlayerId, 
  className = '', 
  compact = false 
}: LeaderboardProps) {
  
  // Sort players by current score (descending), then by name for ties
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const scoreA = a.currentScore || 0;
      const scoreB = b.currentScore || 0;
      
      // Sort by score first (descending)
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // If scores are tied, sort by name (ascending)
      return a.name.localeCompare(b.name);
    });
  }, [players]);

  // Find the leading score
  const leadingScore = sortedPlayers.length > 0 ? (sortedPlayers[0].currentScore || 0) : 0;
  
  // Find all players with the leading score (for ties)
  const leaders = sortedPlayers.filter(player => (player.currentScore || 0) === leadingScore && leadingScore > 0);

  if (players.length === 0) {
    return (
      <div className={`apple-panel p-4 ${className}`}>
        <h3 className="text-sm font-medium text-apple-secondary mb-2">Leaderboard</h3>
        <p className="text-xs text-apple-tertiary">No players yet</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-sm font-medium text-apple-secondary mb-2">
          Leaderboard ({players.length})
        </h3>
        <div className="space-y-1">
          {sortedPlayers.slice(0, 5).map((player, index) => {
            const isLeader = leaders.some(leader => leader.id === player.id);
            const isCurrentPlayer = player.id === currentPlayerId;
            
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isCurrentPlayer 
                    ? 'bg-apple-accent/20 border border-apple-accent/30' 
                    : 'bg-apple-darkest'
                }`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className={`text-xs font-medium w-6 text-center ${
                    index < 3 ? 'text-yellow-400' : 'text-apple-secondary'
                  }`}>
                    #{index + 1}
                  </span>
                  
                  {isLeader && (
                    <span className="text-yellow-400 text-sm crown-animate" title="Current Leader">
                      👑
                    </span>
                  )}
                  
                  <span className={`font-medium truncate ${
                    isCurrentPlayer ? 'text-apple-accent' : 'text-apple-text'
                  }`}>
                    {player.name}
                  </span>
                  
                  {isCurrentPlayer && (
                    <span className="text-xs text-apple-accent">(You)</span>
                  )}
                </div>
                
                <ScoreDisplay player={player} size="small" />
              </div>
            );
          })}
          
          {sortedPlayers.length > 5 && (
            <div className="text-xs text-apple-tertiary text-center pt-1">
              +{sortedPlayers.length - 5} more players
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`apple-panel p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-apple-text">
          Leaderboard
        </h2>
        <span className="text-sm text-apple-secondary">
          {players.length} {players.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const isLeader = leaders.some(leader => leader.id === player.id);
          const isCurrentPlayer = player.id === currentPlayerId;
          
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                isCurrentPlayer 
                  ? 'bg-apple-accent/20 border border-apple-accent/30' 
                  : 'bg-apple-darkest hover:bg-apple-hover'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Rank */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index === 0 
                    ? 'bg-yellow-500 text-black' 
                    : index === 1 
                    ? 'bg-gray-400 text-black'
                    : index === 2
                    ? 'bg-amber-600 text-black'
                    : 'bg-apple-border text-apple-text'
                }`}>
                  {index + 1}
                </div>
                
                {/* Crown for leader(s) */}
                {isLeader && (
                  <div className="flex items-center">
                    <span className="text-xl crown-animate" title="Current Leader">👑</span>
                  </div>
                )}
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold truncate ${
                      isCurrentPlayer ? 'text-apple-accent' : 'text-apple-text'
                    }`}>
                      {player.name}
                    </span>
                    
                    {player.isHost && (
                      <span className="text-yellow-400 text-xs font-medium px-2 py-1 bg-yellow-900/20 rounded-full">
                        Host
                      </span>
                    )}
                    
                    {isCurrentPlayer && (
                      <span className="text-apple-accent text-xs font-medium px-2 py-1 bg-apple-accent/20 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      player.isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-xs text-apple-secondary">
                      {player.isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Score Display */}
              <div className="flex items-center space-x-2">
                <ScoreDisplay player={player} size="large" />
                <span className="text-xs text-apple-secondary">pts</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Game Progress Indicator */}
      {leadingScore > 0 && (
        <div className="mt-6 pt-4 border-t border-apple-border">
          <div className="flex items-center justify-between text-xs text-apple-secondary">
            <span>Game Progress</span>
            <span>{leadingScore} points to lead</span>
          </div>
          <div className="mt-2 bg-apple-darker rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ 
                width: `${Math.min((leadingScore / 25) * 100, 100)}%` // Assume 25 is max reasonable score
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}