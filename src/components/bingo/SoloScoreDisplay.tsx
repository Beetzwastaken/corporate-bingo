import { useState, useEffect } from 'react';
import { useBingoStore } from '../../utils/store';
import type { LineBonus } from '../../lib/bingoEngine';

interface SoloScoreDisplayProps {
  score: number;
  className?: string;
}

interface ScoreAnimation {
  id: string;
  points: number;
  type: 'positive' | 'negative' | 'bonus';
  bonusType?: '3-in-row' | '4-in-row' | 'bingo';
  timestamp: number;
}

export function SoloScoreDisplay({ score, className = '' }: SoloScoreDisplayProps) {
  const [animations, setAnimations] = useState<ScoreAnimation[]>([]);
  const [previousScore, setPreviousScore] = useState(score);
  const { recentBonuses, clearRecentBonuses } = useBingoStore();

  // Track score changes and trigger animations
  useEffect(() => {
    const scoreDiff = score - previousScore;
    
    if (scoreDiff !== 0 && previousScore !== undefined) {
      // Check if this score change includes bonuses
      if (recentBonuses.length > 0) {
        // Create bonus animations
        recentBonuses.forEach((bonus: LineBonus, index: number) => {
          const bonusAnimation: ScoreAnimation = {
            id: `bonus-${Date.now()}-${index}`,
            points: bonus.points,
            type: 'bonus',
            bonusType: bonus.type,
            timestamp: Date.now()
          };
          
          setAnimations(prev => [...prev, bonusAnimation]);
          
          // Remove bonus animation after it completes
          setTimeout(() => {
            setAnimations(prev => prev.filter(anim => anim.id !== bonusAnimation.id));
          }, 2500); // Slightly longer for bonus animations
        });
        
        // Clear recent bonuses after processing
        clearRecentBonuses();
        
        // Calculate base score change (total minus bonuses)
        const bonusTotal = recentBonuses.reduce((sum: number, bonus: LineBonus) => sum + bonus.points, 0);
        const baseScoreChange = scoreDiff - bonusTotal;
        
        if (baseScoreChange !== 0) {
          const baseAnimation: ScoreAnimation = {
            id: `base-${Date.now()}`,
            points: baseScoreChange,
            type: baseScoreChange > 0 ? 'positive' : 'negative',
            timestamp: Date.now()
          };
          
          setAnimations(prev => [...prev, baseAnimation]);
          
          setTimeout(() => {
            setAnimations(prev => prev.filter(anim => anim.id !== baseAnimation.id));
          }, 2000);
        }
      } else {
        // Regular score change without bonuses
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
    }
    
    setPreviousScore(score);
  }, [score, previousScore, recentBonuses, clearRecentBonuses]);

  return (
    <div className={`flex flex-col items-center justify-center relative ${className}`}>
      {/* Score Label */}
      <div className="text-apple-secondary text-sm font-medium mb-1">
        Score
      </div>
      
      {/* Main Score Display */}
      <div className="relative flex items-center justify-center">
        <div className={`text-6xl font-bold transition-colors duration-300 ${
          score > 0 ? 'text-cyan-400' : 'text-apple-secondary'
        }`}>
          {score}
        </div>
        
        {/* Score Change Animations */}
        <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {animations.map((animation, index) => {
            const getBonusColor = () => {
              if (animation.type === 'bonus') {
                switch (animation.bonusType) {
                  case '3-in-row': return 'text-green-400';
                  case '4-in-row': return 'text-yellow-400';
                  case 'bingo': return 'text-yellow-300';
                  default: return 'text-cyan-400';
                }
              }
              return animation.type === 'positive' ? 'text-cyan-400' : 'text-red-400';
            };

            const getBonusText = () => {
              if (animation.type === 'bonus') {
                const sign = animation.points > 0 ? '+' : '';
                switch (animation.bonusType) {
                  case '3-in-row': return `${sign}${animation.points} 3-LINE!`;
                  case '4-in-row': return `${sign}${animation.points} 4-LINE!`;
                  case 'bingo': return `${sign}${animation.points} BINGO!`;
                  default: return `${sign}${animation.points} BONUS`;
                }
              }
              return `${animation.type === 'positive' ? '+' : ''}${animation.points}`;
            };

            return (
              <div
                key={animation.id}
                className={`absolute whitespace-nowrap font-bold ${
                  animation.type === 'bonus' ? 'text-xl' : 'text-2xl'
                } ${getBonusColor()} animate-score-float`}
                style={{
                  animation: 'scoreFloat 2s ease-out forwards',
                  top: `${index * 35}px`
                }}
              >
                {getBonusText()}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Points Label */}
      <div className="text-apple-secondary text-xs font-medium mt-1">
        {score === 1 ? 'point' : 'points'}
      </div>
      
      {/* Subtle Background Glow */}
      {score > 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-cyan-400/5 rounded-2xl -z-10" />
      )}
    </div>
  );
}