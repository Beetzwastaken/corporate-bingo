// Zustand store for the active game in view. Server is source of truth.
// Last state cached for offline read; identity persisted via identity.ts.
import { create } from 'zustand';
import type { GameStateView } from '../lib/api';
import { getGameState } from '../lib/api';

interface GameStore {
  currentGameId: string | null;
  state: GameStateView | null;
  loading: boolean;
  error: string | null;
  setGame: (gameId: string) => void;
  setState: (s: GameStateView) => void;
  refresh: () => Promise<void>;
  clear: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentGameId: null,
  state: null,
  loading: false,
  error: null,
  setGame: (gameId) => set({ currentGameId: gameId, state: null, error: null }),
  setState: (s) => set({ state: s, error: null }),
  refresh: async () => {
    const id = get().currentGameId;
    if (!id) return;
    set({ loading: true, error: null });
    try {
      const s = await getGameState(id);
      set({ state: s, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load', loading: false });
    }
  },
  clear: () => set({ currentGameId: null, state: null, error: null, loading: false })
}));
