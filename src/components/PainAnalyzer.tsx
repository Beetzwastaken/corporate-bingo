// PainAnalyzer Component - Visual Pain Level Display
// Shows current engineering pain level with professional styling

import React from 'react';
import { PainLevel } from '../types';

interface PainAnalyzerProps {
  painScore: PainLevel;
  className?: string;
  showDetails?: boolean;
}

export const PainAnalyzer: React.FC<PainAnalyzerProps> = ({ 
  painScore, 
  className = '',
  showDetails = true 
}) => {
  const getPainColor = (score: PainLevel): string => {
    if (score <= 3) return 'pain-low';
    if (score <= 6) return 'pain-medium';
    if (score <= 8) return 'pain-high';
    return 'pain-extreme';
  };

  const getPainMessage = (score: PainLevel): string => {
    const messages = {
      1: "Mild engineering annoyance",
      2: "Slight project turbulence", 
      3: "Minor technical hiccup",
      4: "Standard development friction",
      5: "Typical engineering suffering",
      6: "Elevated stress protocols",
      7: "Approaching critical pain levels",
      8: "High-stress engineering zone",
      9: "MAXIMUM SUFFERING DETECTED",
      10: "ENGINEERING EMERGENCY STATE"
    };
    return messages[score] || "Unknown pain level";
  };

  const getPainEmoji = (score: PainLevel): string => {
    if (score <= 3) return "😐";
    if (score <= 6) return "😤";
    if (score <= 8) return "😫";
    return "🤯";
  };

  const getPainDescription = (score: PainLevel): string => {
    if (score <= 3) return "Everything's under control";
    if (score <= 6) return "Normal engineering challenges";
    if (score <= 8) return "Significant project stress detected";
    return "Crisis mode activated";
  };

  return (
    <div className={`pain-analyzer mt-4 ${className}`}>
      {showDetails && (
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium text-gray-700">
            Engineering Pain Level
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getPainEmoji(painScore)}</span>
            <span className="font-bold text-gray-800">
              {painScore}/10
            </span>
          </div>
        </div>
      )}

      {/* Pain Meter Bar */}
      <div className="pain-meter">
        <div
          className={`pain-bar ${getPainColor(painScore)}`}
          style={{ width: `${painScore * 10}%` }}
        />
      </div>

      {showDetails && (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium text-gray-800">
            {getPainMessage(painScore)}
          </p>
          <p className="text-xs text-gray-600">
            {getPainDescription(painScore)}
          </p>
        </div>
      )}

      {/* Pain Level Indicators */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>😊 Zen</span>
        <span>😐 Normal</span>
        <span>😤 Stressed</span>
        <span>😫 Crisis</span>
        <span>🤯 Meltdown</span>
      </div>
    </div>
  );
};