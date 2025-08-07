// Performance Metrics Component
// Real-time performance visualization with corporate humor context

import { useMemo } from 'react';
import type { DashboardMetrics } from '../../types';

interface PerformanceMetricsProps {
  metrics: DashboardMetrics | null;
  period: '1h' | '24h' | '7d' | '30d';
  showAdvanced: boolean;
}

export function PerformanceMetrics({ metrics, period, showAdvanced }: PerformanceMetricsProps) {
  // Generate mock historical data for charts
  const chartData = useMemo(() => {
    if (!metrics) return [];
    
    const points = period === '1h' ? 60 : period === '24h' ? 24 : period === '7d' ? 7 : 30;
    return Array.from({ length: points }, (_, i) => ({
      time: i,
      responseTime: metrics.responseTime + Math.random() * 50 - 25,
      throughput: metrics.throughput + Math.random() * 100 - 50,
      activeUsers: Math.max(0, metrics.activeUsers + Math.random() * 200 - 100)
    }));
  }, [metrics, period]);

  if (!metrics) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-600 rounded"></div>
          <div className="h-6 bg-gray-600 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

  const getResponseTimeStatus = () => {
    if (metrics.responseTime < 100) return { color: 'text-green-400', icon: '🚀', status: 'Blazing Fast' };
    if (metrics.responseTime < 200) return { color: 'text-yellow-400', icon: '⚡', status: 'Good' };
    if (metrics.responseTime < 500) return { color: 'text-orange-400', icon: '⚠️', status: 'Sluggish' };
    return { color: 'text-red-400', icon: '🐌', status: 'Needs Coffee' };
  };

  const getUptimeStatus = () => {
    if (metrics.uptime >= 99.9) return { color: 'text-green-400', icon: '💪', status: 'Rock Solid' };
    if (metrics.uptime >= 99.5) return { color: 'text-yellow-400', icon: '👍', status: 'Reliable' };
    if (metrics.uptime >= 99.0) return { color: 'text-orange-400', icon: '😅', status: 'Mostly Up' };
    return { color: 'text-red-400', icon: '🔥', status: 'On Fire' };
  };

  const responseTimeStatus = getResponseTimeStatus();
  const uptimeStatus = getUptimeStatus();

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📈</div>
          <div>
            <h2 className="text-xl font-bold text-white">Performance Metrics</h2>
            <p className="text-sm text-gray-400">System performance & meeting survival rates</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Updated</div>
          <div className="text-sm font-mono text-green-400">
            {metrics.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Response Time */}
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{responseTimeStatus.icon}</span>
            <div className="text-sm text-gray-400">Response Time</div>
          </div>
          <div className={`text-2xl font-bold ${responseTimeStatus.color}`}>
            {metrics.responseTime}ms
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {responseTimeStatus.status}
          </div>
        </div>

        {/* Throughput */}
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔄</span>
            <div className="text-sm text-gray-400">Throughput</div>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.throughput}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            req/sec
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{uptimeStatus.icon}</span>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className={`text-2xl font-bold ${uptimeStatus.color}`}>
            {metrics.uptime.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {uptimeStatus.status}
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">
              {metrics.errorRate < 1 ? '✅' : metrics.errorRate < 5 ? '⚠️' : '🚨'}
            </span>
            <div className="text-sm text-gray-400">Error Rate</div>
          </div>
          <div className={`text-2xl font-bold ${
            metrics.errorRate < 1 ? 'text-green-400' : 
            metrics.errorRate < 5 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {metrics.errorRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.errorRate < 1 ? 'Pristine' : metrics.errorRate < 5 ? 'Acceptable' : 'Concerning'}
          </div>
        </div>
      </div>

      {/* Corporate Humor Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Active Users */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👥</span>
              <div className="text-sm text-gray-300">Meeting Survivors</div>
            </div>
            <div className="text-xs bg-purple-600/20 px-2 py-1 rounded text-purple-300">
              Live
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-bold text-white">{metrics.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-400">current</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Peak today: {metrics.peakConcurrentUsers.toLocaleString()}
          </div>
        </div>

        {/* Meeting Survival Rate */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-lg border border-green-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🎯</span>
            <div className="text-sm text-gray-300">Meeting Survival Rate</div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-bold text-white">{metrics.averageMeetingSurvivalRate.toFixed(1)}%</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.averageMeetingSurvivalRate > 80 ? 'Legendary Endurance' :
             metrics.averageMeetingSurvivalRate > 60 ? 'Battle-Hardened' :
             'Needs More Coffee'}
          </div>
        </div>
      </div>

      {/* Buzzword Velocity */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-4 rounded-lg border border-yellow-500/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💬</span>
            <div>
              <div className="text-sm text-gray-300">Buzzword Velocity</div>
              <div className="text-xs text-gray-500">Corporate speak detection rate</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {metrics.buzzwordVelocity.toFixed(1)}/min
            </div>
            <div className="text-xs text-gray-500">
              {metrics.totalBuzzwordsTriggered.toLocaleString()} total
            </div>
          </div>
        </div>
        
        {/* Buzzword Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (metrics.buzzwordVelocity / 20) * 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {metrics.buzzwordVelocity > 15 ? 'Peak Corporate Hours' :
           metrics.buzzwordVelocity > 10 ? 'Meeting Rush' :
           metrics.buzzwordVelocity > 5 ? 'Casual Corporate' : 'Surprisingly Honest'}
        </div>
      </div>

      {/* Advanced Metrics */}
      {showAdvanced && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Metrics</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Active Rooms */}
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Active Rooms</div>
              <div className="text-xl font-bold text-white">{metrics.activeRooms}</div>
            </div>

            {/* Average Game Duration */}
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Avg Game Time</div>
              <div className="text-xl font-bold text-white">{metrics.averageGameDuration.toFixed(1)}m</div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Completion Rate</div>
              <div className="text-xl font-bold text-white">{metrics.completionRate.toFixed(1)}%</div>
            </div>

            {/* Cheating Attempts */}
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Cheat Attempts</div>
              <div className="text-xl font-bold text-red-400">{metrics.cheatingAttempts}</div>
            </div>

            {/* Top Buzzwords Preview */}
            <div className="bg-gray-800/30 p-3 rounded-lg lg:col-span-2">
              <div className="text-sm text-gray-400 mb-2">Top Buzzwords</div>
              <div className="space-y-1">
                {metrics.topBuzzwords.slice(0, 3).map((buzzword, index) => (
                  <div key={buzzword.word} className="flex items-center justify-between">
                    <span className="text-sm text-white">{index + 1}. {buzzword.word}</span>
                    <span className="text-xs text-gray-400">{buzzword.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Performance Chart */}
      <div className="mt-6">
        <div className="text-sm text-gray-400 mb-2">Response Time Trend ({period})</div>
        <div className="h-16 bg-gray-800/30 rounded-lg p-2">
          <svg viewBox="0 0 400 60" className="w-full h-full">
            <defs>
              <linearGradient id="responseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Chart Line */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={chartData.map((point, index) => 
                `${(index / (chartData.length - 1)) * 380 + 10},${60 - (point.responseTime / 300) * 40}`
              ).join(' ')}
            />
            
            {/* Chart Area */}
            <polygon
              fill="url(#responseGradient)"
              points={`10,60 ${chartData.map((point, index) => 
                `${(index / (chartData.length - 1)) * 380 + 10},${60 - (point.responseTime / 300) * 40}`
              ).join(' ')} 390,60`}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}