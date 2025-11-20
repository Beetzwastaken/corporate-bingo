import { useState, useEffect, useCallback } from 'react';
import { useVerificationStore } from '../../stores/verificationStore';
import { useRoomStore } from '../../stores/roomStore';
import { useConnectionStore } from '../../stores/connectionStore';

export function VerificationModal() {
  const activeVerification = useVerificationStore(state => state.activeVerification);
  const castVote = useVerificationStore(state => state.castVote);
  const setActiveVerification = useVerificationStore(state => state.setActiveVerification);
  const currentPlayer = useRoomStore(state => state.currentPlayer);
  const sendMessage = useConnectionStore(state => state.sendMessage);

  const [timeRemaining, setTimeRemaining] = useState(30);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = useCallback(async (approved: boolean) => {
    if (!activeVerification || !currentPlayer || hasVoted) return;

    setHasVoted(true);

    // Send vote to backend
    try {
      await sendMessage('cast_vote', {
        verificationId: activeVerification.id,
        approved
      });

      // Update local store
      castVote(activeVerification.id, currentPlayer.id, approved);

      // Close modal
      setActiveVerification(null);
    } catch (error) {
      console.error('Failed to cast vote:', error);
      setHasVoted(false);
    }
  }, [activeVerification, currentPlayer, hasVoted, sendMessage, castVote, setActiveVerification]);

  // Countdown timer
  useEffect(() => {
    if (!activeVerification) {
      setTimeRemaining(30);
      setHasVoted(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((activeVerification.expiresAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Auto-approve on timeout
        handleVote(true);
      }
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [activeVerification, handleVote]);

  if (!activeVerification) {
    return null;
  }

  const progressPercentage = (timeRemaining / 30) * 100;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[1100] animate-fadeIn"
        onClick={() => !hasVoted && handleVote(true)} // Click backdrop = approve
      />

      {/* Centered Modal */}
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-[1101] animate-scaleIn w-full max-w-md px-4">
        <div className="bg-apple-dark border-2 border-cyan-400 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-cyan-400 mb-1">
              Verification Request
            </h3>
            <p className="text-apple-secondary text-sm">
              <span className="text-apple-text font-medium">{activeVerification.playerName}</span> claims they heard:
            </p>
          </div>

          {/* Buzzword Display */}
          <div className="bg-apple-darkest rounded-xl p-6 mb-4 border border-apple-border">
            <p className="text-3xl font-bold text-center text-white break-words">
              "{activeVerification.buzzword}"
            </p>
          </div>

          {/* Timer Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-apple-secondary">Time remaining:</span>
              <span className={`text-sm font-bold ${timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                {timeRemaining}s
              </span>
            </div>
            <div className="w-full bg-apple-darkest rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${timeRemaining <= 5 ? 'bg-red-500' : 'bg-cyan-400'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote(false)}
              disabled={hasVoted}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              ✗ Reject
            </button>

            <button
              onClick={() => handleVote(true)}
              disabled={hasVoted}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              ✓ Approve
            </button>
          </div>

          {/* Hint Text */}
          <p className="text-center text-apple-tertiary text-xs mt-4">
            {hasVoted
              ? 'Vote submitted. Waiting for others...'
              : 'Click anywhere outside or wait for timeout to approve'
            }
          </p>
        </div>
      </div>
    </>
  );
}
