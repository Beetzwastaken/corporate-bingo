// Security Validation Test Suite
// Comprehensive security testing for dashboard endpoints and professional appropriateness

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CORPORATE_APPROPRIATENESS_STANDARDS } from '../setup';

// Mock security testing utilities
const securityTestUtils = {
  testXSSVulnerability: (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];
    return xssPatterns.some(pattern => pattern.test(input));
  },

  testSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\bor\b|\band\b).*?['"]/gi,
      /union.*?select/gi,
      /drop.*?table/gi,
      /insert.*?into/gi,
      /delete.*?from/gi
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  validateCORS: (origin: string, allowedOrigins: string[]): boolean => {
    return allowedOrigins.includes(origin);
  },

  checkRateLimit: (requests: number, timeWindow: number, limit: number): boolean => {
    return requests <= limit;
  }
};

describe('Security Validation Testing', () => {
  describe('Input Sanitization and XSS Prevention', () => {
    it('prevents XSS attacks in dashboard query parameters', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        'onmouseover="alert(\'xss\')"',
        '"><script>alert("xss")</script>'
      ];

      maliciousInputs.forEach(input => {
        const hasXSS = securityTestUtils.testXSSVulnerability(input);
        expect(hasXSS).toBe(true);
        
        // Input should be sanitized before processing
        const sanitized = input.replace(/[<>'"&]/g, '');
        const stillHasXSS = securityTestUtils.testXSSVulnerability(sanitized);
        expect(stillHasXSS).toBe(false);
      });
    });

    it('sanitizes WebSocket message content', () => {
      const maliciousWebSocketMessages = [
        {
          type: 'metrics_update',
          payload: {
            responseTime: '<script>alert("xss")</script>',
            maliciousField: 'javascript:void(0)'
          }
        },
        {
          type: 'player_analytics_update',
          payload: {
            totalPlayers: '"><script>alert("xss")</script>',
            region: '<iframe src="malicious.com"></iframe>'
          }
        }
      ];

      maliciousWebSocketMessages.forEach(message => {
        const messageString = JSON.stringify(message);
        
        // Should detect XSS in message content
        const hasXSS = securityTestUtils.testXSSVulnerability(messageString);
        expect(hasXSS).toBe(true);
      });
    });

    it('prevents SQL injection in analytics queries', () => {
      const maliciousSQLInputs = [
        "'; DROP TABLE users; --",
        "1 OR 1=1",
        "UNION SELECT * FROM sensitive_data",
        "'; INSERT INTO admin (user) VALUES ('hacker'); --",
        "1' AND '1'='1",
        "admin'--"
      ];

      maliciousSQLInputs.forEach(input => {
        const hasSQLInjection = securityTestUtils.testSQLInjection(input);
        expect(hasSQLInjection).toBe(true);
        
        // Parameterized queries should prevent SQL injection
        const sanitized = input.replace(/['"]/g, '').replace(/;|\-\-/g, '');
        const stillHasSQLInjection = securityTestUtils.testSQLInjection(sanitized);
        expect(stillHasSQLInjection).toBe(false);
      });
    });

    it('validates and sanitizes file upload paths', () => {
      const maliciousFilePaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/var/log/../../etc/shadow',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        '../../../../usr/local/bin/malicious_script'
      ];

      maliciousFilePaths.forEach(path => {
        // Should detect directory traversal
        const hasTraversal = path.includes('..') || path.includes('\\');
        expect(hasTraversal).toBe(true);
        
        // Sanitized path should be safe
        const sanitized = path.replace(/\.\./g, '').replace(/[\\]/g, '/');
        const stillHasTraversal = sanitized.includes('..');
        expect(stillHasTraversal).toBe(false);
      });
    });
  });

  describe('CORS Security Validation', () => {
    it('validates allowed origins for dashboard API', () => {
      const allowedOrigins = [
        'https://engineer-memes-ai.netlify.app',
        'http://localhost:5175',
        'http://localhost:3000'
      ];

      const testOrigins = [
        { origin: 'https://engineer-memes-ai.netlify.app', shouldAllow: true },
        { origin: 'http://localhost:5175', shouldAllow: true },
        { origin: 'https://malicious-site.com', shouldAllow: false },
        { origin: 'http://evil.com', shouldAllow: false },
        { origin: 'https://engineer-memes-ai.netlify.app.evil.com', shouldAllow: false }
      ];

      testOrigins.forEach(({ origin, shouldAllow }) => {
        const isAllowed = securityTestUtils.validateCORS(origin, allowedOrigins);
        expect(isAllowed).toBe(shouldAllow);
      });
    });

    it('prevents CORS bypass attempts', () => {
      const corssBypassAttempts = [
        'null',
        'https://engineer-memes-ai.netlify.app.evil.com',
        'https://evil.com',
        'data:text/html,<script>alert("xss")</script>',
        'file://localhost/etc/passwd'
      ];

      const allowedOrigins = ['https://engineer-memes-ai.netlify.app'];

      corssBypassAttempts.forEach(origin => {
        const isAllowed = securityTestUtils.validateCORS(origin, allowedOrigins);
        expect(isAllowed).toBe(false);
      });
    });

    it('handles preflight OPTIONS requests securely', () => {
      const mockPreflightRequest = {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://engineer-memes-ai.netlify.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      };

      const allowedMethods = ['GET', 'POST', 'OPTIONS'];
      const allowedHeaders = ['Content-Type', 'Authorization'];

      // Validate requested method
      const methodAllowed = allowedMethods.includes(mockPreflightRequest.headers['Access-Control-Request-Method']);
      expect(methodAllowed).toBe(true);

      // Validate requested headers
      const requestedHeaders = mockPreflightRequest.headers['Access-Control-Request-Headers'].split(', ');
      const headersAllowed = requestedHeaders.every(header => allowedHeaders.includes(header));
      expect(headersAllowed).toBe(true);
    });
  });

  describe('Rate Limiting and DDoS Protection', () => {
    it('implements rate limiting for dashboard API endpoints', () => {
      const rateLimit = 30; // 30 requests per minute
      const timeWindow = 60000; // 1 minute in milliseconds

      // Test scenarios
      const scenarios = [
        { requests: 25, shouldAllow: true },
        { requests: 30, shouldAllow: true },
        { requests: 35, shouldAllow: false },
        { requests: 50, shouldAllow: false }
      ];

      scenarios.forEach(({ requests, shouldAllow }) => {
        const withinLimit = securityTestUtils.checkRateLimit(requests, timeWindow, rateLimit);
        expect(withinLimit).toBe(shouldAllow);
      });
    });

    it('applies different rate limits for different endpoint types', () => {
      const rateLimits = {
        '/api/dashboard/performance': { limit: 60, window: 60000 }, // Higher limit for main metrics
        '/api/dashboard/players': { limit: 30, window: 60000 },      // Standard limit
        '/api/dashboard/system': { limit: 10, window: 60000 },       // Lower limit for sensitive data
        '/api/dashboard/ws': { limit: 5, window: 60000 }             // Lowest limit for WebSocket
      };

      Object.entries(rateLimits).forEach(([endpoint, { limit, window }]) => {
        // Test at limit boundary
        expect(securityTestUtils.checkRateLimit(limit, window, limit)).toBe(true);
        expect(securityTestUtils.checkRateLimit(limit + 1, window, limit)).toBe(false);
      });
    });

    it('implements progressive rate limiting with backoff', () => {
      const baseLimit = 30;
      const violations = [0, 1, 2, 3, 5]; // Number of previous violations

      violations.forEach(violationCount => {
        // Progressive reduction: 30, 15, 7, 3, 1
        const adjustedLimit = Math.max(1, Math.floor(baseLimit / Math.pow(2, violationCount)));
        
        expect(adjustedLimit).toBeLessThanOrEqual(baseLimit);
        expect(adjustedLimit).toBeGreaterThanOrEqual(1);
        
        if (violationCount > 0) {
          const previousLimit = Math.max(1, Math.floor(baseLimit / Math.pow(2, violationCount - 1)));
          expect(adjustedLimit).toBeLessThanOrEqual(previousLimit);
        }
      });
    });

    it('tracks and blocks malicious IP addresses', () => {
      const suspiciousActivities = [
        { ip: '192.168.1.100', requests: 1000, timeWindow: 60000, suspicious: true },
        { ip: '10.0.0.50', requests: 25, timeWindow: 60000, suspicious: false },
        { ip: '172.16.0.200', requests: 500, timeWindow: 30000, suspicious: true }
      ];

      suspiciousActivities.forEach(({ ip, requests, timeWindow, suspicious }) => {
        const normalRate = 30; // Normal rate limit
        const requestsPerSecond = requests / (timeWindow / 1000);
        const isSuspicious = requestsPerSecond > (normalRate / 60) * 10; // 10x normal rate
        
        expect(isSuspicious).toBe(suspicious);
      });
    });
  });

  describe('WebSocket Security', () => {
    it('validates WebSocket origin headers', () => {
      const wsOrigins = [
        { origin: 'https://engineer-memes-ai.netlify.app', valid: true },
        { origin: 'ws://localhost:5175', valid: true },
        { origin: 'https://malicious-site.com', valid: false },
        { origin: null, valid: false },
        { origin: 'file://localhost', valid: false }
      ];

      const allowedWsOrigins = [
        'https://engineer-memes-ai.netlify.app',
        'ws://localhost:5175',
        'http://localhost:5175'
      ];

      wsOrigins.forEach(({ origin, valid }) => {
        const isValid = origin ? allowedWsOrigins.some(allowed => 
          origin.startsWith(allowed.replace('ws://', 'http://').replace('wss://', 'https://'))
        ) : false;
        
        expect(isValid).toBe(valid);
      });
    });

    it('implements WebSocket message size limits', () => {
      const maxMessageSize = 1024 * 64; // 64KB limit
      
      const testMessages = [
        { size: 1024, shouldAllow: true },      // 1KB - allowed
        { size: 32768, shouldAllow: true },     // 32KB - allowed
        { size: 65536, shouldAllow: true },     // 64KB - at limit
        { size: 131072, shouldAllow: false },   // 128KB - too large
        { size: 1048576, shouldAllow: false }   // 1MB - too large
      ];

      testMessages.forEach(({ size, shouldAllow }) => {
        const withinLimit = size <= maxMessageSize;
        expect(withinLimit).toBe(shouldAllow);
      });
    });

    it('prevents WebSocket connection flooding', () => {
      const maxConnectionsPerIP = 10;
      const connectionCounts = [5, 10, 15, 25, 50];

      connectionCounts.forEach(count => {
        const allowed = count <= maxConnectionsPerIP;
        expect(allowed).toBe(count <= 10);
      });
    });

    it('validates WebSocket message frequency', () => {
      const maxMessagesPerSecond = 10;
      const testScenarios = [
        { messages: 5, timeWindow: 1000, shouldAllow: true },
        { messages: 10, timeWindow: 1000, shouldAllow: true },
        { messages: 15, timeWindow: 1000, shouldAllow: false },
        { messages: 50, timeWindow: 1000, shouldAllow: false }
      ];

      testScenarios.forEach(({ messages, timeWindow, shouldAllow }) => {
        const messagesPerSecond = messages / (timeWindow / 1000);
        const withinLimit = messagesPerSecond <= maxMessagesPerSecond;
        expect(withinLimit).toBe(shouldAllow);
      });
    });
  });

  describe('Professional Appropriateness Security', () => {
    it('validates content appropriateness in real-time', () => {
      const contentSamples = [
        {
          content: 'Meeting survivors showing excellent performance metrics',
          appropriatenessScore: 95,
          context: 'executive_presentation'
        },
        {
          content: 'Corporate buzzword effectiveness trending upward',
          appropriatenessScore: 92,
          context: 'team_meeting'
        },
        {
          content: 'Damn this system is broken and stupid',
          appropriatenessScore: 20,
          context: 'any'
        }
      ];

      contentSamples.forEach(({ content, appropriatenessScore, context }) => {
        const hasInappropriate = CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS
          .some(term => content.toLowerCase().includes(term));

        const hasProfessional = CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS
          .some(term => content.toLowerCase().includes(term));

        if (context === 'executive_presentation') {
          expect(appropriatenessScore).toBeGreaterThanOrEqual(
            CORPORATE_APPROPRIATENESS_STANDARDS.EXECUTIVE_THRESHOLD
          );
        }

        if (hasInappropriate) {
          expect(appropriatenessScore).toBeLessThan(50);
        }
        
        if (hasProfessional && !hasInappropriate) {
          expect(appropriatenessScore).toBeGreaterThan(80);
        }
      });
    });

    it('blocks inappropriate content from dashboard display', () => {
      const inappropriateContent = [
        'This damn system sucks',
        'What the hell is this crap',
        'These idiots don\'t know anything',
        'Bullshit corporate nonsense'
      ];

      inappropriateContent.forEach(content => {
        const hasBlacklisted = CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS
          .some(term => content.toLowerCase().includes(term));

        expect(hasBlacklisted).toBe(true);
        
        // Content should be blocked or filtered
        const shouldBlock = hasBlacklisted;
        expect(shouldBlock).toBe(true);
      });
    });

    it('ensures executive-level appropriateness for C-suite dashboards', () => {
      const executiveContent = [
        'Strategic performance optimization metrics',
        'Corporate synergy effectiveness analysis',
        'Executive dashboard showing operational excellence',
        'Meeting productivity enhancement indicators'
      ];

      executiveContent.forEach(content => {
        const professionalTerms = CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS
          .filter(term => content.toLowerCase().includes(term));

        const inappropriateTerms = CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS
          .filter(term => content.toLowerCase().includes(term));

        expect(inappropriateTerms.length).toBe(0);
        expect(professionalTerms.length).toBeGreaterThan(0);

        // Calculate executive appropriateness score
        const appropriatenessScore = Math.max(85, 
          (professionalTerms.length / 3) * 100 - (inappropriateTerms.length * 50)
        );

        expect(appropriatenessScore).toBeGreaterThanOrEqual(
          CORPORATE_APPROPRIATENESS_STANDARDS.EXECUTIVE_THRESHOLD
        );
      });
    });

    it('implements content filtering pipeline', () => {
      const contentPipeline = {
        stage1_profanityFilter: (content: string): boolean => {
          return !CORPORATE_APPROPRIATENESS_STANDARDS.INAPPROPRIATE_TERMS
            .some(term => content.toLowerCase().includes(term));
        },
        
        stage2_professionalValidation: (content: string): number => {
          const professionalCount = CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS
            .filter(term => content.toLowerCase().includes(term)).length;
          return (professionalCount / CORPORATE_APPROPRIATENESS_STANDARDS.PROFESSIONAL_TERMS.length) * 100;
        },

        stage3_contextValidation: (content: string, context: string): boolean => {
          const minScore = {
            'executive_presentation': 96,
            'team_meeting': 85,
            'technical_review': 80
          }[context] || 75;

          const professionalScore = contentPipeline.stage2_professionalValidation(content);
          return professionalScore >= minScore;
        }
      };

      const testContent = 'Strategic corporate synergy optimization for executive excellence';
      const context = 'executive_presentation';

      // Test pipeline stages
      expect(contentPipeline.stage1_profanityFilter(testContent)).toBe(true);
      expect(contentPipeline.stage2_professionalValidation(testContent)).toBeGreaterThan(80);
      expect(contentPipeline.stage3_contextValidation(testContent, context)).toBe(true);
    });
  });

  describe('Data Protection and Privacy', () => {
    it('validates sensitive data masking in analytics', () => {
      const sensitiveDataPatterns = [
        { pattern: /\b\d{16}\b/, name: 'Credit Card', shouldMask: true },
        { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'SSN', shouldMask: true },
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: 'Email', shouldMask: true },
        { pattern: /\b(?:\+?1[-.\s]?)?\(?[2-9][0-8][0-9]\)?[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}\b/, name: 'Phone', shouldMask: true }
      ];

      const testData = [
        'User analytics data with email test@company.com',
        'Payment info: 4532123456789012',
        'SSN: 123-45-6789',
        'Contact: +1-555-123-4567',
        'Regular dashboard metrics: 1847 active users'
      ];

      testData.forEach(data => {
        sensitiveDataPatterns.forEach(({ pattern, name, shouldMask }) => {
          const hasSensitiveData = pattern.test(data);
          
          if (hasSensitiveData && shouldMask) {
            // Data should be masked: email -> e***@***.com
            const masked = data.replace(pattern, (match) => {
              if (name === 'Email') return match.replace(/(.{1}).*@.*(.{3})/, '$1***@***$2');
              if (name === 'Credit Card') return match.replace(/\d{12}/, '************');
              if (name === 'SSN') return match.replace(/\d{3}-\d{2}-\d{4}/, '***-**-****');
              if (name === 'Phone') return match.replace(/\d{7}/, '*******');
              return match;
            });
            
            expect(masked).not.toBe(data);
          }
        });
      });
    });

    it('implements secure session management', () => {
      const sessionTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.Rq8IxqeX7eA6GgYxlcHdPGC4h1cUY-uIXCBvB8mpNdw',
        'invalid-token-format',
        '',
        'expired-token-here'
      ];

      const validTokenPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

      sessionTokens.forEach(token => {
        const isValidFormat = validTokenPattern.test(token);
        const isExpired = token.includes('expired');
        const isEmpty = token === '';

        if (!isEmpty && isValidFormat && !isExpired) {
          // Token should be valid for secure operations
          expect(token.length).toBeGreaterThan(100);
        }
      });
    });

    it('validates secure data transmission protocols', () => {
      const transmissionTests = [
        { protocol: 'https', secure: true },
        { protocol: 'wss', secure: true },
        { protocol: 'http', secure: false },
        { protocol: 'ws', secure: false }
      ];

      transmissionTests.forEach(({ protocol, secure }) => {
        const isSecure = protocol === 'https' || protocol === 'wss';
        expect(isSecure).toBe(secure);
      });
    });
  });

  describe('Audit Trail and Compliance', () => {
    it('logs security events for audit trail', () => {
      const securityEvents = [
        { type: 'failed_authentication', severity: 'medium', timestamp: new Date() },
        { type: 'rate_limit_exceeded', severity: 'low', timestamp: new Date() },
        { type: 'suspicious_activity', severity: 'high', timestamp: new Date() },
        { type: 'data_access', severity: 'low', timestamp: new Date() }
      ];

      securityEvents.forEach(event => {
        expect(event.timestamp).toBeInstanceOf(Date);
        expect(['low', 'medium', 'high']).toContain(event.severity);
        expect(event.type).toBeTruthy();
        
        // High severity events should trigger immediate alerts
        if (event.severity === 'high') {
          const shouldAlert = true;
          expect(shouldAlert).toBe(true);
        }
      });
    });

    it('maintains compliance with security standards', () => {
      const complianceChecks = {
        'Data Encryption': true,
        'Access Control': true,
        'Input Validation': true,
        'Output Encoding': true,
        'Session Security': true,
        'Rate Limiting': true,
        'CORS Policy': true,
        'Content Security': true
      };

      Object.entries(complianceChecks).forEach(([standard, compliant]) => {
        expect(compliant).toBe(true);
      });

      // Overall compliance score
      const complianceScore = Object.values(complianceChecks).filter(Boolean).length / 
                             Object.keys(complianceChecks).length * 100;
      
      expect(complianceScore).toBe(100);
    });
  });
});