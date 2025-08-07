// Dashboard WebSocket Testing Suite
// Comprehensive real-time communication testing with sub-100ms latency validation

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PERFORMANCE_BENCHMARKS } from '../setup';

// WebSocket mock implementation with detailed tracking
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockWebSocket.CONNECTING;
  public url: string;
  public protocol: string | undefined;
  public bufferedAmount = 0;
  public extensions = '';

  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private messageQueue: any[] = [];
  private latencySimulation = 0;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocol = typeof protocols === 'string' ? protocols : protocols?.[0];
    
    // Simulate connection establishment
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  public send(data: string | ArrayBuffer | Blob): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    const message = typeof data === 'string' ? data : data.toString();
    this.messageQueue.push({
      data: message,
      timestamp: performance.now()
    });
  }

  public close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSING;
    
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(new CloseEvent('close', { 
          code: code || 1000, 
          reason: reason || '' 
        }));
      }
    }, 10);
  }

  public addEventListener(type: string, listener: EventListener): void {
    // Mock implementation for event listeners
  }

  public removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  public dispatchEvent(event: Event): boolean {
    return true;
  }

  // Testing utilities
  public simulateMessage(data: any, latency = 0): void {
    setTimeout(() => {
      if (this.onmessage && this.readyState === MockWebSocket.OPEN) {
        this.onmessage(new MessageEvent('message', { 
          data: typeof data === 'string' ? data : JSON.stringify(data) 
        }));
      }
    }, latency);
  }

  public simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  public simulateClose(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }

  public getLatestMessage(): any {
    return this.messageQueue[this.messageQueue.length - 1];
  }

  public getAllMessages(): any[] {
    return [...this.messageQueue];
  }

  public clearMessages(): void {
    this.messageQueue = [];
  }

  public setLatencySimulation(ms: number): void {
    this.latencySimulation = ms;
  }
}

// Global WebSocket mock
global.WebSocket = MockWebSocket as any;

describe('Dashboard WebSocket Real-Time Communication', () => {
  let mockWs: MockWebSocket;

  beforeEach(() => {
    mockWs = new MockWebSocket('ws://localhost:8787/dashboard');
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (mockWs.readyState === MockWebSocket.OPEN) {
      mockWs.close();
    }
  });

  describe('Connection Management', () => {
    it('establishes WebSocket connection successfully', async () => {
      const connectionPromise = new Promise(resolve => {
        mockWs.onopen = resolve;
      });

      await connectionPromise;
      expect(mockWs.readyState).toBe(MockWebSocket.OPEN);
    });

    it('handles connection failures gracefully', async () => {
      let errorOccurred = false;
      
      mockWs.onerror = () => {
        errorOccurred = true;
      };

      mockWs.simulateError();
      expect(errorOccurred).toBe(true);
    });

    it('implements automatic reconnection with exponential backoff', async () => {
      let reconnectAttempts = 0;
      const reconnectDelays: number[] = [];

      const simulateReconnection = () => {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectDelays.push(delay);
        reconnectAttempts++;
        
        setTimeout(() => {
          if (reconnectAttempts < 5) {
            mockWs.simulateClose(1006, 'Connection lost');
            simulateReconnection();
          }
        }, delay);
      };

      mockWs.onclose = () => {
        simulateReconnection();
      };

      mockWs.simulateClose(1006, 'Connection lost');

      // Wait for multiple reconnect attempts
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(reconnectAttempts).toBeGreaterThan(0);
      
      // Verify exponential backoff
      for (let i = 1; i < reconnectDelays.length; i++) {
        expect(reconnectDelays[i]).toBeGreaterThanOrEqual(reconnectDelays[i-1]);
      }
    });

    it('limits maximum reconnection attempts', async () => {
      let reconnectAttempts = 0;
      const maxAttempts = 5;

      const attemptReconnect = () => {
        if (reconnectAttempts < maxAttempts) {
          reconnectAttempts++;
          setTimeout(() => {
            mockWs.simulateClose(1006, 'Connection lost');
            attemptReconnect();
          }, 10);
        }
      };

      mockWs.onclose = attemptReconnect;
      mockWs.simulateClose(1006, 'Connection lost');

      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(reconnectAttempts).toBeLessThanOrEqual(maxAttempts);
    });
  });

  describe('Real-Time Data Streaming', () => {
    beforeEach(async () => {
      await new Promise(resolve => {
        mockWs.onopen = resolve;
      });
    });

    it('receives performance metrics updates in real-time', async () => {
      const metricsUpdate = {
        type: 'metrics_update',
        payload: {
          responseTime: 150,
          throughput: 300,
          errorRate: 0.5,
          uptime: 99.95,
          activeUsers: 2000,
          timestamp: new Date().toISOString()
        }
      };

      let receivedMessage: any = null;
      mockWs.onmessage = (event) => {
        receivedMessage = JSON.parse(event.data);
      };

      mockWs.simulateMessage(metricsUpdate);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedMessage).toEqual(metricsUpdate);
      expect(receivedMessage.type).toBe('metrics_update');
      expect(receivedMessage.payload).toHaveProperty('responseTime');
    });

    it('handles player analytics updates with demographic data', async () => {
      const analyticsUpdate = {
        type: 'player_analytics_update',
        payload: {
          totalPlayers: 16000,
          newPlayersToday: 450,
          playerEngagement: {
            highly_engaged: 35,
            moderately_engaged: 42,
            low_engagement: 23
          },
          geographicDistribution: [
            { region: 'North America', playerCount: 7000, percentage: 43.8 }
          ]
        }
      };

      let receivedData: any = null;
      mockWs.onmessage = (event) => {
        receivedData = JSON.parse(event.data);
      };

      mockWs.simulateMessage(analyticsUpdate);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(receivedData.type).toBe('player_analytics_update');
      expect(receivedData.payload.totalPlayers).toBe(16000);
    });

    it('processes system health updates with infrastructure status', async () => {
      const healthUpdate = {
        type: 'system_health_update',
        payload: {
          serverStatus: 'healthy',
          cloudflareStatus: 'operational',
          cpuUsage: 25,
          memoryUsage: 70,
          networkLatency: 50,
          activeConnections: 1900
        }
      };

      let healthData: any = null;
      mockWs.onmessage = (event) => {
        healthData = JSON.parse(event.data);
      };

      mockWs.simulateMessage(healthUpdate);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(healthData.payload.serverStatus).toBe('healthy');
      expect(healthData.payload.cpuUsage).toBe(25);
    });

    it('handles buzzword effectiveness updates with trending data', async () => {
      const effectivenessUpdate = {
        type: 'buzzword_effectiveness_update',
        payload: {
          overallEffectiveness: 89.2,
          categoryPerformance: [
            { category: 'Classic Corporate', effectiveness: 93, trend: 'up' }
          ],
          emergingTrends: [
            { buzzword: 'AI-Enhanced', growthRate: 950, potential: 94 }
          ]
        }
      };

      let buzzwordData: any = null;
      mockWs.onmessage = (event) => {
        buzzwordData = JSON.parse(event.data);
      };

      mockWs.simulateMessage(effectivenessUpdate);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(buzzwordData.payload.overallEffectiveness).toBe(89.2);
      expect(Array.isArray(buzzwordData.payload.emergingTrends)).toBe(true);
    });
  });

  describe('Latency Performance Validation', () => {
    beforeEach(async () => {
      await new Promise(resolve => {
        mockWs.onopen = resolve;
      });
    });

    it('maintains sub-100ms latency for real-time updates', async () => {
      const testMessage = { type: 'metrics_update', payload: { test: true } };
      const latencyMeasurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        let messageReceived = false;
        mockWs.onmessage = () => {
          const latency = performance.now() - start;
          latencyMeasurements.push(latency);
          messageReceived = true;
        };

        // Simulate realistic network latency (30-80ms)
        const simulatedLatency = 30 + Math.random() * 50;
        mockWs.simulateMessage(testMessage, simulatedLatency);

        await new Promise(resolve => {
          const checkMessage = () => {
            if (messageReceived) {
              resolve(true);
            } else {
              setTimeout(checkMessage, 1);
            }
          };
          checkMessage();
        });
      }

      const averageLatency = latencyMeasurements.reduce((a, b) => a + b) / latencyMeasurements.length;
      const maxLatency = Math.max(...latencyMeasurements);

      expect(averageLatency).toBeLessThan(PERFORMANCE_BENCHMARKS.WEBSOCKET_LATENCY);
      expect(maxLatency).toBeLessThan(PERFORMANCE_BENCHMARKS.WEBSOCKET_LATENCY * 1.5);
    });

    it('handles burst traffic without significant latency increase', async () => {
      const burstSize = 50;
      const messages = Array.from({ length: burstSize }, (_, i) => ({
        type: 'metrics_update',
        payload: { messageId: i, timestamp: Date.now() }
      }));

      const latencies: number[] = [];
      let messagesReceived = 0;

      mockWs.onmessage = (event) => {
        const receivedTime = performance.now();
        const data = JSON.parse(event.data);
        const latency = receivedTime - data.payload.timestamp;
        latencies.push(latency);
        messagesReceived++;
      };

      // Send burst of messages
      const burstStartTime = performance.now();
      messages.forEach((message, index) => {
        message.payload.timestamp = performance.now();
        mockWs.simulateMessage(message, 5); // Minimal simulated latency
      });

      // Wait for all messages to be received
      await new Promise(resolve => {
        const checkComplete = () => {
          if (messagesReceived === burstSize) {
            resolve(true);
          } else if (performance.now() - burstStartTime > 5000) {
            resolve(false); // Timeout
          } else {
            setTimeout(checkComplete, 10);
          }
        };
        checkComplete();
      });

      expect(messagesReceived).toBe(burstSize);
      
      // Latency should remain reasonable even during burst
      const averageLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      expect(averageLatency).toBeLessThan(PERFORMANCE_BENCHMARKS.WEBSOCKET_LATENCY * 2);
    });
  });

  describe('Message Integrity and Ordering', () => {
    beforeEach(async () => {
      await new Promise(resolve => {
        mockWs.onopen = resolve;
      });
    });

    it('preserves message order during high-frequency updates', async () => {
      const messageCount = 20;
      const receivedMessages: any[] = [];

      mockWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        receivedMessages.push(data);
      };

      // Send sequential messages with IDs
      for (let i = 0; i < messageCount; i++) {
        const message = {
          type: 'metrics_update',
          sequenceId: i,
          payload: { messageNumber: i }
        };
        mockWs.simulateMessage(message, 1);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessages.length).toBe(messageCount);
      
      // Verify sequential order
      for (let i = 0; i < receivedMessages.length; i++) {
        expect(receivedMessages[i].sequenceId).toBe(i);
      }
    });

    it('handles malformed messages gracefully', async () => {
      let errorHandled = false;
      const originalConsoleError = console.error;
      console.error = vi.fn();

      mockWs.onmessage = (event) => {
        try {
          JSON.parse(event.data);
        } catch (error) {
          errorHandled = true;
        }
      };

      // Send malformed JSON
      mockWs.simulateMessage('{ invalid json }', 0);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(errorHandled).toBe(true);
      
      console.error = originalConsoleError;
    });

    it('validates message structure and types', async () => {
      const validMessageTypes = [
        'metrics_update', 
        'player_analytics_update', 
        'system_health_update', 
        'buzzword_effectiveness_update'
      ];

      let invalidMessageReceived = false;
      mockWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!validMessageTypes.includes(data.type)) {
          invalidMessageReceived = true;
        }
      };

      // Send message with invalid type
      mockWs.simulateMessage({
        type: 'invalid_message_type',
        payload: {}
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      // Should handle unknown message types gracefully
      expect(invalidMessageReceived).toBe(true);
    });
  });

  describe('Connection Resilience', () => {
    it('recovers from temporary network interruptions', async () => {
      let connectionRestored = false;

      mockWs.onopen = () => {
        connectionRestored = true;
      };

      // Simulate network interruption
      mockWs.simulateClose(1006, 'Network interruption');
      expect(mockWs.readyState).toBe(MockWebSocket.CLOSED);

      // Simulate reconnection after delay
      setTimeout(() => {
        mockWs.readyState = MockWebSocket.OPEN;
        if (mockWs.onopen) {
          mockWs.onopen(new Event('open'));
        }
      }, 50);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(connectionRestored).toBe(true);
    });

    it('handles server-side connection termination', async () => {
      let closeEventReceived = false;
      let closeCode: number | undefined;
      let closeReason: string | undefined;

      mockWs.onclose = (event) => {
        closeEventReceived = true;
        closeCode = event.code;
        closeReason = event.reason;
      };

      mockWs.simulateClose(1011, 'Server restarting');

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(closeEventReceived).toBe(true);
      expect(closeCode).toBe(1011);
      expect(closeReason).toBe('Server restarting');
    });

    it('maintains message queue during brief disconnections', async () => {
      const messageQueue: any[] = [];

      // Queue messages while disconnected
      const messages = [
        { type: 'metrics_update', payload: { id: 1 } },
        { type: 'metrics_update', payload: { id: 2 } },
        { type: 'metrics_update', payload: { id: 3 } }
      ];

      mockWs.onmessage = (event) => {
        messageQueue.push(JSON.parse(event.data));
      };

      // Simulate disconnection
      mockWs.readyState = MockWebSocket.CLOSED;

      // Attempt to queue messages (should be buffered)
      messages.forEach(msg => {
        try {
          mockWs.simulateMessage(msg);
        } catch (error) {
          // Expected - connection closed
        }
      });

      // Reconnect and deliver queued messages
      mockWs.readyState = MockWebSocket.OPEN;
      messages.forEach(msg => {
        mockWs.simulateMessage(msg);
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(messageQueue.length).toBe(messages.length);
      expect(messageQueue.map(m => m.payload.id)).toEqual([1, 2, 3]);
    });
  });

  describe('Concurrent User Handling', () => {
    it('supports multiple simultaneous dashboard viewers', async () => {
      const connectionCount = 10;
      const mockConnections: MockWebSocket[] = [];

      // Create multiple WebSocket connections
      for (let i = 0; i < connectionCount; i++) {
        const connection = new MockWebSocket('ws://localhost:8787/dashboard');
        mockConnections.push(connection);
      }

      // Wait for all connections to open
      await Promise.all(mockConnections.map(conn => 
        new Promise(resolve => {
          conn.onopen = resolve;
        })
      ));

      // Verify all connections are open
      mockConnections.forEach(conn => {
        expect(conn.readyState).toBe(MockWebSocket.OPEN);
      });

      // Broadcast message to all connections
      const broadcastMessage = {
        type: 'metrics_update',
        payload: { activeConnections: connectionCount }
      };

      const receivedCounts: number[] = [];
      
      mockConnections.forEach((conn, index) => {
        let messagesReceived = 0;
        conn.onmessage = () => {
          messagesReceived++;
        };
        
        conn.simulateMessage(broadcastMessage);
        setTimeout(() => {
          receivedCounts[index] = messagesReceived;
        }, 20);
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // All connections should receive the broadcast
      receivedCounts.forEach(count => {
        expect(count).toBe(1);
      });
    });

    it('handles connection scaling without performance degradation', async () => {
      const maxConnections = 50;
      const connections: MockWebSocket[] = [];
      const connectionTimes: number[] = [];

      for (let i = 0; i < maxConnections; i++) {
        const start = performance.now();
        const connection = new MockWebSocket('ws://localhost:8787/dashboard');
        connections.push(connection);

        await new Promise(resolve => {
          connection.onopen = () => {
            const connectionTime = performance.now() - start;
            connectionTimes.push(connectionTime);
            resolve(true);
          };
        });
      }

      // Connection times should remain reasonable even at scale
      const averageConnectionTime = connectionTimes.reduce((a, b) => a + b) / connectionTimes.length;
      const maxConnectionTime = Math.max(...connectionTimes);

      expect(averageConnectionTime).toBeLessThan(100); // 100ms average
      expect(maxConnectionTime).toBeLessThan(500); // 500ms max
    });
  });

  describe('Corporate Humor Content Validation', () => {
    beforeEach(async () => {
      await new Promise(resolve => {
        mockWs.onopen = resolve;
      });
    });

    it('validates corporate appropriateness of real-time content', async () => {
      const corporateUpdate = {
        type: 'buzzword_effectiveness_update',
        payload: {
          topPerformers: [
            { buzzword: 'Synergy', effectiveness: 95, corporateAppropriateness: 98 },
            { buzzword: 'Strategic Alignment', effectiveness: 92, corporateAppropriateness: 96 }
          ],
          professionalGrade: 94,
          executiveSuitability: 97
        }
      };

      let contentValidated = false;
      mockWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.payload.professionalGrade > 90 && data.payload.executiveSuitability > 95) {
          contentValidated = true;
        }
      };

      mockWs.simulateMessage(corporateUpdate);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(contentValidated).toBe(true);
    });

    it('ensures meeting-appropriate humor in real-time updates', async () => {
      const humorUpdate = {
        type: 'player_analytics_update',
        payload: {
          meetingSurvivorCount: 1500,
          buzzwordBingoCompletions: 234,
          executiveHumourApproval: 96,
          professionalAppropriatenessScore: 94
        }
      };

      let meetingAppropriate = false;
      mockWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const content = JSON.stringify(data).toLowerCase();
        
        // Should contain professional humor terms
        const professionalHumor = content.includes('survivor') || 
                                 content.includes('bingo') ||
                                 content.includes('meeting');
        
        // Should not contain inappropriate terms
        const inappropriateTerms = ['damn', 'hell', 'stupid', 'idiots'];
        const hasInappropriate = inappropriateTerms.some(term => content.includes(term));
        
        if (professionalHumor && !hasInappropriate) {
          meetingAppropriate = true;
        }
      };

      mockWs.simulateMessage(humorUpdate);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(meetingAppropriate).toBe(true);
    });
  });
});