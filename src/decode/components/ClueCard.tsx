// The currently-revealed clue for the round. Largest UI element.
export function ClueCard({ clue, clueNumber, totalClues }: { clue: string; clueNumber: number; totalClues: number }) {
  return (
    <div className="bg-j-raised border border-j-accent/20 rounded-2xl p-6 w-full">
      <div className="text-j-tertiary text-xs font-mono uppercase tracking-wider mb-3">
        Clue {clueNumber} of {totalClues}
      </div>
      <p className="text-j-text text-lg leading-relaxed">{clue}</p>
    </div>
  );
}
