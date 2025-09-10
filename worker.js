// Corporate Bingo - Optimized Cloudflare Workers Backend
// Core multiplayer functionality only, analytics delegated to separate service

import { CORPORATE_BINGO } from './src/data/buzzwords.js';
const BUZZWORDS = CORPORATE_BINGO;

// Import and re-export DashboardAnalytics for wrangler
export { DashboardAnalytics } from './analytics-worker.js';

// CORS helper
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
    'Access-Control-Allow-Headers': 'Content-Type, X-Player-ID',
    'Access-Control-Max-Age': '86400',
  };
}

// Main Worker - Core game functionality only
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
      // Analytics requests - delegate to analytics worker with graceful fallback
      if (url.pathname === '/api/performance' || 
          url.pathname === '/api/buzzwords' ||
          url.pathname === '/api/analytics/players' ||
          url.pathname.startsWith('/api/ingest') ||
          url.pathname.startsWith('/ws/dashboard')) {
        try {
          // Check if ANALYTICS binding exists
          if (!env.ANALYTICS) {
            return new Response(JSON.stringify({ 
              error: 'Analytics service temporarily unavailable',
              message: 'Analytics features are being deployed'
            }), { 
              status: 503,
              headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
            });
          }
          
          const analyticsId = env.ANALYTICS.idFromName('dashboard-analytics');
          const analyticsObj = env.ANALYTICS.get(analyticsId);
          return analyticsObj.fetch(request, env);
        } catch (error) {
          console.error('Analytics delegation failed:', error);
          return new Response(JSON.stringify({ 
            error: 'Analytics service temporarily unavailable',
            details: error.message
          }), { 
            status: 503,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
      }

      // Create Room - POST /api/room/create
      if (url.pathname === '/api/room/create' && request.method === 'POST') {
        const body = await request.json();
        
        const { roomName, playerName, roomType } = validateRoomInput(body);
        if (!roomName || !playerName) {
          return new Response(JSON.stringify({ error: 'Invalid room name or player name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
        const roomCode = await generateRoomCode(env, roomType);
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        const response = await roomObj.fetch(new Request('https://dummy/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, playerName, roomCode, roomType })
        }));
        
        const result = await response.json();
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Join Room - POST /api/room/join
      if (url.pathname === '/api/room/join' && request.method === 'POST') {
        const body = await request.json();
        
        const { roomCode, playerName } = validateJoinInput(body);
        if (!roomCode || !playerName) {
          return new Response(JSON.stringify({ error: 'Invalid room code or player name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
        
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
        
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        return roomObj.fetch(request);
      }

      // HTTP Polling Endpoints
      if (url.pathname.match(/^\/api\/room\/([A-Z0-9]{4})\/state$/) && request.method === 'GET') {
        const roomCode = url.pathname.split('/')[3];
        const playerId = request.headers.get('X-Player-ID');
        
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        const response = await roomObj.fetch(new Request('https://dummy/state', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-Player-ID': playerId || '' }
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

      // Get Room Players - GET /api/room/:code/players  
      if (url.pathname.match(/^\/api\/room\/([A-Z0-9]{4})\/players$/) && request.method === 'GET') {
        const roomCode = url.pathname.split('/')[3];
        const playerId = request.headers.get('X-Player-ID');
        
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        const response = await roomObj.fetch(new Request('https://dummy.worker/players', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-Player-ID': playerId || '' }
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

      // Send Player Action - POST /api/room/:code/action
      if (url.pathname.match(/^\/api\/room\/([A-Z0-9]{4})\/action$/) && request.method === 'POST') {
        const roomCode = url.pathname.split('/')[3];
        const playerId = request.headers.get('X-Player-ID');
        const body = await request.json();
        
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        
        const response = await roomObj.fetch(new Request('https://dummy/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Player-ID': playerId || '' },
          body: JSON.stringify(body)
        }));
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Health check - support both old and new endpoints for backward compatibility
      if (url.pathname === '/api/health' || url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: Date.now(),
          version: '1.3.1',
          endpoint: url.pathname
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }
  }
};

// Helper functions - moved from original worker
async function generateRoomCode(env, roomType = 'single') {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    try {
      const roomId = env.ROOMS.idFromName(code);
      const roomObj = env.ROOMS.get(roomId);
      
      const checkResponse = await roomObj.fetch(new Request('https://dummy/exists', {
        method: 'GET'
      }));
      
      if (checkResponse.status === 404) {
        return code;
      }
    } catch (error) {
      return code;
    }
  }
  
  throw new Error('Could not generate unique room code after 10 attempts');
}

function validateRoomInput(body) {
  const roomName = typeof body.roomName === 'string' ? body.roomName.trim().slice(0, 50) : '';
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 30) : '';
  const roomType = body.roomType === 'persistent' ? 'persistent' : 'single';
  
  return { roomName, playerName, roomType };
}

function validateJoinInput(body) {
  const roomCode = typeof body.roomCode === 'string' 
    ? body.roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) 
    : '';
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 30) : '';
  
  return { roomCode, playerName };
}

// BingoRoom Durable Object (core game logic only)
export class BingoRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.room = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    try {
      if (url.pathname === '/create') {
        return await this.createRoom(request);
      }
      
      if (url.pathname === '/join') {
        return await this.joinRoom(request);
      }
      
      if (url.pathname === '/state') {
        return await this.getRoomState(request);
      }
      
      if (url.pathname === '/players') {
        return await this.getPlayers(request);
      }
      
      if (url.pathname === '/action') {
        return await this.handleAction(request);
      }
      
      if (url.pathname === '/exists') {
        return this.room ? new Response('exists') : new Response('not found', { status: 404 });
      }
      
      if (request.headers.get('Upgrade') === 'websocket') {
        return await this.handleWebSocket(request);
      }
      
      return new Response('Not found', { status: 404 });
      
    } catch (error) {
      console.error('BingoRoom error:', error);
      return new Response(JSON.stringify({ error: 'Room processing error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async createRoom(request) {
    const { roomName, playerName, roomCode, roomType } = await request.json();
    
    const player = {
      id: crypto.randomUUID(),
      name: playerName,
      isHost: true,
      board: this.generateUniqueBoard(),
      markedSquares: new Set(),
      score: 0,
      appliedBonuses: [],
      joinedAt: new Date()
    };

    this.room = {
      code: roomCode,
      name: roomName,
      type: roomType,
      players: [player],
      gameState: 'waiting',
      createdAt: new Date(),
      lastActivity: new Date(),
      settings: {
        autoStart: true,
        winCondition: 'line',
        boardSize: 5
      }
    };

    await this.state.storage.put('room', this.room);
    
    return new Response(JSON.stringify({
      success: true,
      roomCode: roomCode,
      player: player,
      room: this.room
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async joinRoom(request) {
    const { playerName } = await request.json();
    
    if (!this.room) {
      this.room = await this.state.storage.get('room');
      if (!this.room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const existingPlayer = this.room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      return new Response(JSON.stringify({
        success: true,
        player: existingPlayer,
        room: this.room
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const player = {
      id: crypto.randomUUID(),
      name: playerName,
      isHost: false,
      board: this.generateUniqueBoard(),
      markedSquares: new Set(),
      score: 0,
      appliedBonuses: [],
      joinedAt: new Date()
    };

    this.room.players.push(player);
    this.room.lastActivity = new Date();
    
    await this.state.storage.put('room', this.room);
    
    // Notify existing players
    this.broadcastToRoom({
      type: 'player_joined',
      player: { id: player.id, name: player.name },
      playerCount: this.room.players.length
    });

    return new Response(JSON.stringify({
      success: true,
      player: player,
      room: this.room
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getRoomState(request) {
    if (!this.room) {
      this.room = await this.state.storage.get('room');
      if (!this.room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      room: {
        code: this.room.code,
        name: this.room.name,
        type: this.room.type,
        gameState: this.room.gameState,
        playerCount: this.room.players.length
      },
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getPlayers(request) {
    if (!this.room) {
      this.room = await this.state.storage.get('room');
      if (!this.room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const players = this.room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      score: p.score,
      joinedAt: p.joinedAt
    }));

    return new Response(JSON.stringify({ players }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async handleAction(request) {
    const action = await request.json();
    const playerId = request.headers.get('X-Player-ID');
    
    if (!this.room) {
      this.room = await this.state.storage.get('room');
      if (!this.room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const player = this.room.players.find(p => p.id === playerId);
    if (!player) {
      return new Response(JSON.stringify({ error: 'Player not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle square marking
    if (action.type === 'mark_square') {
      const { squareIndex, buzzword } = action;
      
      if (player.board[squareIndex] === buzzword) {
        player.markedSquares.add(squareIndex);
        
        // Base score: +1 for marking square
        player.score += 1;
        
        // Check for bonus points
        const analysis = this.analyzeBoardForBonuses(player);
        let bonusPoints = 0;
        
        // Apply new bonuses that haven't been applied yet
        for (const bonus of analysis.lineBonuses) {
          const bonusId = `${bonus.pattern}-${bonus.lineIndex}-${bonus.type}`;
          if (!player.appliedBonuses.includes(bonusId)) {
            bonusPoints += bonus.points;
            player.appliedBonuses.push(bonusId);
          }
        }
        
        // Apply bonus points to score
        player.score += bonusPoints;
        
        this.room.lastActivity = new Date();
        await this.state.storage.put('room', this.room);
        
        // Broadcast to room with bonus info
        this.broadcastToRoom({
          type: 'square_marked',
          player: { id: player.id, name: player.name },
          squareIndex,
          buzzword,
          newScore: player.score,
          bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
          bonusType: bonusPoints > 0 ? analysis.lineBonuses[analysis.lineBonuses.length - 1]?.type : undefined
        });
        
        // Check for win condition
        if (this.checkWinCondition(player)) {
          this.broadcastToRoom({
            type: 'player_won',
            player: { id: player.id, name: player.name },
            finalScore: player.score
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async handleWebSocket(request) {
    const { 0: client, 1: server } = new WebSocketPair();
    
    server.accept();
    
    const playerId = new URL(request.url).searchParams.get('playerId');
    if (playerId) {
      this.sessions.set(playerId, server);
      
      server.addEventListener('close', () => {
        this.sessions.delete(playerId);
      });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  generateUniqueBoard() {
    const shuffled = [...BUZZWORDS].sort(() => Math.random() - 0.5);
    const board = shuffled.slice(0, 24);
    board.splice(12, 0, 'FREE SPACE');
    return board;
  }

  checkWinCondition(player) {
    const marked = Array.from(player.markedSquares);
    marked.push(12); // FREE SPACE always marked
    
    // Check rows
    for (let row = 0; row < 5; row++) {
      const rowSquares = [row * 5, row * 5 + 1, row * 5 + 2, row * 5 + 3, row * 5 + 4];
      if (rowSquares.every(square => marked.includes(square))) {
        return true;
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      const colSquares = [col, col + 5, col + 10, col + 15, col + 20];
      if (colSquares.every(square => marked.includes(square))) {
        return true;
      }
    }
    
    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24];
    const diagonal2 = [4, 8, 12, 16, 20];
    
    if (diagonal1.every(square => marked.includes(square)) || 
        diagonal2.every(square => marked.includes(square))) {
      return true;
    }
    
    return false;
  }

  // Analyze board for line bonuses (3-in-row, 4-in-row, BINGO)
  analyzeBoardForBonuses(player) {
    const marked = Array.from(player.markedSquares);
    marked.push(12); // FREE SPACE always marked
    const lineBonuses = [];
    
    // Check rows for bonuses
    for (let row = 0; row < 5; row++) {
      const rowSquares = [row * 5, row * 5 + 1, row * 5 + 2, row * 5 + 3, row * 5 + 4];
      const markedCount = rowSquares.filter(square => marked.includes(square)).length;
      
      if (markedCount === 5) {
        lineBonuses.push({
          type: 'bingo',
          points: 5,
          pattern: 'row',
          lineIndex: row,
          cells: rowSquares
        });
      } else if (markedCount === 4) {
        lineBonuses.push({
          type: '4-in-row',
          points: 3,
          pattern: 'row',
          lineIndex: row,
          cells: rowSquares.filter(square => marked.includes(square))
        });
      } else if (markedCount === 3) {
        lineBonuses.push({
          type: '3-in-row',
          points: 1,
          pattern: 'row',
          lineIndex: row,
          cells: rowSquares.filter(square => marked.includes(square))
        });
      }
    }
    
    // Check columns for bonuses
    for (let col = 0; col < 5; col++) {
      const colSquares = [col, col + 5, col + 10, col + 15, col + 20];
      const markedCount = colSquares.filter(square => marked.includes(square)).length;
      
      if (markedCount === 5) {
        lineBonuses.push({
          type: 'bingo',
          points: 5,
          pattern: 'column',
          lineIndex: col,
          cells: colSquares
        });
      } else if (markedCount === 4) {
        lineBonuses.push({
          type: '4-in-row',
          points: 3,
          pattern: 'column',
          lineIndex: col,
          cells: colSquares.filter(square => marked.includes(square))
        });
      } else if (markedCount === 3) {
        lineBonuses.push({
          type: '3-in-row',
          points: 1,
          pattern: 'column',
          lineIndex: col,
          cells: colSquares.filter(square => marked.includes(square))
        });
      }
    }
    
    // Check diagonals for bonuses
    const diagonal1 = [0, 6, 12, 18, 24];
    const diagonal2 = [4, 8, 12, 16, 20];
    
    // Diagonal 1 (top-left to bottom-right)
    const diagonal1MarkedCount = diagonal1.filter(square => marked.includes(square)).length;
    if (diagonal1MarkedCount === 5) {
      lineBonuses.push({
        type: 'bingo',
        points: 5,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1
      });
    } else if (diagonal1MarkedCount === 4) {
      lineBonuses.push({
        type: '4-in-row',
        points: 3,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1.filter(square => marked.includes(square))
      });
    } else if (diagonal1MarkedCount === 3) {
      lineBonuses.push({
        type: '3-in-row',
        points: 1,
        pattern: 'diagonal',
        lineIndex: 0,
        cells: diagonal1.filter(square => marked.includes(square))
      });
    }
    
    // Diagonal 2 (top-right to bottom-left)
    const diagonal2MarkedCount = diagonal2.filter(square => marked.includes(square)).length;
    if (diagonal2MarkedCount === 5) {
      lineBonuses.push({
        type: 'bingo',
        points: 5,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2
      });
    } else if (diagonal2MarkedCount === 4) {
      lineBonuses.push({
        type: '4-in-row',
        points: 3,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2.filter(square => marked.includes(square))
      });
    } else if (diagonal2MarkedCount === 3) {
      lineBonuses.push({
        type: '3-in-row',
        points: 1,
        pattern: 'diagonal',
        lineIndex: 1,
        cells: diagonal2.filter(square => marked.includes(square))
      });
    }
    
    const totalBonusPoints = lineBonuses.reduce((sum, bonus) => sum + bonus.points, 0);
    
    return {
      lineBonuses,
      totalBonusPoints
    };
  }

  broadcastToRoom(message) {
    const messageString = JSON.stringify(message);
    
    this.sessions.forEach((session, playerId) => {
      try {
        session.send(messageString);
      } catch (error) {
        console.error(`Failed to send message to ${playerId}:`, error);
        this.sessions.delete(playerId);
      }
    });
  }
}