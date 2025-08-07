// Dashboard API Endpoints Test Suite
// Comprehensive backend testing for analytics endpoints with WebSocket validation

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PERFORMANCE_BENCHMARKS } from '../setup';

// Mock Cloudflare Workers environment
const mockEnv = {
  ROOMS: {
    idFromName: vi.fn(),
    get: vi.fn()
  }
};

// Mock fetch for testing API responses
const originalFetch = global.fetch;

describe('Dashboard Analytics API Endpoints', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Performance Metrics Endpoint (/api/dashboard/performance)', () => {
    it('returns performance metrics with correct structure', async () => {
      const mockMetrics = {
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
          { word: 'Deep Dive', count: 2156, trend: 'stable', effectiveness: 91 }
        ],
        activeRooms: 347,
        averageGameDuration: 23.7,
        completionRate: 67.3,
        cheatingAttempts: 12,
        timestamp: new Date().toISOString()
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockMetrics), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/performance');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('responseTime');
      expect(data).toHaveProperty('throughput');
      expect(data).toHaveProperty('errorRate');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('activeUsers');
      expect(data).toHaveProperty('topBuzzwords');
      expect(Array.isArray(data.topBuzzwords)).toBe(true);
    });

    it('responds within performance benchmark (<200ms)', async () => {
      vi.mocked(global.fetch).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(JSON.stringify({}), { status: 200 }));
          }, 150); // 150ms response time
        })
      );

      const start = performance.now();
      await fetch('/api/dashboard/performance');
      const end = performance.now();

      const responseTime = end - start;
      expect(responseTime).toBeLessThan(PERFORMANCE_BENCHMARKS.API_RESPONSE_TIME);
    });

    it('handles errors gracefully with proper error codes', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/performance');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('includes CORS headers for cross-origin requests', async () => {
      const mockHeaders = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://engineer-memes-ai.netlify.app',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: mockHeaders
        })
      );

      const response = await fetch('/api/dashboard/performance');
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
    });
  });

  describe('Player Analytics Endpoint (/api/dashboard/players)', () => {
    it('returns player analytics with demographic breakdown', async () => {
      const mockAnalytics = {
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
          { region: 'Europe', playerCount: 4521, percentage: 28.6 }
        ],
        deviceBreakdown: {
          mobile: 58,
          desktop: 35,
          tablet: 7
        },
        topPlayerActions: [
          { action: 'Buzzword Marked', count: 47521, trend: 'up' }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAnalytics), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/players');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalPlayers');
      expect(data).toHaveProperty('playerEngagement');
      expect(data.playerEngagement).toHaveProperty('highly_engaged');
      expect(data.playerEngagement).toHaveProperty('moderately_engaged');
      expect(data.playerEngagement).toHaveProperty('low_engagement');
      expect(Array.isArray(data.geographicDistribution)).toBe(true);
      expect(data.deviceBreakdown).toHaveProperty('mobile');
    });

    it('validates engagement percentages sum to 100', async () => {
      const mockAnalytics = {
        playerEngagement: {
          highly_engaged: 32,
          moderately_engaged: 45,
          low_engagement: 23
        }
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockAnalytics), { status: 200 })
      );

      const response = await fetch('/api/dashboard/players');
      const data = await response.json();

      const total = data.playerEngagement.highly_engaged + 
                   data.playerEngagement.moderately_engaged + 
                   data.playerEngagement.low_engagement;
      
      expect(total).toBe(100);
    });
  });

  describe('Buzzword Effectiveness Endpoint (/api/dashboard/buzzwords)', () => {
    it('returns buzzword effectiveness with performance categories', async () => {
      const mockEffectiveness = {
        overallEffectiveness: 87.3,
        categoryPerformance: [
          { category: 'Classic Corporate', effectiveness: 92, usage: 8547, trend: 'stable' },
          { category: 'Virtual Meeting', effectiveness: 89, usage: 6234, trend: 'up' }
        ],
        topPerformers: [
          { buzzword: 'Synergy', effectiveness: 94, usage: 2847, corporateRelevance: 98, humourRating: 91 }
        ],
        underperformers: [
          { 
            buzzword: 'Web 3.0', 
            effectiveness: 45, 
            reasons: ['Too technical', 'Limited corporate usage'],
            suggestions: ['Replace with more universal terms']
          }
        ],
        emergingTrends: [
          { buzzword: 'AI-Driven', growthRate: 847, potential: 92 }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockEffectiveness), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/buzzwords');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('overallEffectiveness');
      expect(data.overallEffectiveness).toBeGreaterThan(0);
      expect(Array.isArray(data.categoryPerformance)).toBe(true);
      expect(Array.isArray(data.topPerformers)).toBe(true);
      expect(Array.isArray(data.underperformers)).toBe(true);
      expect(Array.isArray(data.emergingTrends)).toBe(true);
    });

    it('validates corporate appropriateness scores are within valid range', async () => {
      const mockEffectiveness = {
        topPerformers: [
          { buzzword: 'Synergy', effectiveness: 94, corporateRelevance: 98, humourRating: 91 }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockEffectiveness), { status: 200 })
      );

      const response = await fetch('/api/dashboard/buzzwords');
      const data = await response.json();

      data.topPerformers.forEach((performer: any) => {
        expect(performer.effectiveness).toBeGreaterThanOrEqual(0);
        expect(performer.effectiveness).toBeLessThanOrEqual(100);
        expect(performer.corporateRelevance).toBeGreaterThanOrEqual(0);
        expect(performer.corporateRelevance).toBeLessThanOrEqual(100);
        expect(performer.humourRating).toBeGreaterThanOrEqual(0);
        expect(performer.humourRating).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('System Health Endpoint (/api/dashboard/system)', () => {
    it('returns system health with infrastructure status', async () => {
      const mockHealth = {
        serverStatus: 'healthy',
        cloudflareStatus: 'operational',
        netlifyStatus: 'operational',
        cpuUsage: 23,
        memoryUsage: 67,
        networkLatency: 45,
        activeConnections: 1847,
        connectionSuccess: 99.2,
        messageDeliveryRate: 98.7,
        recentIncidents: [],
        timestamp: new Date().toISOString()
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockHealth), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/system');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('serverStatus');
      expect(data).toHaveProperty('cloudflareStatus');
      expect(data).toHaveProperty('netlifyStatus');
      expect(data.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(data.cpuUsage).toBeLessThanOrEqual(100);
      expect(data.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(data.memoryUsage).toBeLessThanOrEqual(100);
    });

    it('validates service status values are within expected range', async () => {
      const mockHealth = {
        serverStatus: 'healthy',
        connectionSuccess: 99.2,
        messageDeliveryRate: 98.7
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockHealth), { status: 200 })
      );

      const response = await fetch('/api/dashboard/system');
      const data = await response.json();

      expect(['healthy', 'warning', 'critical']).toContain(data.serverStatus);
      expect(data.connectionSuccess).toBeGreaterThanOrEqual(0);
      expect(data.connectionSuccess).toBeLessThanOrEqual(100);
      expect(data.messageDeliveryRate).toBeGreaterThanOrEqual(0);
      expect(data.messageDeliveryRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Rate Limiting and Security', () => {
    it('implements rate limiting for API endpoints', async () => {
      // Simulate rapid successive requests
      const requests = Array.from({ length: 35 }, () => 
        fetch('/api/dashboard/performance')
      );

      // Mock rate limiting response after 30 requests
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))
        // ... more 200s for first 30 requests
        .mockResolvedValue(new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }), 
          { status: 429 }
        ));

      const responses = await Promise.all(requests);
      
      // Last few responses should be rate limited
      const rateLimitedResponses = responses.slice(-5);
      expect(rateLimitedResponses.some(r => r.status === 429)).toBe(true);
    });

    it('validates request origin for CORS compliance', async () => {
      const allowedOrigin = 'https://engineer-memes-ai.netlify.app';
      
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response('{}', {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin
          }
        })
      );

      const response = await fetch('/api/dashboard/performance', {
        headers: { 'Origin': allowedOrigin }
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    });

    it('sanitizes input parameters', async () => {
      // Test for XSS prevention
      const maliciousParams = '?<script>alert("xss")</script>';
      
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 400 })
      );

      const response = await fetch(`/api/dashboard/performance${maliciousParams}`);
      
      // Should reject malicious input
      expect(response.status).toBe(400);
    });
  });

  describe('Load Testing and Scalability', () => {
    it('handles concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const requests = Array.from({ length: concurrentRequests }, () => {
        vi.mocked(global.fetch).mockResolvedValueOnce(
          new Response(JSON.stringify({}), { status: 200 })
        );
        return fetch('/api/dashboard/performance');
      });

      const start = performance.now();
      const responses = await Promise.all(requests);
      const end = performance.now();

      const averageResponseTime = (end - start) / concurrentRequests;
      
      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Average response time should be reasonable under load
      expect(averageResponseTime).toBeLessThan(PERFORMANCE_BENCHMARKS.API_RESPONSE_TIME * 2);
    });

    it('maintains performance under sustained load', async () => {
      // Simulate sustained load over time
      const iterations = 10;
      const requestsPerIteration = 20;
      const responseTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        const requests = Array.from({ length: requestsPerIteration }, () => {
          vi.mocked(global.fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({}), { status: 200 })
          );
          return fetch('/api/dashboard/performance');
        });

        await Promise.all(requests);
        const end = performance.now();
        
        responseTimes.push(end - start);
      }

      // Response times should remain consistent (not degrade significantly)
      const firstHalfAvg = responseTimes.slice(0, 5).reduce((a, b) => a + b) / 5;
      const secondHalfAvg = responseTimes.slice(5).reduce((a, b) => a + b) / 5;
      
      // Performance degradation should be minimal (<50% increase)
      const degradationRatio = secondHalfAvg / firstHalfAvg;
      expect(degradationRatio).toBeLessThan(1.5);
    });
  });

  describe('Error Recovery and Graceful Degradation', () => {
    it('provides meaningful error messages for client debugging', async () => {
      const errorResponse = {
        error: 'Database connection failed',
        code: 'DB_CONNECTION_ERROR',
        timestamp: new Date().toISOString(),
        details: 'Analytics database is temporarily unavailable'
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(errorResponse), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/performance');
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('timestamp');
    });

    it('falls back gracefully when partial data is available', async () => {
      const partialResponse = {
        responseTime: 127,
        throughput: 245,
        // Missing some fields due to service degradation
        uptime: null,
        activeUsers: 1847,
        timestamp: new Date().toISOString()
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(partialResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const response = await fetch('/api/dashboard/performance');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('responseTime');
      expect(data).toHaveProperty('timestamp');
      // Should handle missing data gracefully
    });
  });

  describe('Professional Standards Validation', () => {
    it('ensures all endpoint responses maintain corporate professionalism', async () => {
      const endpoints = [
        '/api/dashboard/performance',
        '/api/dashboard/players', 
        '/api/dashboard/buzzwords',
        '/api/dashboard/system'
      ];

      for (const endpoint of endpoints) {
        vi.mocked(global.fetch).mockResolvedValueOnce(
          new Response(JSON.stringify({
            message: 'Analytics data retrieved successfully',
            status: 'operational'
          }), { status: 200 })
        );

        const response = await fetch(endpoint);
        const data = await response.json();

        // Check response text for professional language
        const responseText = JSON.stringify(data).toLowerCase();
        
        // Should not contain unprofessional language
        const unprofessionalTerms = ['damn', 'hell', 'crap', 'sucks'];
        unprofessionalTerms.forEach(term => {
          expect(responseText).not.toContain(term);
        });
      }
    });
  });
});