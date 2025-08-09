import { useState, useEffect } from 'react';
import type { BingoPlayer } from '../../stores/roomStore';

interface ScoreDisplayProps {
  player: BingoPlayer;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

interface ScoreAnimation {
  id: string;
  points: number;
  type: 'positive' | 'negative';
  timestamp: number;
}

export function ScoreDisplay({ player, className = '', size = 'medium' }: ScoreDisplayProps) {
  const [animations, setAnimations] = useState<ScoreAnimation[]>([]);
  const [previousScore, setPreviousScore] = useState(player.currentScore || 0);

  // Track score changes and trigger animations
  useEffect(() => {
    const currentScore = player.currentScore || 0;
    const scoreDiff = currentScore - previousScore;
    
    if (scoreDiff !== 0 && previousScore !== undefined) {
      const newAnimation: ScoreAnimation = {
        id: Date.now().toString(),
        points: scoreDiff,
        type: scoreDiff > 0 ? 'positive' : 'negative',
        timestamp: Date.now()
      };
      
      setAnimations(prev => [...prev, newAnimation]);
      
      // Remove animation after it completes
      setTimeout(() => {
        setAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
      }, 2000);
    }
    
    setPreviousScore(currentScore);
  }, [player.currentScore, previousScore]);

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const currentScore = player.currentScore || 0;

  return (
    <div className={`relative inline-flex items-center space-x-2 ${className}`}>
      {/* Main Score Display */}
      <div className={`font-semibold ${sizeClasses[size]} ${
        currentScore > 0 ? 'text-cyan-400' : 'text-apple-secondary'
      }`}>
        {currentScore}
      </div>
      
      {/* Score Change Animations */}
      <div className="absolute left-full ml-2 pointer-events-none">
        {animations.map((animation) => (
          <div
            key={animation.id}
            className={`absolute whitespace-nowrap font-bold text-sm ${
              animation.type === 'positive' 
                ? 'text-cyan-400' 
                : 'text-red-400'
            } animate-score-float`}
            style={{
              animation: 'scoreFloat 2s ease-out forwards',
              top: `${(animations.length - animations.indexOf(animation) - 1) * 20}px`
            }}
          >
            {animation.type === 'positive' ? '+' : ''}{animation.points}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact score display for inline use
export function CompactScoreDisplay({ player, className = '' }: Omit<ScoreDisplayProps, 'size'>) {
  const currentScore = player.currentScore || 0;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
      currentScore > 0 
        ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30' 
        : 'bg-apple-darkest text-apple-secondary'
    } ${className}`}>
      {currentScore} pts
    </span>
  );
}