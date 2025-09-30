interface BingoModalProps {
  show: boolean;
  onBingo: () => void;
  onCancel: () => void;
}

export function BingoModal({ show, onBingo, onCancel }: BingoModalProps) {
  if (!show) {
    return null;
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[1000] animate-fadeIn"
        onClick={onCancel}
      />

      {/* Centered Modal */}
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-[1001] animate-scaleIn">
        <div className="bg-apple-dark border-2 border-yellow-400 rounded-2xl shadow-2xl p-8 max-w-md">
          {/* BINGO Title */}
          <div className="text-center mb-6">
            <h2 className="text-6xl font-bold text-yellow-400 animate-pulse tracking-wider">
              🎉 BINGO! 🎉
            </h2>
            <p className="text-apple-secondary mt-4 text-lg">
              Congratulations! You got a BINGO!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={onBingo}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Confirm BINGO
            </button>
          </div>

          {/* Hint Text */}
          <p className="text-center text-apple-tertiary text-sm mt-4">
            Click backdrop or Cancel if this was a mistake
          </p>
        </div>
      </div>
    </>
  );
}