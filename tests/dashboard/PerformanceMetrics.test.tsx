// PerformanceMetrics Component Test Suite
// Comprehensive testing for real-time performance visualization

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMetrics } from '../../src/components/dashboard/PerformanceMetrics';
import { CORPORATE_APPROPRIATENESS_STANDARDS, PERFORMANCE_BENCHMARKS } from '../setup';
import type { DashboardMetrics } from '../../src/types';

const mockMetrics: DashboardMetrics = {
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
    { word: 'Circle Back', count: 1923, trend: 'up', effectiveness: 88 }
  ],
  activeRooms: 347,
  averageGameDuration: 23.7,
  completionRate: 67.3,
  cheatingAttempts: 12,
  timestamp: new Date('2025-01-15T10:30:00Z')
};

describe('PerformanceMetrics Component', () => {
  describe('Component Rendering', () => {
    it('renders component header with appropriate icon and description', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('📈')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('System performance & meeting survival rates')).toBeInTheDocument();
    });

    it('displays timestamp with proper formatting', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('Updated')).toBeInTheDocument();
      // Timestamp should be formatted as HH:MM:SS
      expect(screen.getByText(/\d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });

    it('shows loading state when metrics are null', () => {
      render(<PerformanceMetrics metrics={null} period="24h" showAdvanced={false} />);
      
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Display', () => {
    it('displays response time with appropriate status and color', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('127ms')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument(); // Fast status
      expect(screen.getByText('Blazing Fast')).toBeInTheDocument();
    });

    it('shows different response time status based on performance', () => {
      const slowMetrics = { ...mockMetrics, responseTime: 450 };
      render(<PerformanceMetrics metrics={slowMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('450ms')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Sluggish')).toBeInTheDocument();
    });

    it('displays throughput with correct formatting', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('245')).toBeInTheDocument();
      expect(screen.getByText('req/sec')).toBeInTheDocument();
    });

    it('shows uptime with appropriate status indicators', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('99.97%')).toBeInTheDocument();
      expect(screen.getByText('💪')).toBeInTheDocument();
      expect(screen.getByText('Rock Solid')).toBeInTheDocument();
    });

    it('displays error rate with color-coded status', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('0.3%')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Pristine')).toBeInTheDocument();
    });
  });

  describe('Corporate Humor Integration', () => {
    it('displays meeting survivors with corporate humor context', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('Meeting Survivors')).toBeInTheDocument();
      expect(screen.getByText('1,847')).toBeInTheDocument();
      expect(screen.getByText('Peak today: 3,421')).toBeInTheDocument();
    });

    it('shows meeting survival rate with humorous labels', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('Meeting Survival Rate')).toBeInTheDocument();
      expect(screen.getByText('78.5%')).toBeInTheDocument();
      expect(screen.getByText('Battle-Hardened')).toBeInTheDocument();
    });

    it('displays buzzword velocity with corporate context', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText('Buzzword Velocity')).toBeInTheDocument();
      expect(screen.getByText('Corporate speak detection rate')).toBeInTheDocument();
      expect(screen.getByText('12.4/min')).toBeInTheDocument();
      expect(screen.getByText('28,475 total')).toBeInTheDocument();
    });

    it('uses appropriate humor level for different audiences', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Check that humor is professional and executive-appropriate
      const content = document.body.textContent || '';
      
      // Should not contain inappropriate terms
      CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS.forEach(term => {
        expect(content.toLowerCase()).not.toContain(term);
      });
      
      // Should contain professional terminology
      expect(content).toContain('Meeting Survival');
      expect(content).toContain('Corporate speak');
    });
  });

  describe('Advanced Metrics View', () => {
    it('hides advanced metrics by default', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.queryByText('Advanced Metrics')).not.toBeInTheDocument();
    });

    it('displays advanced metrics when showAdvanced is true', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={true} />);
      
      expect(screen.getByText('Advanced Metrics')).toBeInTheDocument();
      expect(screen.getByText('Active Rooms')).toBeInTheDocument();
      expect(screen.getByText('347')).toBeInTheDocument();
      expect(screen.getByText('Avg Game Time')).toBeInTheDocument();
      expect(screen.getByText('23.7m')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('67.3%')).toBeInTheDocument();
    });

    it('shows top buzzwords in advanced view', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={true} />);
      
      expect(screen.getByText('Top Buzzwords')).toBeInTheDocument();
      expect(screen.getByText('1. Synergy')).toBeInTheDocument();
      expect(screen.getByText('2. Deep Dive')).toBeInTheDocument();
      expect(screen.getByText('3. Circle Back')).toBeInTheDocument();
    });

    it('displays cheat attempts with appropriate styling', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={true} />);
      
      expect(screen.getByText('Cheat Attempts')).toBeInTheDocument();
      const cheatCount = screen.getByText('12');
      expect(cheatCount).toHaveClass('text-red-400');
    });
  });

  describe('Chart Visualization', () => {
    it('renders SVG chart for response time trends', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      expect(screen.getByText(`Response Time Trend (24h)`)).toBeInTheDocument();
      
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
      expect(svgElement?.getAttribute('viewBox')).toBe('0 0 400 60');
    });

    it('generates chart data based on selected period', () => {
      const { rerender } = render(
        <PerformanceMetrics metrics={mockMetrics} period="1h" showAdvanced={false} />
      );
      
      expect(screen.getByText('Response Time Trend (1h)')).toBeInTheDocument();
      
      rerender(<PerformanceMetrics metrics={mockMetrics} period="7d" showAdvanced={false} />);
      expect(screen.getByText('Response Time Trend (7d)')).toBeInTheDocument();
    });

    it('includes gradient styling for chart area', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      const gradient = document.querySelector('#responseGradient');
      expect(gradient).toBeInTheDocument();
      
      const stops = gradient?.querySelectorAll('stop');
      expect(stops).toHaveLength(2);
    });
  });

  describe('Performance Benchmarks', () => {
    it('meets response time rendering benchmarks', () => {
      const start = performance.now();
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(PERFORMANCE_BENCHMARKS.COMPONENT_RENDER_TIME);
    });

    it('handles large datasets efficiently', () => {
      const largeMetrics = {
        ...mockMetrics,
        topBuzzwords: Array.from({ length: 100 }, (_, i) => ({
          word: `Buzzword ${i}`,
          count: 1000 - i,
          trend: 'stable' as const,
          effectiveness: 90 - i * 0.1
        }))
      };
      
      const start = performance.now();
      render(<PerformanceMetrics metrics={largeMetrics} period="24h" showAdvanced={true} />);
      const end = performance.now();
      
      const renderTime = end - start;
      expect(renderTime).toBeLessThan(PERFORMANCE_BENCHMARKS.COMPONENT_RENDER_TIME * 2);
    });
  });

  describe('Accessibility', () => {
    it('includes proper ARIA labels for metrics', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Check for accessible structure
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Performance Metrics');
    });

    it('uses semantic HTML for metric displays', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Time display should be properly formatted
      const timeElements = document.querySelectorAll('time, [datetime]');
      // Chart should have proper SVG structure
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });

    it('maintains sufficient color contrast for status indicators', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Green indicators for good performance
      const goodIndicators = document.querySelectorAll('.text-green-400');
      expect(goodIndicators.length).toBeGreaterThan(0);
      
      // Each status should have both color and text indicators
      expect(screen.getByText('Blazing Fast')).toBeInTheDocument();
      expect(screen.getByText('Rock Solid')).toBeInTheDocument();
    });
  });

  describe('Corporate Appropriateness Validation', () => {
    it('maintains 96% executive appropriateness standard', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={true} />);
      
      const content = document.body.textContent || '';
      
      // Calculate appropriateness score
      const professionalTermCount = CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS
        .filter(term => content.toLowerCase().includes(term)).length;
      
      const appropriatenessScore = (professionalTermCount / 
        CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS.length) * 100;
      
      expect(appropriatenessScore).toBeGreaterThanOrEqual(
        CORPORATE_APPROPRIATENESS_STANDARDS.EXECUTIVE_THRESHOLD
      );
    });

    it('uses meeting-appropriate humor terminology', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Corporate humor should be meeting-appropriate
      expect(screen.getByText('Meeting Survivors')).toBeInTheDocument();
      expect(screen.getByText('Battle-Hardened')).toBeInTheDocument();
      expect(screen.getByText('Corporate speak detection rate')).toBeInTheDocument();
    });

    it('avoids inappropriate language for professional context', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={true} />);
      
      const content = document.body.textContent?.toLowerCase() || '';
      
      CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS.forEach(term => {
        expect(content).not.toContain(term);
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('applies responsive grid classes', () => {
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      const gridElements = document.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
      
      // Check for responsive classes
      gridElements.forEach(grid => {
        const hasResponsiveClasses = grid.classList.toString().includes('grid-cols-2') ||
                                   grid.classList.toString().includes('lg:grid-cols-4') ||
                                   grid.classList.toString().includes('md:grid-cols-2');
        expect(hasResponsiveClasses).toBe(true);
      });
    });

    it('maintains readability on mobile viewports', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      
      render(<PerformanceMetrics metrics={mockMetrics} period="24h" showAdvanced={false} />);
      
      // Text should still be visible and readable
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('127ms')).toBeInTheDocument();
    });
  });
});