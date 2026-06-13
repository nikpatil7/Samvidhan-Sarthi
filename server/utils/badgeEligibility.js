const { MODULE_STEP_ORDER } = require('./constants');
const { computeProgressMetrics } = require('./progressMetrics');

function isContentCompleted(progress, contentId) {
  const id = contentId?.toString();
  if (!id) return false;

  const quizDone = progress.quizScores?.some((q) => q.quizId?.toString() === id);
  if (quizDone) return true;

  return progress.activities?.some(
    (a) => a.activityId?.toString() === id && a.completed
  );
}

function getCompletedCoreSteps(progress, topicContent) {
  const completed = new Set();

  topicContent.forEach((item) => {
    if (
      item.moduleStep &&
      MODULE_STEP_ORDER.includes(item.moduleStep) &&
      isContentCompleted(progress, item._id)
    ) {
      completed.add(item.moduleStep);
    }
  });

  return completed;
}

function groupContentByTopic(allContent) {
  const map = new Map();
  allContent.forEach((item) => {
    const key = item.topic?.toString();
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function buildBadgeStats(userProgress, allContent) {
  const contentByTopic = groupContentByTopic(allContent);
  const moduleStepCompletions = Object.fromEntries(
    MODULE_STEP_ORDER.map((step) => [step, new Set()])
  );

  const scenarioPerformanceScores = [];
  const applicationQuestionScores = [];

  userProgress.forEach((progress) => {
    const topicId = progress.topic?._id?.toString() || progress.topic?.toString();
    const topicContent = contentByTopic.get(topicId) || [];
    const metrics = computeProgressMetrics(progress, topicContent);

    scenarioPerformanceScores.push(metrics.scenarioPerformanceScore);

    MODULE_STEP_ORDER.forEach((step) => {
      const hasStepComplete = topicContent.some(
        (item) => item.moduleStep === step && isContentCompleted(progress, item._id)
      );
      if (hasStepComplete) {
        moduleStepCompletions[step].add(topicId);
      }
    });

    progress.quizScores?.forEach((quizScore) => {
      const content =
        topicContent.find((c) => c._id.toString() === quizScore.quizId?.toString()) ||
        allContent.find((c) => c._id.toString() === quizScore.quizId?.toString());

      if (!content?.quiz?.questions) return;

      const applicationCount = content.quiz.questions.filter(
        (q) => q.questionType === 'application'
      ).length;

      if (applicationCount > 0) {
        applicationQuestionScores.push({
          score: quizScore.score,
          applicationCount
        });
      }
    });
  });

  const moduleStepCounts = Object.fromEntries(
    Object.entries(moduleStepCompletions).map(([step, topics]) => [step, topics.size])
  );

  const interactedContent = allContent.filter((item) =>
    userProgress.some((progress) => isContentCompleted(progress, item._id))
  );

  return {
    totalQuizzes: userProgress.reduce((n, p) => n + (p.quizScores?.length || 0), 0),
    highScoreQuizzes: userProgress.reduce(
      (n, p) => n + (p.quizScores?.filter((q) => q.score >= 80).length || 0),
      0
    ),
    perfectScoreQuizzes: userProgress.reduce(
      (n, p) => n + (p.quizScores?.filter((q) => q.score >= 95).length || 0),
      0
    ),
    totalScenarios: userProgress.reduce((n, p) => {
      return (
        n +
        (p.activities?.filter((a) => {
          const content = allContent.find(
            (c) =>
              c._id.toString() === a.activityId?.toString() &&
              c.type === 'game' &&
              c.gameConfig?.type === 'scenario'
          );
          return content && a.completed;
        }).length || 0)
      );
    }, 0),
    completedTopics: userProgress.filter((p) => p.completionPercentage >= 90).length,
    totalActivities: userProgress.reduce((n, p) => n + (p.activities?.length || 0), 0),
    scenarioPerformanceScores,
    moduleStepCompletions: moduleStepCounts,
    applicationQuestionScores,
    interactedContent,
    contentByTopic
  };
}

function countTopicsWithFullJourney(userProgress, contentByTopic) {
  return userProgress.filter((progress) => {
    const topicId = progress.topic?._id?.toString() || progress.topic?.toString();
    const topicContent = contentByTopic.get(topicId) || [];
    return getCompletedCoreSteps(progress, topicContent).size >= MODULE_STEP_ORDER.length;
  }).length;
}

module.exports = {
  isContentCompleted,
  getCompletedCoreSteps,
  buildBadgeStats,
  countTopicsWithFullJourney,
  MODULE_STEP_ORDER
};
