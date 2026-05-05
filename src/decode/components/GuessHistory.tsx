// Renders the requesting player's guess history for the active round.
export function GuessHistory({ guesses, solvedOnGuess }: { guesses: string[]; solvedOnGuess: number | null }) {
  if (guesses.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 w-full">
      {guesses.map((g, i) => {
        const isWinner = solvedOnGuess === i + 1;
        return (
          <li key={i} className="flex items-center justify-between text-sm font-mono">
            <span className="text-j-tertiary">Guess {i + 1}</span>
            <span className={isWinner ? 'text-j-success' : 'text-j-text'}>{g}</span>
            <span>{isWinner ? '\u2713' : '\u2717'}</span>
          </li>
        );
      })}
    </ul>
  );
}
