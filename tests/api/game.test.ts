// @vitest-environment node
// Live-API integration tests for Jargon. Requires deployed worker.
import { describe, it, expect } from 'vitest';

const API_BASE = 'https://jargon-api.playjargon.workers.dev';

async function api(method: string, path: string, body?: any, playerId?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (playerId) headers['X-Player-Id'] = playerId;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

describe('Jargon API', () => {
  it('create + join + start roundtrip (2-player)', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'Test Lobby', creatorName: 'Alice' });
    expect(c.status).toBe(200);
    expect(c.data.gameId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(c.data.state.players).toHaveLength(1);
    expect(c.data.state.status).toBe('waiting');
    expect(c.data.state.maxPlayers).toBe(2);

    const j = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'Bob' });
    expect(j.status).toBe(200);
    // Status stays 'waiting' until host starts.
    expect(j.data.state.status).toBe('waiting');
    expect(j.data.state.players).toHaveLength(2);

    const s = await api('POST', `/api/games/${c.data.gameId}/start`, undefined, c.data.playerId);
    expect(s.status).toBe(200);
    expect(s.data.state.status).toBe('active');
    expect(s.data.state.currentRound).toBeTruthy();
  }, 15000);

  it('non-host cannot start', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'Host Test', creatorName: 'Alice' });
    const j = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'Bob' });
    const denied = await api('POST', `/api/games/${c.data.gameId}/start`, undefined, j.data.playerId);
    expect(denied.status).toBe(403);
  }, 15000);

  it('rejects join when name missing', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'X', creatorName: 'Alice' });
    const j = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: '' });
    expect(j.status).toBe(400);
  }, 15000);

  it('rejects join past maxPlayers (default 2)', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'X', creatorName: 'A' });
    await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'B' });
    const third = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'C' });
    expect(third.status).toBe(409);
  }, 15000);

  it('4-player game allows 4 joins, rejects 5th', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'Squad', creatorName: 'A', maxPlayers: 4 });
    expect(c.data.state.maxPlayers).toBe(4);
    const j2 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'B' });
    expect(j2.status).toBe(200);
    const j3 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'C' });
    expect(j3.status).toBe(200);
    const j4 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'D' });
    expect(j4.status).toBe(200);
    expect(j4.data.state.players).toHaveLength(4);
    const j5 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'E' });
    expect(j5.status).toBe(409);
  }, 20000);

  it('4-player full round: all guess 4 wrong → all 0pts, allComplete', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'Quad', creatorName: 'A', maxPlayers: 4 });
    const aId = c.data.playerId;
    const ids = [aId];
    for (const name of ['B', 'C', 'D']) {
      const j = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: name });
      ids.push(j.data.playerId);
    }
    await api('POST', `/api/games/${c.data.gameId}/start`, undefined, aId);
    // Each player burns 4 wrong guesses
    for (let i = 0; i < 4; i++) {
      for (const pid of ids) {
        await api('POST', `/api/games/${c.data.gameId}/guess`, { guess: `nope${i}` }, pid);
      }
    }
    const after = await api('GET', `/api/games/${c.data.gameId}`, undefined, aId);
    expect(after.data.currentRound.bothComplete).toBe(true);
    for (const pid of ids) expect(after.data.scores[pid]).toBe(0);
    expect(after.data.currentRound.opponents).toHaveLength(3);
    // Reveal after allComplete
    expect(after.data.currentRound.word).toBeTruthy();
  }, 30000);

  it('redacts other players guesses during active round', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'Redact', creatorName: 'A', maxPlayers: 3 });
    const aId = c.data.playerId;
    const j1 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'B' });
    const j2 = await api('POST', `/api/games/${c.data.gameId}/join`, { playerName: 'C' });
    await api('POST', `/api/games/${c.data.gameId}/start`, undefined, aId);
    await api('POST', `/api/games/${c.data.gameId}/guess`, { guess: 'secretGuessB' }, j1.data.playerId);
    const s = await api('GET', `/api/games/${c.data.gameId}`, undefined, aId);
    expect(s.data.currentRound.opponents).toHaveLength(2);
    const json = JSON.stringify(s.data);
    expect(json).not.toContain('secretGuessB');
  }, 20000);

  it('GET users/me/games returns games for player', async () => {
    const c = await api('POST', '/api/games', { lobbyName: 'My Lobby', creatorName: 'Alice' });
    const list = await api('GET', '/api/users/me/games', undefined, c.data.playerId);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.data)).toBe(true);
    const found = list.data.find((g: any) => g.gameId === c.data.gameId);
    expect(found).toBeTruthy();
    expect(found.lobbyName).toBe('My Lobby');
  }, 15000);
});
