require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
require('../models/Topic');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const { computeProgressMetrics } = require('../utils/progressMetrics');
const {
  buildModuleStepProgress,
  buildEngagementByContentType,
  buildLearningImprovement,
  getProgressTopicId
} = require('../utils/analyticsHelpers');
const { MODULE_STEP_ORDER } = require('../utils/constants');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi');
  const progress = await Progress.find({}).populate('topic');
  const validProgress = progress.filter((p) => p.topic);
  const contents = await Content.find({ isActive: { $ne: false } });

  console.log('VALIDATION REPORT');
  console.log('=================');
  console.log('Progress records:', validProgress.length);

  if (validProgress.length === 0) {
    console.log('No progress data to validate.');
    await mongoose.disconnect();
    return;
  }

  const sample = validProgress[0];
  const topicId = getProgressTopicId(sample);
  const topicContent = contents.filter((c) => c.topic?.toString() === topicId);
  const metrics = computeProgressMetrics(sample, topicContent);

  console.log('\nSample topic:', sample.topic.title);
  console.log('Metric | Source | Formula | Sample');
  console.log('Overall Progress | Progress.completionPercentage | completed/total content |', sample.completionPercentage + '%');
  console.log('Topic Mastery | progressMetrics | quiz*0.5+scenario*0.3+game*0.2 |', metrics.topicMastery + '%');
  console.log('Quiz Performance | progressMetrics | avg(quizScores) |', metrics.quizScore + '%');
  console.log('Scenario Performance | progressMetrics | first-attempt scenario accuracy |', metrics.scenarioPerformanceScore + '%');
  console.log('Game Performance | progressMetrics | avg(non-scenario game scores) |', metrics.gameScore + '%');

  const moduleSteps = buildModuleStepProgress(validProgress, contents, MODULE_STEP_ORDER);
  const engagement = buildEngagementByContentType(validProgress, contents);
  const improvement = buildLearningImprovement(validProgress, contents);

  console.log('Module Steps Completed | analyticsHelpers | sum(step completions) |', Object.values(moduleSteps).reduce((a, b) => a + b, 0));
  console.log('Engagement lesson/quiz/game | analyticsHelpers | engaged content by type |', JSON.stringify(engagement));
  console.log('Learning Improvement | analyticsHelpers | avg(post-pre) |', improvement.averageImprovement + '%');

  const brokenCompare = contents.some(
    (c) => c.topic?.toString() === sample.topic.toString()
  );
  const fixedCompare = contents.some(
    (c) => c.topic?.toString() === topicId
  );
  console.log('\nTopic ID compare bug present:', brokenCompare && !fixedCompare ? 'YES' : 'NO');

  await mongoose.disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
