// Normalize a Jargon guess for comparison against canonical answers.
// Rules:
//   - lowercase
//   - strip apostrophes, hyphens, commas, periods, exclamation, question marks
//   - collapse internal whitespace, trim
// Exact match (no fuzzy) after this transform.
export function normalizeGuess(input: string): string {
  return input
    .toLowerCase()
    .replace(/['\u2019\u2018\u201C\u201D"!?,.\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
