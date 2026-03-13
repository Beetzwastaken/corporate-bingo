import jargonLogo from '../assets/jargon-logo.svg';

interface ModeSelectorProps {
  onSelectMode: (mode: 'solo' | 'duo') => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <div className="h-screen bg-black text-white font-system flex flex-col items-center justify-center overflow-hidden">
      {/* Header section */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg border border-purple-400/30 relative overflow-hidden">
          <img
            src={jargonLogo}
            alt="Jargon"
            className="w-8 h-8 relative z-10"
          />
        </div>
        <h1 className="text-5xl font-bold text-white mb-2">Jargon</h1>
        <p className="text-lg text-apple-secondary">Buzzword bingo for meetings</p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col md:flex-row gap-6 max-w-3xl px-4">
        {/* Solo card */}
        <button
          onClick={() => onSelectMode('solo')}
          className="flex-1 p-8 bg-apple-darkest hover:bg-apple-hover border border-apple-border rounded-2xl transition-all duration-200 transform hover:scale-105 text-left group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2M10 10h-2m8 0h-2M6 10h-2m6-6v2m6 0v2m-6 12v2m6 0v2M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">Solo</h2>
          </div>
          <p className="text-apple-tertiary text-sm leading-relaxed">
            Play during any meeting. Tap buzzwords as you hear them.
          </p>
        </button>

        {/* Duo card */}
        <button
          onClick={() => onSelectMode('duo')}
          className="flex-1 p-8 bg-apple-darkest hover:bg-apple-hover border border-apple-border rounded-2xl transition-all duration-200 transform hover:scale-105 text-left group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0H9m6 12a4 4 0 110-5.292M15 18H9m6 0H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">Duo</h2>
          </div>
          <p className="text-apple-tertiary text-sm leading-relaxed">
            Pair with a colleague. Race to complete your line first.
          </p>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-apple-tertiary text-sm">
        <p>Today's card • <span className="text-apple-text">{dateStr}</span></p>
      </div>
    </div>
  );
}
