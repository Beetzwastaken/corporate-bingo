# Engineer Memes Dashboard API Specification

## Overview

Complete API specification for the Real-Time Performance Dashboard backend endpoints. All analytics endpoints provide comprehensive corporate humor analytics with professional-grade performance metrics.

## Base URLs

- **Development**: `http://localhost:8787`
- **Production**: `https://buzzword-bingo.your-worker.workers.dev`

## CORS Configuration

- **Allowed Origins**: 
  - `https://engineer-memes-ai.netlify.app`
  - `http://localhost:*` (all ports)
- **Methods**: `GET`, `POST`, `OPTIONS`
- **Headers**: `Content-Type`

## Analytics Dashboard Endpoints

### 1. Performance Metrics - GET `/api/dashboard/performance`

**Description**: Real-time system performance and corporate humor engagement metrics.

**Response Schema**:
```json
{
  "responseTime": 85,
  "throughput": 547,
  "errorRate": 0.2,
  "uptime": 99.94,
  "activeUsers": 1847,
  "peakConcurrentUsers": 2750,
  "totalBuzzwordsTriggered": 142350,
  "buzzwordVelocity": 14.7,
  "averageMeetingSurvivalRate": 78.4,
  "topBuzzwords": [
    {
      "word": "Synergy",
      "count": 2847,
      "trend": "up",
      "effectiveness": 92
    }
  ],
  "activeRooms": 47,
  "averageGameDuration": 24.3,
  "completionRate": 82.1,
  "cheatingAttempts": 7,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Corporate Humor Context**:
- `buzzwordVelocity`: Corporate speak detection rate (buzzwords/minute)
- `averageMeetingSurvivalRate`: Percentage of games completed successfully
- `topBuzzwords`: Most effective corporate terms with humor ratings
- Response times include "corporate efficiency" humor annotations

**Update Frequency**: Real-time via WebSocket, HTTP polling every 10 seconds

---

### 2. Player Analytics - GET `/api/dashboard/players`

**Description**: User engagement analytics with corporate humor participation metrics.

**Response Schema**:
```json
{
  "totalPlayers": 18750,
  "newPlayersToday": 285,
  "returningPlayers": 823,
  "averageSessionDuration": 28.5,
  "playerEngagement": {
    "highly_engaged": 42,
    "moderately_engaged": 38,
    "low_engagement": 20
  },
  "geographicDistribution": [
    {
      "region": "North America",
      "playerCount": 7500,
      "percentage": 40
    }
  ],
  "deviceBreakdown": {
    "mobile": 52,
    "desktop": 35,
    "tablet": 13
  },
  "topPlayerActions": [
    {
      "action": "Buzzword Claimed",
      "count": 9350,
      "trend": "up"
    },
    {
      "action": "Self-Claim Detected",
      "count": 95,
      "trend": "down"
    }
  ]
}
```

**Corporate Humor Context**:
- Player engagement levels based on "meeting survival" skills
- Geographic data shows "corporate culture penetration"
- Device breakdown indicates "meeting participation methods"

---

### 3. Buzzword Effectiveness - GET `/api/dashboard/buzzwords`

**Description**: Content effectiveness and corporate humor optimization analytics.

**Response Schema**:
```json
{
  "overallEffectiveness": 87.3,
  "categoryPerformance": [
    {
      "category": "Classic Corporate Speak",
      "effectiveness": 92,
      "usage": 2847,
      "trend": "up"
    }
  ],
  "topPerformers": [
    {
      "buzzword": "Synergy",
      "effectiveness": 95,
      "usage": 2847,
      "corporateRelevance": 98,
      "humourRating": 94
    }
  ],
  "underperformers": [
    {
      "buzzword": "Best Practice",
      "effectiveness": 45,
      "reasons": ["Overused", "Lost impact", "Too generic"],
      "suggestions": ["Replace with specific terms", "Retire temporarily"]
    }
  ],
  "emergingTrends": [
    {
      "buzzword": "AI-powered",
      "growthRate": 145,
      "potential": 87
    }
  ]
}
```

**Corporate Humor Context**:
- Effectiveness scores based on player reaction and engagement
- Corporate relevance measures "authenticity" in business contexts
- Humor ratings from community feedback on term effectiveness

---

### 4. System Health - GET `/api/dashboard/system`

**Description**: Infrastructure health monitoring with corporate IT humor.

**Response Schema**:
```json
{
  "serverStatus": "healthy",
  "cloudflareStatus": "operational",
  "netlifyStatus": "operational",
  "cpuUsage": 23.5,
  "memoryUsage": 56.2,
  "networkLatency": 28,
  "activeConnections": 1456,
  "connectionSuccess": 99.7,
  "messageDeliveryRate": 99.8,
  "recentIncidents": [
    {
      "id": "inc-001",
      "severity": "low",
      "title": "Brief WebSocket Latency Increase",
      "description": "Slight increase in message delivery time",
      "timestamp": "2024-01-15T09:30:00.000Z",
      "resolved": true
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Corporate IT Humor Context**:
- System status with humorous IT terminology
- Performance metrics with "enterprise reliability" context
- Incident descriptions using corporate IT euphemisms

---

### 5. Real-Time Dashboard WebSocket - GET `/api/dashboard/ws`

**Description**: WebSocket endpoint for live dashboard updates with sub-100ms latency.

**Connection Process**:
```javascript
// Frontend WebSocket connection
const ws = new WebSocket('ws://localhost:8787/api/dashboard/ws');

ws.onopen = () => {
  console.log('Dashboard WebSocket connected');
  // Send ping for connection health
  ws.send(JSON.stringify({ type: 'ping' }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleDashboardUpdate(message);
};
```

**Message Types**:

#### Initial Data (Sent on Connection)
```json
{
  "type": "initial_data",
  "payload": {
    "metrics": { /* Performance metrics object */ },
    "playerAnalytics": { /* Player analytics object */ },
    "systemHealth": { /* System health object */ },
    "buzzwordEffectiveness": { /* Buzzword effectiveness object */ }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Real-Time Updates
```json
{
  "type": "metrics_update",
  "payload": { /* Updated metrics data */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

```json
{
  "type": "player_action",
  "payload": {
    "action": "bingo_achieved",
    "playerId": "abc123",
    "roomCode": "DEMO01",
    "details": { /* Action details */ }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

```json
{
  "type": "buzzword_claim",
  "payload": {
    "buzzword": "Synergy",
    "playerId": "def456",
    "verified": true,
    "effectiveness": 92
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Connection Health**:
- Send `ping` messages every 30 seconds
- Server responds with `pong` and timestamp
- Auto-reconnect on connection loss
- Maximum 100ms latency for real-time updates

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error description",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoint": "/api/dashboard/performance"
}
```

**Common Error Codes**:
- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Endpoint not available
- `429`: Too Many Requests - Rate limiting exceeded
- `500`: Internal Server Error - Backend processing error

## Rate Limiting

- **Analytics Endpoints**: 60 requests per minute per IP
- **WebSocket Connections**: 5 concurrent connections per IP
- **Dashboard Updates**: Real-time streaming with throttling at 10 updates/second

## Authentication

No authentication required for analytics endpoints. Public dashboard access with rate limiting protection.

## Data Retention

- **Real-time metrics**: 24 hours in memory
- **Historical data**: 30 days in Durable Object storage
- **Excel integration**: Comprehensive long-term storage via MCP
- **WebSocket events**: 1 hour message history for reconnection

## Frontend Integration Examples

### React Hook for Real-Time Analytics
```javascript
import { useState, useEffect } from 'react';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8787/api/dashboard/ws');
    
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'metrics_update') {
        setMetrics(message.payload);
      }
    };

    // Cleanup
    return () => ws.close();
  }, []);

  return { metrics, connected };
}
```

### HTTP Polling Fallback
```javascript
async function fetchDashboardData() {
  const [metrics, players, buzzwords, health] = await Promise.all([
    fetch('/api/dashboard/performance').then(r => r.json()),
    fetch('/api/dashboard/players').then(r => r.json()),
    fetch('/api/dashboard/buzzwords').then(r => r.json()),
    fetch('/api/dashboard/system').then(r => r.json())
  ]);

  return { metrics, players, buzzwords, health };
}
```

## Corporate Humor Features

### Terminology
- **Meeting Survival Rate**: Game completion percentage
- **Buzzword Velocity**: Corporate speak detection rate
- **C-suite Engagement**: Executive-level humor effectiveness
- **Peak Corporate Hours**: High-activity periods (9-11 AM, 2-4 PM)
- **Cheat Detection**: "Self-proclamation prevention system"

### Status Indicators
- Response times: "Blazing Fast" | "Good" | "Sluggish" | "Needs Coffee"
- Uptime: "Rock Solid" | "Reliable" | "Mostly Up" | "On Fire"
- Error rates: "Pristine" | "Acceptable" | "Concerning" | "Code Red"

### Performance Annotations
All metrics include corporate humor context for executive-friendly presentation while maintaining technical accuracy for development teams.

## MCP Excel Integration

Analytics data is automatically stored in Excel format via MCP server integration:

- **Performance_Metrics** sheet: Time-series performance data
- **Player_Analytics** sheet: User engagement and demographics  
- **Buzzword_Effectiveness** sheet: Content performance tracking
- **System_Health** sheet: Infrastructure monitoring data
- **Real_Time_Events** sheet: Detailed event logging
- **Summary_Dashboard** sheet: Executive summary with trends

Access via Excel MCP functions or direct file export for offline analysis.

---

**API Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Contact**: Backend Dev Agent - Engineer Memes Project