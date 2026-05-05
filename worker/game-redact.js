// Pure redaction. Given a full game state and the requesting playerId,
// strip information the player isn't allowed to see.
//
// During an active round (not bothComplete):
//   - opponent's guesses, currentClueIndex, solvedOnGuess: hidden
//   - opponent visible: name, guessCount, solved (boolean)
//   - the wordId/answer for current round: hidden
//   - the requester's clues: only [0..currentClueIndex] revealed
//
// After bothComplete (or for prior rounds): full reveal.

import { getWord } from './game-pool.js';

export function redactState(state, requesterId) {
  const out = {
    gameId: state.gameId,
    lobbyName: state.lobbyName,
    status: state.status,
    createdAt: state.createdAt,
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
  const opponentEntry = Object.entries(playerStates).find(([pid]) => pid !== requesterId);
  const opponentId = opponentEntry ? opponentEntry[0] : null;
  const opponentState = opponentEntry ? opponentEntry[1] : null;

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
          // Reveal clues only up to current index (or all if round complete)
          revealedClues: word
            ? word.clues.slice(0, fullReveal ? 4 : (myState.currentClueIndex + 1))
            : []
        }
      : null,
    opponent: opponentState
      ? fullReveal
        ? {
            playerId: opponentId,
            guesses: opponentState.guesses,
            solved: opponentState.solved,
            solvedOnGuess: opponentState.solvedOnGuess,
            pointsEarned: opponentState.pointsEarned
          }
        : {
            playerId: opponentId,
            guessCount: (opponentState.guesses || []).length,
            solved: !!opponentState.solved
          }
      : null
  };

  if (fullReveal && word) {
    result.word = { id: word.id, display: word.display, answer: word.answer, clues: word.clues };
  }

  return result;
}
