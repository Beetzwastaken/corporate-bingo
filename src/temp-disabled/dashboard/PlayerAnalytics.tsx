// Player Analytics Component
// User engagement and behavior insights with corporate humor context

import type { PlayerAnalyticsData } from '../../types';

interface PlayerAnalyticsProps {
  analytics: PlayerAnalyticsData | null;
  period: '1h' | '24h' | '7d' | '30d';
  showAdvanced: boolean;
}

export function PlayerAnalytics({ analytics, period, showAdvanced }: PlayerAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-600 rounded"></div>
          <div className="h-6 bg-gray-600 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
              <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'highly_engaged': return 'text-green-400';
      case 'moderately_engaged': return 'text-yellow-400';
      case 'low_engagement': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEngagementLabel = (level: string) => {
    switch (level) {
      case 'highly_engaged': return 'Meeting Legends';
      case 'moderately_engaged': return 'Casual Survivors';
      case 'low_engagement': return 'Quick Escapees';
      default: return level;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getDominantDevice = () => {
    const { mobile, desktop, tablet } = analytics.deviceBreakdown;
    if (mobile > desktop && mobile > tablet) return { device: 'Mobile', percentage: mobile, icon: '📱' };
    if (desktop > mobile && desktop > tablet) return { device: 'Desktop', percentage: desktop, icon: '💻' };
    return { device: 'Tablet', percentage: tablet, icon: '📲' };
  };

  const dominantDevice = getDominantDevice();

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">👥</div>
          <div>
            <h2 className="text-xl font-bold text-white">Player Analytics</h2>
            <p className="text-sm text-gray-400">User engagement & corporate comedy consumption</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Period</div>
          <div className="text-sm font-mono text-blue-400">{period}</div>
        </div>
      </div>

      {/* Key Player Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Players */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🎯</span>
            <div className="text-sm text-gray-300">Total Players</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.totalPlayers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Meeting warriors
          </div>
        </div>

        {/* New Players Today */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🆕</span>
            <div className="text-sm text-gray-300">New Today</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.newPlayersToday.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Fresh victims
          </div>
        </div>

        {/* Returning Players */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 p-4 rounded-lg border border-orange-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔄</span>
            <div className="text-sm text-gray-300">Returning</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.returningPlayers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Gluttons for punishment
          </div>
        </div>

        {/* Average Session */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 p-4 rounded-lg border border-yellow-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">⏱️</span>
            <div className="text-sm text-gray-300">Avg Session</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.averageSessionDuration.toFixed(1)}m
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.averageSessionDuration > 30 ? 'Marathon survivors' :
             analytics.averageSessionDuration > 15 ? 'Decent endurance' :
             'Quick escapes'}
          </div>
        </div>
      </div>

      {/* Player Engagement Breakdown */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Meeting Survival Categories</h3>
        
        <div className="space-y-3">
          {Object.entries(analytics.playerEngagement).map(([level, percentage]) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm">
                  {level === 'highly_engaged' ? '🏆' :
                   level === 'moderately_engaged' ? '🎖️' : '🏃‍♂️'}
                </span>
                <span className="text-sm text-gray-300">{getEngagementLabel(level)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      level === 'highly_engaged' ? 'bg-green-500' :
                      level === 'moderately_engaged' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getEngagementColor(level)}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          • Meeting Legends: 80%+ session completion
          <br />
          • Casual Survivors: 40-80% completion
          <br />
          • Quick Escapees: &lt;40% completion
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Device Usage */}
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-4 rounded-lg border border-indigo-500/20">
          <h3 className="text-sm font-medium text-white mb-3">Device Preferences</h3>
          
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-3xl mb-2">{dominantDevice.icon}</div>
              <div className="text-lg font-bold text-white">{dominantDevice.device}</div>
              <div className="text-sm text-gray-400">{dominantDevice.percentage}% dominant</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">📱 Mobile</span>
              <span className="text-sm font-medium text-white">{analytics.deviceBreakdown.mobile}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">💻 Desktop</span>
              <span className="text-sm font-medium text-white">{analytics.deviceBreakdown.desktop}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">📲 Tablet</span>
              <span className="text-sm font-medium text-white">{analytics.deviceBreakdown.tablet}%</span>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 p-4 rounded-lg border border-teal-500/20">
          <h3 className="text-sm font-medium text-white mb-3">Global Reach</h3>
          
          <div className="space-y-3">
            {analytics.geographicDistribution.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🌍'}
                  </span>
                  <span className="text-sm text-gray-300">{region.region}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(region.percentage / 50) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-white w-12 text-right">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Player Actions */}
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Most Popular Actions</h3>
        
        <div className="space-y-3">
          {analytics.topPlayerActions.map((action, index) => (
            <div key={action.action} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                <span className="text-sm text-gray-300">{action.action}</span>
                <span className="text-sm">{getTrendIcon(action.trend)}</span>
              </div>
              <div className="text-sm font-medium text-white">
                {action.count.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics */}
      {showAdvanced && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Player Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Retention Analysis */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Retention Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Return Rate:</span>
                  <span className="text-white">
                    {((analytics.returningPlayers / analytics.totalPlayers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New vs Returning:</span>
                  <span className="text-white">
                    {(analytics.newPlayersToday / analytics.returningPlayers).toFixed(1)}:1
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {analytics.returningPlayers > analytics.newPlayersToday * 2 
                    ? "Strong retention - players love the corporate pain!"
                    : analytics.returningPlayers > analytics.newPlayersToday 
                    ? "Healthy retention - balanced growth"
                    : "High acquisition - focus on engagement"}
                </div>
              </div>
            </div>

            {/* Behavioral Patterns */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Behavioral Patterns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Actions/Session:</span>
                  <span className="text-white">
                    {(analytics.topPlayerActions.reduce((sum, action) => sum + action.count, 0) / analytics.totalPlayers).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement Score:</span>
                  <span className="text-white">
                    {(analytics.playerEngagement.highly_engaged * 2 + analytics.playerEngagement.moderately_engaged).toFixed(0)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Higher engagement = more meeting survival skills developed
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Insights Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 rounded-lg border border-gray-600/30">
        <div className="text-center">
          <div className="text-lg font-bold text-white mb-2">
            Corporate Comedy Consumption Status
          </div>
          <div className="text-sm text-gray-300">
            {analytics.totalPlayers.toLocaleString()} brave souls are actively battling corporate buzzwords
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Average meeting endurance: {analytics.averageSessionDuration.toFixed(1)} minutes
          </div>
        </div>
      </div>
    </div>
  );
}