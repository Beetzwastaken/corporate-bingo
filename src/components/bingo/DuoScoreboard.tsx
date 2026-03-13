// DuoScoreboard - Shows duo mode scores and game status
import { useDuoStore } from '../../stores/duoStore';

function getLineName(line: { type: 'row' | 'col' | 'diag'; index: number } | null): string {
  if (!line) return 'None';
  switch (line.type) {
    case 'row':
      return `Row ${line.index + 1}`;
    case 'col':
      return `Column ${line.index + 1}`;
    case 'diag':
      return line.index === 0 ? 'Diagonal ↘' : 'Diagonal ↙';
  }
}

export function DuoScoreboard() {
  const {
    phase,
    odName,
    partnerName,
    myLine,
    partnerLine,
    myScore,
    partnerScore,
    myBingo,
    partnerBingo,
    dailySeed
  } = useDuoStore();

  if (phase !== 'playing') {
    return null;
  }

  const leader = myScore > partnerScore ? 'you' : partnerScore > myScore ? 'partner' : 'tie';

  return (
    <div className="apple-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-apple-text">Duo Match</h2>
        <span className="text-xs text-apple-tertiary font-mono">{dailySeed}</span>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Your Score */}
        <div className={`rounded-lg p-3 ${leader === 'you' ? 'bg-cyan-500/20 ring-2 ring-cyan-500' : 'bg-apple-darkest'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-medium text-sm truncate">{odName || 'You'}</span>
            {myBingo && <span className="text-yellow-400 text-xs">BINGO!</span>}
          </div>
          <div className="text-3xl font-bold text-cyan-400">{myScore}</div>
          <div className="text-xs text-apple-tertiary mt-1">
            {getLineName(myLine)}
          </div>
        </div>

        {/* Partner Score */}
        <div className={`rounded-lg p-3 ${leader === 'partner' ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-apple-darkest'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-400 font-medium text-sm truncate">{partnerName || 'Partner'}</span>
            {partnerBingo && <span className="text-yellow-400 text-xs">BINGO!</span>}
          </div>
          <div className="text-3xl font-bold text-orange-400">{partnerScore}</div>
          <div className="text-xs text-apple-tertiary mt-1">
            {getLineName(partnerLine)}
          </div>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="text-xs text-apple-tertiary text-center">
        <span>+1 per square in your line</span>
        <span className="mx-2">|</span>
        <span>+5 BINGO bonus</span>
      </div>

      {/* Status Messages */}
      {(myBingo || partnerBingo) && (
        <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <span className="text-yellow-400 font-medium">
            {myBingo && partnerBingo
              ? 'Both got BINGO!'
              : myBingo
              ? 'You got BINGO! 🎉'
              : 'Partner got BINGO!'}
          </span>
        </div>
      )}
    </div>
  );
}

export default DuoScoreboard;
