// Jargon backend.
// One Game Durable Object per game (keyed by gameId).
// SQLite-backed for persistence across DO eviction. Async play; no timers.

import { corsHeaders } from './cors.js';
import { normalizeGuess } from './game-normalize.js';
import { getWord, pickWord, pointsForGuess } from './game-pool.js';
import { redactState } from './game-redact.js';

const JSON_HEADERS = (origin) => ({ 'Content-Type': 'application/json', ...corsHeaders(origin) });
const RECENT_WORD_LIMIT = 10;
const ABANDON_MS = 30 * 24 * 60 * 60 * 1000; // 30d

// ---------- Game DO ----------

export class Game {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.initSchema();
  }

  initSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS game (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        game_id TEXT,
        lobby_name TEXT,
        status TEXT DEFAULT 'waiting',
        created_at INTEGER,
        scores_json TEXT DEFAULT '{}',
        recent_word_ids_json TEXT DEFAULT '[]',
        current_round_number INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS players (
        player_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slot INTEGER NOT NULL,
        joined_at INTEGER NOT NULL,
        ready_for_next_round INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS rounds (
        round_number INTEGER PRIMARY KEY,
        word_id TEXT,
        started_at INTEGER,
        ended_at INTEGER,
        both_complete INTEGER DEFAULT 0,
        player_states_json TEXT DEFAULT '{}'
      );
    `);
  }

  getGame() {
    const row = this.sql.exec('SELECT * FROM game WHERE id = 1').toArray()[0];
    if (!row) return null;
    return {
      ...row,
      scores: JSON.parse(row.scores_json || '{}'),
      recentWordIds: JSON.parse(row.recent_word_ids_json || '[]')
    };
  }

  getPlayers() {
    return this.sql.exec('SELECT * FROM players ORDER BY slot').toArray().map(p => ({
      playerId: p.player_id,
      name: p.name,
      slot: p.slot,
      joinedAt: p.joined_at,
      readyForNextRound: !!p.ready_for_next_round
    }));
  }

  getRounds() {
    return this.sql.exec('SELECT * FROM rounds ORDER BY round_number').toArray().map(r => ({
      roundNumber: r.round_number,
      wordId: r.word_id,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      bothComplete: !!r.both_complete,
      playerStates: JSON.parse(r.player_states_json || '{}')
    }));
  }

  // Build full state object (unredacted; redaction happens at response layer in Phase 4).
  buildState() {
    const game = this.getGame();
    if (!game) return null;
    const players = this.getPlayers();
    const rounds = this.getRounds();
    return {
      gameId: game.game_id,
      lobbyName: game.lobby_name,
      status: game.status,
      createdAt: game.created_at,
      players,
      rounds,
      currentRound: rounds.find(r => r.roundNumber === game.current_round_number) || null,
      scores: game.scores,
      recentWordIds: game.recentWordIds
    };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      if (path === '/create' && method === 'POST') return await this.handleCreate(request);
      if (path === '/join' && method === 'POST') return await this.handleJoin(request);
      if (path === '/state' && method === 'GET') return this.handleState(request);
      if (path === '/ready' && method === 'POST') return await this.handleReady(request);
      if (path === '/guess' && method === 'POST') return await this.handleGuess(request);
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async alarm() {
    // Housekeeping: mark stale games as abandoned.
    const game = this.getGame();
    if (!game) return;
    const lastTouch = this.sql.exec('SELECT MAX(last_activity) AS t FROM (SELECT MAX(joined_at) AS last_activity FROM players UNION SELECT MAX(started_at) FROM rounds UNION SELECT MAX(ended_at) FROM rounds)').toArray()[0]?.t || game.created_at;
    if (Date.now() - lastTouch > ABANDON_MS) {
      this.sql.exec('UPDATE game SET status = ? WHERE id = 1', 'abandoned');
    }
  }

  scheduleAbandonAlarm() {
    // Set a far-future alarm; restart on each mutation.
    this.state.storage.setAlarm(Date.now() + ABANDON_MS);
  }

  async handleCreate(request) {
    const body = await request.json();
    const { gameId, lobbyName, creatorName, playerId } = body;
    const existing = this.getGame();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Game already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    const now = Date.now();
    this.sql.exec(
      'INSERT INTO game (id, game_id, lobby_name, status, created_at, scores_json, recent_word_ids_json) VALUES (1, ?, ?, ?, ?, ?, ?)',
      gameId, lobbyName, 'waiting', now, JSON.stringify({ [playerId]: 0 }), '[]'
    );
    this.sql.exec(
      'INSERT INTO players (player_id, name, slot, joined_at) VALUES (?, ?, ?, ?)',
      playerId, creatorName, 0, now
    );
    // Index in UserGames
    await this.upsertUserGame(playerId, gameId, lobbyName, 'waiting', null, 0, 0, now);
    // (creator alone, no opponent — status='waiting')
    this.scheduleAbandonAlarm();
    return new Response(JSON.stringify({ gameId, playerId, state: this.buildState() }), { headers: { 'Content-Type': 'application/json' } });
  }

  async handleJoin(request) {
    const body = await request.json();
    const { playerName, playerId } = body;
    const game = this.getGame();
    if (!game) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const players = this.getPlayers();
    if (players.length >= 2) {
      // Idempotent rejoin: if playerId already a member, return state
      if (players.some(p => p.playerId === playerId)) {
        return new Response(JSON.stringify({ gameId: game.game_id, playerId, state: this.buildState() }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Game full' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    if (players.some(p => p.playerId === playerId)) {
      return new Response(JSON.stringify({ gameId: game.game_id, playerId, state: this.buildState() }), { headers: { 'Content-Type': 'application/json' } });
    }
    const now = Date.now();
    this.sql.exec(
      'INSERT INTO players (player_id, name, slot, joined_at) VALUES (?, ?, ?, ?)',
      playerId, playerName, 1, now
    );
    // Init this player's score
    const scores = game.scores;
    scores[playerId] = 0;
    this.sql.exec('UPDATE game SET scores_json = ?, status = ? WHERE id = 1', JSON.stringify(scores), 'active');

    // Index in UserGames for both players (no round started yet → 'your_turn' for both = "ready up")
    const opponent = players[0];
    const fullState = this.buildState();
    const allPlayers = this.getPlayers();
    const cur = this.getCurrentRound(this.getGame());
    const meStatus = this.computePlayerStatus(playerId, allPlayers, cur, 'active');
    const oppStatus = this.computePlayerStatus(opponent.playerId, allPlayers, cur, 'active');
    await this.upsertUserGame(playerId, game.game_id, game.lobby_name, meStatus, opponent.name, 0, 0, now);
    await this.upsertUserGame(opponent.playerId, game.game_id, game.lobby_name, oppStatus, playerName, 0, 0, now);

    this.scheduleAbandonAlarm();
    return new Response(JSON.stringify({ gameId: game.game_id, playerId, state: fullState }), { headers: { 'Content-Type': 'application/json' } });
  }

  handleState(request) {
    const game = this.getGame();
    if (!game) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const requesterId = request.headers.get('X-Player-Id');
    const full = this.buildState();
    // Validate requester is a member; if not, return 403
    if (requesterId && !full.players.some(p => p.playerId === requesterId)) {
      return new Response(JSON.stringify({ error: 'Not a member of this game' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    if (!requesterId) {
      // Public spectator view: redact everything (treat as non-player). For v1 just refuse.
      return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(redactState(full, requesterId)), { headers: { 'Content-Type': 'application/json' } });
  }

  async handleReady(request) {
    const game = this.getGame();
    if (!game) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const playerId = request.headers.get('X-Player-Id');
    if (!playerId) return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const players = this.getPlayers();
    if (!players.some(p => p.playerId === playerId)) {
      return new Response(JSON.stringify({ error: 'Not a member' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    if (players.length < 2) {
      return new Response(JSON.stringify({ error: 'Waiting for second player' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    // If a round is in progress and not bothComplete, ignore ready toggle
    const currentRound = this.getCurrentRound(game);
    if (currentRound && !currentRound.bothComplete) {
      return new Response(JSON.stringify({ error: 'Round in progress' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    // Toggle ready true
    this.sql.exec('UPDATE players SET ready_for_next_round = 1 WHERE player_id = ?', playerId);
    const updatedPlayers = this.getPlayers();
    const allReady = updatedPlayers.length === 2 && updatedPlayers.every(p => p.readyForNextRound);
    if (allReady) {
      await this.startNextRound(game);
    }
    // Refresh dashboard status for both players (ready toggle or round-start changes status)
    const gameAfter = this.getGame();
    const roundAfter = this.getCurrentRound(gameAfter);
    const playersAfter = this.getPlayers();
    const scoresAfter = gameAfter.scores;
    const now = Date.now();
    for (const p of playersAfter) {
      const opp = playersAfter.find(x => x.playerId !== p.playerId);
      const status = this.computePlayerStatus(p.playerId, playersAfter, roundAfter, gameAfter.status);
      await this.upsertUserGame(
        p.playerId, gameAfter.game_id, gameAfter.lobby_name, status,
        opp ? opp.name : null,
        scoresAfter[p.playerId] || 0,
        opp ? (scoresAfter[opp.playerId] || 0) : 0,
        now
      );
    }
    this.scheduleAbandonAlarm();
    return new Response(JSON.stringify({ ok: true, started: allReady, state: this.buildState() }), { headers: { 'Content-Type': 'application/json' } });
  }

  getCurrentRound(game) {
    if (!game.current_round_number) return null;
    const r = this.sql.exec('SELECT * FROM rounds WHERE round_number = ?', game.current_round_number).toArray()[0];
    if (!r) return null;
    return { ...r, bothComplete: !!r.both_complete, playerStates: JSON.parse(r.player_states_json || '{}') };
  }

  async startNextRound(game) {
    const players = this.getPlayers();
    const recent = JSON.parse(game.recent_word_ids_json || '[]');
    const word = pickWord(recent);
    const nextRoundNumber = (game.current_round_number || 0) + 1;
    const now = Date.now();
    const playerStates = {};
    for (const p of players) {
      playerStates[p.playerId] = {
        guesses: [],
        solved: false,
        solvedOnGuess: null,
        pointsEarned: 0,
        currentClueIndex: 0
      };
    }
    this.sql.exec(
      'INSERT INTO rounds (round_number, word_id, started_at, ended_at, both_complete, player_states_json) VALUES (?, ?, ?, NULL, 0, ?)',
      nextRoundNumber, word.id, now, JSON.stringify(playerStates)
    );
    // Update recent words (cap to RECENT_WORD_LIMIT)
    const newRecent = [word.id, ...recent].slice(0, RECENT_WORD_LIMIT);
    this.sql.exec('UPDATE game SET current_round_number = ?, recent_word_ids_json = ? WHERE id = 1',
      nextRoundNumber, JSON.stringify(newRecent));
    // Reset readiness
    this.sql.exec('UPDATE players SET ready_for_next_round = 0');
  }

  async handleGuess(request) {
    const game = this.getGame();
    if (!game) return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    const playerId = request.headers.get('X-Player-Id');
    if (!playerId) return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const body = await request.json();
    const guessRaw = (body.guess || '').toString();
    if (!guessRaw.trim()) return new Response(JSON.stringify({ error: 'guess required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const players = this.getPlayers();
    if (!players.some(p => p.playerId === playerId)) {
      return new Response(JSON.stringify({ error: 'Not a member' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const round = this.getCurrentRound(game);
    if (!round || round.bothComplete) {
      return new Response(JSON.stringify({ error: 'No active round' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    const ps = round.playerStates[playerId];
    if (!ps) return new Response(JSON.stringify({ error: 'Player has no round state' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    if (ps.solved || ps.guesses.length >= 4) {
      return new Response(JSON.stringify({ error: 'No guesses remaining' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    const word = getWord(round.word_id);
    if (!word) return new Response(JSON.stringify({ error: 'Word not found' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    const correct = normalizeGuess(guessRaw) === normalizeGuess(word.answer);
    ps.guesses.push(guessRaw);
    let pointsEarned = 0;
    if (correct) {
      ps.solved = true;
      ps.solvedOnGuess = ps.guesses.length;
      pointsEarned = pointsForGuess(ps.solvedOnGuess);
      ps.pointsEarned = pointsEarned;
    } else if (ps.guesses.length < 4) {
      ps.currentClueIndex = Math.min(3, ps.guesses.length); // reveal next clue
    }

    // Recompute bothComplete
    const updatedStates = round.playerStates;
    updatedStates[playerId] = ps;
    const allDone = Object.values(updatedStates).every(s => s.solved || s.guesses.length >= 4);
    const now = Date.now();

    this.sql.exec(
      'UPDATE rounds SET player_states_json = ?, both_complete = ?, ended_at = ? WHERE round_number = ?',
      JSON.stringify(updatedStates),
      allDone ? 1 : 0,
      allDone ? now : null,
      round.round_number
    );

    // Update scores if round just ended
    let scoresAfter;
    if (allDone) {
      scoresAfter = JSON.parse(game.scores_json || '{}');
      for (const [pid, st] of Object.entries(updatedStates)) {
        scoresAfter[pid] = (scoresAfter[pid] || 0) + (st.pointsEarned || 0);
      }
      this.sql.exec('UPDATE game SET scores_json = ? WHERE id = 1', JSON.stringify(scoresAfter));
    } else {
      scoresAfter = JSON.parse(game.scores_json || '{}');
    }

    // Recompute round shape for status calc (post-write)
    const roundForStatus = {
      bothComplete: allDone,
      playerStates: updatedStates
    };

    if (allDone) {
      // Both finished → 'round_complete' for both until they ready-up
      for (const p of players) {
        const opp = players.find(x => x.playerId !== p.playerId);
        const status = this.computePlayerStatus(p.playerId, players, roundForStatus, 'active');
        await this.upsertUserGame(
          p.playerId, game.game_id, game.lobby_name, status,
          opp ? opp.name : null,
          scoresAfter[p.playerId] || 0,
          opp ? (scoresAfter[opp.playerId] || 0) : 0,
          now
        );
      }
    } else {
      // Update both players: guesser may now be 'waiting_on_opponent', opp 'your_turn'
      for (const p of players) {
        const opp = players.find(x => x.playerId !== p.playerId);
        const status = this.computePlayerStatus(p.playerId, players, roundForStatus, 'active');
        await this.upsertUserGame(
          p.playerId, game.game_id, game.lobby_name, status,
          opp ? opp.name : null,
          scoresAfter[p.playerId] || 0,
          opp ? (scoresAfter[opp.playerId] || 0) : 0,
          now
        );
      }
    }

    this.scheduleAbandonAlarm();

    // Build redacted view for the requester
    const fullAfter = this.buildState();
    return new Response(JSON.stringify({
      correct,
      pointsEarned,
      guessesRemaining: 4 - ps.guesses.length,
      solved: ps.solved,
      bothComplete: allDone,
      state: redactState(fullAfter, playerId)
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Derives per-player status used by the dashboard.
  // Values: 'waiting' (alone) | 'your_turn' | 'waiting_on_opponent' | 'round_complete' | 'game_over'
  computePlayerStatus(playerId, players, currentRound, gameStatus) {
    if (gameStatus === 'abandoned') return 'game_over';
    if (players.length < 2) return 'waiting';
    if (!currentRound) return 'your_turn'; // both joined, no round yet → ready up
    if (currentRound.bothComplete) return 'round_complete';
    const ps = currentRound.playerStates?.[playerId];
    if (!ps) return 'your_turn';
    const finishedSelf = ps.solved || (ps.guesses && ps.guesses.length >= 4);
    return finishedSelf ? 'waiting_on_opponent' : 'your_turn';
  }

  async upsertUserGame(playerId, gameId, lobbyName, status, opponentName, yourScore, opponentScore, lastActivity) {
    if (!this.env.USER_GAMES) return;
    const id = this.env.USER_GAMES.idFromName(playerId);
    const obj = this.env.USER_GAMES.get(id);
    await obj.fetch(new Request('https://internal/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, gameId, lobbyName, status, opponentName, yourScore, opponentScore, lastActivity })
    }));
  }
}

// ---------- Route dispatcher ----------
// Returns Response or null if no game route matched.
export async function handleGameRequest(request, env, origin) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (!path.startsWith('/api/games') && !path.startsWith('/api/users/')) return null;

  // POST /api/games — create new game
  if (path === '/api/games' && method === 'POST') {
    const body = await request.json();
    const lobbyName = (body.lobbyName || '').toString().trim().slice(0, 80);
    const creatorName = (body.creatorName || '').toString().trim().slice(0, 40);
    if (!lobbyName || !creatorName) {
      return new Response(JSON.stringify({ error: 'lobbyName and creatorName required' }), { status: 400, headers: JSON_HEADERS(origin) });
    }
    const gameId = crypto.randomUUID();
    const playerId = request.headers.get('X-Player-Id') || crypto.randomUUID();
    const id = env.GAMES.idFromName(gameId);
    const obj = env.GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, lobbyName, creatorName, playerId })
    }));
    const data = await upstream.json();
    if (!upstream.ok) return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
    return new Response(JSON.stringify({
      gameId,
      playerId,
      inviteUrl: `/join/${gameId}`,
      state: data.state
    }), { headers: JSON_HEADERS(origin) });
  }

  // POST /api/games/:gameId/join
  const joinMatch = path.match(/^\/api\/games\/([^/]+)\/join$/);
  if (joinMatch && method === 'POST') {
    const gameId = joinMatch[1];
    const body = await request.json();
    const playerName = (body.playerName || '').toString().trim().slice(0, 40);
    if (!playerName) return new Response(JSON.stringify({ error: 'playerName required' }), { status: 400, headers: JSON_HEADERS(origin) });
    const playerId = request.headers.get('X-Player-Id') || crypto.randomUUID();
    const id = env.GAMES.idFromName(gameId);
    const obj = env.GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, playerId })
    }));
    const data = await upstream.json();
    if (!upstream.ok) return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
    return new Response(JSON.stringify({ gameId, playerId, state: data.state }), { headers: JSON_HEADERS(origin) });
  }

  // GET /api/games/:gameId
  const stateMatch = path.match(/^\/api\/games\/([^/]+)$/);
  if (stateMatch && method === 'GET') {
    const gameId = stateMatch[1];
    const playerId = request.headers.get('X-Player-Id');
    const id = env.GAMES.idFromName(gameId);
    const obj = env.GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/state', {
      method: 'GET',
      headers: playerId ? { 'X-Player-Id': playerId } : {}
    }));
    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
  }

  // POST /api/games/:gameId/ready
  const readyMatch = path.match(/^\/api\/games\/([^/]+)\/ready$/);
  if (readyMatch && method === 'POST') {
    const gameId = readyMatch[1];
    const playerId = request.headers.get('X-Player-Id');
    if (!playerId) return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: JSON_HEADERS(origin) });
    const id = env.GAMES.idFromName(gameId);
    const obj = env.GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/ready', {
      method: 'POST',
      headers: { 'X-Player-Id': playerId }
    }));
    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
  }

  // POST /api/games/:gameId/guess
  const guessMatch = path.match(/^\/api\/games\/([^/]+)\/guess$/);
  if (guessMatch && method === 'POST') {
    const gameId = guessMatch[1];
    const playerId = request.headers.get('X-Player-Id');
    if (!playerId) return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: JSON_HEADERS(origin) });
    const body = await request.text();
    const id = env.GAMES.idFromName(gameId);
    const obj = env.GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Player-Id': playerId },
      body
    }));
    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
  }

  // GET /api/users/me/games
  if (path === '/api/users/me/games' && method === 'GET') {
    const playerId = request.headers.get('X-Player-Id');
    if (!playerId) return new Response(JSON.stringify({ error: 'X-Player-Id required' }), { status: 400, headers: JSON_HEADERS(origin) });
    const id = env.USER_GAMES.idFromName(playerId);
    const obj = env.USER_GAMES.get(id);
    const upstream = await obj.fetch(new Request('https://internal/list', { method: 'GET' }));
    const data = await upstream.json();
    return new Response(JSON.stringify(data), { status: upstream.status, headers: JSON_HEADERS(origin) });
  }

  return null;
}
