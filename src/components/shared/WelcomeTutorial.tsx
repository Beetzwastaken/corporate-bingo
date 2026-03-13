import { useState } from 'react';

interface WelcomeTutorialProps {
  show: boolean;
  onComplete: () => void;
}

export function WelcomeTutorial({ show, onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Jargon! 🎯",
      content: (
        <div className="space-y-4">
          <p className="text-apple-text text-lg">
            Duo Mode - Team up and compete!
          </p>
          <p className="text-apple-secondary">
            Pair up with a coworker and see who can spot corporate buzzwords faster.
            Same bingo card, different lines, one winner!
          </p>
          <div className="bg-apple-darkest rounded-lg p-4 mt-4">
            <p className="text-apple-accent font-medium mb-2">What's New:</p>
            <ul className="text-apple-secondary text-sm space-y-1">
              <li>• Pair with a partner using a 4-character code</li>
              <li>• Each player picks their own secret line</li>
              <li>• Same 25 buzzwords globally per day</li>
              <li>• Compete for the highest score!</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "How It Works 🎮",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-apple-text font-medium">Create or Join</p>
                <p className="text-apple-secondary text-sm">Enter your name and create a room, or join with a friend's code</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-apple-text font-medium">Pick Your Line</p>
                <p className="text-apple-secondary text-sm">Choose a row, column, or diagonal - kept secret until both pick!</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-apple-text font-medium">Mark Buzzwords</p>
                <p className="text-apple-secondary text-sm">Tap squares when you hear those phrases in your meeting</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="text-apple-text font-medium">Race to BINGO!</p>
                <p className="text-apple-secondary text-sm">Complete your line first to score the bonus points</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
            <p className="text-yellow-400 text-sm font-medium">💡 Pro Tip</p>
            <p className="text-apple-secondary text-sm mt-1">
              Lines can overlap! You and your partner might share some squares.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Scoring 📊",
      content: (
        <div className="space-y-4">
          <p className="text-apple-secondary">
            Score points by marking squares in YOUR line:
          </p>

          <div className="grid gap-3">
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-apple-text font-medium">Square in your line marked</span>
                </div>
                <span className="text-cyan-400 font-bold text-xl">+1</span>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <span className="text-apple-text font-medium">Complete your line (BINGO!)</span>
                </div>
                <span className="text-yellow-400 font-bold text-xl">+5</span>
              </div>
            </div>
          </div>

          <div className="bg-apple-darkest rounded-lg p-4 mt-4">
            <p className="text-apple-secondary text-sm">
              <span className="text-cyan-400 font-medium">Your line</span> is highlighted in cyan,{' '}
              <span className="text-orange-400 font-medium">partner's line</span> in orange.
              Purple means overlap!
            </p>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-3">
            <p className="text-purple-400 text-sm font-medium">Overlap Strategy</p>
            <p className="text-apple-secondary text-sm mt-1">
              If you share squares with your partner, you both score when those are marked!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Daily Card 🌅",
      content: (
        <div className="space-y-4">
          <p className="text-apple-secondary">
            Everyone plays the same 25 buzzwords each day!
          </p>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔄</span>
              <div>
                <p className="text-apple-text font-medium">Daily Reset</p>
                <p className="text-apple-secondary text-sm">New card at midnight in your timezone</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="bg-apple-darkest rounded-lg p-4">
              <p className="text-apple-accent font-medium mb-2">Same card means:</p>
              <ul className="text-apple-secondary text-sm space-y-1">
                <li>• Compare scores fairly with your partner</li>
                <li>• Play throughout the day across meetings</li>
                <li>• Your duo persists across days</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm font-medium">💡 Pro Tip</p>
            <p className="text-apple-secondary text-sm mt-1">
              Stay paired with your partner - you'll get a fresh card together each day!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play! 🚀",
      content: (
        <div className="space-y-4">
          <p className="text-apple-text text-lg text-center">
            You're all set to compete in Duo Mode!
          </p>

          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-6 text-center">
            <p className="text-cyan-400 font-bold text-xl mb-2">
              🤝 Get Started
            </p>
            <p className="text-apple-secondary mb-4">
              Enter your name, then create a room or join your partner's!
            </p>
          </div>

          <div className="space-y-2 text-sm text-apple-secondary">
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Create a room and share the 4-character code
            </p>
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Or join with a code from your partner
            </p>
            <p className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              Pick your line and start marking buzzwords!
            </p>
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm font-medium text-center">
              💡 Click the ? button anytime to see this tutorial again
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
