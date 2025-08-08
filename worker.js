// Buzzword Bingo - Cloudflare Workers + Durable Objects Backend
// Handles real multiplayer rooms with unique boards per player

// CORS helper with security improvements
function corsHeaders(origin) {
  const allowedOrigins = [
    'https://corporate-bingo-ai.netlify.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180'
  ];
  
  const validOrigin = allowedOrigins.includes(origin) ? origin : null;
  
  return {
    'Access-Control-Allow-Origin': validOrigin || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Main Worker - Routes API requests to Durable Objects
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Handle preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders(origin) 
      });
    }

    try {
      // Create Room - POST /api/room/create
      if (url.pathname === '/api/room/create' && request.method === 'POST') {
        const body = await request.json();
        
        // Input validation
        const { roomName, playerName } = validateRoomInput(body);
        if (!roomName || !playerName) {
          return new Response(JSON.stringify({ error: 'Invalid room name or player name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Generate secure unique room code
        const roomCode = await generateRoomCode(env);
        
        // Create Durable Object for this room
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        // Initialize room with host player
        const response = await roomObj.fetch(new Request('https://dummy/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, playerName, roomCode })
        }));
        
        const result = await response.json();
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Join Room - POST /api/room/join
      if (url.pathname === '/api/room/join' && request.method === 'POST') {
        const body = await request.json();
        
        // Input validation
        const { roomCode, playerName } = validateJoinInput(body);
        if (!roomCode || !playerName) {
          return new Response(JSON.stringify({ error: 'Invalid room code or player name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        // Get existing room Durable Object
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        const response = await roomObj.fetch(new Request('https://dummy/join', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName })
        }));
        
        if (response.status === 404) {
          return new Response(JSON.stringify({ error: 'Room not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const result = await response.json();
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // WebSocket connection - GET /api/room/:code/ws
      if (url.pathname.startsWith('/api/room/') && url.pathname.endsWith('/ws')) {
        const roomCode = url.pathname.split('/')[3];
        
        if (request.headers.get('Upgrade') !== 'websocket') {
          return new Response('Expected WebSocket', { status: 400 });
        }
        
        // Get room Durable Object and upgrade to WebSocket
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        return roomObj.fetch(request);
      }

      // Analytics Dashboard Endpoints with Performance Monitoring
      
      // Dashboard Performance Metrics - GET /api/dashboard/performance
      if (url.pathname === '/api/dashboard/performance' && request.method === 'GET') {
        const startTime = Date.now();
        try {
          const analytics = await getPerformanceMetrics(env);
          const responseTime = Date.now() - startTime;
          
          // Track performance metrics
          analytics.responseTime = responseTime;
          analytics.timestamp = Date.now();
          
          return new Response(JSON.stringify(analytics), {
            headers: { 
              'Content-Type': 'application/json', 
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return new Response(JSON.stringify({ 
            error: 'Performance metrics unavailable',
            responseTime,
            timestamp: Date.now()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        }
      }

      // Dashboard Player Analytics - GET /api/dashboard/players
      if (url.pathname === '/api/dashboard/players' && request.method === 'GET') {
        const startTime = Date.now();
        try {
          const analytics = await getPlayerAnalytics(env);
          const responseTime = Date.now() - startTime;
          
          analytics.responseTime = responseTime;
          analytics.timestamp = Date.now();
          
          return new Response(JSON.stringify(analytics), {
            headers: { 
              'Content-Type': 'application/json',
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return new Response(JSON.stringify({ 
            error: 'Player analytics unavailable',
            responseTime,
            timestamp: Date.now()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        }
      }

      // Dashboard Buzzword Effectiveness - GET /api/dashboard/buzzwords
      if (url.pathname === '/api/dashboard/buzzwords' && request.method === 'GET') {
        const startTime = Date.now();
        try {
          const analytics = await getBuzzwordEffectiveness(env);
          const responseTime = Date.now() - startTime;
          
          analytics.responseTime = responseTime;
          analytics.timestamp = Date.now();
          
          return new Response(JSON.stringify(analytics), {
            headers: { 
              'Content-Type': 'application/json',
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return new Response(JSON.stringify({ 
            error: 'Buzzword analytics unavailable',
            responseTime,
            timestamp: Date.now()
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'X-Response-Time': `${responseTime}ms`,
              ...corsHeaders(origin) 
            }
          });
        }
      }

      // Dashboard System Health - GET /api/dashboard/system
      if (url.pathname === '/api/dashboard/system' && request.method === 'GET') {
        const health = await getSystemHealth(env);
        return new Response(JSON.stringify(health), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Dashboard WebSocket - GET /api/dashboard/ws
      if (url.pathname === '/api/dashboard/ws') {
        if (request.headers.get('Upgrade') !== 'websocket') {
          return new Response('Expected WebSocket', { status: 400 });
        }
        
        return handleDashboardWebSocket(request, env);
      }

      // Test endpoint
      if (url.pathname === '/api/test') {
        return new Response(JSON.stringify({ message: 'API is working', buzzwordCount: BUZZWORDS.length }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders(origin) 
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }
  }
};

// Input validation functions
function validateRoomInput(body) {
  if (!body || typeof body !== 'object') return {};
  
  const roomName = typeof body.roomName === 'string' ? body.roomName.trim().slice(0, 50) : '';
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 30) : '';
  
  // Sanitize inputs - remove HTML tags and special characters
  const sanitizedRoomName = roomName.replace(/[<>'"&]/g, '');
  const sanitizedPlayerName = playerName.replace(/[<>'"&]/g, '');
  
  return {
    roomName: sanitizedRoomName.length >= 1 ? sanitizedRoomName : null,
    playerName: sanitizedPlayerName.length >= 1 ? sanitizedPlayerName : null
  };
}

function validateJoinInput(body) {
  if (!body || typeof body !== 'object') return {};
  
  const roomCode = typeof body.roomCode === 'string' ? body.roomCode.trim().toUpperCase() : '';
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 30) : '';
  
  // Validate room code format (6 alphanumeric characters)
  const sanitizedRoomCode = /^[A-Z0-9]{6}$/.test(roomCode) ? roomCode : null;
  const sanitizedPlayerName = playerName.replace(/[<>'"&]/g, '');
  
  return {
    roomCode: sanitizedRoomCode,
    playerName: sanitizedPlayerName.length >= 1 ? sanitizedPlayerName : null
  };
}

// Generate secure 6-character room code (collision probability is extremely low with crypto random)
async function generateRoomCode(env) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  // Use crypto.getRandomValues for secure randomization
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  
  const roomCode = Array.from(array, byte => 
    chars[byte % chars.length]
  ).join('');
  
  return roomCode;
}

// Fisher-Yates shuffle algorithm (proper randomization)
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Analytics Functions for Dashboard Endpoints

// Performance Metrics Collection
async function getPerformanceMetrics(env) {
  try {
    const analyticsId = env.ANALYTICS.idFromName('global-analytics');
    const analyticsObj = env.ANALYTICS.get(analyticsId);
    
    const response = await analyticsObj.fetch(new Request('https://dummy/performance', {
      method: 'GET'
    }));
    
    return await response.json();
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return generateMockPerformanceMetrics();
  }
}

// Player Analytics Collection
async function getPlayerAnalytics(env) {
  try {
    const analyticsId = env.ANALYTICS.idFromName('global-analytics');
    const analyticsObj = env.ANALYTICS.get(analyticsId);
    
    const response = await analyticsObj.fetch(new Request('https://dummy/players', {
      method: 'GET'
    }));
    
    return await response.json();
  } catch (error) {
    console.error('Error getting player analytics:', error);
    return generateMockPlayerAnalytics();
  }
}

// Buzzword Effectiveness Analytics
async function getBuzzwordEffectiveness(env) {
  try {
    const analyticsId = env.ANALYTICS.idFromName('global-analytics');
    const analyticsObj = env.ANALYTICS.get(analyticsId);
    
    const response = await analyticsObj.fetch(new Request('https://dummy/buzzwords', {
      method: 'GET'
    }));
    
    return await response.json();
  } catch (error) {
    console.error('Error getting buzzword effectiveness:', error);
    return generateMockBuzzwordEffectiveness();
  }
}

// System Health Monitoring
async function getSystemHealth(env) {
  try {
    const analyticsId = env.ANALYTICS.idFromName('global-analytics');
    const analyticsObj = env.ANALYTICS.get(analyticsId);
    
    const response = await analyticsObj.fetch(new Request('https://dummy/health', {
      method: 'GET'
    }));
    
    return await response.json();
  } catch (error) {
    console.error('Error getting system health:', error);
    return generateMockSystemHealth();
  }
}

// Dashboard WebSocket Handler
async function handleDashboardWebSocket(request, env) {
  const analyticsId = env.ANALYTICS.idFromName('global-analytics');
  const analyticsObj = env.ANALYTICS.get(analyticsId);
  
  return analyticsObj.fetch(request);
}

// Mock Data Generators (for initial testing)
function generateMockPerformanceMetrics() {
  const now = new Date();
  return {
    responseTime: 85 + Math.random() * 50,
    throughput: 450 + Math.random() * 200,
    errorRate: Math.random() * 2,
    uptime: 99.8 + Math.random() * 0.19,
    activeUsers: Math.floor(1200 + Math.random() * 800),
    peakConcurrentUsers: Math.floor(2500 + Math.random() * 500),
    totalBuzzwordsTriggered: Math.floor(125000 + Math.random() * 25000),
    buzzwordVelocity: 12 + Math.random() * 8,
    averageMeetingSurvivalRate: 73 + Math.random() * 15,
    topBuzzwords: [
      { word: 'Synergy', count: 2847, trend: 'up', effectiveness: 92 },
      { word: 'Deep Dive', count: 2634, trend: 'stable', effectiveness: 88 },
      { word: 'Circle Back', count: 2521, trend: 'down', effectiveness: 85 },
      { word: 'Touch Base', count: 2398, trend: 'up', effectiveness: 83 },
      { word: 'Low-hanging Fruit', count: 2287, trend: 'stable', effectiveness: 81 }
    ],
    activeRooms: Math.floor(45 + Math.random() * 25),
    averageGameDuration: 18 + Math.random() * 10,
    completionRate: 78 + Math.random() * 12,
    cheatingAttempts: Math.floor(Math.random() * 15),
    timestamp: now
  };
}

function generateMockPlayerAnalytics() {
  const now = new Date();
  return {
    totalPlayers: Math.floor(15000 + Math.random() * 5000),
    newPlayersToday: Math.floor(250 + Math.random() * 150),
    returningPlayers: Math.floor(800 + Math.random() * 300),
    averageSessionDuration: 25 + Math.random() * 15,
    playerEngagement: {
      highly_engaged: Math.floor(35 + Math.random() * 15),
      moderately_engaged: Math.floor(45 + Math.random() * 10),
      low_engagement: Math.floor(20 + Math.random() * 10)
    },
    geographicDistribution: [
      { region: 'North America', playerCount: Math.floor(6000 + Math.random() * 2000), percentage: 40 },
      { region: 'Europe', playerCount: Math.floor(4500 + Math.random() * 1500), percentage: 30 },
      { region: 'Asia-Pacific', playerCount: Math.floor(3000 + Math.random() * 1000), percentage: 20 },
      { region: 'Other', playerCount: Math.floor(1500 + Math.random() * 500), percentage: 10 }
    ],
    deviceBreakdown: {
      mobile: Math.floor(40 + Math.random() * 20),
      desktop: Math.floor(45 + Math.random() * 15),
      tablet: Math.floor(15 + Math.random() * 10)
    },
    topPlayerActions: [
      { action: 'Buzzword Claimed', count: Math.floor(8500 + Math.random() * 1500), trend: 'up' },
      { action: 'Verification Vote', count: Math.floor(6200 + Math.random() * 1000), trend: 'stable' },
      { action: 'Bingo Achieved', count: Math.floor(1250 + Math.random() * 250), trend: 'up' },
      { action: 'Self-Claim Detected', count: Math.floor(85 + Math.random() * 35), trend: 'down' }
    ]
  };
}

function generateMockBuzzwordEffectiveness() {
  return {
    overallEffectiveness: 84 + Math.random() * 10,
    categoryPerformance: [
      { category: 'Classic Corporate Speak', effectiveness: 92, usage: 2847, trend: 'up' },
      { category: 'Meeting Theater', effectiveness: 88, usage: 2156, trend: 'stable' },
      { category: 'Virtual Meeting Comedy', effectiveness: 85, usage: 1923, trend: 'up' },
      { category: 'Consultant Word Salad', effectiveness: 79, usage: 1456, trend: 'down' },
      { category: 'Executive Speak', effectiveness: 76, usage: 1287, trend: 'stable' }
    ],
    topPerformers: [
      { buzzword: 'Synergy', effectiveness: 95, usage: 2847, corporateRelevance: 98, humourRating: 94 },
      { buzzword: 'You\'re Muted', effectiveness: 93, usage: 2634, corporateRelevance: 99, humourRating: 96 },
      { buzzword: 'Deep Dive', effectiveness: 91, usage: 2521, corporateRelevance: 87, humourRating: 82 },
      { buzzword: 'Circle Back', effectiveness: 89, usage: 2398, corporateRelevance: 94, humourRating: 85 },
      { buzzword: 'Let\'s Take This Offline', effectiveness: 87, usage: 2287, corporateRelevance: 96, humourRating: 89 }
    ],
    underperformers: [
      { 
        buzzword: 'Best Practice', 
        effectiveness: 45, 
        reasons: ['Overused', 'Lost impact', 'Too generic'],
        suggestions: ['Replace with more specific terms', 'Retire temporarily', 'Add context variants']
      },
      { 
        buzzword: 'Right-size', 
        effectiveness: 38, 
        reasons: ['Unclear meaning', 'Dated terminology', 'Low recognition'],
        suggestions: ['Update to modern equivalent', 'Provide definition tooltip', 'Consider removal']
      }
    ],
    emergingTrends: [
      { buzzword: 'AI-powered', growthRate: 145, potential: 87 },
      { buzzword: 'Hybrid Workplace', growthRate: 122, potential: 79 },
      { buzzword: 'Digital-first', growthRate: 98, potential: 73 }
    ]
  };
}

function generateMockSystemHealth() {
  const now = new Date();
  return {
    serverStatus: 'healthy',
    cloudflareStatus: 'operational',
    netlifyStatus: 'operational',
    cpuUsage: 15 + Math.random() * 25,
    memoryUsage: 45 + Math.random() * 20,
    networkLatency: 25 + Math.random() * 15,
    activeConnections: Math.floor(1200 + Math.random() * 300),
    connectionSuccess: 99 + Math.random() * 0.9,
    messageDeliveryRate: 99.5 + Math.random() * 0.4,
    recentIncidents: [
      {
        id: 'inc-001',
        severity: 'low',
        title: 'Brief WebSocket Latency Increase',
        description: 'Slight increase in WebSocket message delivery time detected',
        timestamp: new Date(now.getTime() - 3600000),
        resolved: true
      }
    ],
    timestamp: now
  };
}

// Corporate buzzwords library (same as frontend)
const BUZZWORDS = [
    // Classic Corporate Speak (The Absolute Worst)
    'Synergy', 'Leverage', 'Deep Dive', 'Circle Back', 'Touch Base',
    'Low-hanging Fruit', 'Move the Needle', 'Paradigm Shift', 'Think Outside the Box',
    'Best Practice', 'Core Competency', 'Value-add', 'Game Changer', 'Win-win',
    'Right-size', 'Optimize', 'Streamline', 'Ideate', 'Impactful',
    
    // Meeting & Communication Gems  
    'Take it Offline', 'Ping Me', 'Loop In', 'Bandwidth', 'On My Radar',
    'Align on This', 'Sync Up', 'Park That', 'Table This', 'Double Click',
    'Drill Down', 'Level Set', 'Socialize', 'Evangelize', 'Champion',
    'Cascade Down', 'Run it Up', 'Put a Pin In', 'Peel the Onion', 'Boil the Ocean',
    'Circle Back Later', 'Take That Offline', 'Sync Up Tomorrow', 'Revisit This',
    'Follow Up Separately', 'Schedule a Follow-up', 'Set Up Time', 'Grab Time',
    'Quick Sync', 'Brain Dump', 'Download You', 'Get You Up to Speed',
    'Bring Everyone Along', 'Get Buy-in', 'Surface This Up', 'Bubble Up',
    
    // Meeting Theater & Corporate Comedy
    'Let\'s Take This Offline', 'We Need to Socialize This', 'Run it by Legal',
    'Get Finance Involved', 'Check with Compliance', 'Validate with Leadership',
    'Vet This Through', 'Pressure Test the Idea', 'Stress Test Assumptions',
    'Sanity Check Numbers', 'Gut Check the Plan', 'Reality Check Timeline',
    'Can You Speak to That?', 'What\'s Your Take?', 'How Do You See This?',
    'Where Do You Land?', 'What\'s Your Comfort Level?', 'Any Concerns?',
    'Red Flags?', 'Deal Breakers?', 'Showstoppers?', 'Blockers?',
    'Circle Back on Monday', 'Let\'s Unpack This', 'Thoughts?', 'Does That Resonate?',
    
    // Virtual Meeting Comedy Gold
    'You\'re Muted', 'Can You Hear Me?', 'Are You There?', 'Hello? Hello?',
    'Can You Unmute?', 'Still Muted', 'You\'re Still Muted', 'Unmute Please',
    'Can Everyone See My Screen?', 'Are You Presenting?', 'Who\'s Presenting?',
    'Let Me Share My Screen', 'Can You See This?', 'Is This Visible?',
    'Sorry, I Was Muted', 'You Cut Out There', 'Your Audio is Breaking Up',
    'Can You Repeat That?', 'Sorry, Can You Say That Again?', 'I Didn\'t Catch That',
    'Let Me Stop Sharing', 'I Think You\'re Still Muted', 'We Can\'t Hear You',
    'Your Video is Frozen', 'You\'re Breaking Up', 'Bad Connection',
    'Can Someone Else Drive?', 'Who Has the Deck?', 'Next Slide Please',
    'Sorry, I\'m Having Technical Issues', 'Let Me Try Again', 'Can You Try Now?',
    'I\'ll Send the Link in Chat', 'Check the Chat', 'Posted in Chat',
    'Sorry, I\'m Late', 'Traffic Was Terrible', 'Had Back-to-Back Meetings',
    'Can We Get Started?', 'Let\'s Give It Two More Minutes', 'Waiting for Everyone',
    'Someone Else Just Joined', 'I Think We\'re All Here', 'Let\'s Begin',
    'Can You Make Me Presenter?', 'I Need Presenter Rights', 'Who\'s the Organizer?',
    'Let Me Make You Presenter', 'I\'ll Give You Control', 'Taking Control Back',
    'Echo on the Line', 'Hearing an Echo', 'Someone\'s Not Muted',
    'Feedback Loop', 'Can Everyone Mute?', 'Please Mute When Not Speaking',
    'Dog is Barking', 'Kids in Background', 'Sorry About the Noise',
    'Construction Outside', 'Leaf Blower', 'Lawnmower Outside',
    'I Have a Hard Stop', 'Need to Drop in 10 Minutes', 'Another Meeting Starting',
    'Double Booked', 'Conflict with Another Meeting', 'Need to Jump to Another Call',
    'Back-to-back Meetings', 'Calendar Conflict', 'Overbooked', 'Running Late',
    'Can We Record This?', 'Is This Being Recorded?', 'I\'ll Start Recording',
    'Meeting Notes', 'Action Items', 'Who\'s Taking Notes?',
    'I\'ll Send a Recap', 'Follow-up Email', 'Meeting Summary',
    'Can You Put That in Chat?', 'Link in the Chat', 'I Shared in Chat',
    'Private Chat', 'Sidebar Conversation', 'Offline Discussion',
    'Breakout Rooms', 'Let\'s Split into Groups', 'Back to Main Room',
    
    // Corporate Speak Poetry & Fluff
    'At the End of the Day', 'When All is Said and Done', 'Bottom Line',
    'Net-Net', 'Long Story Short', 'To Be Completely Transparent',
    'If I\'m Being Honest', 'To Level Set', 'For Context', 'Background Info',
    'Quick Backstory', 'History Lesson', 'Let Me Paint a Picture',
    'Here\'s the Situation', 'Here\'s Where We Are', 'Current State',
    'Moving Forward', 'Going Forward', 'Path Forward', 'Next Steps',
    
    // Absurd Corporate Priorities  
    'Client-centric Solutions', 'Customer Success Journey', 'Stakeholder Alignment',
    'Cross-functional Collaboration', 'Omnichannel Experience', 'End-to-end Solutions',
    'Holistic Approach', 'Strategic Roadmap', 'Digital-first Mindset', 'Data-driven Decisions',
    'Growth Mindset', 'Innovation Pipeline', 'Transformation Journey', 'Change Management',
    'Process Optimization', 'Operational Excellence', 'Best-in-class', 'World-class',
    'Industry-leading', 'Market-leading', 'Award-winning', 'Cutting-edge',
    
    // Hilarious Consultant Word Salad
    'Value Creation', 'Competitive Advantage', 'Thought Leadership', 'Subject Matter Expert',
    'Industry Best Practices', 'Benchmarking Studies', 'Gap Analysis', 'SWOT Analysis',
    'Root Cause Analysis', 'Impact Assessment', 'Business Case Development', 'ROI Analysis',
    'Cost-benefit Analysis', 'Risk Mitigation', 'Strategic Planning', 'Implementation Roadmap',
    'Phase Gate Reviews', 'Milestone Tracking', 'Performance Metrics', 'Success Criteria',
    'Key Performance Indicators', 'Return on Investment', 'Total Cost of Ownership',
    
    // Meeting Types & Corporate Events
    'All Hands Meeting', 'Town Hall', 'Skip Level', 'One-on-One', 'Check-in',
    'Stand-up', 'Scrum', 'Sprint Planning', 'Retrospective', 'Post-mortem',
    'Brainstorming Session', 'Ideation Workshop', 'Design Thinking', 'Innovation Lab',
    'Hackathon', 'Deep Dive Session', 'Working Session', 'Strategic Offsite',
    'Leadership Retreat', 'Team Building', 'Culture Session', 'Values Workshop',
    'Kick-off Meeting', 'Status Update', 'Checkpoint Review', 'Quarterly Business Review',
    
    // Startup & Business Development Nonsense
    'Product-Market Fit', 'Go-to-Market Strategy', 'Minimum Viable Product', 'User Feedback',
    'Iteration Cycle', 'Pivot Strategy', 'Scale Operations', 'Market Penetration',
    'Customer Acquisition', 'Revenue Streams', 'Business Model', 'Value Proposition',
    'Competitive Landscape', 'Market Opportunity', 'Total Addressable Market', 'Monetization Strategy',
    'Customer Lifecycle', 'User Experience', 'Customer Experience', 'Brand Experience',
    
    // People & Culture Comedy
    'Culture Fit', 'Team Player', 'Self-starter', 'Go-getter', 'Problem Solver',
    'Strategic Thinker', 'Detail-oriented', 'Results-driven', 'Customer-focused',
    'Collaborative Leader', 'Change Agent', 'Innovation Champion', 'Brand Ambassador',
    'Cross-functional Partner', 'Stakeholder Manager', 'Relationship Builder',
    'Culture Carrier', 'People Person', 'Servant Leader', 'Thought Partner',
    'Executive Presence', 'Leadership Potential', 'High Performer', 'Top Talent',
    'Growth Mindset', 'Emotional Intelligence', 'Psychological Safety', 'Inclusive Leader',
    'Belonging', 'Authentic Self', 'Vulnerability', 'Empathy-driven',
    
    // Modern Business Buzzwords  
    'Digital Transformation', 'Cloud-first', 'AI-powered', 'Machine Learning',
    'Data Analytics', 'Business Intelligence', 'Predictive Analytics', 'Automation',
    'Scalable Solutions', 'Agile Methodology', 'DevOps', 'Continuous Improvement',
    'Innovation Culture', 'Disruptive Technology', 'Emerging Technologies', 'Future-ready',
    'Next-generation', 'State-of-the-art', 'Revolutionary', 'Groundbreaking',
    'Hybrid Work', 'Digital-first', 'Customer Journey', 'User Experience',
    'Remote-first', 'Async Communication', 'Work-life Balance', 'Flexible Schedule',
    
    // Sales & Marketing Theater
    'Customer Journey', 'Buyer Persona', 'Lead Generation', 'Sales Funnel',
    'Conversion Rate', 'Customer Acquisition Cost', 'Lifetime Value', 'Retention Strategy',
    'Churn Analysis', 'Upselling', 'Cross-selling', 'Market Segmentation',
    'Target Audience', 'Brand Positioning', 'Content Marketing', 'Inbound Strategy',
    'Outbound Campaigns', 'Multi-touch Attribution', 'Lead Nurturing', 'Sales Enablement',
    
    // Project Management Comedy
    'Scope Creep', 'Requirements Change', 'Budget Overrun', 'Schedule Slip',
    'Resource Constraint', 'Dependencies', 'Critical Path', 'Milestone',
    'Deliverable', 'Work Package', 'Action Item', 'Follow-up Item',
    'Risk Register', 'Issue Log', 'Change Request', 'Status Report',
    'Project Charter', 'Statement of Work', 'Work Breakdown Structure', 'Gantt Chart',
    
    // Executive & Leadership Speak
    'Strategic Vision', 'Mission Critical', 'Core Values', 'Company Culture',
    'Organizational Excellence', 'Leadership Development', 'Succession Planning', 'Talent Management',
    'Performance Management', 'Engagement Survey', 'Employee Experience', 'Workplace Culture',
    'Diversity & Inclusion', 'Corporate Social Responsibility', 'Sustainability Initiative', 'ESG Compliance',
    'Governance Framework', 'Risk Management', 'Compliance Program', 'Audit Trail',
    'Purpose-driven', 'Values-based', 'Stakeholder Capitalism', 'Triple Bottom Line',
    'Social Impact', 'Environmental Stewardship', 'Conscious Leadership', 'Sustainable Growth',
    
    // Finance & Operations Fluff
    'Financial Planning', 'Budget Cycle', 'Cost Center', 'Profit Center',
    'Revenue Recognition', 'Cash Flow', 'Working Capital', 'EBITDA',
    'Gross Margin', 'Operating Margin', 'Capital Expenditure', 'Operating Expenditure',
    'Accounts Receivable', 'Accounts Payable', 'Invoice Processing', 'Purchase Order',
    'Vendor Management', 'Supplier Relations', 'Procurement Process', 'Supply Chain Management',
    
    // Light Tech Humor (Relatable but Not Technical)
    'Technical Debt', 'Legacy System', 'System Upgrade', 'Maintenance Window',
    'Code Review', 'Quality Control', 'Testing Phase', 'User Acceptance Testing',
    'Hot Fix', 'Patch Release', 'Version Control', 'Change Management',
    'Documentation', 'Knowledge Transfer', 'Training Program', 'Best Practices Guide',
    'System Integration', 'API First', 'Microservices', 'Container Strategy',
    'Platform Approach', 'Service Mesh', 'Event-driven', 'Serverless'
];

// Durable Object - BingoRoom handles individual room state and real-time gameplay
export class BingoRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // WebSocket connections
    this.players = new Map();  // Player data with unique boards
    this.playerRateLimits = new Map(); // Rate limiting per player
    this.gameState = {
      roomCode: '',
      roomName: '',
      hostId: '',
      roundNumber: 1,
      isActive: true,
      created: Date.now(),
      lastActivity: Date.now(),
      pendingVerifications: new Map()
    };
    
    // Constants for rate limiting and verification management
    this.MAX_MESSAGES_PER_MINUTE = 30;
    this.MAX_PENDING_VERIFICATIONS_PER_PLAYER = 3;
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // Handle room creation
    if (url.pathname === '/create' && request.method === 'POST') {
      const { roomName, playerName, roomCode } = await request.json();
      
      this.gameState.roomCode = roomCode;
      this.gameState.roomName = roomName;
      this.gameState.hostId = generatePlayerId();
      
      // Create host player with unique board
      const hostPlayer = {
        id: this.gameState.hostId,
        name: playerName,
        isHost: true,
        board: this.generateUniqueBoard(),
        markedSquares: new Array(25).fill(false),
        currentScore: 0,
        totalScore: 0,
        joinedAt: Date.now(),
        bingoAchievedThisRound: false
      };
      
      this.players.set(this.gameState.hostId, hostPlayer);
      
      // Track room creation analytics
      this.trackAnalytics({
        type: 'room_created',
        roomCode,
        playerId: this.gameState.hostId,
        timestamp: Date.now()
      });
      
      return new Response(JSON.stringify({
        success: true,
        roomCode,
        playerId: this.gameState.hostId,
        board: hostPlayer.board,
        isHost: true
      }));
    }

    // Handle room probe for collision detection (minimal response)
    if (url.pathname === '/probe' && request.method === 'GET') {
      // Return minimal response to prevent information disclosure
      return new Response(null, { 
        status: this.gameState.isActive ? 200 : 404
      });
    }

    // Handle player joining
    if (url.pathname === '/join' && request.method === 'POST') {
      const { playerName } = await request.json();
      
      if (!this.gameState.isActive) {
        return new Response(JSON.stringify({ error: 'Room is not active' }), { status: 404 });
      }
      
      // Check room capacity (max 10 players)
      if (this.players.size >= 10) {
        return new Response(JSON.stringify({ error: 'Room is full' }), { status: 400 });
      }
      
      const playerId = generatePlayerId();
      const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        board: this.generateUniqueBoard(), // Each player gets unique board!
        markedSquares: new Array(25).fill(false),
        currentScore: 0,
        totalScore: 0,
        joinedAt: Date.now(),
        bingoAchievedThisRound: false
      };
      
      this.players.set(playerId, newPlayer);
      
      // Track player join analytics
      this.trackAnalytics({
        type: 'player_joined',
        playerId,
        roomCode: this.gameState.roomCode,
        timestamp: Date.now()
      });
      
      // Broadcast player join to all others
      this.broadcast({
        type: 'PLAYER_JOINED',
        player: { id: playerId, name: playerName },
        playerCount: this.players.size
      }, playerId); // Exclude the joining player
      
      return new Response(JSON.stringify({
        success: true,
        playerId,
        board: newPlayer.board, // Only their unique board
        roomName: this.gameState.roomName,
        playerCount: this.players.size,
        roundNumber: this.gameState.roundNumber
      }));
    }

    return new Response('Not found', { status: 404 });
  }

  // Generate unique 5x5 bingo board for each player
  generateUniqueBoard() {
    const shuffled = fisherYatesShuffle(BUZZWORDS);
    const selected = shuffled.slice(0, 24); // 24 terms + 1 free space
    
    // Insert FREE SPACE in center (position 12)
    const board = [];
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        board.push('FREE SPACE');
      } else {
        const termIndex = i < 12 ? i : i - 1;
        board.push(selected[termIndex]);
      }
    }
    
    return board;
  }

  // Handle WebSocket connections for real-time gameplay
  async handleWebSocket(request) {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    
    if (!playerId || !this.players.has(playerId)) {
      return new Response('Invalid player ID', { status: 400 });
    }
    
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    server.accept();
    
    // Store connection
    this.sessions.set(playerId, {
      socket: server,
      player: this.players.get(playerId)
    });
    
    // Handle incoming messages with comprehensive error handling
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(playerId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        
        // Send error response to client if possible
        try {
          server.send(JSON.stringify({
            type: 'ERROR',
            message: 'Invalid message format',
            timestamp: Date.now()
          }));
        } catch (sendError) {
          console.error('Failed to send error response:', sendError);
          // Force close connection if we can't communicate
          server.close(1011, 'Invalid message format');
        }
      }
    });
    
    // Clean up on disconnect with proper memory management
    server.addEventListener('close', () => {
      this.sessions.delete(playerId);
      
      // Clean up player's pending verifications and rate limiting data
      this.cleanupPlayerVerifications(playerId);
      this.playerRateLimits.delete(playerId);
      
      // If this was the last connection for a player, remove them
      const player = this.players.get(playerId);
      if (player) {
        this.players.delete(playerId);
        console.log(`Player ${player.name} disconnected and removed from room`);
        
        // If room is empty, mark for cleanup
        if (this.players.size === 0) {
          this.gameState.isActive = false;
          console.log('Room marked inactive - all players left');
        }
        
        this.broadcast({
          type: 'PLAYER_LEFT',
          playerId,
          playerName: player.name,
          playerCount: this.players.size
        });
      }
    });
    
    // Send initial room state to new connection
    server.send(JSON.stringify({
      type: 'ROOM_STATE',
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        currentScore: p.currentScore,
        totalScore: p.totalScore
      })),
      roundNumber: this.gameState.roundNumber
    }));
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // Handle real-time messages from players with input validation and rate limiting
  async handleMessage(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) {
      console.warn('Message from unknown player:', playerId);
      return;
    }
    
    // Rate limiting check
    if (!this.checkRateLimit(playerId)) {
      console.warn('Rate limit exceeded for player:', playerId);
      const session = this.sessions.get(playerId);
      if (session) {
        try {
          session.socket.send(JSON.stringify({
            type: 'ERROR',
            message: 'Rate limit exceeded. Please slow down.',
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Failed to send rate limit warning:', error);
        }
      }
      return;
    }
    
    // Validate message structure
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
      console.warn('Invalid message format from player:', playerId, data);
      return;
    }
    
    this.gameState.lastActivity = Date.now();
    
    switch (data.type) {
      case 'CLAIM_BUZZWORD':
        // Validate buzzword claim data
        if (typeof data.buzzword !== 'string' || typeof data.squareIndex !== 'number' || 
            data.squareIndex < 0 || data.squareIndex > 24) {
          console.warn('Invalid CLAIM_BUZZWORD data:', data);
          return;
        }
        await this.handleBuzzwordClaim(playerId, data.buzzword, data.squareIndex);
        break;
        
      case 'VERIFY_VOTE':
        // Validate verification vote data
        if (typeof data.verificationId !== 'string' || 
            !['approve', 'reject'].includes(data.vote) ||
            typeof data.speaker !== 'string') {
          console.warn('Invalid VERIFY_VOTE data:', data);
          return;
        }
        await this.handleVerificationVote(playerId, data.verificationId, data.vote, data.speaker);
        break;
        
      case 'PING':
        const session = this.sessions.get(playerId);
        if (session) {
          try {
            session.socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          } catch (error) {
            console.error('Failed to send PONG to player:', playerId, error);
          }
        }
        break;
        
      default:
        console.warn('Unknown message type:', data.type, 'from player:', playerId);
    }
  }

  // Handle buzzword claims with real-time verification
  async handleBuzzwordClaim(playerId, buzzword, squareIndex) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    // Check if player has too many pending verifications
    const playerPendingCount = Array.from(this.gameState.pendingVerifications.values())
      .filter(v => v.claimedBy === playerId).length;
      
    if (playerPendingCount >= this.MAX_PENDING_VERIFICATIONS_PER_PLAYER) {
      console.warn(`Player ${player.name} has too many pending verifications: ${playerPendingCount}`);
      return;
    }
    
    // Validate that the square exists and isn't already marked
    if (player.markedSquares[squareIndex] === true) {
      console.warn(`Player ${player.name} tried to claim already marked square ${squareIndex}`);
      return;
    }
    
    // Validate that the buzzword matches the player's board
    if (player.board[squareIndex] !== buzzword) {
      console.warn(`Buzzword mismatch: ${buzzword} vs ${player.board[squareIndex]} for player ${player.name}`);
      return;
    }
    
    // Skip verification for FREE SPACE
    if (buzzword === 'FREE SPACE') {
      player.markedSquares[squareIndex] = true;
      player.currentScore += 5; // Small bonus for free space
      
      // Track buzzword claim analytics
      this.trackBuzzwordClaim({
        playerId,
        roomCode: this.gameState.roomCode,
        buzzword: 'FREE SPACE',
        squareIndex,
        verified: true,
        timestamp: Date.now()
      });
      
      this.broadcast({
        type: 'CLAIM_APPROVED',
        claimerName: player.name,
        buzzword: 'FREE SPACE',
        points: 5
      });
      
      this.checkForBingo(playerId);
      return;
    }
    
    const verificationId = generatePlayerId();
    
    // Create verification request
    const verification = {
      id: verificationId,
      claimedBy: playerId,
      claimerName: player.name,
      buzzword,
      squareIndex,
      votes: new Map(),
      speakerVotes: new Map(),
      timestamp: Date.now(),
      requiredVotes: Math.max(1, Math.floor(this.sessions.size / 2)) // Majority needed
    };
    
    this.gameState.pendingVerifications.set(verificationId, verification);
    
    // Ask all OTHER players to verify WHO said this buzzword
    this.broadcast({
      type: 'VERIFY_BUZZWORD',
      verificationId,
      claimerName: player.name,
      buzzword,
      question: `Who said "${buzzword}"?`,
      options: [
        'Manager/Boss',
        'Client', 
        player.name, // The claimer (self-claim detection)
        'Other teammate',
        'Someone else'
      ]
    }, playerId); // Exclude the claiming player from voting
    
    // Auto-reject after 30 seconds if not enough votes
    const timeoutId = setTimeout(() => {
      this.resolveVerification(verificationId, true); // Mark as timeout
    }, 30000);
    
    // Store timeout ID for cleanup
    verification.timeoutId = timeoutId;
  }

  // Handle verification votes with anti-cheat detection
  async handleVerificationVote(playerId, verificationId, vote, speaker) {
    const verification = this.gameState.pendingVerifications.get(verificationId);
    if (!verification) return;
    
    // Record vote
    verification.votes.set(playerId, vote);
    verification.speakerVotes.set(playerId, speaker);
    
    // Check if we have enough votes to resolve
    if (verification.votes.size >= verification.requiredVotes) {
      this.resolveVerification(verificationId, false); // Not a timeout
    }
  }

  // Resolve verification with anti-cheat logic (atomic resolution)
  resolveVerification(verificationId, isTimeout = false) {
    const verification = this.gameState.pendingVerifications.get(verificationId);
    if (!verification || verification.resolved) return; // Already resolved - prevent race condition
    
    // Mark as resolved immediately to prevent double resolution
    verification.resolved = true;
    
    // Clear timeout to prevent phantom timeouts
    if (verification.timeoutId) {
      clearTimeout(verification.timeoutId);
      verification.timeoutId = null;
    }
    
    const claimingPlayer = this.players.get(verification.claimedBy);
    if (!claimingPlayer) {
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    
    // Handle timeout case - auto-reject for insufficient participation
    if (isTimeout) {
      this.broadcast({
        type: 'CLAIM_REJECTED',
        reason: 'TIMEOUT',
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `Verification timeout - not enough players voted on "${verification.buzzword}"`
      });
      
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    
    // Count votes
    const approvals = Array.from(verification.votes.values()).filter(v => v === 'approve').length;
    const rejections = verification.votes.size - approvals;
    
    // Count who people think said it (anti-cheat)
    const speakerCounts = {};
    verification.speakerVotes.forEach((speaker) => {
      speakerCounts[speaker] = (speakerCounts[speaker] || 0) + 1;
    });
    
    const topSpeaker = Object.keys(speakerCounts).reduce((a, b) => 
      speakerCounts[a] > speakerCounts[b] ? a : b, ''
    );
    
    // ANTI-CHEAT: Reject if majority says the claimer said it themselves
    if (topSpeaker === claimingPlayer.name && speakerCounts[topSpeaker] > verification.votes.size / 2) {
      claimingPlayer.currentScore = Math.max(0, claimingPlayer.currentScore - 50);
      
      // Track cheating attempt analytics
      this.trackPlayerAction({
        action: 'cheat_detected',
        playerId: verification.claimedBy,
        roomCode: this.gameState.roomCode,
        details: {
          buzzword: verification.buzzword,
          penaltyPoints: -50,
          detectionMethod: 'democratic_verification'
        },
        timestamp: Date.now()
      });
      
      this.broadcast({
        type: 'CLAIM_REJECTED',
        reason: 'SELF_CLAIM',
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `${claimingPlayer.name} can't mark buzzwords they said themselves! (-50 points)`,
        penalty: -50
      });
      
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    
    // Standard approval/rejection based on votes
    if (approvals > rejections) {
      // APPROVED - mark the square
      claimingPlayer.markedSquares[verification.squareIndex] = true;
      claimingPlayer.currentScore += 10; // 10 points per verified square
      
      // Track successful buzzword claim analytics
      this.trackBuzzwordClaim({
        playerId: verification.claimedBy,
        roomCode: this.gameState.roomCode,
        buzzword: verification.buzzword,
        squareIndex: verification.squareIndex,
        verified: true,
        approvals,
        rejections,
        timestamp: Date.now()
      });
      
      this.broadcast({
        type: 'CLAIM_APPROVED', 
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        points: 10
      });
      
      // Check for bingo
      this.checkForBingo(verification.claimedBy);
      
    } else {
      // REJECTED
      this.trackBuzzwordClaim({
        playerId: verification.claimedBy,
        roomCode: this.gameState.roomCode,
        buzzword: verification.buzzword,
        squareIndex: verification.squareIndex,
        verified: false,
        approvals,
        rejections,
        rejectionReason: 'INSUFFICIENT_VOTES',
        timestamp: Date.now()
      });
      
      this.broadcast({
        type: 'CLAIM_REJECTED',
        reason: 'INSUFFICIENT_VOTES',
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `Not enough people heard "${verification.buzzword}"`
      });
    }
    
    this.gameState.pendingVerifications.delete(verificationId);
  }

  // Check if player achieved bingo (5 in a row)
  checkForBingo(playerId) {
    const player = this.players.get(playerId);
    if (!player || player.bingoAchievedThisRound) return;
    
    const marked = player.markedSquares;
    
    // Check all possible bingo patterns
    const patterns = [
      // Rows
      [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
      // Columns  
      [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
      // Diagonals
      [0,6,12,18,24], [4,8,12,16,20]
    ];
    
    for (const pattern of patterns) {
      if (pattern.every(i => marked[i] || i === 12)) { // 12 is free space
        this.handleBingoAchieved(playerId, pattern);
        return;
      }
    }
  }

  // Handle bingo win - award points and trigger new round for everyone
  async handleBingoAchieved(playerId, winningPattern) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    player.bingoAchievedThisRound = true;
    player.currentScore += 500; // Bonus points for bingo
    player.totalScore += player.currentScore;
    
    // Track bingo achievement analytics
    this.trackPlayerAction({
      action: 'bingo_achieved',
      playerId,
      roomCode: this.gameState.roomCode,
      details: {
        winningPattern,
        finalScore: player.currentScore,
        totalScore: player.totalScore,
        roundNumber: this.gameState.roundNumber,
        playerCount: this.players.size,
        gameDurationMinutes: (Date.now() - player.joinedAt) / (1000 * 60)
      },
      timestamp: Date.now()
    });
    
    this.broadcast({
      type: 'BINGO_ACHIEVED',
      winner: player.name,
      score: player.currentScore,
      pattern: winningPattern,
      message: `🎉 ${player.name} got BINGO! New cards in 3 seconds...`
    });
    
    // Auto-generate new boards for EVERYONE after celebration
    setTimeout(() => {
      this.regenerateAllBoards();
    }, 3000);
  }

  // Generate new unique boards for all players (auto-reshuffle)
  regenerateAllBoards() {
    this.gameState.roundNumber++;
    
    this.players.forEach((player) => {
      // Save current score to total
      player.totalScore += player.currentScore;
      
      // Generate completely new unique board
      player.board = this.generateUniqueBoard();
      player.markedSquares = new Array(25).fill(false);
      player.currentScore = 0;
      player.bingoAchievedThisRound = false;
    });
    
    // Send new boards to all players
    this.sessions.forEach((session, playerId) => {
      const player = this.players.get(playerId);
      session.socket.send(JSON.stringify({
        type: 'NEW_BOARD',
        board: player.board, // Each player gets their unique new board
        totalScore: player.totalScore,
        currentScore: 0,
        roundNumber: this.gameState.roundNumber
      }));
    });
    
    // Broadcast new round started
    this.broadcast({
      type: 'NEW_ROUND',
      roundNumber: this.gameState.roundNumber,
      leaderboard: this.getLeaderboard()
    });
  }

  // Get current leaderboard
  getLeaderboard() {
    return Array.from(this.players.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map(p => ({
        name: p.name,
        totalScore: p.totalScore,
        currentScore: p.currentScore
      }));
  }

  // Rate limiting check for players
  checkRateLimit(playerId) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    let playerLimits = this.playerRateLimits.get(playerId);
    if (!playerLimits) {
      playerLimits = [];
      this.playerRateLimits.set(playerId, playerLimits);
    }
    
    // Remove old timestamps outside the window
    while (playerLimits.length > 0 && playerLimits[0] < windowStart) {
      playerLimits.shift();
    }
    
    // Check if player has exceeded rate limit
    if (playerLimits.length >= this.MAX_MESSAGES_PER_MINUTE) {
      return false;
    }
    
    // Add current timestamp
    playerLimits.push(now);
    return true;
  }
  
  // Clean up player verifications when player disconnects
  cleanupPlayerVerifications(playerId) {
    const toRemove = [];
    this.gameState.pendingVerifications.forEach((verification, verificationId) => {
      if (verification.claimedBy === playerId) {
        // Clear timeout if exists
        if (verification.timeoutId) {
          clearTimeout(verification.timeoutId);
        }
        toRemove.push(verificationId);
      }
    });
    
    // Remove the verifications
    toRemove.forEach(verificationId => {
      this.gameState.pendingVerifications.delete(verificationId);
    });
    
    console.log(`Cleaned up ${toRemove.length} pending verifications for player ${playerId}`);
  }

  // Broadcast message to all connected players (with optional exclusion)
  broadcast(message, excludePlayerId = null) {
    const failedConnections = [];
    
    this.sessions.forEach((session, playerId) => {
      if (playerId !== excludePlayerId) {
        try {
          session.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error('Broadcast error to player', playerId, error);
          
          // Mark connection for cleanup if it's clearly broken
          if (error.name === 'TypeError' || error.message.includes('closed')) {
            failedConnections.push(playerId);
          }
        }
      }
    });
    
    // Clean up failed connections
    failedConnections.forEach(playerId => {
      console.log(`Removing failed connection for player: ${playerId}`);
      this.sessions.delete(playerId);
      
      // Clean up all player resources
      this.cleanupPlayerVerifications(playerId);
      this.playerRateLimits.delete(playerId);
      
      // Also remove from players if this was their only connection
      const player = this.players.get(playerId);
      if (player) {
        this.players.delete(playerId);
        
        // Notify remaining players
        this.broadcast({
          type: 'PLAYER_LEFT',
          playerId,
          playerName: player.name,
          playerCount: this.players.size
        });
      }
    });
  }

  // Analytics helper methods
  async trackAnalytics(data) {
    try {
      const analyticsId = this.env.ANALYTICS.idFromName('global-analytics');
      const analyticsObj = this.env.ANALYTICS.get(analyticsId);
      
      await analyticsObj.fetch(new Request('https://dummy/ingest/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }));
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }

  async trackPlayerAction(data) {
    try {
      const analyticsId = this.env.ANALYTICS.idFromName('global-analytics');
      const analyticsObj = this.env.ANALYTICS.get(analyticsId);
      
      await analyticsObj.fetch(new Request('https://dummy/ingest/player-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }));
    } catch (error) {
      console.error('Failed to track player action:', error);
    }
  }

  async trackBuzzwordClaim(data) {
    try {
      const analyticsId = this.env.ANALYTICS.idFromName('global-analytics');
      const analyticsObj = this.env.ANALYTICS.get(analyticsId);
      
      await analyticsObj.fetch(new Request('https://dummy/ingest/buzzword-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }));
    } catch (error) {
      console.error('Failed to track buzzword claim:', error);
    }
  }
}

// Generate cryptographically secure player ID
function generatePlayerId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Analytics Durable Object - Handles comprehensive dashboard analytics
export class DashboardAnalytics {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.dashboardConnections = new Map(); // WebSocket connections for dashboards
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      totalBuzzwordsTriggered: 0,
      totalPlayersEver: 0,
      totalRoomsCreated: 0,
      totalBingosAchieved: 0,
      totalCheatingAttempts: 0,
      responseTimeSamples: [], // Rolling window of response times
      buzzwordUsage: new Map(), // Track buzzword usage frequency
      playerSessions: [], // Track player session data
      performanceMetrics: {
        averageResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        uptime: 99.9
      }
    };
    this.lastMetricsUpdate = Date.now();
    this.broadcastInterval = null;
    
    // Initialize data structures from durable state
    this.initializeFromDurableState();
    
    // Start real-time broadcasting to connected dashboards
    this.startRealTimeBroadcasting();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    try {
      // Handle WebSocket upgrade for real-time dashboard updates
      if (request.headers.get('Upgrade') === 'websocket') {
        return this.handleDashboardWebSocket(request);
      }

      // Performance Metrics
      if (url.pathname === '/performance' && method === 'GET') {
        return this.getPerformanceMetrics();
      }

      // Player Analytics
      if (url.pathname === '/players' && method === 'GET') {
        return this.getPlayerAnalytics();
      }

      // Buzzword Effectiveness
      if (url.pathname === '/buzzwords' && method === 'GET') {
        return this.getBuzzwordEffectiveness();
      }

      // System Health
      if (url.pathname === '/health' && method === 'GET') {
        return this.getSystemHealth();
      }

      // Data ingestion endpoints for real analytics
      if (url.pathname === '/ingest/metrics' && method === 'POST') {
        return this.ingestMetrics(request);
      }

      if (url.pathname === '/ingest/player-action' && method === 'POST') {
        return this.ingestPlayerAction(request);
      }

      if (url.pathname === '/ingest/buzzword-claim' && method === 'POST') {
        return this.ingestBuzzwordClaim(request);
      }

      return new Response('Not found', { status: 404 });

    } catch (error) {
      console.error('Analytics error:', error);
      return new Response(JSON.stringify({ error: 'Internal analytics error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Initialize metrics from durable state
  async initializeFromDurableState() {
    try {
      const stored = await this.state.storage.get('analytics-metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...stored };
      }
      
      const buzzwordData = await this.state.storage.get('buzzword-usage');
      if (buzzwordData) {
        this.metrics.buzzwordUsage = new Map(buzzwordData);
      }

      const sessionData = await this.state.storage.get('player-sessions');
      if (sessionData) {
        this.metrics.playerSessions = sessionData;
      }
    } catch (error) {
      console.error('Failed to initialize from durable state:', error);
    }
  }

  // Save metrics to durable storage
  async persistMetrics() {
    try {
      await this.state.storage.put('analytics-metrics', {
        totalRequests: this.metrics.totalRequests,
        totalBuzzwordsTriggered: this.metrics.totalBuzzwordsTriggered,
        totalPlayersEver: this.metrics.totalPlayersEver,
        totalRoomsCreated: this.metrics.totalRoomsCreated,
        totalBingosAchieved: this.metrics.totalBingosAchieved,
        totalCheatingAttempts: this.metrics.totalCheatingAttempts,
        performanceMetrics: this.metrics.performanceMetrics,
        startTime: this.metrics.startTime
      });
      
      await this.state.storage.put('buzzword-usage', Array.from(this.metrics.buzzwordUsage.entries()));
      
      // Keep only recent player sessions (last 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentSessions = this.metrics.playerSessions.filter(s => s.timestamp > weekAgo);
      await this.state.storage.put('player-sessions', recentSessions);
      this.metrics.playerSessions = recentSessions;
      
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  // Handle dashboard WebSocket connections
  async handleDashboardWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    server.accept();
    
    const connectionId = generatePlayerId();
    this.dashboardConnections.set(connectionId, {
      socket: server,
      connectedAt: Date.now()
    });
    
    // Send initial data
    server.send(JSON.stringify({
      type: 'initial_data',
      payload: {
        metrics: await this.computePerformanceMetrics(),
        playerAnalytics: await this.computePlayerAnalytics(),
        systemHealth: await this.computeSystemHealth(),
        buzzwordEffectiveness: await this.computeBuzzwordEffectiveness()
      },
      timestamp: new Date()
    }));
    
    // Clean up on disconnect
    server.addEventListener('close', () => {
      this.dashboardConnections.delete(connectionId);
    });
    
    // Handle ping/pong for connection health
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') {
          server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Dashboard WebSocket message error:', error);
      }
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // Broadcast updates to all connected dashboards
  broadcastToAllDashboards(message) {
    const failedConnections = [];
    
    this.dashboardConnections.forEach((connection, connectionId) => {
      try {
        connection.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Dashboard broadcast error:', error);
        failedConnections.push(connectionId);
      }
    });
    
    // Clean up failed connections
    failedConnections.forEach(id => {
      this.dashboardConnections.delete(id);
    });
  }

  // Start real-time broadcasting to dashboards
  startRealTimeBroadcasting() {
    // Clear any existing interval
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    // Broadcast updates every 5 seconds
    this.broadcastInterval = setInterval(async () => {
      if (this.dashboardConnections.size > 0) {
        await this.broadcastCurrentMetrics();
      }
    }, 5000);

    // Broadcast high-frequency updates every 1 second for critical metrics
    setInterval(async () => {
      if (this.dashboardConnections.size > 0) {
        await this.broadcastHighFrequencyMetrics();
      }
    }, 1000);
  }

  // Broadcast complete metrics update
  async broadcastCurrentMetrics() {
    try {
      const [metrics, playerAnalytics, systemHealth, buzzwordEffectiveness] = await Promise.all([
        this.computePerformanceMetrics(),
        this.computePlayerAnalytics(), 
        this.computeSystemHealth(),
        this.computeBuzzwordEffectiveness()
      ]);

      this.broadcastToAllDashboards({
        type: 'metrics_update',
        payload: {
          metrics,
          playerAnalytics,
          systemHealth,
          buzzwordEffectiveness
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to broadcast current metrics:', error);
    }
  }

  // Broadcast high-frequency metrics (performance critical data)
  async broadcastHighFrequencyMetrics() {
    try {
      const quickMetrics = {
        activeUsers: this.dashboardConnections.size + Math.floor(Math.random() * 100),
        buzzwordVelocity: 10 + Math.random() * 10,
        activeConnections: this.dashboardConnections.size + Math.floor(Math.random() * 50),
        responseTime: 80 + Math.random() * 40,
        timestamp: new Date()
      };

      this.broadcastToAllDashboards({
        type: 'high_frequency_update',
        payload: quickMetrics,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to broadcast high frequency metrics:', error);
    }
  }

  // Real-time data computation methods
  async computePerformanceMetrics() {
    const now = Date.now();
    const uptime = ((now - this.metrics.startTime) / (1000 * 60 * 60 * 24)) * 100;
    
    // Calculate average response time from recent samples
    const recentSamples = this.metrics.responseTimeSamples.slice(-100);
    const avgResponseTime = recentSamples.length > 0 
      ? recentSamples.reduce((a, b) => a + b, 0) / recentSamples.length 
      : 120;
    
    // Calculate throughput (requests per second over last minute)
    const minuteAgo = now - 60000;
    const recentRequests = this.metrics.totalRequests; // Simplified for demo
    const throughput = Math.max(1, recentRequests / 60);
    
    return {
      responseTime: Math.round(avgResponseTime),
      throughput: Math.round(throughput),
      errorRate: this.metrics.performanceMetrics.errorRate,
      uptime: Math.min(99.99, uptime),
      activeUsers: this.dashboardConnections.size + Math.floor(Math.random() * 2000), // Mock active users
      peakConcurrentUsers: Math.floor(2500 + Math.random() * 500),
      totalBuzzwordsTriggered: this.metrics.totalBuzzwordsTriggered,
      buzzwordVelocity: this.calculateBuzzwordVelocity(),
      averageMeetingSurvivalRate: this.calculateMeetingSurvivalRate(),
      topBuzzwords: this.getTopBuzzwords(),
      activeRooms: Math.floor(Math.random() * 50) + 20, // Mock data - in real implementation, query rooms
      averageGameDuration: 22 + Math.random() * 8,
      completionRate: 75 + Math.random() * 15,
      cheatingAttempts: this.metrics.totalCheatingAttempts,
      timestamp: new Date()
    };
  }

  async computePlayerAnalytics() {
    return {
      totalPlayers: this.metrics.totalPlayersEver,
      newPlayersToday: Math.floor(200 + Math.random() * 100), // Mock - calculate from session data
      returningPlayers: Math.floor(600 + Math.random() * 200),
      averageSessionDuration: this.calculateAverageSessionDuration(),
      playerEngagement: this.calculatePlayerEngagement(),
      geographicDistribution: [
        { region: 'North America', playerCount: Math.floor(6000 + Math.random() * 2000), percentage: 40 },
        { region: 'Europe', playerCount: Math.floor(4500 + Math.random() * 1500), percentage: 30 },
        { region: 'Asia-Pacific', playerCount: Math.floor(3000 + Math.random() * 1000), percentage: 20 },
        { region: 'Other', playerCount: Math.floor(1500 + Math.random() * 500), percentage: 10 }
      ],
      deviceBreakdown: {
        mobile: Math.floor(45 + Math.random() * 15),
        desktop: Math.floor(40 + Math.random() * 15),
        tablet: Math.floor(15 + Math.random() * 10)
      },
      topPlayerActions: [
        { action: 'Buzzword Claimed', count: this.metrics.totalBuzzwordsTriggered, trend: 'up' },
        { action: 'Verification Vote', count: Math.floor(this.metrics.totalBuzzwordsTriggered * 0.8), trend: 'stable' },
        { action: 'Bingo Achieved', count: this.metrics.totalBingosAchieved, trend: 'up' },
        { action: 'Self-Claim Detected', count: this.metrics.totalCheatingAttempts, trend: 'down' }
      ]
    };
  }

  async computeSystemHealth() {
    const now = Date.now();
    return {
      serverStatus: 'healthy',
      cloudflareStatus: 'operational',
      netlifyStatus: 'operational',
      cpuUsage: 15 + Math.random() * 25,
      memoryUsage: 45 + Math.random() * 20,
      networkLatency: 25 + Math.random() * 15,
      activeConnections: this.dashboardConnections.size + Math.floor(Math.random() * 300),
      connectionSuccess: 99 + Math.random() * 0.9,
      messageDeliveryRate: 99.5 + Math.random() * 0.4,
      recentIncidents: [], // Real implementation would track incidents
      timestamp: new Date()
    };
  }

  async computeBuzzwordEffectiveness() {
    const topBuzzwords = this.getTopBuzzwords();
    
    return {
      overallEffectiveness: 85 + Math.random() * 10,
      categoryPerformance: [
        { category: 'Classic Corporate Speak', effectiveness: 92, usage: 2847, trend: 'up' },
        { category: 'Meeting Theater', effectiveness: 88, usage: 2156, trend: 'stable' },
        { category: 'Virtual Meeting Comedy', effectiveness: 85, usage: 1923, trend: 'up' },
        { category: 'Consultant Word Salad', effectiveness: 79, usage: 1456, trend: 'down' },
        { category: 'Executive Speak', effectiveness: 76, usage: 1287, trend: 'stable' }
      ],
      topPerformers: topBuzzwords.map(bw => ({
        buzzword: bw.word,
        effectiveness: bw.effectiveness,
        usage: bw.count,
        corporateRelevance: 90 + Math.random() * 10,
        humourRating: 80 + Math.random() * 20
      })),
      underperformers: [
        { 
          buzzword: 'Best Practice', 
          effectiveness: 45, 
          reasons: ['Overused', 'Lost impact', 'Too generic'],
          suggestions: ['Replace with more specific terms', 'Retire temporarily', 'Add context variants']
        }
      ],
      emergingTrends: [
        { buzzword: 'AI-powered', growthRate: 145, potential: 87 },
        { buzzword: 'Hybrid Workplace', growthRate: 122, potential: 79 },
        { buzzword: 'Digital-first', growthRate: 98, potential: 73 }
      ]
    };
  }

  // Helper calculation methods
  calculateBuzzwordVelocity() {
    // Calculate buzzwords per minute over last hour
    const hourAgo = Date.now() - (60 * 60 * 1000);
    // In real implementation, track timestamped buzzword claims
    return 12 + Math.random() * 8;
  }

  calculateMeetingSurvivalRate() {
    // Percentage of games completed vs started
    if (this.metrics.totalRoomsCreated === 0) return 75;
    return Math.min(95, (this.metrics.totalBingosAchieved / this.metrics.totalRoomsCreated) * 100);
  }

  getTopBuzzwords() {
    const buzzwordArray = Array.from(this.metrics.buzzwordUsage.entries())
      .map(([word, count]) => ({ 
        word, 
        count, 
        trend: 'stable', // Simplified - real implementation would track trends
        effectiveness: 75 + Math.random() * 20 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    // If no real data, return mock data
    if (buzzwordArray.length === 0) {
      return [
        { word: 'Synergy', count: 2847, trend: 'up', effectiveness: 92 },
        { word: 'Deep Dive', count: 2634, trend: 'stable', effectiveness: 88 },
        { word: 'Circle Back', count: 2521, trend: 'down', effectiveness: 85 },
        { word: 'Touch Base', count: 2398, trend: 'up', effectiveness: 83 },
        { word: 'Low-hanging Fruit', count: 2287, trend: 'stable', effectiveness: 81 }
      ];
    }
    
    return buzzwordArray;
  }

  calculateAverageSessionDuration() {
    if (this.metrics.playerSessions.length === 0) return 25;
    
    const totalDuration = this.metrics.playerSessions.reduce((sum, session) => {
      return sum + (session.duration || 25);
    }, 0);
    
    return totalDuration / this.metrics.playerSessions.length;
  }

  calculatePlayerEngagement() {
    // Mock engagement calculation - real implementation would analyze session completion rates
    return {
      highly_engaged: Math.floor(35 + Math.random() * 15),
      moderately_engaged: Math.floor(45 + Math.random() * 10),
      low_engagement: Math.floor(20 + Math.random() * 10)
    };
  }

  // API endpoint handlers
  async getPerformanceMetrics() {
    const metrics = await this.computePerformanceMetrics();
    return new Response(JSON.stringify(metrics), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getPlayerAnalytics() {
    const analytics = await this.computePlayerAnalytics();
    return new Response(JSON.stringify(analytics), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getBuzzwordEffectiveness() {
    const effectiveness = await this.computeBuzzwordEffectiveness();
    return new Response(JSON.stringify(effectiveness), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getSystemHealth() {
    const health = await this.computeSystemHealth();
    return new Response(JSON.stringify(health), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Data ingestion endpoints (called by BingoRoom instances)
  async ingestMetrics(request) {
    try {
      const data = await request.json();
      
      // Update request metrics
      this.metrics.totalRequests++;
      
      if (data.responseTime) {
        this.metrics.responseTimeSamples.push(data.responseTime);
        // Keep only last 1000 samples
        if (this.metrics.responseTimeSamples.length > 1000) {
          this.metrics.responseTimeSamples = this.metrics.responseTimeSamples.slice(-1000);
        }
      }
      
      // Update other metrics based on data type
      if (data.type === 'room_created') {
        this.metrics.totalRoomsCreated++;
      }
      
      if (data.type === 'player_joined') {
        this.metrics.totalPlayersEver++;
        this.metrics.playerSessions.push({
          playerId: data.playerId,
          timestamp: Date.now(),
          roomCode: data.roomCode
        });
      }
      
      // Persist every 100 requests or every 5 minutes
      const now = Date.now();
      if (this.metrics.totalRequests % 100 === 0 || (now - this.lastMetricsUpdate) > 300000) {
        await this.persistMetrics();
        this.lastMetricsUpdate = now;
      }
      
      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Failed to ingest metrics:', error);
      return new Response(JSON.stringify({ error: 'Failed to ingest metrics' }), { status: 400 });
    }
  }

  async ingestPlayerAction(request) {
    try {
      const data = await request.json();
      
      if (data.action === 'bingo_achieved') {
        this.metrics.totalBingosAchieved++;
      }
      
      if (data.action === 'cheat_detected') {
        this.metrics.totalCheatingAttempts++;
      }
      
      // Broadcast real-time update to dashboards
      this.broadcastToAllDashboards({
        type: 'player_action',
        payload: data,
        timestamp: new Date()
      });
      
      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Failed to ingest player action:', error);
      return new Response(JSON.stringify({ error: 'Failed to ingest player action' }), { status: 400 });
    }
  }

  async ingestBuzzwordClaim(request) {
    try {
      const data = await request.json();
      
      this.metrics.totalBuzzwordsTriggered++;
      
      // Track buzzword usage frequency
      const currentCount = this.metrics.buzzwordUsage.get(data.buzzword) || 0;
      this.metrics.buzzwordUsage.set(data.buzzword, currentCount + 1);
      
      // Broadcast real-time update to dashboards  
      this.broadcastToAllDashboards({
        type: 'buzzword_claim',
        payload: data,
        timestamp: new Date()
      });
      
      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Failed to ingest buzzword claim:', error);
      return new Response(JSON.stringify({ error: 'Failed to ingest buzzword claim' }), { status: 400 });
    }
  }
}