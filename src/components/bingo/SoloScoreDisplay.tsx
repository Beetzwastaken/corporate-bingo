import { useState, useEffect } from 'react';

interface SoloScoreDisplayProps {
  score: number;
  className?: string;
}

interface ScoreAnimation {
  id: string;
  points: number;
  type: 'positive' | 'negative';
  timestamp: number;
}

export function SoloScoreDisplay({ score, className = '' }: SoloScoreDisplayProps) {
  const [animations, setAnimations] = useState<ScoreAnimation[]>([]);
  const [previousScore, setPreviousScore] = useState(score);

  // Track score changes and trigger animations
  useEffect(() => {
    const scoreDiff = score - previousScore;
    
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
    
    setPreviousScore(score);
  }, [score, previousScore]);

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
          {animations.map((animation, index) => (
            <div
              key={animation.id}
              className={`absolute whitespace-nowrap font-bold text-2xl ${
                animation.type === 'positive' 
                  ? 'text-cyan-400' 
                  : 'text-red-400'
              } animate-score-float`}
              style={{
                animation: 'scoreFloat 2s ease-out forwards',
                top: `${index * 30}px`
              }}
            >
              {animation.type === 'positive' ? '+' : ''}{animation.points}
            </div>
          ))}
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