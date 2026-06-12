const express = require('express');
const { authenticateToken } = require('./auth');
const Progress = require('../models/Progress');
const Topic = require('../models/Topic');
const Badge = require('../models/Badge');
const User = require('../models/User');
const router = express.Router();

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
          activities: []
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
        activities: []
      });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    res.status(500).json({ message: 'Error fetching topic progress', error: error.message });
  }
});

// Check and award badges based on progress
router.post('/check-badges', authenticateToken, async (req, res) => {
  try {
    // Get all user progress
    const progress = await Progress.find({ user: req.user.id });
    
    // Get all available badges
    const badges = await Badge.find({ isActive: true });
    
    // Get user with current badges
    const user = await User.findById(req.user.id);
    
    // Track which badges were newly awarded
    const newlyAwardedBadges = [];
    
    // Check each badge's requirements against user progress
    for (const badge of badges) {
      // Skip if user already has this badge
      if (user.badges.includes(badge._id)) {
        continue;
      }
      
      let shouldAward = false;
      
      // Check different badge requirements based on category
      switch (badge.category) {
        case 'progress':
          // Badge for overall progress percentage
          if (badge.requirements.totalProgress) {
            const totalTopics = progress.length;
            if (totalTopics > 0) {
              const overallProgress = Math.round(
                progress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalTopics
              );
              shouldAward = overallProgress >= badge.requirements.totalProgress;
            }
          }
          
          // Badge for completing specific number of topics
          if (badge.requirements.topicsCompleted) {
            const completedTopics = progress.filter(p => p.completionPercentage === 100).length;
            shouldAward = completedTopics >= badge.requirements.topicsCompleted;
          }
          break;
          
        case 'mastery':
          // Badge for quiz scores
          if (badge.requirements.averageQuizScore) {
            const quizScores = progress
              .flatMap(p => p.quizScores)
              .map(q => q.score);
              
            if (quizScores.length >= badge.requirements.minQuizzes || !badge.requirements.minQuizzes) {
              const avgScore = quizScores.length > 0
                ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
                : 0;
              shouldAward = avgScore >= badge.requirements.averageQuizScore;
            }
          }
          
          // Badge for mastering specific categories
          if (badge.requirements.category) {
            const topicIds = progress
              .filter(p => p.completionPercentage === 100)
              .map(p => p.topic);
              
            const topics = await Topic.find({ _id: { $in: topicIds } });
            const categoryCount = topics.filter(t => t.category === badge.requirements.category).length;
            shouldAward = categoryCount >= badge.requirements.count;
          }
          break;
          
        case 'participation':
          // Badge for login streak or activity count
          if (badge.requirements.totalActivities) {
            const activityCount = progress
              .flatMap(p => p.activities)
              .length;
            shouldAward = activityCount >= badge.requirements.totalActivities;
          }
          break;
          
        default:
          // Special badges might have custom requirements
          break;
      }
      
      // Award the badge if conditions are met
      if (shouldAward) {
        user.badges.push(badge._id);
        newlyAwardedBadges.push(badge);
      }
    }
    
    // Save the user if any badges were awarded
    if (newlyAwardedBadges.length > 0) {
      await user.save();
    }
    
    res.json({
      newBadges: newlyAwardedBadges,
      totalBadges: user.badges.length
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ message: 'Error checking badges', error: error.message });
  }
});

module.exports = router; 