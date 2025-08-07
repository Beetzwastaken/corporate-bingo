// System Health Component
// Real-time infrastructure monitoring with professional corporate presentation

import type { SystemHealthData } from '../../types';

interface SystemHealthProps {
  health: SystemHealthData | null;
  showAdvanced: boolean;
}

export function SystemHealth({ health, showAdvanced }: SystemHealthProps) {
  if (!health) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-600 rounded"></div>
          <div className="h-6 bg-gray-600 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-6 bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return '✅';
      case 'warning':
      case 'degraded':
        return '⚠️';
      case 'critical':
      case 'major_outage':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
      case 'major_outage':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 75) return 'bg-yellow-500';
    if (usage < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLatencyStatus = () => {
    if (health.networkLatency < 50) return { color: 'text-green-400', status: 'Lightning Fast' };
    if (health.networkLatency < 100) return { color: 'text-yellow-400', status: 'Speedy' };
    if (health.networkLatency < 200) return { color: 'text-orange-400', status: 'Acceptable' };
    return { color: 'text-red-400', status: 'Sluggish' };
  };

  const latencyStatus = getLatencyStatus();

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏥</div>
          <div>
            <h2 className="text-xl font-bold text-white">System Health</h2>
            <p className="text-sm text-gray-400">Infrastructure & service monitoring</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Status</div>
          <div className={`text-sm font-medium ${getStatusColor(health.serverStatus)}`}>
            {getStatusIcon(health.serverStatus)} {health.serverStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <h3 className="text-sm font-medium text-white mb-3">Service Status</h3>
          <div className="space-y-3">
            {/* Server Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(health.serverStatus)}</span>
                <span className="text-sm text-gray-300">Main Server</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(health.serverStatus)}`}>
                {health.serverStatus}
              </span>
            </div>

            {/* Cloudflare Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(health.cloudflareStatus)}</span>
                <span className="text-sm text-gray-300">Cloudflare CDN</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(health.cloudflareStatus)}`}>
                {health.cloudflareStatus}
              </span>
            </div>

            {/* Netlify Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(health.netlifyStatus)}</span>
                <span className="text-sm text-gray-300">Netlify Frontend</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(health.netlifyStatus)}`}>
                {health.netlifyStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
          <h3 className="text-sm font-medium text-white mb-3">Resource Usage</h3>
          
          {/* CPU Usage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">CPU Usage</span>
              <span className="text-sm font-medium text-white">{health.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(health.cpuUsage)}`}
                style={{ width: `${health.cpuUsage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {health.cpuUsage < 50 ? 'Cruising Along' : 
               health.cpuUsage < 75 ? 'Working Hard' :
               health.cpuUsage < 90 ? 'Pushing Limits' : 'Time for Vacation'}
            </div>
          </div>

          {/* Memory Usage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Memory Usage</span>
              <span className="text-sm font-medium text-white">{health.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(health.memoryUsage)}`}
                style={{ width: `${health.memoryUsage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {health.memoryUsage < 50 ? 'Plenty of Room' : 
               health.memoryUsage < 75 ? 'Getting Cozy' :
               health.memoryUsage < 90 ? 'Feeling Cramped' : 'Memory Hoarder'}
            </div>
          </div>

          {/* Network Latency */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Network Latency</span>
              <span className={`text-sm font-medium ${latencyStatus.color}`}>
                {health.networkLatency}ms
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {latencyStatus.status}
            </div>
          </div>
        </div>

        {/* WebSocket Health */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-500/20">
          <h3 className="text-sm font-medium text-white mb-3">Real-time Communication</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Active Connections */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {health.activeConnections.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Active Connections</div>
            </div>

            {/* Connection Success */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                health.connectionSuccess > 95 ? 'text-green-400' :
                health.connectionSuccess > 90 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {health.connectionSuccess.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Success Rate</div>
            </div>

            {/* Message Delivery */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                health.messageDeliveryRate > 95 ? 'text-green-400' :
                health.messageDeliveryRate > 90 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {health.messageDeliveryRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Delivery Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      {health.recentIncidents.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-white mb-3">Recent Incidents</h3>
          <div className="space-y-2">
            {health.recentIncidents.slice(0, showAdvanced ? 5 : 3).map((incident) => (
              <div 
                key={incident.id} 
                className={`p-3 rounded-lg border ${
                  incident.resolved 
                    ? 'bg-gray-800/30 border-gray-600/50' 
                    : 'bg-red-900/20 border-red-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {incident.severity === 'critical' ? '🚨' :
                       incident.severity === 'high' ? '⚠️' :
                       incident.severity === 'medium' ? '🟡' : '🔵'}
                    </span>
                    <span className="text-sm font-medium text-white">{incident.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {incident.resolved && (
                      <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                        Resolved
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {incident.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 rounded-lg border border-gray-600/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Overall System Health</div>
            <div className="text-xs text-gray-500 mt-1">
              Last updated: {health.timestamp.toLocaleTimeString()}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getStatusColor(health.serverStatus)}`}>
              {health.serverStatus === 'healthy' && health.cloudflareStatus === 'operational' && health.netlifyStatus === 'operational' 
                ? '💪 All Systems Go' 
                : '🔧 Needs Attention'}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced System Details */}
      {showAdvanced && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">System Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Infrastructure</div>
              <div className="space-y-1 text-xs text-gray-300">
                <div>• Cloudflare Workers (Serverless)</div>
                <div>• Netlify Static Hosting</div>
                <div>• Global Edge Distribution</div>
                <div>• WebSocket Real-time Sync</div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Performance Targets</div>
              <div className="space-y-1 text-xs text-gray-300">
                <div>• Response Time: &lt;200ms</div>
                <div>• Uptime: &gt;99.9%</div>
                <div>• Connection Success: &gt;95%</div>
                <div>• Message Delivery: &gt;98%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}