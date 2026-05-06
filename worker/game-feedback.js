// Wordle-style per-letter feedback.
// Inputs may include spaces/punctuation; only [A-Za-z] are scored.
// Returns array of 'correct' | 'present' | 'absent' aligned to the answer's letters.
// Standard 2-pass algo for repeated letters: greens first, then yellows from
// remaining pool.
export function computeFeedback(guess, answer) {
  const g = (guess || '').toString().replace(/[^A-Za-z]/g, '').toLowerCase();
  const a = (answer || '').toString().replace(/[^A-Za-z]/g, '').toLowerCase();
  const len = a.length;
  const result = new Array(len).fill('absent');
  const remaining = {};

  // Pass 1: greens
  for (let i = 0; i < len; i++) {
    const ag = g[i];
    const aa = a[i];
    if (ag !== undefined && ag === aa) {
      result[i] = 'correct';
    } else if (aa) {
      remaining[aa] = (remaining[aa] || 0) + 1;
    }
  }
  // Pass 2: yellows
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'absent') continue;
    const ag = g[i];
    if (ag && remaining[ag] > 0) {
      result[i] = 'present';
      remaining[ag] -= 1;
    }
  }
  return result;
}
