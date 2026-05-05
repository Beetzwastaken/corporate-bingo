// Unit tests for decode redact. Imports the JS module directly.
// @ts-expect-error — JS module without types
import { redactState } from '../../worker/decode-redact.js';
import { describe, it, expect } from 'vitest';

const ME = 'p-me';
const OPP = 'p-opp';

const baseState = {
  gameId: 'g1',
  lobbyName: 'Lobby',
  status: 'active',
  createdAt: 1,
  scores: { [ME]: 0, [OPP]: 0 },
  players: [
    { playerId: ME, name: 'Me', slot: 0, joinedAt: 1, readyForNextRound: false },
    { playerId: OPP, name: 'Opp', slot: 1, joinedAt: 2, readyForNextRound: false }
  ],
  rounds: [],
  currentRound: null
};

function makeRound(opts: any = {}) {
  return {
    roundNumber: 1,
    wordId: 'synergy',
    startedAt: 10,
    endedAt: opts.bothComplete ? 100 : null,
    bothComplete: !!opts.bothComplete,
    playerStates: {
      [ME]: { guesses: ['wrong1'], solved: false, solvedOnGuess: null, pointsEarned: 0, currentClueIndex: 1, ...opts.me },
      [OPP]: { guesses: ['secret1', 'secret2'], solved: false, solvedOnGuess: null, pointsEarned: 0, currentClueIndex: 2, ...opts.opp }
    }
  };
}

describe('redactState', () => {
  it('hides opponent guesses during active round', () => {
    const state = { ...baseState, currentRound: makeRound(), rounds: [makeRound()] };
    const r = redactState(state, ME);
    expect(r.currentRound.opponent.guesses).toBeUndefined();
    expect(r.currentRound.opponent.guessCount).toBe(2);
    expect(JSON.stringify(r)).not.toContain('secret1');
    expect(JSON.stringify(r)).not.toContain('secret2');
  });

  it('hides opponent currentClueIndex and solvedOnGuess during active round', () => {
    const state = { ...baseState, currentRound: makeRound(), rounds: [makeRound()] };
    const r = redactState(state, ME);
    expect(r.currentRound.opponent.currentClueIndex).toBeUndefined();
    expect(r.currentRound.opponent.solvedOnGuess).toBeUndefined();
  });

  it('hides word answer during active round', () => {
    const state = { ...baseState, currentRound: makeRound(), rounds: [makeRound()] };
    const r = redactState(state, ME);
    expect(r.currentRound.word).toBeUndefined();
    // Should not include the canonical answer "synergy" anywhere in opponent block
    expect(JSON.stringify(r.currentRound.opponent)).not.toContain('synergy');
  });

  it('reveals only requester clues 0..currentClueIndex during active round', () => {
    const state = { ...baseState, currentRound: makeRound(), rounds: [makeRound()] };
    const r = redactState(state, ME);
    // me.currentClueIndex = 1 → 2 clues revealed
    expect(r.currentRound.you.revealedClues).toHaveLength(2);
  });

  it('full reveal after bothComplete (opponent guesses, word, all clues)', () => {
    const state = { ...baseState, currentRound: makeRound({ bothComplete: true }), rounds: [makeRound({ bothComplete: true })] };
    const r = redactState(state, ME);
    expect(r.currentRound.opponent.guesses).toEqual(['secret1', 'secret2']);
    expect(r.currentRound.word.id).toBe('synergy');
    expect(r.currentRound.word.answer).toBe('synergy');
    expect(r.currentRound.you.revealedClues).toHaveLength(4);
  });

  it('exposes scores and player names always', () => {
    const state = { ...baseState, currentRound: makeRound(), rounds: [] };
    const r = redactState(state, ME);
    expect(r.scores[ME]).toBe(0);
    expect(r.players.find((p: any) => p.playerId === OPP).name).toBe('Opp');
  });
});
