/**
 * Feature: learning-architecture-restructure
 * Property 28: Priority_Topic Classification
 * Validates: Requirements 11.1
 *
 * For any topic title string, the `isPriorityTopic(title)` function should
 * return `true` if and only if the title (case-insensitively) exactly matches
 * one of the ten canonical Priority_Topic values.
 */

const fc = require('fast-check');
const { isPriorityTopic, PRIORITY_TOPICS } = require('../../utils/constants');

// ---------------------------------------------------------------------------
// Helper: build a Set of lowercase canonical values for fast membership checks
// ---------------------------------------------------------------------------
const PRIORITY_LOWER = new Set(PRIORITY_TOPICS.map((t) => t.toLowerCase()));

describe('Property 28 — Priority_Topic Classification', () => {
  // -------------------------------------------------------------------------
  // 1. Exact canonical values always return true
  // -------------------------------------------------------------------------
  it('returns true for every exact canonical Priority_Topic title', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRIORITY_TOPICS),
        (title) => {
          expect(isPriorityTopic(title)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 2. Lowercase variants of canonical values still return true
  // -------------------------------------------------------------------------
  it('returns true for lowercase variants of canonical Priority_Topic titles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRIORITY_TOPICS),
        (title) => {
          expect(isPriorityTopic(title.toLowerCase())).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 3. Uppercase variants of canonical values still return true
  // -------------------------------------------------------------------------
  it('returns true for uppercase variants of canonical Priority_Topic titles', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PRIORITY_TOPICS),
        (title) => {
          expect(isPriorityTopic(title.toUpperCase())).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // 4. Arbitrary strings that are NOT a canonical value return false
  // -------------------------------------------------------------------------
  it('returns false for arbitrary strings that are not a canonical Priority_Topic', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (title) => {
          // Skip strings that happen to case-insensitively match a canonical value
          if (PRIORITY_LOWER.has(title.trim().toLowerCase())) return;
          expect(isPriorityTopic(title)).toBe(false);
        }
      ),
      { numRuns: 500 }
    );
  });

  // -------------------------------------------------------------------------
  // 5. Non-string inputs always return false
  // -------------------------------------------------------------------------
  it('returns false for non-string inputs (null, undefined, number)', () => {
    expect(isPriorityTopic(null)).toBe(false);
    expect(isPriorityTopic(undefined)).toBe(false);
    expect(isPriorityTopic(42)).toBe(false);
    expect(isPriorityTopic({})).toBe(false);
    expect(isPriorityTopic([])).toBe(false);
    expect(isPriorityTopic(true)).toBe(false);
  });
});
