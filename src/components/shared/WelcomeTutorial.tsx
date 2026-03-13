import { useState } from 'react';

interface WelcomeTutorialProps {
  show: boolean;
  onComplete: () => void;
}

export function WelcomeTutorial({ show, onComplete }: WelcomeTutorialProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Jargon",
      content: (
        <div className="space-y-4">
          <p className="text-apple-text text-lg">
            Buzzword bingo you play during real meetings.
          </p>
          <p className="text-apple-secondary">
            Open the app before your next meeting. You'll get a card of corporate buzzwords.
            When someone in the meeting says one — tap it. Complete a line and you win.
          </p>
          <div className="bg-apple-darkest rounded-lg p-4 text-sm text-apple-secondary space-y-2">
            <p><span className="text-purple-400 font-medium">Solo</span> — Play on your own during any meeting</p>
            <p><span className="text-cyan-400 font-medium">Duo</span> — Pair with a colleague, race to complete your line first</p>
          </div>
        </div>
      )
    },
    {
      title: "How to Play",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { num: '1', text: 'Pick Solo or Duo on the home screen' },
              { num: '2', text: 'Open the app when your meeting starts' },
              { num: '3', text: 'Tap buzzwords as you hear them in the meeting' },
              { num: '4', text: 'Complete a full line (row, column, or diagonal) to win' }
            ].map(({ num, text }) => (
              <div key={num} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  {num}
                </div>
                <p className="text-apple-secondary text-sm pt-1">{text}</p>
              </div>
            ))}
          </div>
          <div className="bg-apple-darkest rounded-lg p-4 text-sm">
            <p className="text-apple-tertiary">
              Everyone gets the same card each day (like Wordle). New card at midnight.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Duo Mode",
      content: (
        <div className="space-y-4">
          <p className="text-apple-secondary">
            In Duo, you and a partner get the same card. Each of you secretly picks a line
            to complete. First to finish their line wins.
          </p>
          <div className="bg-apple-darkest rounded-lg p-4 text-sm text-apple-secondary space-y-2">
            <p>Create a room and share the 4-character code</p>
            <p>Or join with a code from your partner</p>
            <p>Both pick your lines, then start tapping</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded ring-2 ring-cyan-500 bg-cyan-900/40"></div>
              <span className="text-cyan-400">Your line</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded ring-2 ring-orange-500 bg-orange-900/40"></div>
              <span className="text-orange-400">Partner's</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!show) return null;

  const isLast = step === steps.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[1100]" />
      <div className="fixed inset-0 flex items-center justify-center z-[1101] p-4">
        <div className="bg-apple-dark border border-apple-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col">
          <div className="border-b border-apple-border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-apple-text">{steps[step].title}</h2>
              <button onClick={onComplete} className="text-apple-secondary hover:text-apple-text text-sm">
                Skip
              </button>
            </div>
            <div className="flex gap-1.5 mt-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i === step ? 'bg-purple-400' : i < step ? 'bg-purple-600' : 'bg-apple-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {steps[step].content}
          </div>

          <div className="border-t border-apple-border p-5 flex items-center justify-between">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className={`px-4 py-2 rounded-lg text-sm ${
                step === 0 ? 'text-apple-tertiary cursor-not-allowed' : 'text-apple-text hover:bg-apple-hover'
              }`}
            >
              Back
            </button>
            <button
              onClick={isLast ? onComplete : () => setStep(s => s + 1)}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
