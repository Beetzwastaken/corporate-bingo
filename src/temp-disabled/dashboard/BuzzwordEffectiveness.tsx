// Buzzword Effectiveness Component
// Content performance tracking with corporate humor analytics

import type { BuzzwordEffectivenessData } from '../../types';

interface BuzzwordEffectivenessProps {
  effectiveness: BuzzwordEffectivenessData | null;
  period: '1h' | '24h' | '7d' | '30d';
  showAdvanced: boolean;
}

export function BuzzwordEffectiveness({ effectiveness, showAdvanced }: BuzzwordEffectivenessProps) {
  if (!effectiveness) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-600 rounded"></div>
          <div className="h-6 bg-gray-600 rounded w-48"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
              <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
              <div className="h-6 bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEffectivenessStatus = (score: number) => {
    if (score >= 90) return { status: 'Legendary Buzzword', icon: '🏆' };
    if (score >= 75) return { status: 'Corporate Gold', icon: '⭐' };
    if (score >= 60) return { status: 'Meeting Approved', icon: '✅' };
    return { status: 'Needs Synergy', icon: '⚠️' };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const overallStatus = getEffectivenessStatus(effectiveness.overallEffectiveness);

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">💼</div>
          <div>
            <h2 className="text-xl font-bold text-white">Buzzword Effectiveness</h2>
            <p className="text-sm text-gray-400">Corporate speak performance & humor impact</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Overall Score</div>
          <div className={`text-2xl font-bold ${getEffectivenessColor(effectiveness.overallEffectiveness)}`}>
            {effectiveness.overallEffectiveness.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Overall Effectiveness */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{overallStatus.icon}</span>
            <div>
              <div className="text-lg font-bold text-white">{overallStatus.status}</div>
              <div className="text-sm text-gray-400">Corporate comedy effectiveness rating</div>
            </div>
          </div>
          <div className={`text-3xl font-bold ${getEffectivenessColor(effectiveness.overallEffectiveness)}`}>
            {effectiveness.overallEffectiveness.toFixed(0)}%
          </div>
        </div>
        
        {/* Effectiveness Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              effectiveness.overallEffectiveness >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              effectiveness.overallEffectiveness >= 75 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
              effectiveness.overallEffectiveness >= 60 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${effectiveness.overallEffectiveness}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {effectiveness.overallEffectiveness >= 90 ? 'Peak corporate humor - C-suite approved!' :
           effectiveness.overallEffectiveness >= 75 ? 'Solid meeting material - middle management loves it' :
           effectiveness.overallEffectiveness >= 60 ? 'Getting there - needs more buzzword density' :
           'Requires immediate synergistic optimization'}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Category Performance</h3>
        
        <div className="space-y-3">
          {effectiveness.categoryPerformance.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                <div>
                  <div className="text-sm text-gray-300">{category.category}</div>
                  <div className="text-xs text-gray-500">{category.usage.toLocaleString()} uses</div>
                </div>
                <span className={`text-sm ${getTrendColor(category.trend)}`}>
                  {getTrendIcon(category.trend)}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getEffectivenessColor(category.effectiveness)}`}>
                  {category.effectiveness}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Buzzwords */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/20 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">🏆 Hall of Fame Buzzwords</h3>
        
        <div className="space-y-4">
          {effectiveness.topPerformers.slice(0, showAdvanced ? 5 : 3).map((buzzword, index) => (
            <div key={buzzword.buzzword} className="bg-gray-800/30 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">"{buzzword.buzzword}"</div>
                    <div className="text-xs text-gray-500">{buzzword.usage.toLocaleString()} triggers</div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${getEffectivenessColor(buzzword.effectiveness)}`}>
                  {buzzword.effectiveness}%
                </div>
              </div>
              
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Corporate Relevance:</span>
                    <span className="text-white">{buzzword.corporateRelevance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Humor Rating:</span>
                    <span className="text-white">{buzzword.humourRating}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Underperforming Buzzwords */}
      {effectiveness.underperformers.length > 0 && (
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-4 rounded-lg border border-red-500/20 mb-6">
          <h3 className="text-sm font-medium text-white mb-4">📉 Needs Improvement</h3>
          
          <div className="space-y-3">
            {effectiveness.underperformers.slice(0, showAdvanced ? 3 : 2).map((buzzword) => (
              <div key={buzzword.buzzword} className="bg-gray-800/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔧</span>
                    <span className="text-sm font-medium text-white">"{buzzword.buzzword}"</span>
                  </div>
                  <span className={`text-sm font-bold ${getEffectivenessColor(buzzword.effectiveness)}`}>
                    {buzzword.effectiveness}%
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  Issues: {buzzword.reasons.join(', ')}
                </div>
                
                {showAdvanced && (
                  <div className="text-xs text-gray-300">
                    💡 Suggestions: {buzzword.suggestions.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emerging Trends */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-4 rounded-lg border border-blue-500/20 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">🚀 Emerging Trends</h3>
        
        <div className="space-y-3">
          {effectiveness.emergingTrends.map((trend, index) => (
            <div key={trend.buzzword} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm">🌟</span>
                <div>
                  <div className="text-sm text-white">"{trend.buzzword}"</div>
                  <div className="text-xs text-gray-500">Rising star</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">
                  +{trend.growthRate}%
                </div>
                <div className="text-xs text-gray-400">
                  Potential: {trend.potential}%
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          These buzzwords are showing rapid adoption and high corporate appeal
        </div>
      </div>

      {/* Advanced Analytics */}
      {showAdvanced && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Content Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Content Strategy Insights */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Content Strategy</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Top Category:</span>
                  <span className="text-white">
                    {effectiveness.categoryPerformance[0]?.category || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Effectiveness:</span>
                  <span className="text-white">
                    {(effectiveness.categoryPerformance.reduce((sum, cat) => sum + cat.effectiveness, 0) / effectiveness.categoryPerformance.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growth Potential:</span>
                  <span className="text-white">
                    {effectiveness.emergingTrends.length > 0 
                      ? `${effectiveness.emergingTrends[0].potential}%`
                      : 'Stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Recommendations</h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div>• Focus on {effectiveness.categoryPerformance[0]?.category || 'top'} category content</div>
                <div>• Investigate {effectiveness.underperformers.length} underperforming terms</div>
                <div>• Capitalize on {effectiveness.emergingTrends.length} trending opportunities</div>
                <div>• Maintain {effectiveness.topPerformers.filter(p => p.effectiveness > 90).length} high-performers</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Performance Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 rounded-lg border border-gray-600/30">
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-2">
            Corporate Humor Optimization Status
          </div>
          <div className="text-sm text-gray-300">
            {effectiveness.topPerformers.length} proven buzzwords driving maximum meeting engagement
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Current effectiveness: {effectiveness.overallEffectiveness.toFixed(1)}% • 
            {effectiveness.emergingTrends.length > 0 && ` ${effectiveness.emergingTrends.length} trends monitored • `}
            {effectiveness.underperformers.length} optimization opportunities identified
          </div>
        </div>
      </div>
    </div>
  );
}