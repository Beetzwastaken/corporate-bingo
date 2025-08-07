// Engineering Meme Generator - TypeScript Type Definitions
// MCP-Enhanced with autonomous agent support

export type EngineeringCategory = 'mechanical' | 'electrical' | 'software' | 'civil' | 'chemical' | 'general';

export type PainLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TextArea {
  id: string;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  width: number; // Percentage width (0-100)
  height: number; // Percentage height (0-100)
  fontSize: number; // Base font size in pixels
  fontColor: string; // Hex color for text
  strokeColor: string; // Hex color for text stroke
  strokeWidth: number; // Stroke width in pixels
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  placeholder: string; // Default text to display
  maxLength: number; // Maximum character limit
  fontFamily?: string; // Optional font family override
  fontWeight?: 'normal' | 'bold' | 'bolder';
}

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  category: EngineeringCategory;
  textAreas: TextArea[];
  triggers: string[]; // Keywords that suggest this template
  painLevel: PainLevel; // Base pain level for this template
  svgContent?: string; // SVG content if generated dynamically
  imageUrl?: string; // Fallback image URL for static templates
  tags: string[]; // Additional tags for better categorization
  popularity: number; // Usage popularity score (0-100)
  createdBy: 'user' | 'agent' | 'system'; // Who created this template
  createdAt: Date;
  lastUsed?: Date;
}

export interface GeneratedMeme {
  id: string;
  templateId: string;
  texts: { [textAreaId: string]: string };
  painScore: PainLevel;
  timestamp: Date;
  category: EngineeringCategory;
  imageDataUrl?: string; // Generated meme as base64 data URL
  svgContent?: string; // Generated meme as SVG content
  metadata: {
    userInput: string; // Original user pain input
    suggestedBy: 'user' | 'agent'; // How this template was selected
    generationTime: number; // Time taken to generate in milliseconds
    quality: number; // Quality score from OpenCV validation (0-100)
  };
}

export interface PainAnalysis {
  score: PainLevel;
  keywords: string[];
  category: EngineeringCategory;
  confidence: number; // Confidence in the analysis (0-100)
  suggestedTemplate?: string; // Suggested template ID
  reasons: string[]; // Why this score was assigned
}

export interface EngineeringKeyword {
  word: string;
  category: EngineeringCategory;
  painWeight: number; // How much pain this keyword adds (-5 to +5)
  context?: string; // Optional context where this keyword applies
}

// MCP Server Integration Types
export interface SVGMakerRequest {
  prompt: string;
  style: 'meme' | 'professional' | 'cartoon';
  size: '600x600' | '800x800' | '1024x1024';
  background: 'transparent' | 'white' | 'auto';
}

export interface OpenCVAnalysis {
  textRegions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  qualityScore: number;
  suggestions: string[];
}

export interface AnalyticsData {
  totalMemes: number;
  averagePainLevel: number;
  popularCategories: { category: EngineeringCategory; count: number }[];
  popularTemplates: { templateId: string; usage: number }[];
  painTrends: { date: string; averagePain: number }[];
  topKeywords: { keyword: string; frequency: number }[];
}

// Autonomous Agent Types
export interface AgentConfig {
  id: string;
  name: string;
  type: 'template-generator' | 'pain-analyzer' | 'quality-controller' | 'analytics' | 'deployment';
  autonomyLevel: number; // 0-100, how autonomous this agent is
  active: boolean;
  lastRun?: Date;
  successRate: number; // Success rate percentage
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: unknown;
  output?: unknown;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

// Store Types for Zustand
export interface MemeStore {
  // Current meme state
  selectedTemplate: MemeTemplate | null;
  currentTexts: { [textAreaId: string]: string };
  painScore: PainLevel;
  userInput: string;
  generatedMemeUrl: string;
  
  // Template library
  templates: MemeTemplate[];
  filteredTemplates: MemeTemplate[];
  selectedCategory: EngineeringCategory | 'all';
  
  // Generated memes
  generatedMemes: GeneratedMeme[];
  
  // Analytics
  analytics: AnalyticsData | null;
  
  // Agent system
  agents: AgentConfig[];
  activeTasks: AgentTask[];
  
  // Dashboard state
  dashboard: DashboardState;
  
  // Actions
  setSelectedTemplate: (template: MemeTemplate) => void;
  updateText: (areaId: string, text: string) => void;
  setPainScore: (score: PainLevel) => void;
  setUserInput: (input: string) => void;
  setGeneratedMemeUrl: (url: string) => void;
  addGeneratedMeme: (meme: GeneratedMeme) => void;
  filterTemplates: (category: EngineeringCategory | 'all') => void;
  updateAnalytics: (analytics: AnalyticsData) => void;
  addTemplate: (template: MemeTemplate) => void;
  removeTemplate: (templateId: string) => void;
  updateAgent: (agentId: string, updates: Partial<AgentConfig>) => void;
  addTask: (task: AgentTask) => void;
  updateTask: (taskId: string, updates: Partial<AgentTask>) => void;
  updateAnalyticsFromMeme: (meme: GeneratedMeme) => void;
  initializeDefaultTemplates: () => Promise<void>;
  
  // Dashboard actions
  updateDashboardMetrics: (metrics: DashboardMetrics) => void;
  updatePlayerAnalytics: (analytics: PlayerAnalyticsData) => void;
  updateSystemHealth: (health: SystemHealthData) => void;
  updateBuzzwordEffectiveness: (effectiveness: BuzzwordEffectivenessData) => void;
  setDashboardConnected: (connected: boolean) => void;
  setMetricsPeriod: (period: '1h' | '24h' | '7d' | '30d') => void;
  toggleAutoRefresh: () => void;
  toggleAdvancedMetrics: () => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Event Types for Agent Communication
export interface AgentEvent {
  type: 'template-generated' | 'pain-analyzed' | 'quality-checked' | 'analytics-updated' | 'deployment-completed';
  agentId: string;
  data: unknown;
  timestamp: Date;
}

// Real-Time Dashboard Types
export interface DashboardMetrics {
  // Performance Metrics
  responseTime: number; // Average response time in ms
  throughput: number; // Requests per second
  errorRate: number; // Error percentage
  uptime: number; // Uptime percentage
  activeUsers: number; // Current active users
  peakConcurrentUsers: number; // Peak concurrent users today
  
  // Buzzword & Content Metrics
  totalBuzzwordsTriggered: number; // Total buzzwords triggered across all games
  buzzwordVelocity: number; // Buzzwords triggered per minute
  averageMeetingSurvivalRate: number; // Percentage of completed bingo games
  topBuzzwords: Array<{
    word: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    effectiveness: number; // 0-100 score
  }>;
  
  // Game Performance
  activeRooms: number; // Current active bingo rooms
  averageGameDuration: number; // Average game duration in minutes
  completionRate: number; // Percentage of games completed
  cheatingAttempts: number; // Anti-cheat detections
  
  timestamp: Date;
}

export interface PlayerAnalyticsData {
  totalPlayers: number;
  newPlayersToday: number;
  returningPlayers: number;
  averageSessionDuration: number; // in minutes
  playerEngagement: {
    highly_engaged: number; // 80%+ session completion
    moderately_engaged: number; // 40-80% session completion  
    low_engagement: number; // <40% session completion
  };
  geographicDistribution: Array<{
    region: string;
    playerCount: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topPlayerActions: Array<{
    action: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface SystemHealthData {
  // Infrastructure Health
  serverStatus: 'healthy' | 'warning' | 'critical';
  cloudflareStatus: 'operational' | 'degraded' | 'major_outage';
  netlifyStatus: 'operational' | 'degraded' | 'major_outage';
  
  // Performance Indicators
  cpuUsage: number; // 0-100 percentage
  memoryUsage: number; // 0-100 percentage
  networkLatency: number; // in milliseconds
  
  // WebSocket Health
  activeConnections: number;
  connectionSuccess: number; // 0-100 percentage
  messageDeliveryRate: number; // 0-100 percentage
  
  // Recent Incidents
  recentIncidents: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: Date;
    resolved: boolean;
  }>;
  
  timestamp: Date;
}

export interface BuzzwordEffectivenessData {
  overallEffectiveness: number; // 0-100 score
  categoryPerformance: Array<{
    category: string;
    effectiveness: number;
    usage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topPerformers: Array<{
    buzzword: string;
    effectiveness: number;
    usage: number;
    corporateRelevance: number; // How well it fits corporate culture
    humourRating: number; // Community humor rating
  }>;
  underperformers: Array<{
    buzzword: string;
    effectiveness: number;
    reasons: string[];
    suggestions: string[];
  }>;
  emergingTrends: Array<{
    buzzword: string;
    growthRate: number;
    potential: number;
  }>;
}

// WebSocket Message Types
export interface DashboardWebSocketMessage {
  type: 'metrics_update' | 'player_analytics_update' | 'system_health_update' | 'buzzword_effectiveness_update';
  payload: DashboardMetrics | PlayerAnalyticsData | SystemHealthData | BuzzwordEffectivenessData;
  timestamp: Date;
}

// Dashboard Store Extension
export interface DashboardState {
  // Real-time data
  metrics: DashboardMetrics | null;
  playerAnalytics: PlayerAnalyticsData | null;
  systemHealth: SystemHealthData | null;
  buzzwordEffectiveness: BuzzwordEffectivenessData | null;
  
  // Connection state
  wsConnected: boolean;
  lastUpdate: Date | null;
  
  // UI state
  selectedMetricsPeriod: '1h' | '24h' | '7d' | '30d';
  autoRefresh: boolean;
  showAdvancedMetrics: boolean;
}

// Bingo Game Types
export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface BingoRoom {
  id: string;
  name: string;
  code: string;
  players: number;
  isActive: boolean;
}

export interface BingoPlayer {
  id: string;
  name: string;
  board: BingoSquare[];
  score: number;
  isHost?: boolean;
}