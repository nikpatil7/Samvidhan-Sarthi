const express = require('express');
const { authenticateToken } = require('./auth');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');
const Content = require('../models/Content');
const User = require('../models/User');
const { computeProgressMetrics } = require('../utils/progressMetrics');
const router = express.Router();

async function withComputedMetrics(progressDoc, topicId) {
  if (!progressDoc) {
    return null;
  }

  const plain = progressDoc.toObject ? progressDoc.toObject() : progressDoc;
  const topicContent = await Content.find({ topic: topicId, isActive: true });
  const metrics = computeProgressMetrics(plain, topicContent);

  return {
    ...plain,
    topicMastery: metrics.topicMastery,
    quizScore: metrics.quizScore,
    gameScore: metrics.gameScore,
    scenarioPerformanceScore: metrics.scenarioPerformanceScore
  };
}

// Get user progress for all topics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { country } = req.query;
    
    const filter = { user: req.user.id };
    if (country) {
      filter.country = country;
    }
    
    const progress = await Progress.find(filter)
      .populate('topic')
      .sort({ lastUpdated: -1 });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Get dashboard summary stats for user
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { country } = req.query;
    
    const filter = { user: req.user.id };
    if (country) {
      filter.country = country;
    }
    
    const progress = await Progress.find(filter).populate('topic');
    
    // Filter out entries with deleted topics
    const validProgress = progress.filter(p => p.topic != null);
    
    const totalStarted = validProgress.length;
    const totalCompleted = validProgress.filter(p => p.completionPercentage === 100).length;
    const overallProgress = totalStarted > 0
      ? Math.round(validProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalStarted)
      : 0;
    
    const allQuizScores = validProgress.flatMap(p => p.quizScores.map(q => q.score));
    const averageQuizScore = allQuizScores.length > 0
      ? Math.round(allQuizScores.reduce((sum, s) => sum + s, 0) / allQuizScores.length)
      : 0;
    
    const totalActivities = validProgress.reduce((sum, p) => sum + p.activities.filter(a => a.completed).length, 0);
    const totalQuizzes = validProgress.reduce((sum, p) => sum + p.quizScores.length, 0);
    
    const recentActivities = validProgress
      .flatMap(p => p.activities.map(a => ({
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        completed: a.completed,
        score: a.score,
        date: a.date
      })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    res.json({
      totalStarted,
      totalCompleted,
      overallProgress,
      averageQuizScore,
      totalActivities,
      totalQuizzes,
      recentActivities,
      topicProgress: validProgress.map(p => ({
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        completionPercentage: p.completionPercentage,
        lastUpdated: p.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({ message: 'Error fetching progress summary', error: error.message });
  }
});

// Get user progress for a specific topic
router.get('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    
    let progress;
    
    let resolvedTopicId = topicId;

    // Resolve customId (e.g. l0-1) to MongoDB ObjectId
    if (!topicId.match(/^[0-9a-fA-F]{24}$/)) {
      const topic = await Topic.findOne({ customId: topicId });
      if (topic) {
        resolvedTopicId = topic._id;
      } else {
        return res.json({
          user: req.user.id,
          topic: topicId,
          completionPercentage: 0,
          quizScores: [],
          activities: [],
          topicMastery: 0,
          quizScore: 0,
          gameScore: 0,
          scenarioPerformanceScore: 0
        });
      }
    }

    progress = await Progress.findOne({
      user: req.user.id,
      topic: resolvedTopicId
    }).populate('topic');
    
    if (!progress) {
      return res.json({
        user: req.user.id,
        topic: topicId,
        completionPercentage: 0,
        quizScores: [],
        activities: [],
        topicMastery: 0,
        quizScore: 0,
        gameScore: 0,
        scenarioPerformanceScore: 0
      });
    }
    
    res.json(await withComputedMetrics(progress, resolvedTopicId));
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    res.status(500).json({ message: 'Error fetching topic progress', error: error.message });
  }
});

// Check and award badges based on progress
router.post('/check-badges', authenticateToken, async (req, res) => {
  try {
    const userBefore = await User.findById(req.user.id);
    const { checkAndAwardAchievements } = require('./users');
    const newBadgesCount = await checkAndAwardAchievements(req.user.id);

    if (newBadgesCount === null) {
      return res.status(500).json({ message: 'Error checking badges' });
    }

    const userAfter = await User.findById(req.user.id).populate('badges');
    const previousIds = new Set(userBefore.badges.map((id) => id.toString()));
    const newlyAwardedBadges = userAfter.badges.filter(
      (badge) => !previousIds.has(badge._id.toString())
    );

    res.json({
      newBadges: newlyAwardedBadges,
      totalBadges: userAfter.badges.length
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ message: 'Error checking badges', error: error.message });
  }
});

module.exports = router; 