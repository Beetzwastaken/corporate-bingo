// Durable Object for Real-time Multiplayer Buzzword Bingo
// Handles room state, WebSocket connections, and game logic

import {
  BingoRoom,
  Player,
  BingoSquare,
  VotingSession,
  WebSocketMessage,
  RoomError,
  ROOM_CONFIG,
  DurableObjectState,
  RoomEvent,
  GameState,
  RoomSettings,
  RoomStatistics,
  WinRecord
} from './types';
import { BuzzwordLibrary } from './BuzzwordLibrary';
import { BingoGameEngine } from './BingoGameEngine';

export class BingoRoomObject implements DurableObject {
  private state: DurableObjectStorage;
  private env: any;
  private room: BingoRoom | null = null;
  private connections = new Map<string, WebSocket>(); // connectionId -> WebSocket
  private playerConnections = new Map<string, string>(); // playerId -> connectionId
  private cleanupInterval: number | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state.storage;
    this.env = env;
    
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle WebSocket connections
      if (request.headers.get('Upgrade') === 'websocket') {
        return this.handleWebSocket(request);
      }

      // Handle REST API endpoints
      switch (path) {
        case '/create':
          return this.handleCreateRoom(request);
        case '/join':
          return this.handleJoinRoom(request);
        case '/status':
          return this.handleRoomStatus(request);
        case '/leave':
          return this.handleLeaveRoom(request);
        case '/kick':
          return this.handleKickPlayer(request);
        case '/settings':
          return this.handleUpdateSettings(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('BingoRoomObject error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('playerId');
    const roomCode = url.searchParams.get('roomCode');

    if (!playerId || !roomCode) {
      return new Response('Missing playerId or roomCode', { status: 400 });
    }

    // Load room data
    await this.loadRoom();
    
    if (!this.room || this.room.code !== roomCode) {
      return new Response('Room not found', { status: 404 });
    }

    // Create WebSocket pair
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept the WebSocket connection
    server.accept();

    // Generate unique connection ID
    const connectionId = crypto.randomUUID();
    
    // Store connection
    this.connections.set(connectionId, server);
    this.playerConnections.set(playerId, connectionId);

    // Set up event handlers
    server.addEventListener('message', (event) => {
      this.handleWebSocketMessage(playerId, connectionId, event.data);
    });

    server.addEventListener('close', () => {
      this.handlePlayerDisconnect(playerId, connectionId);
    });

    server.addEventListener('error', (error) => {
      console.error('WebSocket error for player', playerId, ':', error);
      this.handlePlayerDisconnect(playerId, connectionId);
    });

    // Update player connection status
    const player = this.room.players.get(playerId);
    if (player) {
      player.isConnected = true;
      player.connectionId = connectionId;
      player.lastActivity = new Date();
      await this.saveRoom();
      
      // Broadcast player connection
      await this.broadcastPlayerListUpdate();
      
      // Send current game state to the connecting player
      await this.sendGameStateToPlayer(playerId);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleCreateRoom(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { roomName, playerName, maxPlayers, settings } = data;

      if (!roomName || !playerName) {
        throw new RoomError('Room name and player name are required', 'INVALID_REQUEST');
      }

      // Generate unique room code
      const roomCode = this.generateRoomCode();
      const roomId = crypto.randomUUID();
      const hostId = crypto.randomUUID();

      // Create room
      const now = new Date();
      const defaultSettings: RoomSettings = {
        requireMajorityForWin: true,
        voteTimeoutSeconds: ROOM_CONFIG.DEFAULT_VOTE_TIMEOUT_SECONDS,
        maxPlayersPerRoom: maxPlayers || ROOM_CONFIG.DEFAULT_MAX_PLAYERS,
        autoCleanupMinutes: ROOM_CONFIG.DEFAULT_CLEANUP_MINUTES,
        allowSpectators: false,
        democraticWinThreshold: ROOM_CONFIG.DEFAULT_WIN_THRESHOLD,
      };

      this.room = {
        id: roomId,
        code: roomCode,
        name: roomName.substring(0, ROOM_CONFIG.MAX_ROOM_NAME_LENGTH),
        hostId,
        maxPlayers: maxPlayers || ROOM_CONFIG.DEFAULT_MAX_PLAYERS,
        isGameActive: true,
        createdAt: now,
        lastActivity: now,
        players: new Map(),
        sharedCard: BingoGameEngine.generateSharedCard(),
        gameState: {
          currentRound: 1,
          roundStartTime: now,
          totalRounds: 1,
          isRoundActive: true,
          winnerHistory: [],
        },
        votingSession: null,
        settings: { ...defaultSettings, ...settings },
        statistics: {
          gamesPlayed: 0,
          totalWins: 0,
          averageGameDuration: 0,
          mostActivePlayer: '',
          popularSquares: {},
          winPatternCounts: { row: 0, column: 0, diagonal: 0 },
        },
      };

      // Add host as first player
      const hostPlayer: Player = {
        id: hostId,
        name: playerName.substring(0, ROOM_CONFIG.MAX_PLAYER_NAME_LENGTH),
        connectionId: '',
        isHost: true,
        isConnected: false,
        joinedAt: now,
        lastActivity: now,
        card: [...this.room.sharedCard], // Copy shared card
        hasClaimedBingo: false,
        winCount: 0,
      };

      this.room.players.set(hostId, hostPlayer);

      // Save room
      await this.saveRoom();

      // Log event
      await this.logEvent('room:created', roomId, hostId, { roomName, playerName });

      return new Response(JSON.stringify({
        success: true,
        roomCode,
        roomId,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleJoinRoom(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { roomCode, playerName } = data;

      if (!roomCode || !playerName) {
        throw new RoomError('Room code and player name are required', 'INVALID_REQUEST');
      }

      await this.loadRoom();

      if (!this.room || this.room.code !== roomCode.toUpperCase()) {
        throw new RoomError('Room not found', 'ROOM_NOT_FOUND');
      }

      if (this.room.players.size >= this.room.maxPlayers) {
        throw new RoomError('Room is full', 'ROOM_FULL');
      }

      // Check if player name already exists
      const existingPlayer = Array.from(this.room.players.values())
        .find(p => p.name.toLowerCase() === playerName.toLowerCase());
      
      if (existingPlayer) {
        throw new RoomError('Player name already taken', 'PLAYER_EXISTS');
      }

      // Add new player
      const playerId = crypto.randomUUID();
      const now = new Date();
      
      const newPlayer: Player = {
        id: playerId,
        name: playerName.substring(0, ROOM_CONFIG.MAX_PLAYER_NAME_LENGTH),
        connectionId: '',
        isHost: false,
        isConnected: false,
        joinedAt: now,
        lastActivity: now,
        card: [...this.room.sharedCard], // Copy shared card
        hasClaimedBingo: false,
        winCount: 0,
      };

      this.room.players.set(playerId, newPlayer);
      this.room.lastActivity = now;

      await this.saveRoom();

      // Log event
      await this.logEvent('player:joined', this.room.id, playerId, { playerName });

      // Broadcast to existing players
      await this.broadcast({
        type: 'PLAYER_JOIN',
        playerId,
        playerName,
        isHost: false,
        timestamp: now,
      });

      await this.broadcastPlayerListUpdate();

      return new Response(JSON.stringify({
        success: true,
        roomId: this.room.id,
        playerId,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleRoomStatus(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const roomCode = url.searchParams.get('roomCode');

      if (!roomCode) {
        throw new RoomError('Room code is required', 'INVALID_REQUEST');
      }

      await this.loadRoom();

      if (!this.room || this.room.code !== roomCode.toUpperCase()) {
        throw new RoomError('Room not found', 'ROOM_NOT_FOUND');
      }

      const players = Array.from(this.room.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        isHost: player.isHost,
        isConnected: player.isConnected,
      }));

      return new Response(JSON.stringify({
        success: true,
        room: {
          id: this.room.id,
          code: this.room.code,
          name: this.room.name,
          playerCount: this.room.players.size,
          maxPlayers: this.room.maxPlayers,
          isGameActive: this.room.isGameActive,
          players,
        },
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleLeaveRoom(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { playerId } = data;

      if (!playerId) {
        throw new RoomError('Player ID is required', 'INVALID_REQUEST');
      }

      await this.loadRoom();

      if (!this.room) {
        throw new RoomError('Room not found', 'ROOM_NOT_FOUND');
      }

      const player = this.room.players.get(playerId);
      if (!player) {
        throw new RoomError('Player not found in room', 'INVALID_REQUEST');
      }

      await this.removePlayer(playerId, 'left');

      return new Response(JSON.stringify({
        success: true,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleKickPlayer(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { hostId, playerId, reason = 'Kicked by host' } = data;

      if (!hostId || !playerId) {
        throw new RoomError('Host ID and Player ID are required', 'INVALID_REQUEST');
      }

      await this.loadRoom();

      if (!this.room) {
        throw new RoomError('Room not found', 'ROOM_NOT_FOUND');
      }

      const host = this.room.players.get(hostId);
      if (!host || !host.isHost) {
        throw new RoomError('Only the host can kick players', 'UNAUTHORIZED');
      }

      const player = this.room.players.get(playerId);
      if (!player) {
        throw new RoomError('Player not found in room', 'INVALID_REQUEST');
      }

      if (player.isHost) {
        throw new RoomError('Cannot kick the host', 'INVALID_REQUEST');
      }

      // Broadcast kick message before removing
      await this.broadcast({
        type: 'PLAYER_KICK',
        kickedPlayerId: playerId,
        kickedPlayerName: player.name,
        kickedBy: host.name,
        reason,
        timestamp: new Date(),
      });

      await this.removePlayer(playerId, 'kick');

      return new Response(JSON.stringify({
        success: true,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleUpdateSettings(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const { hostId, settings } = data;

      if (!hostId || !settings) {
        throw new RoomError('Host ID and settings are required', 'INVALID_REQUEST');
      }

      await this.loadRoom();

      if (!this.room) {
        throw new RoomError('Room not found', 'ROOM_NOT_FOUND');
      }

      const host = this.room.players.get(hostId);
      if (!host || !host.isHost) {
        throw new RoomError('Only the host can update settings', 'UNAUTHORIZED');
      }

      // Update settings
      this.room.settings = { ...this.room.settings, ...settings };
      await this.saveRoom();

      // Broadcast settings update
      await this.broadcast({
        type: 'ROOM_SETTINGS_UPDATE',
        settings: this.room.settings,
        updatedBy: host.name,
        timestamp: new Date(),
      });

      return new Response(JSON.stringify({
        success: true,
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (error instanceof RoomError) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private async handleWebSocketMessage(playerId: string, connectionId: string, data: any): Promise<void> {
    try {
      const message = JSON.parse(data);
      const player = this.room?.players.get(playerId);
      
      if (!player || !this.room) {
        return;
      }

      // Update player activity
      player.lastActivity = new Date();

      switch (message.type) {
        case 'MARK_SQUARE':
          await this.handleMarkSquare(playerId, message.squareId, message.isMarked);
          break;
        case 'CLAIM_BINGO':
          await this.handleBingoClaim(playerId, message.winningPattern, message.winningCells);
          break;
        case 'VOTE':
          await this.handleVote(playerId, message.votingSessionId, message.vote);
          break;
        case 'NEW_GAME':
          await this.handleNewGame(playerId);
          break;
        case 'CHAT_MESSAGE':
          await this.handleChatMessage(playerId, message.message);
          break;
        case 'HEARTBEAT':
          // Just update activity timestamp
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }

      await this.saveRoom();
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      await this.sendToPlayer(playerId, {
        type: 'ERROR',
        error: 'Failed to process message',
        details: error.message,
        timestamp: new Date(),
      });
    }
  }

  private async handleMarkSquare(playerId: string, squareId: string, isMarked: boolean): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    // Find and update the square in player's card
    const square = player.card.find(s => s.id === squareId);
    if (!square || square.isFree) return;

    square.isMarked = isMarked;

    // Update room statistics
    if (isMarked) {
      if (!this.room.statistics.popularSquares[square.text]) {
        this.room.statistics.popularSquares[square.text] = 0;
      }
      this.room.statistics.popularSquares[square.text]++;
    }

    // Broadcast to all players
    await this.broadcast({
      type: isMarked ? 'SQUARE_MARKED' : 'SQUARE_UNMARKED',
      squareId,
      squareText: square.text,
      playerId,
      playerName: player.name,
      timestamp: new Date(),
    });

    await this.logEvent('square:marked', this.room.id, playerId, { squareId, squareText: square.text, isMarked });
  }

  private async handleBingoClaim(playerId: string, winningPattern: 'row' | 'column' | 'diagonal', winningCells: number[]): Promise<void> {
    if (!this.room || this.room.votingSession) return;

    const player = this.room.players.get(playerId);
    if (!player || player.hasClaimedBingo) return;

    // Verify the bingo claim
    const isValidBingo = BingoGameEngine.verifyBingo(player.card, winningPattern, winningCells);
    if (!isValidBingo) {
      await this.sendToPlayer(playerId, {
        type: 'ERROR',
        error: 'Invalid bingo claim',
        timestamp: new Date(),
      });
      return;
    }

    player.hasClaimedBingo = true;

    // Check if voting is required
    const requiresVoting = this.room.settings.requireMajorityForWin && this.room.players.size > 1;

    if (requiresVoting) {
      // Start voting session
      await this.startVotingSession(playerId, winningPattern, winningCells);
    } else {
      // Auto-approve the win
      await this.processWin(playerId, winningPattern, winningCells, true);
    }

    await this.broadcast({
      type: 'BINGO_CLAIM',
      playerId,
      playerName: player.name,
      winningPattern,
      winningCells,
      requiresVoting,
      timestamp: new Date(),
    });

    await this.logEvent('bingo:claimed', this.room.id, playerId, { winningPattern, winningCells, requiresVoting });
  }

  private async startVotingSession(playerId: string, winningPattern: 'row' | 'column' | 'diagonal', winningCells: number[]): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    const votingSession: VotingSession = {
      id: crypto.randomUUID(),
      claimantId: playerId,
      claimantName: player.name,
      winningPattern,
      winningCells,
      votesFor: [],
      votesAgainst: [],
      abstained: [],
      expiresAt: new Date(Date.now() + this.room.settings.voteTimeoutSeconds * 1000),
      isCompleted: false,
      result: 'pending',
    };

    this.room.votingSession = votingSession;

    await this.broadcast({
      type: 'VOTING_START',
      votingSession,
      timestamp: new Date(),
    });

    await this.logEvent('vote:started', this.room.id, playerId, { votingSessionId: votingSession.id });

    // Set timeout to end voting
    setTimeout(async () => {
      await this.endVotingSession('timeout');
    }, this.room.settings.voteTimeoutSeconds * 1000);
  }

  private async handleVote(playerId: string, votingSessionId: string, vote: 'for' | 'against' | 'abstain'): Promise<void> {
    if (!this.room || !this.room.votingSession) return;

    if (this.room.votingSession.id !== votingSessionId || this.room.votingSession.isCompleted) {
      return;
    }

    const player = this.room.players.get(playerId);
    if (!player || playerId === this.room.votingSession.claimantId) return;

    // Remove previous vote if exists
    this.room.votingSession.votesFor = this.room.votingSession.votesFor.filter(id => id !== playerId);
    this.room.votingSession.votesAgainst = this.room.votingSession.votesAgainst.filter(id => id !== playerId);
    this.room.votingSession.abstained = this.room.votingSession.abstained.filter(id => id !== playerId);

    // Add new vote
    switch (vote) {
      case 'for':
        this.room.votingSession.votesFor.push(playerId);
        break;
      case 'against':
        this.room.votingSession.votesAgainst.push(playerId);
        break;
      case 'abstain':
        this.room.votingSession.abstained.push(playerId);
        break;
    }

    await this.broadcast({
      type: 'WIN_VOTE',
      votingSessionId,
      playerId,
      playerName: player.name,
      vote,
      timestamp: new Date(),
    });

    // Check if all eligible players have voted
    const eligibleVoters = Array.from(this.room.players.values()).filter(p => 
      p.isConnected && p.id !== this.room.votingSession.claimantId
    ).length;

    const totalVotes = this.room.votingSession.votesFor.length + 
                      this.room.votingSession.votesAgainst.length + 
                      this.room.votingSession.abstained.length;

    if (totalVotes >= eligibleVoters) {
      await this.endVotingSession('completed');
    }
  }

  private async endVotingSession(reason: 'completed' | 'timeout'): Promise<void> {
    if (!this.room || !this.room.votingSession || this.room.votingSession.isCompleted) return;

    const session = this.room.votingSession;
    session.isCompleted = true;

    const votesFor = session.votesFor.length;
    const votesAgainst = session.votesAgainst.length;
    const abstained = session.abstained.length;
    const totalEligibleVoters = Array.from(this.room.players.values()).filter(p => 
      p.isConnected && p.id !== session.claimantId
    ).length;

    // Calculate if win is approved (need majority of eligible voters)
    const threshold = Math.ceil(totalEligibleVoters * this.room.settings.democraticWinThreshold);
    const isApproved = votesFor >= threshold;
    
    session.result = isApproved ? 'approved' : 'denied';

    await this.processWin(session.claimantId, session.winningPattern, session.winningCells, isApproved);

    const winner = isApproved ? this.room.players.get(session.claimantId) : undefined;

    await this.broadcast({
      type: 'VOTING_END',
      votingSessionId: session.id,
      result: reason === 'timeout' ? 'timeout' : session.result,
      winnerName: winner?.name,
      votesFor,
      votesAgainst,
      abstained,
      timestamp: new Date(),
    });

    await this.logEvent('vote:ended', this.room.id, session.claimantId, { 
      result: session.result, 
      votesFor, 
      votesAgainst, 
      abstained 
    });

    // Clear voting session
    this.room.votingSession = null;
  }

  private async processWin(playerId: string, winningPattern: 'row' | 'column' | 'diagonal', winningCells: number[], wasApproved: boolean): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    if (wasApproved) {
      player.winCount++;
      this.room.statistics.totalWins++;
      this.room.statistics.winPatternCounts[winningPattern]++;
    }

    // Add to win history
    const winRecord: WinRecord = {
      playerId,
      playerName: player.name,
      timestamp: new Date(),
      winningPattern,
      winningCells,
      votesFor: this.room.votingSession?.votesFor.length || 0,
      votesAgainst: this.room.votingSession?.votesAgainst.length || 0,
      wasApproved,
    };

    this.room.gameState.winnerHistory.push(winRecord);

    if (wasApproved) {
      // End current game and potentially start a new one
      this.room.gameState.isRoundActive = false;
      this.room.statistics.gamesPlayed++;
      
      // Auto-start new game after a short delay
      setTimeout(async () => {
        await this.startNewGame(playerId);
      }, 3000);
    } else {
      // Reset player's bingo claim if denied
      player.hasClaimedBingo = false;
    }
  }

  private async handleNewGame(playerId: string): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player || !player.isHost) {
      await this.sendToPlayer(playerId, {
        type: 'ERROR',
        error: 'Only the host can start a new game',
        timestamp: new Date(),
      });
      return;
    }

    await this.startNewGame(playerId);
  }

  private async startNewGame(initiatorId: string): Promise<void> {
    if (!this.room) return;

    // Generate new shared card
    this.room.sharedCard = BingoGameEngine.generateSharedCard();
    
    // Update all player cards
    this.room.players.forEach(player => {
      player.card = [...this.room.sharedCard];
      player.hasClaimedBingo = false;
    });

    // Update game state
    this.room.gameState.currentRound++;
    this.room.gameState.roundStartTime = new Date();
    this.room.gameState.isRoundActive = true;
    this.room.votingSession = null;

    await this.broadcast({
      type: 'NEW_GAME',
      sharedCard: this.room.sharedCard,
      initiatedBy: this.room.players.get(initiatorId)?.name || 'System',
      timestamp: new Date(),
    });

    await this.broadcastGameStateUpdate();
    await this.logEvent('game:started', this.room.id, initiatorId);
  }

  private async handleChatMessage(playerId: string, message: string): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    const trimmedMessage = message.trim().substring(0, ROOM_CONFIG.MAX_CHAT_MESSAGE_LENGTH);
    if (!trimmedMessage) return;

    await this.broadcast({
      type: 'CHAT_MESSAGE',
      playerId,
      playerName: player.name,
      message: trimmedMessage,
      timestamp: new Date(),
    });
  }

  private async handlePlayerDisconnect(playerId: string, connectionId: string): Promise<void> {
    if (!this.room) return;

    // Remove connection
    this.connections.delete(connectionId);
    this.playerConnections.delete(playerId);

    const player = this.room.players.get(playerId);
    if (player) {
      player.isConnected = false;
      player.connectionId = '';

      await this.broadcast({
        type: 'PLAYER_LEAVE',
        playerId,
        playerName: player.name,
        reason: 'disconnect',
        timestamp: new Date(),
      });

      await this.broadcastPlayerListUpdate();
      await this.logEvent('player:disconnected', this.room.id, playerId);
    }

    await this.saveRoom();

    // If all players are disconnected, schedule cleanup
    const connectedPlayers = Array.from(this.room.players.values()).filter(p => p.isConnected);
    if (connectedPlayers.length === 0) {
      setTimeout(async () => {
        await this.checkForCleanup();
      }, this.room.settings.autoCleanupMinutes * 60 * 1000);
    }
  }

  private async removePlayer(playerId: string, reason: 'left' | 'kick'): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    // Close player's connection if exists
    const connectionId = this.playerConnections.get(playerId);
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.close();
      }
      this.connections.delete(connectionId);
      this.playerConnections.delete(playerId);
    }

    // Remove from room
    this.room.players.delete(playerId);

    // If this was the host, assign a new host
    if (player.isHost && this.room.players.size > 0) {
      const newHost = Array.from(this.room.players.values())[0];
      newHost.isHost = true;
    }

    await this.broadcast({
      type: 'PLAYER_LEAVE',
      playerId,
      playerName: player.name,
      reason,
      timestamp: new Date(),
    });

    await this.broadcastPlayerListUpdate();
    await this.logEvent('player:left', this.room.id, playerId, { reason });

    // If no players left, clean up room
    if (this.room.players.size === 0) {
      await this.cleanupRoom();
    }
  }

  private async broadcast(message: WebSocketMessage): Promise<void> {
    const messageStr = JSON.stringify(message);
    const promises: Promise<void>[] = [];

    this.connections.forEach((connection, connectionId) => {
      promises.push(
        new Promise((resolve) => {
          try {
            connection.send(messageStr);
          } catch (error) {
            console.error('Failed to send message to connection', connectionId, ':', error);
          }
          resolve();
        })
      );
    });

    await Promise.all(promises);
  }

  private async sendToPlayer(playerId: string, message: WebSocketMessage): Promise<void> {
    const connectionId = this.playerConnections.get(playerId);
    if (!connectionId) return;

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      connection.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message to player', playerId, ':', error);
    }
  }

  private async sendGameStateToPlayer(playerId: string): Promise<void> {
    if (!this.room) return;

    const player = this.room.players.get(playerId);
    if (!player) return;

    await this.sendToPlayer(playerId, {
      type: 'GAME_STATE_UPDATE',
      gameState: this.room.gameState,
      sharedCard: player.card,
      timestamp: new Date(),
    });
  }

  private async broadcastPlayerListUpdate(): Promise<void> {
    if (!this.room) return;

    const players = Array.from(this.room.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      isConnected: player.isConnected,
      hasClaimedBingo: player.hasClaimedBingo,
      winCount: player.winCount,
    }));

    await this.broadcast({
      type: 'PLAYER_LIST_UPDATE',
      players,
      timestamp: new Date(),
    });
  }

  private async broadcastGameStateUpdate(): Promise<void> {
    if (!this.room) return;

    await this.broadcast({
      type: 'GAME_STATE_UPDATE',
      gameState: this.room.gameState,
      sharedCard: this.room.sharedCard,
      timestamp: new Date(),
    });
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < ROOM_CONFIG.CODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async loadRoom(): Promise<void> {
    if (this.room) return;

    const roomData = await this.state.get<any>('room');
    if (roomData) {
      // Reconstruct room with Map objects
      this.room = {
        ...roomData,
        players: new Map(roomData.players || []),
        createdAt: new Date(roomData.createdAt),
        lastActivity: new Date(roomData.lastActivity),
        gameState: {
          ...roomData.gameState,
          roundStartTime: roomData.gameState.roundStartTime ? new Date(roomData.gameState.roundStartTime) : null,
          winnerHistory: roomData.gameState.winnerHistory.map((win: any) => ({
            ...win,
            timestamp: new Date(win.timestamp),
          })),
        },
        votingSession: roomData.votingSession ? {
          ...roomData.votingSession,
          expiresAt: new Date(roomData.votingSession.expiresAt),
        } : null,
      };

      // Reconstruct player dates
      this.room.players.forEach(player => {
        player.joinedAt = new Date(player.joinedAt);
        player.lastActivity = new Date(player.lastActivity);
      });
    }
  }

  private async saveRoom(): Promise<void> {
    if (!this.room) return;

    // Convert Maps to arrays for serialization
    const roomData = {
      ...this.room,
      players: Array.from(this.room.players.entries()),
      lastActivity: new Date(),
    };

    this.room.lastActivity = new Date();
    await this.state.put('room', roomData);
  }

  private async logEvent(type: string, roomId: string, playerId?: string, data?: any): Promise<void> {
    const event: RoomEvent = {
      type: type as any,
      roomId,
      playerId,
      data,
      timestamp: new Date(),
    };

    let eventLog = await this.state.get<RoomEvent[]>('eventLog') || [];
    eventLog.push(event);
    
    // Keep only last 1000 events
    if (eventLog.length > 1000) {
      eventLog = eventLog.slice(-1000);
    }

    await this.state.put('eventLog', eventLog);
  }

  private startPeriodicCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(async () => {
      await this.checkForCleanup();
    }, ROOM_CONFIG.ROOM_CLEANUP_INTERVAL_MS) as any;
  }

  private async checkForCleanup(): Promise<void> {
    await this.loadRoom();
    
    if (!this.room) return;

    const now = new Date();
    const inactiveThreshold = this.room.settings.autoCleanupMinutes * 60 * 1000;
    const timeSinceActivity = now.getTime() - this.room.lastActivity.getTime();

    // Clean up inactive players
    const playersToRemove: string[] = [];
    this.room.players.forEach((player, playerId) => {
      const timeSincePlayerActivity = now.getTime() - player.lastActivity.getTime();
      if (!player.isConnected && timeSincePlayerActivity > ROOM_CONFIG.INACTIVE_PLAYER_TIMEOUT_MS) {
        playersToRemove.push(playerId);
      }
    });

    for (const playerId of playersToRemove) {
      await this.removePlayer(playerId, 'left');
    }

    // Clean up room if no active players and inactive
    const connectedPlayers = Array.from(this.room.players.values()).filter(p => p.isConnected);
    if (connectedPlayers.length === 0 && timeSinceActivity > inactiveThreshold) {
      await this.cleanupRoom();
    }
  }

  private async cleanupRoom(): Promise<void> {
    if (!this.room) return;

    // Close all connections
    this.connections.forEach(connection => {
      try {
        connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    });

    this.connections.clear();
    this.playerConnections.clear();

    await this.logEvent('room:destroyed', this.room.id);

    // Clear room data
    await this.state.deleteAll();
    this.room = null;

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}