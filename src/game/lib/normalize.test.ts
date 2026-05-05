import { describe, it, expect } from 'vitest';
import { normalizeGuess } from './normalize';

describe('normalizeGuess', () => {
  it('lowercases', () => {
    expect(normalizeGuess('Synergy')).toBe('synergy');
    expect(normalizeGuess('SYNERGY')).toBe('synergy');
  });

  it('trims and collapses whitespace', () => {
    expect(normalizeGuess('  synergy  ')).toBe('synergy');
    expect(normalizeGuess('boil  the   ocean')).toBe('boil the ocean');
    expect(normalizeGuess('\tsynergy\n')).toBe('synergy');
  });

  it('strips apostrophes (straight + curly)', () => {
    expect(normalizeGuess("you're muted")).toBe('youre muted');
    expect(normalizeGuess('you\u2019re muted')).toBe('youre muted');
  });

  it('strips hyphens', () => {
    expect(normalizeGuess('low-hanging fruit')).toBe('lowhanging fruit');
    expect(normalizeGuess('back-to-back meetings')).toBe('backtoback meetings');
  });

  it('strips punctuation (commas, periods, !, ?)', () => {
    expect(normalizeGuess('Synergy!')).toBe('synergy');
    expect(normalizeGuess('synergy.')).toBe('synergy');
    expect(normalizeGuess('synergy, please?')).toBe('synergy please');
  });

  it("matches spec example: You're MUTED! === youre muted", () => {
    expect(normalizeGuess("You're MUTED!")).toBe(normalizeGuess('youre muted'));
  });

  it('does NOT fuzzy match (synergys != synergy)', () => {
    expect(normalizeGuess('synergys')).not.toBe(normalizeGuess('synergy'));
  });

  it('handles empty / pure-whitespace input', () => {
    expect(normalizeGuess('')).toBe('');
    expect(normalizeGuess('   ')).toBe('');
  });

  it('handles mixed case + punctuation + hyphens together', () => {
    expect(normalizeGuess("Run It Up The Flag-pole!")).toBe('run it up the flagpole');
  });
});
