/**
 * Feature: learning-architecture-restructure
 * Property 21: Topic Mastery Formula
 * Validates: Requirements 8.1
 *
 * computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore }) must equal
 * Math.round(quizScore * 0.5 + scenarioPerformanceScore * 0.3 + gameScore * 0.2)
 * with missing components defaulting to 0.
 */

const fc = require('fast-check');
const { computeTopicMastery } = require('../../utils/topicMastery');

describe('Property 21 — Topic Mastery Formula', () => {
  // -------------------------------------------------------------------------
  // 1. Main property: all three scores provided
  // -------------------------------------------------------------------------
  it('computes weighted formula correctly for any triple of 0–100 integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (quizScore, scenarioPerformanceScore, gameScore) => {
          const expected = Math.round(
            quizScore * 0.5 +
            scenarioPerformanceScore * 0.3 +
            gameScore * 0.2
          );
          expect(computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore }))
            .toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 2. Missing quizScore defaults to 0
  // -------------------------------------------------------------------------
  it('defaults missing quizScore to 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (scenarioPerformanceScore, gameScore) => {
          const expected = Math.round(scenarioPerformanceScore * 0.3 + gameScore * 0.2);
          expect(computeTopicMastery({ scenarioPerformanceScore, gameScore })).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 3. Missing scenarioPerformanceScore defaults to 0
  // -------------------------------------------------------------------------
  it('defaults missing scenarioPerformanceScore to 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (quizScore, gameScore) => {
          const expected = Math.round(quizScore * 0.5 + gameScore * 0.2);
          expect(computeTopicMastery({ quizScore, gameScore })).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 4. Missing gameScore defaults to 0
  // -------------------------------------------------------------------------
  it('defaults missing gameScore to 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (quizScore, scenarioPerformanceScore) => {
          const expected = Math.round(quizScore * 0.5 + scenarioPerformanceScore * 0.3);
          expect(computeTopicMastery({ quizScore, scenarioPerformanceScore })).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 5. All components missing → returns 0
  // -------------------------------------------------------------------------
  it('returns 0 when no scores are provided (empty object)', () => {
    expect(computeTopicMastery({})).toBe(0);
    expect(computeTopicMastery()).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 6. Result is always an integer in [0, 100]
  // -------------------------------------------------------------------------
  it('result is always an integer in the range [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (quizScore, scenarioPerformanceScore, gameScore) => {
          const result = computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore });
          expect(Number.isInteger(result)).toBe(true);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
