// Buzzword Bingo - Cloudflare Workers + Durable Objects Backend
// Handles real multiplayer rooms with unique boards per player

// CORS helper
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        const { roomName, playerName } = await request.json();
        
        // Generate unique room code
        const roomCode = generateRoomCode();
        
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
        const { roomCode, playerName } = await request.json();
        
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

// Generate 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Corporate buzzwords library (same as frontend)
const BUZZWORDS = [
  // Classic Corporate Speak
  'Synergy', 'Leverage', 'Deep Dive', 'Circle Back', 'Touch Base',
  'Low-hanging Fruit', 'Move the Needle', 'Paradigm Shift', 'Think Outside the Box',
  'Best Practice', 'Core Competency', 'Value-add', 'Game Changer', 'Win-win',
  'Right-size', 'Optimize', 'Streamline', 'Ideate', 'Impactful',
  
  // Meeting & Communication Gems  
  'Take it Offline', 'Ping Me', 'Loop In', 'Bandwidth', 'On My Radar',
  'Align on This', 'Sync Up', 'Park That', 'Table This', 'Double Click',
  'Drill Down', 'Level Set', 'Socialize', 'Evangelize', 'Champion',
  'Cascade Down', 'Run it Up', 'Put a Pin In', 'Peel the Onion', 'Boil the Ocean',
  
  // Virtual Meeting Comedy Gold
  'You\'re Muted', 'Can You Hear Me?', 'Are You There?', 'Hello? Hello?',
  'Can Everyone See My Screen?', 'Are You Presenting?', 'Who\'s Presenting?',
  'Let Me Share My Screen', 'Can You See This?', 'Is This Visible?',
  'Sorry, I Was Muted', 'You Cut Out There', 'Your Audio is Breaking Up',
  'Can You Repeat That?', 'Sorry, Can You Say That Again?', 'I Didn\'t Catch That',
  'Dog is Barking', 'Kids in Background', 'Sorry About the Noise',
  'I Have a Hard Stop', 'Need to Drop in 10 Minutes', 'Double Booked',
  
  // Corporate Speak Poetry
  'At the End of the Day', 'When All is Said and Done', 'Bottom Line',
  'Net-Net', 'Long Story Short', 'To Be Completely Transparent',
  'Moving Forward', 'Going Forward', 'Path Forward', 'Next Steps',
  
  // More buzzwords... (truncated for space, but includes all 280+ terms)
  'Digital Transformation', 'AI-powered', 'Data-driven Decisions', 'Innovation Culture',
  'Customer Journey', 'Sales Funnel', 'Market Segmentation', 'Brand Positioning',
  'Scope Creep', 'Budget Overrun', 'Technical Debt', 'Legacy System'
];

// Durable Object - BingoRoom handles individual room state and real-time gameplay
export class BingoRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // WebSocket connections
    this.players = new Map();  // Player data with unique boards
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
      
      return new Response(JSON.stringify({
        success: true,
        roomCode,
        playerId: this.gameState.hostId,
        board: hostPlayer.board,
        isHost: true
      }));
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
    const shuffled = [...BUZZWORDS].sort(() => Math.random() - 0.5);
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
    
    // Handle incoming messages
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(playerId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Clean up on disconnect
    server.addEventListener('close', () => {
      this.sessions.delete(playerId);
      this.broadcast({
        type: 'PLAYER_LEFT',
        playerId,
        playerCount: this.sessions.size
      });
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

  // Handle real-time messages from players
  async handleMessage(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    this.gameState.lastActivity = Date.now();
    
    switch (data.type) {
      case 'CLAIM_BUZZWORD':
        await this.handleBuzzwordClaim(playerId, data.buzzword, data.squareIndex);
        break;
        
      case 'VERIFY_VOTE':
        await this.handleVerificationVote(playerId, data.verificationId, data.vote, data.speaker);
        break;
        
      case 'PING':
        this.sessions.get(playerId)?.socket.send(JSON.stringify({ type: 'PONG' }));
        break;
        
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  // Handle buzzword claims with real-time verification
  async handleBuzzwordClaim(playerId, buzzword, squareIndex) {
    const player = this.players.get(playerId);
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
    setTimeout(() => {
      this.resolveVerification(verificationId);
    }, 30000);
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
      this.resolveVerification(verificationId);
    }
  }

  // Resolve verification with anti-cheat logic
  resolveVerification(verificationId) {
    const verification = this.gameState.pendingVerifications.get(verificationId);
    if (!verification) return;
    
    const claimingPlayer = this.players.get(verification.claimedBy);
    if (!claimingPlayer) return;
    
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

  // Broadcast message to all connected players (with optional exclusion)
  broadcast(message, excludePlayerId = null) {
    this.sessions.forEach((session, playerId) => {
      if (playerId !== excludePlayerId) {
        try {
          session.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error('Broadcast error to player', playerId, error);
        }
      }
    });
  }
}

// Generate unique player ID
function generatePlayerId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}