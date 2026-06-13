const { MODULE_STEP_ORDER } = require('./constants');

function getProgressTopicId(progress) {
  if (!progress?.topic) return null;
  if (progress.topic._id) {
    return progress.topic._id.toString();
  }
  return progress.topic.toString();
}

function isContentCompletedInProgress(progress, contentId) {
  const id = contentId?.toString();
  if (!id || !progress) return false;

  if (progress.quizScores?.some((q) => q.quizId?.toString() === id)) {
    return true;
  }

  return Boolean(
    progress.activities?.some((a) => a.activityId?.toString() === id && a.completed)
  );
}

function isContentEngagedInProgress(progress, contentId) {
  const id = contentId?.toString();
  if (!id || !progress) return false;

  if (isContentCompletedInProgress(progress, id)) {
    return true;
  }

  return Boolean(
    progress.activities?.some((a) => a.activityId?.toString() === id)
  );
}

function buildModuleStepProgress(validProgress, contents, moduleSteps = MODULE_STEP_ORDER) {
  const moduleStepProgress = Object.fromEntries(moduleSteps.map((step) => [step, 0]));

  validProgress.forEach((progress) => {
    const topicId = getProgressTopicId(progress);
    if (!topicId) return;

    moduleSteps.forEach((step) => {
      const stepContent = contents.filter(
        (item) => item.topic?.toString() === topicId && item.moduleStep === step
      );
      const completed = stepContent.some((item) =>
        isContentCompletedInProgress(progress, item._id)
      );
      if (completed) {
        moduleStepProgress[step] += 1;
      }
    });
  });

  return moduleStepProgress;
}

function countTotalModuleStepCompletions(moduleStepProgress) {
  return Object.values(moduleStepProgress).reduce((sum, count) => sum + count, 0);
}

function buildEngagementByContentType(validProgress, contents) {
  const counts = {};

  validProgress.forEach((progress) => {
    const topicId = getProgressTopicId(progress);
    if (!topicId) return;

    contents
      .filter((item) => item.topic?.toString() === topicId && item.isActive !== false)
      .forEach((content) => {
        if (!isContentEngagedInProgress(progress, content._id)) {
          return;
        }
        const type = content.type || 'other';
        counts[type] = (counts[type] || 0) + 1;
      });
  });

  return counts;
}

function buildLearningImprovement(validProgress, contents) {
  const result = {
    preTestScores: [],
    postTestScores: [],
    averageImprovement: 0,
    significantImprovementCount: 0,
    regressionCount: 0
  };

  validProgress.forEach((progress) => {
    const topicId = getProgressTopicId(progress);
    if (!topicId) return;

    const preTestContent = contents.find(
      (item) => item.topic?.toString() === topicId && item.moduleStep === 'pre-test'
    );
    const postTestContent = contents.find(
      (item) => item.topic?.toString() === topicId && item.moduleStep === 'post-test'
    );

    if (!preTestContent || !postTestContent) return;

    const preTestScore = progress.quizScores?.find(
      (q) => q.quizId?.toString() === preTestContent._id.toString()
    );
    const postTestScore = progress.quizScores?.find(
      (q) => q.quizId?.toString() === postTestContent._id.toString()
    );

    if (!preTestScore || !postTestScore) return;

    result.preTestScores.push(preTestScore.score);
    result.postTestScores.push(postTestScore.score);

    const improvement = postTestScore.score - preTestScore.score;
    if (improvement >= 20) result.significantImprovementCount += 1;
    if (improvement < 0) result.regressionCount += 1;
  });

  if (result.preTestScores.length > 0) {
    const avgPre =
      result.preTestScores.reduce((sum, value) => sum + value, 0) / result.preTestScores.length;
    const avgPost =
      result.postTestScores.reduce((sum, value) => sum + value, 0) / result.postTestScores.length;
    result.averageImprovement = Math.round(avgPost - avgPre);
  }

  return result;
}

module.exports = {
  getProgressTopicId,
  isContentCompletedInProgress,
  isContentEngagedInProgress,
  buildModuleStepProgress,
  countTotalModuleStepCompletions,
  buildEngagementByContentType,
  buildLearningImprovement
};
