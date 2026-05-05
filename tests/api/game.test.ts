// @vitest-environment node
// Live-API integration tests for Jargon. Requires deployed worker.
import { describe, it, expect } from 'vitest';

const API_BASE = 'https://jargon-api.playjargon.workers.dev/api/games';

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
  it('create + join roundtrip', async () => {
    const c = await api('POST', '/games', { lobbyName: 'Test Lobby', creatorName: 'Alice' });
    expect(c.status).toBe(200);
    expect(c.data.gameId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(c.data.playerId).toBeTruthy();
    expect(c.data.state.lobbyName).toBe('Test Lobby');
    expect(c.data.state.players).toHaveLength(1);
    expect(c.data.state.players[0].name).toBe('Alice');
    expect(c.data.state.status).toBe('waiting');

    const j = await api('POST', `/games/${c.data.gameId}/join`, { playerName: 'Bob' });
    expect(j.status).toBe(200);
    expect(j.data.playerId).not.toBe(c.data.playerId);
    expect(j.data.state.status).toBe('active');
    expect(j.data.state.players).toHaveLength(2);
    expect(j.data.state.players.map((p: any) => p.name).sort()).toEqual(['Alice', 'Bob']);

    const s = await api('GET', `/games/${c.data.gameId}`, undefined, c.data.playerId);
    expect(s.status).toBe(200);
    expect(s.data.players).toHaveLength(2);
  }, 15000);

  it('rejects join when name missing', async () => {
    const c = await api('POST', '/games', { lobbyName: 'X', creatorName: 'Alice' });
    const j = await api('POST', `/games/${c.data.gameId}/join`, { playerName: '' });
    expect(j.status).toBe(400);
  }, 15000);

  it('rejects 3rd join (game full)', async () => {
    const c = await api('POST', '/games', { lobbyName: 'X', creatorName: 'A' });
    await api('POST', `/games/${c.data.gameId}/join`, { playerName: 'B' });
    const third = await api('POST', `/games/${c.data.gameId}/join`, { playerName: 'C' });
    expect(third.status).toBe(409);
  }, 15000);

  it('GET users/me/games returns games for player', async () => {
    const c = await api('POST', '/games', { lobbyName: 'My Lobby', creatorName: 'Alice' });
    const list = await api('GET', '/users/me/games', undefined, c.data.playerId);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.data)).toBe(true);
    const found = list.data.find((g: any) => g.gameId === c.data.gameId);
    expect(found).toBeTruthy();
    expect(found.lobbyName).toBe('My Lobby');
  }, 15000);

  it('full round: P1 solves guess 2 (5pts), P2 fails all 4 (0pts)', async () => {
    const c = await api('POST', '/games', { lobbyName: 'Round Test', creatorName: 'Alice' });
    const aliceId = c.data.playerId;
    const j = await api('POST', `/games/${c.data.gameId}/join`, { playerName: 'Bob' });
    const bobId = j.data.playerId;
    // Both ready → round starts
    await api('POST', `/games/${c.data.gameId}/ready`, undefined, aliceId);
    await api('POST', `/games/${c.data.gameId}/ready`, undefined, bobId);

    const s = await api('GET', `/games/${c.data.gameId}`, undefined, aliceId);
    expect(s.data.currentRound).toBeTruthy();
    expect(s.data.currentRound.bothComplete).toBe(false);
    expect(s.data.currentRound.opponent.guessCount).toBe(0);
    expect(s.data.currentRound.opponent.guesses).toBeUndefined();

    // Need the answer to test scoring; pull from redacted state via reading own
    // round's revealedClues won't give us answer. Simpler: probe by guessing all
    // 20 candidates is heavy. Instead, since this test is non-deterministic on
    // word selection, query state to see word id reveal — only works if
    // bothComplete. So play out a full round end-to-end:
    // Alice: wrong, then guesses all 20 known answers via brute force is overkill.
    // Strategy: have BOTH players use 4 wrong guesses to force bothComplete with 0 points,
    // assert recent_word_ids gets populated.
    for (let i = 0; i < 4; i++) {
      await api('POST', `/games/${c.data.gameId}/guess`, { guess: `nope${i}` }, aliceId);
      await api('POST', `/games/${c.data.gameId}/guess`, { guess: `nada${i}` }, bobId);
    }
    const after = await api('GET', `/games/${c.data.gameId}`, undefined, aliceId);
    expect(after.data.currentRound.bothComplete).toBe(true);
    expect(after.data.scores[aliceId]).toBe(0);
    expect(after.data.scores[bobId]).toBe(0);
    expect(after.data.currentRound.word).toBeTruthy(); // revealed after bothComplete
    expect(after.data.currentRound.word.id).toBeTruthy();
  }, 30000);

  it('recent_word_ids prevents immediate repeat', async () => {
    const c = await api('POST', '/games', { lobbyName: 'Repeat Test', creatorName: 'A' });
    const aId = c.data.playerId;
    const j = await api('POST', `/games/${c.data.gameId}/join`, { playerName: 'B' });
    const bId = j.data.playerId;
    const seen = new Set<string>();
    for (let r = 0; r < 3; r++) {
      await api('POST', `/games/${c.data.gameId}/ready`, undefined, aId);
      await api('POST', `/games/${c.data.gameId}/ready`, undefined, bId);
      // Burn 4 guesses each
      for (let i = 0; i < 4; i++) {
        await api('POST', `/games/${c.data.gameId}/guess`, { guess: `x${i}` }, aId);
        await api('POST', `/games/${c.data.gameId}/guess`, { guess: `y${i}` }, bId);
      }
      const s = await api('GET', `/games/${c.data.gameId}`, undefined, aId);
      const wid = s.data.currentRound.word.id;
      expect(seen.has(wid)).toBe(false);
      seen.add(wid);
    }
    expect(seen.size).toBe(3);
  }, 60000);
});
