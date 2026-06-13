/**
 * Word-count and reading-time utilities.
 * Requirements: 2.3, 2.4
 */

/**
 * Counts the number of words in a content string.
 * A "word" is defined as a maximal sequence of non-whitespace characters.
 * Returns 0 for null, undefined, or empty strings.
 *
 * @param {string|null|undefined} content
 * @returns {number}
 */
function countWords(content) {
  if (!content) return 0;
  const matches = content.match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Computes the estimated reading time (in minutes) for a content string.
 * Formula: Math.ceil(wordCount / 200)
 * Returns 0 for null, undefined, or empty strings.
 *
 * @param {string|null|undefined} content
 * @returns {number}
 */
function computeEstimatedTime(content) {
  const words = countWords(content);
  if (words === 0) return 0;
  return Math.ceil(words / 200);
}

module.exports = { countWords, computeEstimatedTime };
