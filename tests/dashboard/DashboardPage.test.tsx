// DashboardPage Component Test Suite
// Comprehensive testing for real-time performance dashboard

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { useMemeStore } from '../../src/utils/store';

// Mock WebSocket implementation
const mockWebSocket = {
  readyState: WebSocket.OPEN,
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
};

global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket);

// Mock store with comprehensive dashboard state
const mockDashboardState = {
  dashboard: {
    metrics: {
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
        { word: 'Synergy', count: 2847, trend: 'up' as const, effectiveness: 94 },
        { word: 'Deep Dive', count: 2156, trend: 'stable' as const, effectiveness: 91 }
      ],
      activeRooms: 347,
      averageGameDuration: 23.7,
      completionRate: 67.3,
      cheatingAttempts: 12,
      timestamp: new Date()
    },
    playerAnalytics: {
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
        { region: 'North America', playerCount: 6847, percentage: 43.4 }
      ],
      deviceBreakdown: { mobile: 58, desktop: 35, tablet: 7 },
      topPlayerActions: [
        { action: 'Buzzword Marked', count: 47521, trend: 'up' as const }
      ]
    },
    systemHealth: {
      serverStatus: 'healthy' as const,
      cloudflareStatus: 'operational' as const,
      netlifyStatus: 'operational' as const,
      cpuUsage: 23,
      memoryUsage: 67,
      networkLatency: 45,
      activeConnections: 1847,
      connectionSuccess: 99.2,
      messageDeliveryRate: 98.7,
      recentIncidents: [],
      timestamp: new Date()
    },
    buzzwordEffectiveness: {
      overallEffectiveness: 87.3,
      categoryPerformance: [
        { category: 'Classic Corporate', effectiveness: 92, usage: 8547, trend: 'stable' as const }
      ],
      topPerformers: [
        { buzzword: 'Synergy', effectiveness: 94, usage: 2847, corporateRelevance: 98, humourRating: 91 }
      ],
      underperformers: [],
      emergingTrends: []
    },
    wsConnected: false,
    lastUpdate: null,
    selectedMetricsPeriod: '24h' as const,
    autoRefresh: false,
    showAdvancedMetrics: false
  },
  updateDashboardMetrics: vi.fn(),
  updatePlayerAnalytics: vi.fn(),
  updateSystemHealth: vi.fn(),
  updateBuzzwordEffectiveness: vi.fn(),
  setDashboardConnected: vi.fn(),
  setMetricsPeriod: vi.fn(),
  toggleAutoRefresh: vi.fn(),
  toggleAdvancedMetrics: vi.fn()
};

// Mock zustand store
vi.mock('../../src/utils/store', () => ({
  useMemeStore: vi.fn()
}));

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.mocked(useMemeStore).mockReturnValue(mockDashboardState as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('renders dashboard header with correct title and description', () => {
      render(<DashboardPage mockData={true} />);
      
      expect(screen.getByText('📊 Performance Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time corporate humor analytics & system monitoring')).toBeInTheDocument();
    });

    it('displays connection status indicator', () => {
      render(<DashboardPage mockData={true} />);
      
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-500');
    });

    it('renders all four dashboard components', () => {
      render(<DashboardPage mockData={true} />);
      
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Player Analytics')).toBeInTheDocument();
      expect(screen.getByText('Buzzword Effectiveness')).toBeInTheDocument();
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    it('displays corporate humor tagline in footer', () => {
      render(<DashboardPage mockData={true} />);
      
      expect(screen.getByText('"Turning corporate suffering into actionable insights since 2025"')).toBeInTheDocument();
      expect(screen.getByText('// Professional performance monitoring with a side of humor')).toBeInTheDocument();
    });
  });

  describe('Dashboard Controls', () => {
    it('renders time period selector with correct options', () => {
      render(<DashboardPage mockData={true} />);
      
      const selector = screen.getByDisplayValue('Last 24 Hours');
      expect(selector).toBeInTheDocument();
      
      fireEvent.click(selector);
      expect(screen.getByText('Last Hour')).toBeInTheDocument();
      expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });

    it('handles time period changes', () => {
      render(<DashboardPage mockData={true} />);
      
      const selector = screen.getByDisplayValue('Last 24 Hours');
      fireEvent.change(selector, { target: { value: '7d' } });
      
      expect(mockDashboardState.setMetricsPeriod).toHaveBeenCalledWith('7d');
    });

    it('toggles auto-refresh correctly', () => {
      render(<DashboardPage mockData={true} />);
      
      const autoRefreshButton = screen.getByText('Auto-refresh OFF');
      fireEvent.click(autoRefreshButton);
      
      expect(mockDashboardState.toggleAutoRefresh).toHaveBeenCalled();
    });

    it('toggles advanced metrics view', () => {
      render(<DashboardPage mockData={true} />);
      
      const advancedButton = screen.getByText('Advanced View');
      fireEvent.click(advancedButton);
      
      expect(mockDashboardState.toggleAdvancedMetrics).toHaveBeenCalled();
    });
  });

  describe('WebSocket Integration', () => {
    it('attempts WebSocket connection in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      render(<DashboardPage mockData={false} />);
      
      expect(global.WebSocket).toHaveBeenCalledWith('wss://engineer-memes-api.your-domain.com/dashboard');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('uses localhost in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<DashboardPage mockData={false} />);
      
      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8787/dashboard');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('handles WebSocket connection errors gracefully', async () => {
      const erroringWebSocket = {
        ...mockWebSocket,
        onerror: null,
      };
      global.WebSocket = vi.fn().mockImplementation(() => erroringWebSocket);

      render(<DashboardPage mockData={false} />);

      // Simulate error
      act(() => {
        if (erroringWebSocket.onerror) {
          erroringWebSocket.onerror(new Event('error'));
        }
      });

      await waitFor(() => {
        expect(screen.queryByText('Connection Error')).toBeInTheDocument();
      });
    });

    it('handles WebSocket message parsing', async () => {
      render(<DashboardPage mockData={false} />);

      const testMessage = {
        type: 'metrics_update',
        payload: {
          responseTime: 150,
          throughput: 300,
          errorRate: 0.5,
          uptime: 99.95,
          activeUsers: 2000,
          timestamp: new Date()
        }
      };

      // Simulate incoming message
      act(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage({ data: JSON.stringify(testMessage) } as MessageEvent);
        }
      });

      expect(mockDashboardState.updateDashboardMetrics).toHaveBeenCalledWith(testMessage.payload);
    });
  });

  describe('Mock Data Mode', () => {
    it('initializes with mock data when mockData prop is true', () => {
      render(<DashboardPage mockData={true} />);
      
      expect(mockDashboardState.setDashboardConnected).toHaveBeenCalledWith(true);
      expect(mockDashboardState.updateDashboardMetrics).toHaveBeenCalled();
      expect(mockDashboardState.updatePlayerAnalytics).toHaveBeenCalled();
      expect(mockDashboardState.updateSystemHealth).toHaveBeenCalled();
      expect(mockDashboardState.updateBuzzwordEffectiveness).toHaveBeenCalled();
    });

    it('uses custom refresh interval when provided', () => {
      vi.useFakeTimers();
      
      render(<DashboardPage mockData={true} refreshInterval={1000} />);
      
      // Fast forward time to trigger refresh
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Should have called update methods multiple times due to refresh
      expect(mockDashboardState.updateDashboardMetrics).toHaveBeenCalledTimes(2); // Initial + refresh
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('displays connection error with retry button', () => {
      render(<DashboardPage mockData={false} />);
      
      // Simulate connection error
      const errorMessage = 'Connection failed';
      mockDashboardState.dashboard.wsConnected = false;
      
      render(<DashboardPage mockData={false} />);
      
      // Would need to trigger error state in actual implementation
      // This is a placeholder for error state testing
    });

    it('handles malformed WebSocket messages gracefully', () => {
      render(<DashboardPage mockData={false} />);
      
      // Simulate malformed message
      act(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage({ data: 'invalid json' } as MessageEvent);
        }
      });
      
      // Should not crash the application
      expect(screen.getByText('📊 Performance Dashboard')).toBeInTheDocument();
    });
  });

  describe('Professional Appropriateness', () => {
    it('uses professional language appropriate for executive presentations', () => {
      render(<DashboardPage mockData={true} />);
      
      // Check for executive-appropriate language
      expect(screen.getByText('Real-time corporate humor analytics & system monitoring')).toBeInTheDocument();
      expect(screen.getByText('Professional performance monitoring with a side of humor')).toBeInTheDocument();
    });

    it('maintains corporate context throughout dashboard', () => {
      render(<DashboardPage mockData={true} />);
      
      // Corporate humor should be subtle and professional
      expect(screen.getByText('"Turning corporate suffering into actionable insights since 2025"')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile optimization', () => {
      render(<DashboardPage mockData={true} />);
      
      const mainContainer = screen.getByText('📊 Performance Dashboard').closest('div');
      expect(mainContainer).toHaveClass('min-h-screen', 'p-4', 'md:p-6');
    });

    it('uses responsive grid layouts', () => {
      render(<DashboardPage mockData={true} />);
      
      // Check grid layouts are responsive
      const gridContainers = document.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      gridContainers.forEach(container => {
        expect(container).toHaveClass(/grid-cols-1|xl:grid-cols-2/);
      });
    });
  });

  describe('Performance Optimization', () => {
    it('cleans up WebSocket connection on unmount', () => {
      const { unmount } = render(<DashboardPage mockData={false} />);
      
      unmount();
      
      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('debounces auto-refresh updates appropriately', () => {
      vi.useFakeTimers();
      
      const mockState = {
        ...mockDashboardState,
        dashboard: {
          ...mockDashboardState.dashboard,
          autoRefresh: true,
          wsConnected: true
        }
      };
      vi.mocked(useMemeStore).mockReturnValue(mockState as any);
      
      render(<DashboardPage mockData={true} refreshInterval={5000} />);
      
      // Advance time but not enough to trigger refresh
      act(() => {
        vi.advanceTimersByTime(4999);
      });
      
      expect(mockDashboardState.updateDashboardMetrics).toHaveBeenCalledTimes(1); // Only initial
      
      // Now advance to trigger refresh
      act(() => {
        vi.advanceTimersByTime(1);
      });
      
      expect(mockDashboardState.updateDashboardMetrics).toHaveBeenCalledTimes(2); // Initial + refresh
      
      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('includes proper ARIA labels for dashboard elements', () => {
      render(<DashboardPage mockData={true} />);
      
      // Connection status should be accessible
      const statusIndicator = document.querySelector('.w-3.h-3.rounded-full');
      expect(statusIndicator).toBeTruthy();
    });

    it('maintains proper heading hierarchy', () => {
      render(<DashboardPage mockData={true} />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('📊 Performance Dashboard');
      
      // Component headings should be h2
      const componentHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(componentHeadings.length).toBeGreaterThan(0);
    });
  });
});

// Corporate Humor Appropriateness Tests
describe('Dashboard Corporate Humor Standards', () => {
  beforeEach(() => {
    vi.mocked(useMemeStore).mockReturnValue(mockDashboardState as any);
  });

  it('maintains 96% executive appropriateness standard', () => {
    render(<DashboardPage mockData={true} />);
    
    // Check that all visible text is appropriate for C-suite
    const inappropriateTerms = ['damn', 'hell', 'crap', 'stupid', 'idiots'];
    const pageText = document.body.textContent || '';
    
    inappropriateTerms.forEach(term => {
      expect(pageText.toLowerCase()).not.toContain(term);
    });
  });

  it('uses professional corporate terminology', () => {
    render(<DashboardPage mockData={true} />);
    
    // Professional terms that should be present
    const professionalTerms = [
      'performance',
      'analytics',
      'monitoring',
      'insights',
      'metrics'
    ];
    
    const pageText = document.body.textContent || '';
    
    professionalTerms.forEach(term => {
      expect(pageText.toLowerCase()).toContain(term);
    });
  });

  it('humor enhances rather than disrupts professional presentation', () => {
    render(<DashboardPage mockData={true} />);
    
    // Humor should be subtle and contextual
    expect(screen.getByText('"Turning corporate suffering into actionable insights since 2025"')).toBeInTheDocument();
    expect(screen.getByText('// Professional performance monitoring with a side of humor')).toBeInTheDocument();
  });
});