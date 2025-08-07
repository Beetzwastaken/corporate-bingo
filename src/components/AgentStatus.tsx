// AgentStatus Component - Autonomous Agent Monitoring Display
// Shows real-time status of MCP-powered autonomous agents

import React, { useState } from 'react';
import type { AgentConfig } from '../types';

interface AgentStatusProps {
  agents: AgentConfig[];
  className?: string;
}

export const AgentStatus: React.FC<AgentStatusProps> = ({ agents, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (agent: AgentConfig): string => {
    if (!agent.active) return 'bg-gray-500';
    if (agent.successRate >= 95) return 'bg-green-500';
    if (agent.successRate >= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (agent: AgentConfig): string => {
    if (!agent.active) return 'Inactive';
    if (agent.successRate >= 95) return 'Excellent';
    if (agent.successRate >= 90) return 'Good';
    return 'Issues';
  };

  const getAutonomyDescription = (level: number): string => {
    if (level >= 95) return 'Fully Autonomous';
    if (level >= 90) return 'High Autonomy';
    if (level >= 70) return 'Moderate Autonomy';
    return 'Supervised';
  };

  const getAgentIcon = (type: string): string => {
    const icons = {
      'template-generator': '🎨',
      'pain-analyzer': '🧠',
      'quality-controller': '🔍',
      'analytics': '📊',
      'deployment': '🚀'
    };
    return icons[type as keyof typeof icons] || '🤖';
  };

  const activeAgents = agents.filter(a => a.active);
  const averageSuccess = agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length;

  return (
    <div className={`${className}`}>
      {/* Compact Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Overall Status */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                activeAgents.length === agents.length ? 'bg-green-500' : 
                activeAgents.length > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Autonomous Agents
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {activeAgents.length}/{agents.length} Active
            </span>
          </div>

          {/* Agent Icons */}
          <div className="flex items-center space-x-1">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className={`relative group`}
                title={`${agent.name}: ${getStatusText(agent)} (${agent.successRate.toFixed(1)}%)`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  agent.active ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {getAgentIcon(agent.type)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agent)}`} />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {agent.name}: {getStatusText(agent)}
                </div>
              </div>
            ))}
          </div>

          {/* Success Rate */}
          <div className="text-sm text-gray-600">
            Avg Success: {averageSuccess.toFixed(1)}%
          </div>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          <span className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Detailed Status (Expandable) */}
      {showDetails && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-3">
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getAgentIcon(agent.type)}</span>
                    <h4 className="font-medium text-gray-800">{agent.name}</h4>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {agent.active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Agent Metrics */}
                <div className="space-y-2">
                  {/* Success Rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{agent.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(agent)}`}
                        style={{ width: `${agent.successRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Autonomy Level */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Autonomy</span>
                      <span className="font-medium">{agent.autonomyLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${agent.autonomyLevel}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getAutonomyDescription(agent.autonomyLevel)}
                    </p>
                  </div>

                  {/* Last Run */}
                  {agent.lastRun && (
                    <div className="text-xs text-gray-500">
                      Last run: {new Date(agent.lastRun).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Agent Controls */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => {
                      // Toggle agent active status
                      agent.active = !agent.active;
                    }}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      agent.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {agent.active ? 'Pause' : 'Activate'}
                  </button>
                  <button className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                    Logs
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* System-wide Agent Settings */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">System Settings</h4>
                <p className="text-sm text-gray-600">Configure autonomous agent behavior</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    defaultChecked 
                  />
                  <span>Auto-restart failed agents</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    defaultChecked 
                  />
                  <span>Learning mode</span>
                </label>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{activeAgents.length}</p>
              <p className="text-xs text-blue-800">Active Agents</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{averageSuccess.toFixed(0)}%</p>
              <p className="text-xs text-green-800">Avg Success</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">
                {agents.reduce((sum, a) => sum + a.autonomyLevel, 0) / agents.length}%
              </p>
              <p className="text-xs text-purple-800">Avg Autonomy</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">24/7</p>
              <p className="text-xs text-orange-800">Monitoring</p>
            </div>
          </div>

          {/* Agent Descriptions */}
          <div className="mt-4 space-y-2">
            <h5 className="font-medium text-gray-800">Agent Capabilities</h5>
            {agents.map(agent => (
              <div key={agent.id} className="text-xs text-gray-600">
                <span className="font-medium">{getAgentIcon(agent.type)} {agent.name}:</span>
                <span className="ml-2">
                  {agent.type === 'template-generator' && 'Creates new meme templates using SVGMaker MCP'}
                  {agent.type === 'pain-analyzer' && 'Analyzes engineering pain levels with advanced NLP'}
                  {agent.type === 'quality-controller' && 'Validates meme quality using OpenCV MCP'}
                  {agent.type === 'analytics' && 'Tracks usage patterns with Excel VBA MCP'}
                  {agent.type === 'deployment' && 'Manages deployments with Puppeteer MCP'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};