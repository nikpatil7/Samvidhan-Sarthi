/**
 * Property-Based Tests: Reading Time Calculation
 * Feature: learning-architecture-restructure, Property 5: Reading Time Calculation
 * Validates: Requirements 2.4
 */

const fc = require('fast-check');
const { countWords, computeEstimatedTime } = require('../../utils/wordCount');

describe('Property 5: Reading Time Calculation', () => {
  /**
   * Main property: for any non-empty string,
   * computeEstimatedTime(s) === Math.ceil(countWords(s) / 200)
   * Validates: Requirements 2.4
   */
  it('estimatedTime equals ceil(wordCount / 200) for any non-empty string', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (s) => {
        const wordCount = countWords(s);
        expect(computeEstimatedTime(s)).toBe(Math.ceil(wordCount / 200));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: empty string returns 0 for both functions
   */
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
    expect(computeEstimatedTime('')).toBe(0);
  });

  /**
   * Edge case: string with only whitespace returns 0
   */
  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
    expect(computeEstimatedTime('   ')).toBe(0);

    expect(countWords('\t\n  \r\n')).toBe(0);
    expect(computeEstimatedTime('\t\n  \r\n')).toBe(0);
  });

  /**
   * Specific: exactly 200 words → 1 minute
   */
  it('returns 1 minute for exactly 200 words', () => {
    const content200 = Array(200).fill('word').join(' ');
    expect(countWords(content200)).toBe(200);
    expect(computeEstimatedTime(content200)).toBe(1);
  });

  /**
   * Specific: 201 words → 2 minutes
   */
  it('returns 2 minutes for 201 words', () => {
    const content201 = Array(201).fill('word').join(' ');
    expect(countWords(content201)).toBe(201);
    expect(computeEstimatedTime(content201)).toBe(2);
  });
});
