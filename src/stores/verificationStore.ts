// Verification Store - Manages square claim verification and voting
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Verification request interface
export interface VerificationRequest {
  id: string;
  playerId: string;
  playerName: string;
  squareIndex: number;
  buzzword: string;
  votes: Map<string, boolean>; // playerId -> approved (true/false)
  createdAt: number;
  resolved: boolean;
  expiresAt: number;
}

// Simplified verification for display
export interface ActiveVerification {
  id: string;
  playerName: string;
  buzzword: string;
  squareIndex: number;
  expiresAt: number;
}

interface VerificationStore {
  // State
  pendingVerifications: Map<string, VerificationRequest>;
  activeVerification: ActiveVerification | null;
  hasVoted: Map<string, boolean>; // verificationId -> voted status

  // Actions
  addVerification: (verification: VerificationRequest) => void;
  setActiveVerification: (verification: ActiveVerification | null) => void;
  castVote: (verificationId: string, playerId: string, approved: boolean) => void;
  resolveVerification: (verificationId: string) => void;
  clearVerification: (verificationId: string) => void;
  clearExpiredVerifications: () => void;
  getVerification: (verificationId: string) => VerificationRequest | undefined;
  hasUserVoted: (verificationId: string) => boolean;
}

export const useVerificationStore = create<VerificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      pendingVerifications: new Map(),
      activeVerification: null,
      hasVoted: new Map(),

      // Add a new verification request
      addVerification: (verification: VerificationRequest) => {
        const state = get();
        const newPending = new Map(state.pendingVerifications);
        newPending.set(verification.id, verification);

        set({
          pendingVerifications: newPending
        });

        // Auto-clear after expiration (30 seconds + 5 second buffer)
        setTimeout(() => {
          get().clearVerification(verification.id);
        }, 35000);
      },

      // Set the currently active verification (what user sees in modal)
      setActiveVerification: (verification: ActiveVerification | null) => {
        set({ activeVerification: verification });
      },

      // Record a vote for a verification
      castVote: (verificationId: string, playerId: string, approved: boolean) => {
        const state = get();
        const verification = state.pendingVerifications.get(verificationId);

        if (!verification || verification.resolved) {
          console.warn(`Cannot vote on verification ${verificationId} - not found or resolved`);
          return;
        }

        // Update votes
        const newVotes = new Map(verification.votes);
        newVotes.set(playerId, approved);

        const updatedVerification = {
          ...verification,
          votes: newVotes
        };

        const newPending = new Map(state.pendingVerifications);
        newPending.set(verificationId, updatedVerification);

        const newHasVoted = new Map(state.hasVoted);
        newHasVoted.set(verificationId, true);

        set({
          pendingVerifications: newPending,
          hasVoted: newHasVoted,
          activeVerification: null // Close modal after voting
        });
      },

      // Mark verification as resolved
      resolveVerification: (verificationId: string) => {
        const state = get();
        const verification = state.pendingVerifications.get(verificationId);

        if (!verification) {
          return;
        }

        const updatedVerification = {
          ...verification,
          resolved: true
        };

        const newPending = new Map(state.pendingVerifications);
        newPending.set(verificationId, updatedVerification);

        set({ pendingVerifications: newPending });

        // Clear after 5 seconds
        setTimeout(() => {
          get().clearVerification(verificationId);
        }, 5000);
      },

      // Remove verification from pending list
      clearVerification: (verificationId: string) => {
        const state = get();
        const newPending = new Map(state.pendingVerifications);
        newPending.delete(verificationId);

        const newHasVoted = new Map(state.hasVoted);
        newHasVoted.delete(verificationId);

        set({
          pendingVerifications: newPending,
          hasVoted: newHasVoted
        });

        // If this was the active verification, close the modal
        if (state.activeVerification?.id === verificationId) {
          set({ activeVerification: null });
        }
      },

      // Clean up expired verifications
      clearExpiredVerifications: () => {
        const state = get();
        const now = Date.now();
        const newPending = new Map(state.pendingVerifications);
        let hasChanges = false;

        for (const [id, verification] of newPending.entries()) {
          if (now > verification.expiresAt) {
            newPending.delete(id);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          set({ pendingVerifications: newPending });
        }
      },

      // Get a specific verification
      getVerification: (verificationId: string) => {
        return get().pendingVerifications.get(verificationId);
      },

      // Check if user has voted on a verification
      hasUserVoted: (verificationId: string) => {
        return get().hasVoted.get(verificationId) === true;
      }
    }),
    {
      name: 'bingo-verification-store'
    }
  )
);
