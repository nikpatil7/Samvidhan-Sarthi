const { computeTopicMastery } = require('./topicMastery');

function calculateScenarioPerformanceScore(activities, scenarioGames, fallbackAverage) {
  const scenarioAttempts = (activities || []).filter(
    (activity) => activity.activityType === 'scenario' && activity.scenarioIndex != null
  );

  if (scenarioAttempts.length > 0) {
    const firstAttemptByIndex = new Map();
    scenarioAttempts.forEach((activity) => {
      const key = activity.scenarioIndex;
      if (!firstAttemptByIndex.has(key)) {
        firstAttemptByIndex.set(key, activity);
      }
    });

    const firstAttempts = Array.from(firstAttemptByIndex.values());
    const correct = firstAttempts.filter((activity) => activity.isCorrect).length;
    return Math.round((correct / firstAttempts.length) * 100);
  }

  if (fallbackAverage != null) {
    return fallbackAverage;
  }

  return null;
}

function calculateAverageGameScore(activities, allContent) {
  const nonScenarioGames = allContent.filter(
    (item) => item.type === 'game' && item.gameConfig?.type !== 'scenario'
  );

  if (nonScenarioGames.length === 0) {
    return null;
  }

  const gameActivityIds = nonScenarioGames.map((game) => game._id.toString());
  const gameActivities = (activities || []).filter(
    (activity) =>
      gameActivityIds.includes(activity.activityId?.toString()) && activity.completed
  );

  if (gameActivities.length === 0) {
    return null;
  }

  const gameScores = gameActivities.map((activity) => activity.score).filter((score) => score > 0);
  if (gameScores.length === 0) {
    return null;
  }

  return Math.round(gameScores.reduce((sum, score) => sum + score, 0) / gameScores.length);
}

function calculateAverageQuizScore(quizScores) {
  if (!quizScores || quizScores.length === 0) {
    return null;
  }

  const scores = quizScores.map((quiz) => quiz.score).filter((score) => score > 0);
  if (scores.length === 0) {
    return null;
  }

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getScenarioFallbackAverage(activities, scenarioGames) {
  if (scenarioGames.length === 0) {
    return null;
  }

  const scenarioActivityIds = scenarioGames.map((game) => game._id.toString());
  const scenarioActivities = (activities || []).filter((activity) =>
    scenarioActivityIds.includes(activity.activityId?.toString())
  );

  if (scenarioActivities.length === 0) {
    return null;
  }

  const perGameScores = scenarioActivityIds
    .map((gameId) => {
      const gameActivities = scenarioActivities.filter(
        (activity) => activity.activityId?.toString() === gameId
      );
      if (gameActivities.length === 0) return null;

      const indexedAttempts = gameActivities.filter(
        (activity) => activity.scenarioIndex != null
      );
      if (indexedAttempts.length > 0) {
        const firstByIndex = new Map();
        indexedAttempts.forEach((activity) => {
          if (!firstByIndex.has(activity.scenarioIndex)) {
            firstByIndex.set(activity.scenarioIndex, activity);
          }
        });
        const attempts = Array.from(firstByIndex.values());
        const correct = attempts.filter((activity) => activity.isCorrect).length;
        return Math.round((correct / attempts.length) * 100);
      }

      const completed = gameActivities.find((activity) => activity.completed);
      if (completed && completed.score > 0) {
        return completed.score;
      }

      return null;
    })
    .filter((score) => score != null && score > 0);

  if (perGameScores.length === 0) {
    return null;
  }

  return Math.round(
    perGameScores.reduce((sum, value) => sum + value, 0) / perGameScores.length
  );
}

/**
 * Always derive display metrics from raw progress + content.
 * Stored aggregate fields may be stale or zero-filled.
 */
function computeProgressMetrics(progress, allContent) {
  const scenarioGames = allContent.filter(
    (item) => item.type === 'game' && item.gameConfig?.type === 'scenario'
  );

  const quizScore = calculateAverageQuizScore(progress.quizScores || []);
  const scenarioPerformanceScore = calculateScenarioPerformanceScore(
    progress.activities || [],
    scenarioGames,
    getScenarioFallbackAverage(progress.activities || [], scenarioGames)
  );
  const gameScore = calculateAverageGameScore(progress.activities || [], allContent);
  const topicMastery = computeTopicMastery({
    quizScore,
    scenarioPerformanceScore,
    gameScore
  });

  return {
    quizScore: quizScore ?? 0,
    gameScore: gameScore ?? 0,
    scenarioPerformanceScore: scenarioPerformanceScore ?? 0,
    topicMastery: topicMastery ?? 0
  };
}

function averageMetric(values, { excludeZero = false } = {}) {
  let valid = values.filter((value) => value != null && !Number.isNaN(value));
  if (excludeZero) {
    valid = valid.filter((value) => value > 0);
  }
  if (valid.length === 0) {
    return 0;
  }
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function persistProgressMetrics(progress, allContent) {
  const metrics = computeProgressMetrics(progress, allContent);
  progress.quizScore = metrics.quizScore;
  progress.gameScore = metrics.gameScore;
  progress.scenarioPerformanceScore = metrics.scenarioPerformanceScore;
  progress.topicMastery = metrics.topicMastery;
  return metrics;
}

module.exports = {
  calculateScenarioPerformanceScore,
  calculateAverageGameScore,
  calculateAverageQuizScore,
  getScenarioFallbackAverage,
  computeProgressMetrics,
  averageMetric,
  persistProgressMetrics
};
