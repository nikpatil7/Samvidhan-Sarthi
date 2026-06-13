/**
 * Shared constants for the learning architecture restructure.
 * Requirements: 1.1, 11.1
 */

/**
 * Canonical order of the seven Module_Step identifiers.
 * Index position is used for sorting and gating logic.
 */
const MODULE_STEP_ORDER = [
  'why-it-matters',
  'real-life-scenario',
  'constitutional-concept',
  'case-example',
  'interactive-assessment',
  'reinforcement-activity',
  'key-takeaways'
];

/**
 * The ten highest-priority constitutional topics.
 * Matching is case-insensitive and exact (no partial matches).
 */
const PRIORITY_TOPICS = [
  'Preamble',
  'Fundamental Rights',
  'Directive Principles',
  'Fundamental Duties',
  'Right to Equality',
  'Right to Freedom',
  'Union Government',
  'Judiciary',
  'Emergency Provisions',
  'Basic Structure Doctrine'
];

/**
 * Lowercase set for O(1) lookup during isPriorityTopic checks.
 * @private
 */
const PRIORITY_TOPICS_LOWER = new Set(PRIORITY_TOPICS.map((t) => t.toLowerCase()));

/**
 * Returns true iff the given title (after trimming) exactly matches one of the
 * ten canonical Priority_Topic values (case-insensitive).
 *
 * @param {string} title
 * @returns {boolean}
 */
function isPriorityTopic(title) {
  if (typeof title !== 'string') return false;
  return PRIORITY_TOPICS_LOWER.has(title.trim().toLowerCase());
}

module.exports = { MODULE_STEP_ORDER, PRIORITY_TOPICS, isPriorityTopic };
