# System Architecture

Technical architecture documentation for Corporate Buzzword Bingo multiplayer system.

## Overview

Real-time multiplayer bingo game built on serverless architecture with global edge deployment.

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Frontend      │◄──►│   Cloudflare         │◄──►│   Durable Objects   │
│   (Browser)     │    │   Workers            │    │   (Game Rooms)      │
│                 │    │                      │    │                     │
│ • HTML/CSS/JS   │    │ • API Router         │    │ • Room State        │
│ • WebSocket     │    │ • Request Handler    │    │ • Player Management │
│ • Local Storage │    │ • CORS & Security    │    │ • Real-time Logic   │
│ • Responsive UI │    │ • Input Validation   │    │ • WebSocket Upgrade │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Frontend Architecture

### Single Page Application
- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Tailwind CSS via CDN
- **State Management**: In-memory objects + localStorage
- **Real-time**: Native WebSocket API
- **Responsive**: Mobile-first CSS Grid/Flexbox

### Key Components

#### Game State Manager
```javascript
const gameState = {
  currentUser: null,
  currentRoom: null,
  gameBoard: [],
  markedSquares: [],
  websocket: null,
  isMultiplayer: false,
  playerId: null
};
```

#### WebSocket Client
```javascript
class MultiplayerClient {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.websocket = null;
    this.reconnectAttempts = 0;
  }
  
  connect(roomCode, playerId) { /* ... */ }
  sendMessage(message) { /* ... */ }
  handleMessage(event) { /* ... */ }
}
```

#### Room Management
```javascript
async function createRoom(roomName, playerName) {
  const response = await fetch(`${API_BASE}/api/room/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, playerName })
  });
  return await response.json();
}
```

## Backend Architecture

### Cloudflare Workers + Durable Objects

```
                    ┌─────────────────────────┐
                    │   Cloudflare Worker     │
                    │   (Main Router)         │
                    │                         │
                    │ • CORS handling         │
                    │ • Request routing       │
                    │ • Input validation      │
                    │ • Error handling        │
                    └─────────┬───────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │  Room ABC123    │ │  Room DEF456    │ │  Room XYZ789    │
    │                 │ │                 │ │                 │
    │ • Player state  │ │ • Player state  │ │ • Player state  │
    │ • WebSockets    │ │ • WebSockets    │ │ • WebSockets    │
    │ • Game logic    │ │ • Game logic    │ │ • Game logic    │
    │ • Verification  │ │ • Verification  │ │ • Verification  │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Worker Entry Point (`worker.js`)

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(request);
    }
    
    // Route API requests
    if (url.pathname === '/api/room/create') {
      return await createRoom(request, env);
    }
    
    if (url.pathname === '/api/room/join') {
      return await joinRoom(request, env);
    }
    
    if (url.pathname.endsWith('/ws')) {
      return await upgradeWebSocket(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### Durable Objects (`BingoRoom`)

```javascript
export class BingoRoom {
  constructor(state, env) {
    this.state = state;           // Persistent storage
    this.sessions = new Map();    // WebSocket connections
    this.players = new Map();     // Player data
    this.gameState = {            // Room state
      roomCode: '',
      roomName: '',
      hostId: '',
      roundNumber: 1,
      isActive: true,
      pendingVerifications: new Map()
    };
  }
  
  async fetch(request) { /* Handle room-specific requests */ }
  async handleWebSocket(request) { /* WebSocket upgrade */ }
  async handleMessage(playerId, data) { /* Real-time messages */ }
}
```

## Data Flow

### Room Creation Flow
```
1. Frontend calls POST /api/room/create
2. Worker validates input and generates room code
3. Worker creates new Durable Object for room
4. Durable Object initializes with host player
5. Returns room code and player's unique board
```

### Player Join Flow
```
1. Frontend calls POST /api/room/join with room code
2. Worker routes to existing Durable Object
3. Durable Object validates room capacity (max 10)
4. Generates unique board for new player
5. Broadcasts join event to existing players
6. Returns player's unique board and room info
```

### Real-time Gameplay Flow
```
1. Player clicks square to claim buzzword
2. Frontend sends CLAIM_BUZZWORD via WebSocket
3. Durable Object validates claim and creates verification
4. Broadcasts VERIFY_BUZZWORD to other players
5. Other players vote with VERIFY_VOTE messages
6. Durable Object tallies votes and resolves verification
7. Broadcasts result (CLAIM_APPROVED/REJECTED)
8. Checks for bingo and handles round completion
```

## Security Architecture

### Input Validation
```javascript
function validateRoomInput(body) {
  if (!body || typeof body !== 'object') return {};
  
  const roomName = typeof body.roomName === 'string' 
    ? body.roomName.trim().slice(0, 50) : '';
  const playerName = typeof body.playerName === 'string' 
    ? body.playerName.trim().slice(0, 30) : '';
  
  // Sanitize inputs - remove HTML tags and special characters
  const sanitizedRoomName = roomName.replace(/[<>'"&]/g, '');
  const sanitizedPlayerName = playerName.replace(/[<>'"&]/g, '');
  
  return {
    roomName: sanitizedRoomName.length >= 1 ? sanitizedRoomName : null,
    playerName: sanitizedPlayerName.length >= 1 ? sanitizedPlayerName : null
  };
}
```

### CORS Policy
```javascript
function corsHeaders(origin) {
  const allowedOrigins = [
    'https://engineer-memes-ai.netlify.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175'
  ];
  
  const validOrigin = allowedOrigins.includes(origin) ? origin : null;
  
  return {
    'Access-Control-Allow-Origin': validOrigin || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
```

### Rate Limiting
- **30 messages per minute** per player
- **10 players maximum** per room  
- **3 pending verifications maximum** per player
- **30 second timeout** for verification voting

### Cryptographic Security
```javascript
// Secure room code generation
async function generateRoomCode(env) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);  // Cryptographically secure
  
  return Array.from(array, byte => 
    chars[byte % chars.length]
  ).join('');
}

// Secure player ID generation
function generatePlayerId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}
```

## Real-time Architecture

### WebSocket Management
```javascript
// Connection handling
async handleWebSocket(request) {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  
  server.accept();
  
  // Store connection
  this.sessions.set(playerId, {
    socket: server,
    player: this.players.get(playerId)
  });
  
  // Handle messages
  server.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    await this.handleMessage(playerId, data);
  });
  
  // Cleanup on disconnect
  server.addEventListener('close', () => {
    this.cleanupPlayer(playerId);
  });
  
  return new Response(null, { status: 101, webSocket: client });
}
```

### Message Broadcasting
```javascript
broadcast(message, excludePlayerId = null) {
  this.sessions.forEach((session, playerId) => {
    if (playerId !== excludePlayerId) {
      try {
        session.socket.send(JSON.stringify(message));
      } catch (error) {
        // Handle failed connections
        this.cleanupFailedConnection(playerId);
      }
    }
  });
}
```

## Game Logic Architecture

### Board Generation
```javascript
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
```

### Verification System
```javascript
// Democratic verification with anti-cheat
async handleBuzzwordClaim(playerId, buzzword, squareIndex) {
  // Validation checks
  if (player.markedSquares[squareIndex] === true) return;
  if (player.board[squareIndex] !== buzzword) return;
  
  // Create verification request
  const verification = {
    id: generatePlayerId(),
    claimedBy: playerId,
    claimerName: player.name,
    buzzword,
    squareIndex,
    votes: new Map(),
    speakerVotes: new Map(),
    requiredVotes: Math.max(1, Math.floor(this.sessions.size / 2))
  };
  
  this.gameState.pendingVerifications.set(verificationId, verification);
  
  // Broadcast to other players for voting
  this.broadcast({
    type: 'VERIFY_BUZZWORD',
    verificationId,
    claimerName: player.name,
    buzzword,
    question: `Who said "${buzzword}"?`,
    options: ['Manager/Boss', 'Client', player.name, 'Other teammate', 'Someone else']
  }, playerId);
}
```

### Bingo Detection
```javascript
checkForBingo(playerId) {
  const player = this.players.get(playerId);
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
```

## Performance Optimizations

### Memory Management
- Automatic cleanup on player disconnect
- Verification timeout handling
- Rate limiting data pruning
- Failed connection cleanup

### Edge Computing Benefits
- **Global deployment**: Cloudflare's 300+ edge locations
- **Low latency**: Workers run close to users
- **Auto-scaling**: Serverless architecture scales automatically
- **High availability**: Built-in redundancy and failover

### Efficient Data Structures
- `Map` objects for O(1) lookups
- Atomic operations for race condition prevention
- Minimal state persistence (only game-critical data)
- Lazy cleanup for optimal performance

## Development Architecture

### Local Development Setup
```bash
# Backend (Cloudflare Workers)
npx wrangler dev --port 8787

# Frontend (Vite)
npx vite --port 5175
```

### Deployment Pipeline
```yaml
Backend:
  - Local: wrangler dev
  - Production: wrangler deploy
  - Monitoring: Cloudflare Analytics

Frontend:
  - Local: Vite dev server  
  - Production: Netlify auto-deploy from git
  - CDN: Global edge distribution
```

## Monitoring & Observability

### Error Handling
- Comprehensive try-catch blocks
- Structured error responses
- Client-side error recovery
- WebSocket connection recovery

### Logging
- Server-side console logging
- Client-side debug information
- Performance metrics
- Connection status tracking

### Health Checks
- `/api/test` endpoint for system status
- WebSocket ping/pong for connection health
- Automatic reconnection logic
- Graceful degradation on failures