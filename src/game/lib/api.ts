// Jargon API wrapper. Sends X-Player-Id header for the current user.
import { getApiBaseUrl } from '../../lib/config';
import { getOrCreateUserId } from './identity';

export interface Word {
  id: string;
  display: string;
  answer: string;
  clues: string[];
}

export type OpponentRoundView =
  | { playerId: string; guessCount: number; solved: boolean }
  | { playerId: string; guesses: string[]; solved: boolean; solvedOnGuess: number | null; pointsEarned: number };

export interface RoundView {
  roundNumber: number;
  startedAt: number;
  endedAt: number | null;
  bothComplete: boolean; // semantically "all complete" — kept for compat
  you: {
    guesses: string[];
    solved: boolean;
    solvedOnGuess: number | null;
    pointsEarned: number;
    currentClueIndex: number;
    revealedClues: string[];
  } | null;
  opponents: OpponentRoundView[];
  word?: Word;
  // Letter-mask of word.display for active rounds: letters → '_', separators preserved.
  wordPattern?: string;
}

export interface Player {
  playerId: string;
  name: string;
  slot: number;
  joinedAt: number;
  readyForNextRound: boolean;
}

export interface GameStateView {
  gameId: string;
  lobbyName: string;
  status: 'waiting' | 'active' | 'abandoned';
  createdAt: number;
  maxPlayers: number;
  scores: Record<string, number>;
  players: Player[];
  rounds: RoundView[];
  currentRound: RoundView | null;
  you: string;
}

export interface GameSummary {
  gameId: string;
  lobbyName: string;
  opponentName: string | null; // legacy: first opponent
  opponentNames: string[];
  yourScore: number;
  opponentScore: number; // legacy: first opponent
  opponentScores: number[];
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
  state: GameStateView;
}

export function createGame(lobbyName: string, creatorName: string, maxPlayers: number = 2): Promise<CreateGameResponse> {
  return req('POST', '/api/games', { lobbyName, creatorName, maxPlayers });
}

export function startGame(gameId: string): Promise<{ ok: boolean; state: GameStateView }> {
  return req('POST', `/api/games/${gameId}/start`);
}

export interface JoinGameResponse {
  gameId: string;
  playerId: string;
  state: GameStateView;
}

export function joinGame(gameId: string, playerName: string): Promise<JoinGameResponse> {
  return req('POST', `/api/games/${gameId}/join`, { playerName });
}

export function getGameState(gameId: string): Promise<GameStateView> {
  return req('GET', `/api/games/${gameId}`);
}

export function readyForNextRound(gameId: string): Promise<{ ok: boolean; started: boolean; state: GameStateView }> {
  return req('POST', `/api/games/${gameId}/ready`);
}

export interface GuessResponse {
  correct: boolean;
  pointsEarned: number;
  guessesRemaining: number;
  solved: boolean;
  bothComplete: boolean;
  state: GameStateView;
}

export function submitGuess(gameId: string, guess: string): Promise<GuessResponse> {
  return req('POST', `/api/games/${gameId}/guess`, { guess });
}

export function listMyGames(): Promise<GameSummary[]> {
  return req('GET', '/api/users/me/games');
}

export function deleteGame(gameId: string): Promise<{ ok: boolean }> {
  return req('DELETE', `/api/games/${gameId}`);
}
