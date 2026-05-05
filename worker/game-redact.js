// Pure redaction. Given a full game state and the requesting playerId,
// strip information the player isn't allowed to see.
//
// During an active round (not allComplete):
//   - other players' guesses, currentClueIndex, solvedOnGuess: hidden
//   - opponents visible: name, guessCount, solved (boolean)
//   - the wordId/answer for current round: hidden
//   - the requester's clues: only [0..currentClueIndex] revealed
//
// After allComplete (or for prior rounds): full reveal.
// API field name `bothComplete` is preserved for backward compat — semantically "all complete".

import { getWord } from './game-pool.js';

export function redactState(state, requesterId) {
  const out = {
    gameId: state.gameId,
    lobbyName: state.lobbyName,
    status: state.status,
    createdAt: state.createdAt,
    maxPlayers: state.maxPlayers,
    scores: state.scores,
    players: state.players.map(p => ({
      playerId: p.playerId,
      name: p.name,
      slot: p.slot,
      joinedAt: p.joinedAt,
      readyForNextRound: p.readyForNextRound
    })),
    rounds: state.rounds.map(r => redactRound(r, requesterId)),
    currentRound: state.currentRound ? redactRound(state.currentRound, requesterId) : null,
    you: requesterId
  };
  return out;
}

function redactRound(round, requesterId) {
  const playerStates = round.playerStates || {};
  const myState = playerStates[requesterId] || null;
  const opponentEntries = Object.entries(playerStates).filter(([pid]) => pid !== requesterId);

  const fullReveal = !!round.bothComplete;
  const word = round.wordId ? getWord(round.wordId) : null;

  const result = {
    roundNumber: round.roundNumber,
    startedAt: round.startedAt,
    endedAt: round.endedAt,
    bothComplete: !!round.bothComplete,
    you: myState
      ? {
          guesses: myState.guesses,
          solved: myState.solved,
          solvedOnGuess: myState.solvedOnGuess,
          pointsEarned: myState.pointsEarned,
          currentClueIndex: myState.currentClueIndex,
          revealedClues: word
            ? word.clues.slice(0, fullReveal ? 4 : (myState.currentClueIndex + 1))
            : []
        }
      : null,
    opponents: opponentEntries.map(([pid, st]) =>
      fullReveal
        ? {
            playerId: pid,
            guesses: st.guesses,
            solved: !!st.solved,
            solvedOnGuess: st.solvedOnGuess,
            pointsEarned: st.pointsEarned
          }
        : {
            playerId: pid,
            guessCount: (st.guesses || []).length,
            solved: !!st.solved
          }
    )
  };

  if (fullReveal && word) {
    result.word = { id: word.id, display: word.display, answer: word.answer, clues: word.clues };
  }

  return result;
}
