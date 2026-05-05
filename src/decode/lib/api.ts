// Decode API wrapper. Sends X-Player-Id header for the current user.
import { getApiBaseUrl } from '../../lib/config';
import { getOrCreateUserId } from './identity';

export interface DecodeWord {
  id: string;
  display: string;
  answer: string;
  clues: string[];
}

export interface DecodeRoundView {
  roundNumber: number;
  startedAt: number;
  endedAt: number | null;
  bothComplete: boolean;
  you: {
    guesses: string[];
    solved: boolean;
    solvedOnGuess: number | null;
    pointsEarned: number;
    currentClueIndex: number;
    revealedClues: string[];
  } | null;
  opponent:
    | { playerId: string; guessCount: number; solved: boolean }
    | { playerId: string; guesses: string[]; solved: boolean; solvedOnGuess: number | null; pointsEarned: number }
    | null;
  word?: DecodeWord;
}

export interface DecodePlayer {
  playerId: string;
  name: string;
  slot: number;
  joinedAt: number;
  readyForNextRound: boolean;
}

export interface DecodeStateView {
  gameId: string;
  lobbyName: string;
  status: 'waiting' | 'active' | 'abandoned';
  createdAt: number;
  scores: Record<string, number>;
  players: DecodePlayer[];
  rounds: DecodeRoundView[];
  currentRound: DecodeRoundView | null;
  you: string;
}

export interface DecodeGameSummary {
  gameId: string;
  lobbyName: string;
  opponentName: string | null;
  yourScore: number;
  opponentScore: number;
  status: string;
  lastActivity: number;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const playerId = getOrCreateUserId();
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Player-Id': playerId
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export interface CreateGameResponse {
  gameId: string;
  playerId: string;
  inviteUrl: string;
  state: DecodeStateView;
}

export function createGame(lobbyName: string, creatorName: string): Promise<CreateGameResponse> {
  return req('POST', '/api/decode/games', { lobbyName, creatorName });
}

export interface JoinGameResponse {
  gameId: string;
  playerId: string;
  state: DecodeStateView;
}

export function joinGame(gameId: string, playerName: string): Promise<JoinGameResponse> {
  return req('POST', `/api/decode/games/${gameId}/join`, { playerName });
}

export function getGameState(gameId: string): Promise<DecodeStateView> {
  return req('GET', `/api/decode/games/${gameId}`);
}

export function readyForNextRound(gameId: string): Promise<{ ok: boolean; started: boolean; state: DecodeStateView }> {
  return req('POST', `/api/decode/games/${gameId}/ready`);
}

export interface GuessResponse {
  correct: boolean;
  pointsEarned: number;
  guessesRemaining: number;
  solved: boolean;
  bothComplete: boolean;
  state: DecodeStateView;
}

export function submitGuess(gameId: string, guess: string): Promise<GuessResponse> {
  return req('POST', `/api/decode/games/${gameId}/guess`, { guess });
}

export function listMyGames(): Promise<DecodeGameSummary[]> {
  return req('GET', '/api/decode/users/me/games');
}
