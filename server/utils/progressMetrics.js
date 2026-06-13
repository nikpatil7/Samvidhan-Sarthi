const { computeTopicMastery } = require('./topicMastery');

function calculateScenarioPerformanceScore(activities, scenarioGames, fallbackAverage) {
  const scenarioAttempts = activities.filter(
    (activity) => activity.activityType === 'scenario' && activity.scenarioIndex != null
  );
  const firstAttempts = scenarioAttempts.filter((activity) => activity.isFirstAttempt);

  if (firstAttempts.length > 0) {
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
  const gameActivities = activities.filter(
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
  if (quizScores.length === 0) {
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
  const scenarioActivities = activities.filter(
    (activity) =>
      scenarioActivityIds.includes(activity.activityId?.toString()) && activity.completed
  );

  if (scenarioActivities.length === 0) {
    return null;
  }

  const scenarioScores = scenarioActivities
    .map((activity) => activity.score)
    .filter((value) => value > 0);

  if (scenarioScores.length === 0) {
    return null;
  }

  return Math.round(
    scenarioScores.reduce((sum, value) => sum + value, 0) / scenarioScores.length
  );
}

/**
 * Compute mastery-related scores for dashboard display.
 * Recalculates from raw progress when stored aggregates are missing.
 */
function computeProgressMetrics(progress, allContent) {
  const scenarioGames = allContent.filter(
    (item) => item.type === 'game' && item.gameConfig?.type === 'scenario'
  );

  const quizScore =
    progress.quizScore != null
      ? progress.quizScore
      : calculateAverageQuizScore(progress.quizScores || []);

  const scenarioPerformanceScore =
    progress.scenarioPerformanceScore != null
      ? progress.scenarioPerformanceScore
      : calculateScenarioPerformanceScore(
          progress.activities || [],
          scenarioGames,
          getScenarioFallbackAverage(progress.activities || [], scenarioGames)
        );

  const gameScore =
    progress.gameScore != null
      ? progress.gameScore
      : calculateAverageGameScore(progress.activities || [], allContent);

  const topicMastery =
    progress.topicMastery != null
      ? progress.topicMastery
      : computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore });

  return {
    quizScore: quizScore ?? 0,
    gameScore: gameScore ?? 0,
    scenarioPerformanceScore: scenarioPerformanceScore ?? 0,
    topicMastery: topicMastery ?? 0
  };
}

function averageMetric(values) {
  const valid = values.filter((value) => value != null && !Number.isNaN(value));
  if (valid.length === 0) {
    return 0;
  }
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

module.exports = {
  calculateScenarioPerformanceScore,
  calculateAverageGameScore,
  calculateAverageQuizScore,
  getScenarioFallbackAverage,
  computeProgressMetrics,
  averageMetric
};
