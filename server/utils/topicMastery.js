/**
 * Topic mastery formula utility.
 * Requirements: 8.1
 */

/**
 * Computes the Topic_Mastery score for a given set of component scores.
 *
 * Formula: Math.round(quizScore * 0.5 + scenarioPerformanceScore * 0.3 + gameScore * 0.2)
 *
 * Any missing (undefined/null) component defaults to 0.
 * All inputs are expected to be integers in the range 0–100.
 *
 * @param {object} scores
 * @param {number} [scores.quizScore]                - Weight: 50%
 * @param {number} [scores.scenarioPerformanceScore] - Weight: 30%
 * @param {number} [scores.gameScore]                - Weight: 20%
 * @returns {number} Integer 0–100
 */
function computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore } = {}) {
  const q = quizScore != null ? quizScore : 0;
  const s = scenarioPerformanceScore != null ? scenarioPerformanceScore : 0;
  const g = gameScore != null ? gameScore : 0;
  return Math.round(q * 0.5 + s * 0.3 + g * 0.2);
}

module.exports = { computeTopicMastery };
