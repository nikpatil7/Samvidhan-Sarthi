/**
 * Feature: learning-architecture-restructure
 * Property 22: Learning Streak Arithmetic
 * Validates: Requirements 8.4, 8.5
 *
 * For any pair (lastActivityDate, completionDate) expressed as UTC calendar dates:
 *   - lastActivityDate null → streak = 1, lastActivityDate is set
 *   - UTC day diff === 1   → streak increments by 1, lastActivityDate updated
 *   - UTC day diff > 1     → streak resets to 1, lastActivityDate updated
 *   - UTC day diff === 0   → streak and lastActivityDate unchanged
 */

const fc = require('fast-check');
const { updateStreak, utcDayDiff } = require('../../utils/streakUtils');

// ---------------------------------------------------------------------------
// Helper: truncate a Date to UTC midnight (strips time component)
// ---------------------------------------------------------------------------
function toUtcMidnight(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

// ---------------------------------------------------------------------------
// Case 1: lastActivityDate is null → streak = 1, lastActivityDate is set
// ---------------------------------------------------------------------------

describe('Property 22 — null lastActivityDate starts streak at 1', () => {
  it('sets learningStreak = 1 and records lastActivityDate when lastActivityDate is null', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d)),
        (completionDate) => {
          const user = { learningStreak: 0, lastActivityDate: null };
          const completionMidnight = toUtcMidnight(completionDate);

          updateStreak(user, completionMidnight);

          expect(user.learningStreak).toBe(1);
          expect(user.lastActivityDate).toEqual(completionMidnight);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Case 2: UTC day diff === 1 → streak increments by 1, lastActivityDate updated
// ---------------------------------------------------------------------------

describe('Property 22 — consecutive-day streak increment', () => {
  it('increments learningStreak by 1 when completion date is exactly 1 UTC day after lastActivityDate', () => {
    fc.assert(
      fc.property(
        // Base date for lastActivityDate (leave room for +1 day within range)
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-30') }),
        fc.integer({ min: 1, max: 100 }), // existing streak value
        (baseDate, existingStreak) => {
          const lastActivityMidnight = toUtcMidnight(baseDate);
          // completion is exactly one UTC day later
          const completionMidnight = new Date(lastActivityMidnight.getTime() + 86400000);

          // Sanity-check the generated pair really is 1 day apart
          expect(utcDayDiff(completionMidnight, lastActivityMidnight)).toBe(1);

          const user = {
            learningStreak: existingStreak,
            lastActivityDate: lastActivityMidnight,
          };

          updateStreak(user, completionMidnight);

          expect(user.learningStreak).toBe(existingStreak + 1);
          expect(user.lastActivityDate).toEqual(completionMidnight);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Case 3: UTC day diff > 1 → streak resets to 1, lastActivityDate updated
// ---------------------------------------------------------------------------

describe('Property 22 — streak reset when gap > 1 day', () => {
  it('resets learningStreak to 1 when completion date is more than 1 UTC day after lastActivityDate', () => {
    fc.assert(
      fc.property(
        // Base date for lastActivityDate — filter out invalid (NaN) dates
        fc.date({ min: new Date('2020-01-01'), max: new Date('2029-12-31') }).filter(d => !isNaN(d)),
        // Gap strictly greater than 1 day (2–365 days)
        fc.integer({ min: 2, max: 365 }),
        fc.integer({ min: 1, max: 100 }), // existing streak
        (baseDate, gapDays, existingStreak) => {
          const lastActivityMidnight = toUtcMidnight(baseDate);
          const completionMidnight = new Date(
            lastActivityMidnight.getTime() + gapDays * 86400000
          );

          // Sanity-check the generated pair really is > 1 day apart
          expect(utcDayDiff(completionMidnight, lastActivityMidnight)).toBe(gapDays);

          const user = {
            learningStreak: existingStreak,
            lastActivityDate: lastActivityMidnight,
          };

          updateStreak(user, completionMidnight);

          expect(user.learningStreak).toBe(1);
          expect(user.lastActivityDate).toEqual(completionMidnight);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Case 4: UTC day diff === 0 → streak and lastActivityDate unchanged
// ---------------------------------------------------------------------------

describe('Property 22 — same UTC day leaves streak unchanged', () => {
  it('does not modify learningStreak or lastActivityDate when completion is on the same UTC day', () => {
    fc.assert(
      fc.property(
        // Base date for lastActivityDate
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        // Random intra-day offset in milliseconds (0 to 86399999 ms = up to 23h 59m 59s)
        fc.integer({ min: 0, max: 86399999 }),
        fc.integer({ min: 1, max: 100 }),
        (baseDate, intraDayOffsetMs, existingStreak) => {
          const lastActivityMidnight = toUtcMidnight(baseDate);
          // Completion is on the same UTC calendar day (just a different time within the day)
          const completionSameDay = new Date(
            lastActivityMidnight.getTime() + intraDayOffsetMs
          );

          // Sanity-check the generated pair really is 0 days apart
          expect(utcDayDiff(completionSameDay, lastActivityMidnight)).toBe(0);

          const user = {
            learningStreak: existingStreak,
            lastActivityDate: lastActivityMidnight,
          };

          updateStreak(user, completionSameDay);

          // Both values must be unchanged
          expect(user.learningStreak).toBe(existingStreak);
          expect(user.lastActivityDate).toEqual(lastActivityMidnight);
        }
      ),
      { numRuns: 100 }
    );
  });
});
