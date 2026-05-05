// Mirror of src/decode/lib/normalize.ts. Keep logic identical.
export function normalizeGuess(input) {
  return input
    .toLowerCase()
    .replace(/['\u2019\u2018\u201C\u201D"!?,.\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
