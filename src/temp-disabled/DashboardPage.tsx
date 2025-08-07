// Real-Time Performance Dashboard
// Corporate humor-themed analytics with professional engineering standards

import { useEffect, useState } from 'react';
import { useMemeStore } from '../utils/store';
import { PerformanceMetrics } from '../components/dashboard/PerformanceMetrics';
import { PlayerAnalytics } from '../components/dashboard/PlayerAnalytics';
import { BuzzwordEffectiveness } from '../components/dashboard/BuzzwordEffectiveness';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import type { 
  DashboardWebSocketMessage,
  DashboardMetrics,
  PlayerAnalyticsData,
  SystemHealthData,
  BuzzwordEffectivenessData
} from '../types';

interface DashboardPageProps {
  // Optional props for testing or customization
  mockData?: boolean;
  refreshInterval?: number;
}

export function DashboardPage({ mockData = false, refreshInterval = 5000 }: DashboardPageProps) {
  const {
    dashboard,
    updateDashboardMetrics,
    updatePlayerAnalytics,
    updateSystemHealth,
    updateBuzzwordEffectiveness,
    setDashboardConnected,
    setMetricsPeriod,
    toggleAutoRefresh,
    toggleAdvancedMetrics
  } = useMemeStore();

  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // WebSocket connection management
  useEffect(() => {
    if (mockData) {
      // Use mock data for development/testing
      initializeMockData();
      return;
    }

    const connectWebSocket = () => {
      try {
        // In production, this would connect to the actual backend WebSocket
        const ws = new WebSocket(process.env.NODE_ENV === 'production' 
          ? 'wss://engineer-memes-api.your-domain.com/dashboard'
          : 'ws://localhost:8787/dashboard'
        );

        ws.onopen = () => {
          console.log('Dashboard WebSocket connected');
          setDashboardConnected(true);
          setConnectionError(null);
          setRetryCount(0);
        };

        ws.onmessage = (event) => {
          try {
            const message: DashboardWebSocketMessage = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError('Connection failed');
        };

        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          setDashboardConnected(false);
          
          // Attempt to reconnect with exponential backoff
          if (retryCount < 5) {
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              connectWebSocket();
            }, retryDelay);
          } else {
            setConnectionError('Connection lost - please refresh the page');
          }
        };

        setWsConnection(ws);

      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setConnectionError('Failed to connect');
      }
    };

    connectWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [mockData, retryCount]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: DashboardWebSocketMessage) => {
    switch (message.type) {
      case 'metrics_update':
        updateDashboardMetrics(message.payload as DashboardMetrics);
        break;
      case 'player_analytics_update':
        updatePlayerAnalytics(message.payload as PlayerAnalyticsData);
        break;
      case 'system_health_update':
        updateSystemHealth(message.payload as SystemHealthData);
        break;
      case 'buzzword_effectiveness_update':
        updateBuzzwordEffectiveness(message.payload as BuzzwordEffectivenessData);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  };

  // Initialize mock data for development
  const initializeMockData = () => {
    setDashboardConnected(true);
    
    // Mock performance metrics
    updateDashboardMetrics({
      responseTime: 127,
      throughput: 245,
      errorRate: 0.3,
      uptime: 99.97,
      activeUsers: 1847,
      peakConcurrentUsers: 3421,
      totalBuzzwordsTriggered: 28475,
      buzzwordVelocity: 12.4,
      averageMeetingSurvivalRate: 78.5,
      topBuzzwords: [
        { word: 'Synergy', count: 2847, trend: 'up', effectiveness: 94 },
        { word: 'Deep Dive', count: 2156, trend: 'stable', effectiveness: 91 },
        { word: 'Circle Back', count: 1923, trend: 'up', effectiveness: 88 },
        { word: 'Low-Hanging Fruit', count: 1745, trend: 'down', effectiveness: 85 },
        { word: 'Think Outside the Box', count: 1632, trend: 'stable', effectiveness: 82 }
      ],
      activeRooms: 347,
      averageGameDuration: 23.7,
      completionRate: 67.3,
      cheatingAttempts: 12,
      timestamp: new Date()
    });

    // Mock player analytics
    updatePlayerAnalytics({
      totalPlayers: 15789,
      newPlayersToday: 432,
      returningPlayers: 1415,
      averageSessionDuration: 18.5,
      playerEngagement: {
        highly_engaged: 32,
        moderately_engaged: 45,
        low_engagement: 23
      },
      geographicDistribution: [
        { region: 'North America', playerCount: 6847, percentage: 43.4 },
        { region: 'Europe', playerCount: 4521, percentage: 28.6 },
        { region: 'Asia Pacific', playerCount: 3156, percentage: 20.0 },
        { region: 'Other', playerCount: 1265, percentage: 8.0 }
      ],
      deviceBreakdown: {
        mobile: 58,
        desktop: 35,
        tablet: 7
      },
      topPlayerActions: [
        { action: 'Buzzword Marked', count: 47521, trend: 'up' },
        { action: 'Room Joined', count: 12847, trend: 'stable' },
        { action: 'Game Completed', count: 8934, trend: 'up' },
        { action: 'Cheat Reported', count: 247, trend: 'down' }
      ]
    });

    // Mock system health
    updateSystemHealth({
      serverStatus: 'healthy',
      cloudflareStatus: 'operational',
      netlifyStatus: 'operational',
      cpuUsage: 23,
      memoryUsage: 67,
      networkLatency: 45,
      activeConnections: 1847,
      connectionSuccess: 99.2,
      messageDeliveryRate: 98.7,
      recentIncidents: [
        {
          id: 'inc-001',
          severity: 'low',
          title: 'Minor latency spike',
          description: 'Brief increase in response times during peak hours',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: true
        }
      ],
      timestamp: new Date()
    });

    // Mock buzzword effectiveness
    updateBuzzwordEffectiveness({
      overallEffectiveness: 87.3,
      categoryPerformance: [
        { category: 'Classic Corporate', effectiveness: 92, usage: 8547, trend: 'stable' },
        { category: 'Virtual Meeting', effectiveness: 89, usage: 6234, trend: 'up' },
        { category: 'Consultant Speak', effectiveness: 85, usage: 4756, trend: 'up' },
        { category: 'People & Culture', effectiveness: 81, usage: 3421, trend: 'down' },
        { category: 'Tech Buzzwords', effectiveness: 78, usage: 2987, trend: 'stable' }
      ],
      topPerformers: [
        { buzzword: 'Synergy', effectiveness: 94, usage: 2847, corporateRelevance: 98, humourRating: 91 },
        { buzzword: 'Deep Dive', effectiveness: 91, usage: 2156, corporateRelevance: 95, humourRating: 88 },
        { buzzword: 'Circle Back', effectiveness: 88, usage: 1923, corporateRelevance: 93, humourRating: 85 }
      ],
      underperformers: [
        { 
          buzzword: 'Web 3.0', 
          effectiveness: 45, 
          reasons: ['Too technical', 'Limited corporate usage', 'Generational gap'],
          suggestions: ['Replace with more universal terms', 'Add context examples']
        }
      ],
      emergingTrends: [
        { buzzword: 'AI-Driven', growthRate: 847, potential: 92 },
        { buzzword: 'Hybrid Work', growthRate: 423, potential: 88 }
      ]
    });
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!dashboard.autoRefresh || !dashboard.wsConnected) return;

    const interval = setInterval(() => {
      if (mockData) {
        // Simulate data updates for mock mode
        const now = new Date();
        updateDashboardMetrics({
          ...dashboard.metrics!,
          activeUsers: dashboard.metrics!.activeUsers + Math.floor(Math.random() * 20 - 10),
          responseTime: Math.max(50, dashboard.metrics!.responseTime + Math.floor(Math.random() * 40 - 20)),
          timestamp: now
        });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dashboard.autoRefresh, dashboard.wsConnected, mockData, refreshInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              📊 Performance Dashboard
            </h1>
            <p className="text-lg text-gray-300">
              Real-time corporate humor analytics & system monitoring
            </p>
            <div className="flex items-center space-x-4 mt-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  dashboard.wsConnected 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-400">
                  {dashboard.wsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Last Update */}
              {dashboard.lastUpdate && (
                <div className="text-sm text-gray-400">
                  Updated: {dashboard.lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-6 lg:mt-0">
            {/* Time Period Selector */}
            <select
              value={dashboard.selectedMetricsPeriod}
              onChange={(e) => setMetricsPeriod(e.target.value as '1h' | '24h' | '7d' | '30d')}
              className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Auto-refresh Toggle */}
            <button
              onClick={toggleAutoRefresh}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dashboard.autoRefresh
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Auto-refresh {dashboard.autoRefresh ? 'ON' : 'OFF'}
            </button>

            {/* Advanced Metrics Toggle */}
            <button
              onClick={toggleAdvancedMetrics}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dashboard.showAdvancedMetrics
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              Advanced View
            </button>
          </div>
        </div>

        {/* Error Display */}
        {connectionError && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <span>Connection Error: {connectionError}</span>
              <button
                onClick={() => window.location.reload()}
                className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <PerformanceMetrics 
            metrics={dashboard.metrics}
            period={dashboard.selectedMetricsPeriod}
            showAdvanced={dashboard.showAdvancedMetrics}
          />

          {/* System Health */}
          <SystemHealth 
            health={dashboard.systemHealth}
            showAdvanced={dashboard.showAdvancedMetrics}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Player Analytics */}
          <PlayerAnalytics 
            analytics={dashboard.playerAnalytics}
            period={dashboard.selectedMetricsPeriod}
            showAdvanced={dashboard.showAdvancedMetrics}
          />

          {/* Buzzword Effectiveness */}
          <BuzzwordEffectiveness 
            effectiveness={dashboard.buzzwordEffectiveness}
            period={dashboard.selectedMetricsPeriod}
            showAdvanced={dashboard.showAdvancedMetrics}
          />
        </div>

        {/* Footer with Corporate Humor */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            "Turning corporate suffering into actionable insights since 2025"
          </p>
          <p className="text-gray-500 text-xs mt-1 font-mono">
            // Professional performance monitoring with a side of humor
          </p>
        </div>
      </div>
    </div>
  );
}