import { useState } from 'react';

interface WelcomeTutorialProps {
  show: boolean;
  onComplete: () => void;
}

export function WelcomeTutorial({ show, onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Corporate Bingo! 🎯",
      content: (
        <div className="space-y-4">
          <p className="text-apple-text text-lg">
            Turn boring meetings into interactive entertainment!
          </p>
          <p className="text-apple-secondary">
            Listen for buzzwords like "synergy", "circle back", and "let's take this offline"
            during your meetings and mark them on your bingo board.
          </p>
          <div className="bg-apple-darkest rounded-lg p-4 mt-4">
            <p className="text-apple-accent font-medium mb-2">Quick Stats:</p>
            <ul className="text-apple-secondary text-sm space-y-1">
              <li>• 171 professionally curated corporate buzzwords</li>
              <li>• Real-time multiplayer support</li>
              <li>• Advanced scoring with bonuses</li>
              <li>• Share your wins like Wordle!</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "How to Play 🎮",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-apple-text font-medium">Listen for buzzwords</p>
                <p className="text-apple-secondary text-sm">During your meeting, listen for corporate speak on your board</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-apple-text font-medium">Click to claim squares</p>
                <p className="text-apple-secondary text-sm">Tap a square when you hear that buzzword</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-apple-text font-medium">Get BINGO!</p>
                <p className="text-apple-secondary text-sm">Complete 5 in a row (horizontal, vertical, or diagonal)</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-yellow-400 text-sm font-medium">💡 Pro Tip</p>
            <p className="text-apple-secondary text-sm mt-1">
              The center square is always FREE - it's already marked for you!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Solo or Multiplayer? 🎲",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="text-apple-text font-bold">Solo Play</h3>
              </div>
              <p className="text-apple-secondary text-sm mb-3">
                Start playing immediately! No setup needed.
              </p>
              <ul className="text-apple-secondary text-sm space-y-1">
                <li>• Instant play - no room required</li>
                <li>• Track your own score</li>
                <li>• Practice and have fun!</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👥</span>
                <h3 className="text-apple-text font-bold">Multiplayer Rooms</h3>
              </div>
              <p className="text-apple-secondary text-sm mb-3">
                Play with your team during meetings!
              </p>
              <ul className="text-apple-secondary text-sm space-y-1">
                <li>• Create or join rooms with 4-char codes</li>
                <li>• Everyone gets unique boards</li>
                <li>• Vote to verify claims</li>
                <li>• Real-time leaderboards</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Scoring System 📊",
      content: (
        <div className="space-y-4">
          <p className="text-apple-secondary">
            Earn points for every square you claim, with bonus points for completing lines!
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-apple-darkest rounded-lg p-3">
              <span className="text-apple-text">Each verified square</span>
              <span className="text-cyan-400 font-bold">+1 point</span>
            </div>

            <div className="flex items-center justify-between bg-apple-darkest rounded-lg p-3">
              <span className="text-apple-text">3-in-a-row bonus</span>
              <span className="text-green-400 font-bold">+1 point</span>
            </div>

            <div className="flex items-center justify-between bg-apple-darkest rounded-lg p-3">
              <span className="text-apple-text">4-in-a-row bonus</span>
              <span className="text-yellow-400 font-bold">+3 points</span>
            </div>

            <div className="flex items-center justify-between bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-500/30 rounded-lg p-3">
              <span className="text-apple-text font-bold">BINGO! (5-in-a-row)</span>
              <span className="text-yellow-400 font-bold text-lg">+5 points</span>
            </div>
          </div>

          <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium">⚠️ Anti-Cheat</p>
            <p className="text-apple-secondary text-sm mt-1">
              You can't claim words you said yourself! Penalty: -50 points
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Share Your Wins! 🎉",
      content: (
        <div className="space-y-4">
          <p className="text-apple-secondary">
            Got BINGO? Share your results with friends and coworkers!
          </p>

          <div className="bg-apple-darkest rounded-lg p-4">
            <p className="text-apple-accent font-medium mb-2">After each BINGO:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">📋</span>
                <p className="text-apple-secondary">
                  Click "Share Result" to copy your emoji grid
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">🔗</span>
                <p className="text-apple-secondary">
                  Copy invite links to bring friends to your room
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">💬</span>
                <p className="text-apple-secondary">
                  Paste in Slack, Teams, or social media!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
            <p className="text-sm text-apple-secondary mb-2">Example share:</p>
            <div className="font-mono text-xs text-apple-text bg-black/30 rounded p-2">
              🎯 Corporate Bingo #5<br />
              BINGO! 12/25 squares<br />
              Score: 18 points<br />
              <br />
              🟩🟩🟨⬜⬜<br />
              ⬜🟩🟨⬜🟩<br />
              🟩⬜🟨🟩⬜<br />
              ⬜⬜🟨⬜⬜<br />
              🟩⬜🟨⬜🟩
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play! 🚀",
      content: (
        <div className="space-y-4">
          <p className="text-apple-text text-lg text-center">
            You're all set to survive your next corporate meeting!
          </p>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-6 text-center">
            <p className="text-cyan-400 font-bold text-xl mb-2">
              🎯 Choose Your Mode
            </p>
            <p className="text-apple-secondary mb-4">
              Start with solo play to get comfortable, then create or join a room to compete with your team!
            </p>
          </div>

          <div className="space-y-2 text-sm text-apple-secondary">
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Click the board to start solo play
            </p>
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Click "Rooms" to create/join multiplayer
            </p>
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Have fun and may the best buzzword hunter win!
            </p>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm font-medium text-center">
              💡 You can replay this tutorial anytime from the app menu
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!show) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[1100] animate-fadeIn" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1101] p-4">
        <div className="bg-apple-dark border-2 border-cyan-500/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="border-b border-apple-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-apple-text">
                {currentStepData.title}
              </h2>
              <button
                onClick={handleSkip}
                className="text-apple-secondary hover:text-apple-text transition-colors text-sm"
              >
                Skip Tutorial
              </button>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-1.5 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-cyan-400'
                      : index < currentStep
                      ? 'bg-cyan-600'
                      : 'bg-apple-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentStepData.content}
          </div>

          {/* Footer */}
          <div className="border-t border-apple-border p-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  isFirstStep
                    ? 'bg-apple-darkest text-apple-tertiary cursor-not-allowed'
                    : 'bg-apple-darkest text-apple-text hover:bg-apple-darker'
                }`}
              >
                Previous
              </button>

              <div className="text-apple-secondary text-sm">
                {currentStep + 1} of {steps.length}
              </div>

              <button
                onClick={handleNext}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  isLastStep
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                {isLastStep ? "Let's Play! 🎯" : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
