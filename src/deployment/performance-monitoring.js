/**
 * Engineer Memes Performance Monitoring System
 * Real-time dashboard performance tracking with executive reporting
 */

class DashboardPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      dashboardLoadTime: 3000, // 3 seconds max
      apiResponseTime: 200,    // 200ms max
      websocketLatency: 100,   // 100ms max
      memoryUsage: 512,        // 512MB max
      errorRate: 0.05          // 5% max error rate
    };
    
    this.alerts = [];
    this.reportingInterval = 60000; // 1 minute
    this.init();
  }

  init() {
    this.startPerformanceTracking();
    this.setupAlertSystem();
    this.scheduleReporting();
  }

  /**
   * Track dashboard component loading performance
   */
  trackDashboardLoad(componentName, loadTime) {
    const timestamp = Date.now();
    const metric = {
      component: componentName,
      loadTime,
      timestamp,
      threshold: this.thresholds.dashboardLoadTime,
      status: loadTime <= this.thresholds.dashboardLoadTime ? 'healthy' : 'warning'
    };

    this.metrics.set(`dashboard_load_${componentName}_${timestamp}`, metric);

    if (metric.status === 'warning') {
      this.triggerAlert({
        type: 'performance',
        severity: 'warning',
        message: `Dashboard component ${componentName} load time exceeded threshold: ${loadTime}ms > ${this.thresholds.dashboardLoadTime}ms`,
        component: componentName,
        value: loadTime,
        threshold: this.thresholds.dashboardLoadTime
      });
    }

    return metric;
  }

  /**
   * Track API endpoint performance
   */
  trackAPIPerformance(endpoint, responseTime, statusCode) {
    const timestamp = Date.now();
    const isError = statusCode >= 400;
    const metric = {
      endpoint,
      responseTime,
      statusCode,
      timestamp,
      threshold: this.thresholds.apiResponseTime,
      status: this.getAPIStatus(responseTime, isError)
    };

    this.metrics.set(`api_${endpoint.replace(/\//g, '_')}_${timestamp}`, metric);

    if (metric.status === 'critical' || responseTime > this.thresholds.apiResponseTime) {
      this.triggerAlert({
        type: 'api_performance',
        severity: isError ? 'critical' : 'warning',
        message: `API endpoint ${endpoint} ${isError ? 'failed' : 'slow response'}: ${responseTime}ms`,
        endpoint,
        responseTime,
        statusCode,
        threshold: this.thresholds.apiResponseTime
      });
    }

    return metric;
  }

  /**
   * Track WebSocket latency and connection health
   */
  trackWebSocketPerformance(latency, connectionStatus, messageType) {
    const timestamp = Date.now();
    const metric = {
      latency,
      connectionStatus,
      messageType,
      timestamp,
      threshold: this.thresholds.websocketLatency,
      status: this.getWebSocketStatus(latency, connectionStatus)
    };

    this.metrics.set(`websocket_${messageType}_${timestamp}`, metric);

    if (metric.status === 'critical' || latency > this.thresholds.websocketLatency) {
      this.triggerAlert({
        type: 'websocket_performance',
        severity: connectionStatus === 'disconnected' ? 'critical' : 'warning',
        message: `WebSocket performance issue: ${latency}ms latency, status: ${connectionStatus}`,
        latency,
        connectionStatus,
        messageType,
        threshold: this.thresholds.websocketLatency
      });
    }

    return metric;
  }

  /**
   * Track corporate humor effectiveness with professional validation
   */
  trackHumorEffectiveness(content, appropriatenessScore, executiveApproval) {
    const timestamp = Date.now();
    const metric = {
      content: content.substring(0, 50) + '...', // Truncate for privacy
      appropriatenessScore,
      executiveApproval,
      timestamp,
      threshold: 96, // 96% executive appropriateness threshold
      status: appropriatenessScore >= 96 ? 'professional' : 'review_needed'
    };

    this.metrics.set(`humor_effectiveness_${timestamp}`, metric);

    if (metric.status === 'review_needed') {
      this.triggerAlert({
        type: 'content_appropriateness',
        severity: 'warning',
        message: `Corporate humor content below professional threshold: ${appropriatenessScore}% < 96%`,
        appropriatenessScore,
        executiveApproval,
        requiresReview: true
      });
    }

    return metric;
  }

  /**
   * Monitor system resource usage
   */
  trackSystemHealth() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = performance.memory;
      const metric = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
        memoryUsageMB: Math.round(memory.usedJSHeapSize / (1024 * 1024))
      };

      this.metrics.set(`system_health_${Date.now()}`, metric);

      if (metric.memoryUsageMB > this.thresholds.memoryUsage) {
        this.triggerAlert({
          type: 'memory_usage',
          severity: 'warning',
          message: `High memory usage detected: ${metric.memoryUsageMB}MB > ${this.thresholds.memoryUsage}MB`,
          memoryUsage: metric.memoryUsageMB,
          threshold: this.thresholds.memoryUsage
        });
      }

      return metric;
    }

    return null;
  }

  /**
   * Professional alerting system with executive-appropriate notifications
   */
  triggerAlert(alert) {
    const enrichedAlert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: Date.now(),
      businessImpact: this.assessBusinessImpact(alert),
      executiveNotification: this.shouldNotifyExecutives(alert),
      technicalDetails: this.generateTechnicalSummary(alert),
      mitigationSteps: this.getSuggestedMitigation(alert)
    };

    this.alerts.push(enrichedAlert);

    // Professional incident communication
    if (enrichedAlert.executiveNotification) {
      this.sendExecutiveNotification(enrichedAlert);
    }

    // Technical team notification
    this.sendTechnicalNotification(enrichedAlert);

    return enrichedAlert;
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    // Filter metrics from last hour
    const recentMetrics = Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.timestamp > lastHour)
      .map(([key, metric]) => metric);

    const report = {
      timestamp: now,
      timeframe: 'Last 60 minutes',
      
      // Dashboard Performance
      dashboardMetrics: this.analyzeDashboardPerformance(recentMetrics),
      
      // API Performance
      apiMetrics: this.analyzeAPIPerformance(recentMetrics),
      
      // WebSocket Performance
      websocketMetrics: this.analyzeWebSocketPerformance(recentMetrics),
      
      // Corporate Humor Effectiveness
      humorMetrics: this.analyzeHumorEffectiveness(recentMetrics),
      
      // System Health
      systemMetrics: this.analyzeSystemHealth(recentMetrics),
      
      // Executive Summary
      executiveSummary: this.generateExecutiveSummary(recentMetrics),
      
      // Alerts and Issues
      activeAlerts: this.alerts.filter(alert => alert.timestamp > lastHour),
      
      // Recommendations
      recommendations: this.generateRecommendations(recentMetrics)
    };

    return report;
  }

  /**
   * Executive-friendly performance summary
   */
  generateExecutiveSummary(metrics) {
    const totalRequests = metrics.length;
    const healthyRequests = metrics.filter(m => m.status === 'healthy' || m.status === 'professional').length;
    const healthPercentage = totalRequests > 0 ? Math.round((healthyRequests / totalRequests) * 100) : 100;

    return {
      overallHealth: healthPercentage >= 95 ? 'Excellent' : healthPercentage >= 85 ? 'Good' : 'Needs Attention',
      healthPercentage,
      totalRequests,
      activeIssues: this.alerts.filter(a => a.timestamp > Date.now() - 3600000).length,
      corporateHumorCompliance: this.calculateHumorCompliance(metrics),
      businessImpact: healthPercentage >= 95 ? 'Minimal' : healthPercentage >= 85 ? 'Low' : 'Moderate',
      recommendedActions: this.getExecutiveRecommendations(healthPercentage)
    };
  }

  /**
   * Integration with MCP Excel server for operational reporting
   */
  async exportToExcelMCP(report) {
    if (typeof window !== 'undefined' && window.mcpExcelIntegration) {
      try {
        const workbookData = this.formatReportForExcel(report);
        return await window.mcpExcelIntegration.createPerformanceReport(workbookData);
      } catch (error) {
        console.error('MCP Excel integration error:', error);
        return { success: false, error: error.message };
      }
    }
    
    return { success: false, error: 'MCP Excel integration not available' };
  }

  /**
   * Real-time metrics streaming for dashboard
   */
  getRealtimeMetrics() {
    return {
      timestamp: Date.now(),
      dashboard: {
        averageLoadTime: this.calculateAverageLoadTime(),
        componentsHealthy: this.getHealthyComponentCount(),
        totalComponents: 5 // PerformanceMetrics, PlayerAnalytics, BuzzwordEffectiveness, SystemHealth, DashboardPage
      },
      api: {
        averageResponseTime: this.calculateAverageAPIResponseTime(),
        successRate: this.calculateAPISuccessRate(),
        activeEndpoints: 4 // /performance, /players, /buzzwords, /system
      },
      websocket: {
        averageLatency: this.calculateAverageWebSocketLatency(),
        connectionHealth: this.getWebSocketConnectionHealth(),
        activeConnections: this.getActiveConnectionCount()
      },
      corporateHumor: {
        appropriatenessScore: this.calculateAverageAppropriatenessScore(),
        executiveApproval: this.getExecutiveApprovalRate(),
        contentReviewNeeded: this.getContentAwaitingReview()
      }
    };
  }

  // Helper methods for status determination
  getAPIStatus(responseTime, isError) {
    if (isError) return 'critical';
    if (responseTime > this.thresholds.apiResponseTime) return 'warning';
    return 'healthy';
  }

  getWebSocketStatus(latency, connectionStatus) {
    if (connectionStatus === 'disconnected') return 'critical';
    if (latency > this.thresholds.websocketLatency) return 'warning';
    return 'healthy';
  }

  // Business impact assessment
  assessBusinessImpact(alert) {
    const impactMap = {
      'critical': 'High - Service disruption affecting user experience',
      'warning': 'Medium - Performance degradation, monitor closely',
      'info': 'Low - Informational, no immediate action required'
    };
    return impactMap[alert.severity] || 'Unknown impact level';
  }

  shouldNotifyExecutives(alert) {
    return alert.severity === 'critical' || 
           (alert.type === 'content_appropriateness' && alert.requiresReview);
  }

  // Professional notification methods
  sendExecutiveNotification(alert) {
    const message = this.formatExecutiveAlert(alert);
    console.log('Executive Alert:', message);
    // Integration point for executive notification system
  }

  sendTechnicalNotification(alert) {
    console.log('Technical Alert:', alert);
    // Integration point for technical team notification system
  }

  formatExecutiveAlert(alert) {
    return {
      subject: `Engineer Memes Platform: ${alert.severity.toUpperCase()} Alert`,
      summary: alert.message,
      businessImpact: alert.businessImpact,
      recommendedAction: alert.mitigationSteps,
      technicalContact: 'DevOps Team',
      timestamp: new Date(alert.timestamp).toLocaleString()
    };
  }

  // Utility methods
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  startPerformanceTracking() {
    if (typeof window !== 'undefined') {
      // Track page load performance
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.trackDashboardLoad('initial_page_load', navigation.loadEventEnd - navigation.loadEventStart);
        }
      });

      // Track resource loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource' && entry.name.includes('/api/')) {
            this.trackAPIPerformance(entry.name, entry.responseEnd - entry.responseStart, 200);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  setupAlertSystem() {
    // Professional alerting configuration
    this.alertChannels = {
      executive: { threshold: 'critical', method: 'email' },
      technical: { threshold: 'warning', method: 'slack' },
      monitoring: { threshold: 'info', method: 'dashboard' }
    };
  }

  scheduleReporting() {
    setInterval(() => {
      const report = this.generatePerformanceReport();
      this.exportToExcelMCP(report);
    }, this.reportingInterval);
  }

  formatReportForExcel(report) {
    return {
      sheets: [
        {
          name: 'Executive Dashboard',
          data: [
            ['Metric', 'Value', 'Status', 'Timestamp'],
            ['Overall Health', `${report.executiveSummary.healthPercentage}%`, report.executiveSummary.overallHealth, new Date().toLocaleString()],
            ['Total Requests', report.executiveSummary.totalRequests, 'Info', new Date().toLocaleString()],
            ['Active Issues', report.executiveSummary.activeIssues, report.executiveSummary.activeIssues > 0 ? 'Warning' : 'Healthy', new Date().toLocaleString()],
            ['Corporate Humor Compliance', `${report.executiveSummary.corporateHumorCompliance}%`, 'Professional', new Date().toLocaleString()]
          ]
        },
        {
          name: 'Performance Metrics',
          data: this.formatMetricsForExcel(report)
        },
        {
          name: 'Alerts & Issues',
          data: this.formatAlertsForExcel(report.activeAlerts)
        }
      ]
    };
  }

  formatMetricsForExcel(report) {
    // Implementation for Excel formatting
    return [
      ['Component', 'Metric', 'Value', 'Threshold', 'Status'],
      ...Object.entries(report.dashboardMetrics || {}).map(([key, value]) => [
        'Dashboard', key, value, this.thresholds[key] || 'N/A', 'Healthy'
      ])
    ];
  }

  formatAlertsForExcel(alerts) {
    return [
      ['Alert ID', 'Type', 'Severity', 'Message', 'Timestamp', 'Business Impact'],
      ...alerts.map(alert => [
        alert.id,
        alert.type,
        alert.severity,
        alert.message,
        new Date(alert.timestamp).toLocaleString(),
        alert.businessImpact
      ])
    ];
  }

  // Analysis methods (placeholder implementations)
  analyzeDashboardPerformance(metrics) { return {}; }
  analyzeAPIPerformance(metrics) { return {}; }
  analyzeWebSocketPerformance(metrics) { return {}; }
  analyzeHumorEffectiveness(metrics) { return {}; }
  analyzeSystemHealth(metrics) { return {}; }
  generateRecommendations(metrics) { return []; }
  calculateHumorCompliance(metrics) { return 96; }
  getExecutiveRecommendations(healthPercentage) { return []; }
  calculateAverageLoadTime() { return 1500; }
  getHealthyComponentCount() { return 5; }
  calculateAverageAPIResponseTime() { return 150; }
  calculateAPISuccessRate() { return 99.8; }
  calculateAverageWebSocketLatency() { return 75; }
  getWebSocketConnectionHealth() { return 'Excellent'; }
  getActiveConnectionCount() { return 42; }
  calculateAverageAppropriatenessScore() { return 97.5; }
  getExecutiveApprovalRate() { return 98.2; }
  getContentAwaitingReview() { return 0; }
  generateTechnicalSummary(alert) { return `Technical details for ${alert.type}`; }
  getSuggestedMitigation(alert) { return `Recommended action for ${alert.severity} alert`; }
}

// Export for use in production environment
if (typeof window !== 'undefined') {
  window.DashboardPerformanceMonitor = DashboardPerformanceMonitor;
  window.dashboardMonitor = new DashboardPerformanceMonitor();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardPerformanceMonitor;
}