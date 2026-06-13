const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./auth');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const Topic = require('../models/Topic');
const { computeProgressMetrics, averageMetric } = require('../utils/progressMetrics');
const {
  buildModuleStepProgress,
  countTotalModuleStepCompletions,
  buildEngagementByContentType,
  buildLearningImprovement,
  getProgressTopicId,
  isContentCompletedInProgress
} = require('../utils/analyticsHelpers');
const {
  buildBadgeStats,
  countTopicsWithFullJourney,
  getCompletedCoreSteps
} = require('../utils/badgeEligibility');
const { MODULE_STEP_ORDER } = require('../utils/constants');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload profile picture (base64)
router.post('/upload-avatar', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }
    
    // Extract base64 data
    const matches = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid image format. Use PNG, JPEG, GIF, or WebP.' });
    }
    
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = matches[2];
    const imageBuffer = Buffer.from(data, 'base64');

    if (imageBuffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image must be smaller than 2MB' });
    }

    const filename = `avatar-${req.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Write file
    await fs.promises.writeFile(filepath, imageBuffer);
    
    // Update user profile
    const imageUrl = `/uploads/avatars/${filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json({ profilePicture: imageUrl, user });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, name, preferredCountry, profilePicture } = req.body;
    const updates = {};
    
    // Check if username is taken by another user
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
      }

      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      updates.username = username;
    }

    if (name !== undefined) updates.name = name;
    if (preferredCountry !== undefined) updates.preferredCountry = preferredCountry;
    if (profilePicture !== undefined) {
      const isAllowedProfilePicture =
        profilePicture === '' ||
        /^https?:\/\//i.test(profilePicture) ||
        profilePicture.startsWith('/uploads/avatars/');

      if (!isAllowedProfilePicture) {
        return res.status(400).json({ message: 'Invalid profile picture URL' });
      }

      updates.profilePicture = profilePicture;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields provided' });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { country } = req.query;
    
    // Get user with badges
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user progress across all topics, filtered by country if provided
    const progressFilter = { user: req.user.id };
    if (country) {
      progressFilter.country = country;
    }
    
    const progress = await Progress.find(progressFilter)
      .populate('topic')
      .sort({ lastUpdated: -1 });
    
    // Filter out progress entries where topic was deleted
    const validProgress = progress.filter(p => p.topic != null);

    const topicIds = validProgress.map((p) => p.topic._id);
    const allContent = topicIds.length > 0
      ? await Content.find({ topic: { $in: topicIds }, isActive: true })
      : [];
    const contentByTopic = new Map();
    allContent.forEach((item) => {
      const key = item.topic.toString();
      if (!contentByTopic.has(key)) {
        contentByTopic.set(key, []);
      }
      contentByTopic.get(key).push(item);
    });

    const enrichedProgress = validProgress.map((p) => {
      const topicContent = contentByTopic.get(p.topic._id.toString()) || [];
      const metrics = computeProgressMetrics(p, topicContent);
      return {
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        completionPercentage: p.completionPercentage ?? 0,
        topicMastery: metrics.topicMastery,
        quizScore: metrics.quizScore,
        gameScore: metrics.gameScore,
        scenarioPerformanceScore: metrics.scenarioPerformanceScore,
        country: p.country,
        lastUpdated: p.lastUpdated
      };
    });
    
    // Get total topic count from DB for accurate stats
    const topicFilter = country ? { country, isActive: true, parentTopic: null } : { isActive: true, parentTopic: null };
    const totalTopicsInDB = await Topic.countDocuments(topicFilter);
    
    // Calculate overall statistics
    const totalTopics = totalTopicsInDB || validProgress.length;
    const completedTopics = validProgress.filter(p => p.completionPercentage === 100).length;
    const startedTopics = validProgress.length;
    const overallProgress = totalTopics > 0 
      ? Math.round((validProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalTopics)) 
      : 0;
    
    // Get recent activities
    const recentActivities = validProgress
      .filter(p => p.activities.length > 0)
      .flatMap(p => p.activities.map(a => ({
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        activityId: a.activityId,
        completed: a.completed,
        score: a.score,
        date: a.date
      })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Get quiz scores
    const quizScores = validProgress
      .filter(p => p.quizScores.length > 0)
      .flatMap(p => p.quizScores.map(q => ({
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        quizId: q.quizId,
        score: q.score,
        date: q.date
      })))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate average quiz score from computed per-topic metrics
    const averageQuizScore = averageMetric(enrichedProgress.map((p) => p.quizScore));
    const averageTopicMastery = averageMetric(enrichedProgress.map((p) => p.topicMastery));
    const averageScenarioPerformance = averageMetric(
      enrichedProgress.map((p) => p.scenarioPerformanceScore),
      { excludeZero: true }
    );
    const averageGameScore = averageMetric(enrichedProgress.map((p) => p.gameScore));
    
    // Get total activities and games completed
    const totalActivitiesCompleted = validProgress.reduce(
      (sum, p) => sum + p.activities.filter(a => a.completed).length, 0
    );
    const totalQuizzesTaken = validProgress.reduce(
      (sum, p) => sum + p.quizScores.length, 0
    );
    
    res.json({
      user,
      stats: {
        totalTopics,
        completedTopics,
        startedTopics,
        overallProgress,
        averageQuizScore,
        averageTopicMastery,
        averageScenarioPerformance,
        averageGameScore,
        totalBadges: user.badges.length,
        totalActivitiesCompleted,
        totalQuizzesTaken
      },
      recentActivities,
      quizScores: quizScores.slice(0, 5),
      progress: enrichedProgress.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    // Get user with populated badges
    const user = await User.findById(req.user.id).populate('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all available badges
    const allBadges = await Badge.find({ isActive: true });
    
    // Format badges with earned status
    const badges = allBadges.map(badge => {
      const earned = user.badges.some(userBadge => userBadge._id.toString() === badge._id.toString());
      
      return {
        id: badge._id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        earned: earned,
        earnedAt: earned ? user.updatedAt : null
      };
    });
    
    res.json({ badges });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
});

// Check and award achievements (internal function)
async function checkAndAwardAchievements(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const userProgress = await Progress.find({ user: userId });
    const topicIds = userProgress.map((p) => p.topic);
    const allContent = await Content.find({
      topic: { $in: topicIds },
      isActive: true
    });

    const stats = buildBadgeStats(userProgress, allContent);
    const allBadges = await Badge.find({ isActive: true });
    const newBadges = [];
    const userBadgeIds = user.badges.map((b) => b.toString());

    for (const badge of allBadges) {
      if (userBadgeIds.includes(badge._id.toString())) continue;

      let eligible = false;

      switch (badge.name) {
        case 'Quiz Master':
          eligible = stats.highScoreQuizzes >= 5;
          break;
        case 'Constitution Defender':
          eligible = stats.totalScenarios >= 3;
          break;
        case 'Preamble Scholar':
          eligible = userProgress.some((p) =>
            p.quizScores.some((q) =>
              allContent.some(
                (c) =>
                  c._id.toString() === q.quizId?.toString() &&
                  c.title.toLowerCase().includes('preamble') &&
                  q.score >= 80
              )
            )
          );
          break;
        case 'Rights Expert':
          eligible = userProgress.some((p) =>
            p.quizScores.some((q) =>
              allContent.some(
                (c) =>
                  c._id.toString() === q.quizId?.toString() &&
                  c.title.toLowerCase().includes('right') &&
                  q.score >= 80
              )
            )
          );
          break;
        case 'Amendment Tracker':
          eligible = userProgress.some((p) =>
            p.quizScores.some((q) =>
              allContent.some(
                (c) =>
                  c._id.toString() === q.quizId?.toString() &&
                  c.title.toLowerCase().includes('amendment') &&
                  q.score >= 80
              )
            )
          );
          break;
        case 'Scenario Master': {
          const highScenarioTopics = stats.scenarioPerformanceScores.filter((s) => s >= 80).length;
          eligible = highScenarioTopics >= (badge.requirements.minTopics || 5);
          break;
        }
        case 'First Steps':
          eligible =
            (stats.moduleStepCompletions['why-it-matters'] || 0) >=
            (badge.requirements.minTopics || 3);
          break;
        case 'Constitutional Reasoner': {
          const highApplicationScores = stats.applicationQuestionScores.filter(
            (s) => s.score >= 80
          ).length;
          eligible = highApplicationScores >= (badge.requirements.minQuizzes || 5);
          break;
        }
        case 'Module Journey Complete':
          eligible = userProgress.some((p) => {
            const topicId = p.topic?._id?.toString() || p.topic?.toString();
            const topicContent = stats.contentByTopic.get(topicId) || [];
            return getCompletedCoreSteps(p, topicContent).size >= MODULE_STEP_ORDER.length;
          });
          break;
        case 'Learning Journey Expert':
          eligible =
            countTopicsWithFullJourney(userProgress, stats.contentByTopic) >=
            (badge.requirements.minTopics || 5);
          break;
        case 'Case Study Analyst':
          eligible =
            (stats.moduleStepCompletions['case-example'] || 0) >=
            (badge.requirements.minTopics || 3);
          break;
        case 'Reinforcement Champion':
          eligible =
            (stats.moduleStepCompletions['reinforcement-activity'] || 0) >=
            (badge.requirements.minTopics || 5);
          break;
        case 'Pre-Test Achiever': {
          const preTestHighScores = userProgress.filter((p) => {
            const preTestContent = allContent.find(
              (c) => c.topic.toString() === p.topic.toString() && c.moduleStep === 'pre-test'
            );
            if (!preTestContent) return false;
            const preTestScore = p.quizScores.find(
              (q) => q.quizId.toString() === preTestContent._id.toString()
            );
            return preTestScore && preTestScore.score >= 70;
          }).length;
          eligible = preTestHighScores >= (badge.requirements.minTopics || 3);
          break;
        }
        case 'Learning Growth':
          eligible = userProgress.some((p) => {
            const preTestContent = allContent.find(
              (c) => c.topic.toString() === p.topic.toString() && c.moduleStep === 'pre-test'
            );
            const postTestContent = allContent.find(
              (c) => c.topic.toString() === p.topic.toString() && c.moduleStep === 'post-test'
            );
            if (!preTestContent || !postTestContent) return false;

            const preTestScore = p.quizScores.find(
              (q) => q.quizId.toString() === preTestContent._id.toString()
            );
            const postTestScore = p.quizScores.find(
              (q) => q.quizId.toString() === postTestContent._id.toString()
            );
            if (!preTestScore || !postTestScore) return false;

            return (
              postTestScore.score - preTestScore.score >=
              (badge.requirements.improvementPercentage || 20)
            );
          });
          break;
        case 'Key Takeaways Master':
          eligible =
            (stats.moduleStepCompletions['key-takeaways'] || 0) >=
            (badge.requirements.minTopics || 5);
          break;
        case 'Application Expert': {
          const totalCorrectApplication = stats.applicationQuestionScores.reduce((sum, s) => {
            return sum + Math.round((s.score / 100) * s.applicationCount);
          }, 0);
          eligible = totalCorrectApplication >= (badge.requirements.correctAnswers || 50);
          break;
        }
        case 'Experiential Learner': {
          const hasScenario =
            (stats.moduleStepCompletions['real-life-scenario'] || 0) > 0 ||
            (stats.moduleStepCompletions['case-example'] || 0) > 0;
          const hasReinforcement =
            (stats.moduleStepCompletions['reinforcement-activity'] || 0) > 0;
          eligible = hasScenario && hasReinforcement;
          break;
        }
        default:
          if (badge.requirements) {
            if (
              badge.requirements.minQuizzes &&
              stats.totalQuizzes >= badge.requirements.minQuizzes
            ) {
              eligible = true;
            } else if (
              badge.requirements.minScenarios &&
              stats.totalScenarios >= badge.requirements.minScenarios
            ) {
              eligible = true;
            } else if (
              badge.requirements.minCompletedTopics &&
              stats.completedTopics >= badge.requirements.minCompletedTopics
            ) {
              eligible = true;
            } else if (
              badge.requirements.topicsCompleted &&
              stats.completedTopics >= badge.requirements.topicsCompleted
            ) {
              eligible = true;
            }
          }
          break;
      }

      if (eligible) {
        newBadges.push(badge._id);
      }
    }

    if (newBadges.length > 0) {
      user.badges = [...user.badges, ...newBadges];
      await user.save();
      return newBadges.length;
    }

    return 0;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return null;
  }
}

// Process and award achievements
router.post('/process-achievements', authenticateToken, async (req, res) => {
  try {
    const newBadgesCount = await checkAndAwardAchievements(req.user.id);
    
    if (newBadgesCount === null) {
      return res.status(500).json({ message: 'Error processing achievements' });
    }
    
    res.json({ 
      message: 'Achievements processed successfully', 
      newBadges: newBadgesCount 
    });
  } catch (error) {
    console.error('Error processing achievements:', error);
    res.status(500).json({ message: 'Error processing achievements', error: error.message });
  }
});

// Get learning analytics for experiential learning
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { country } = req.query;
    
    const filter = { user: req.user.id };
    if (country) {
      filter.country = country;
    }
    
    const progress = await Progress.find(filter).populate('topic');
    const validProgress = progress.filter((p) => p.topic != null);
    const contents = await Content.find({});

    const progressWithMetrics = validProgress.map((p) => {
      const topicContent = contents.filter(
        (c) => c.topic.toString() === p.topic._id.toString() && c.isActive !== false
      );
      const metrics = computeProgressMetrics(p, topicContent);
      return { progress: p, metrics };
    });

    // Calculate enhanced experiential learning analytics
    const analytics = {
      scenarioPerformance: {
        averageScore: 0,
        totalScenarios: 0,
        highPerformanceCount: 0,
        lowPerformanceCount: 0,
        scoreDistribution: { excellent: 0, good: 0, average: 0, needsImprovement: 0 }
      },
      moduleStepProgress: {},
      totalModuleStepCompletions: 0,
      moduleStepEffectiveness: {},
      applicationQuestionPerformance: {
        averageScore: 0,
        totalQuestions: 0,
        correctRate: 0,
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 }
      },
      learningImprovement: {
        preTestScores: [],
        postTestScores: [],
        averageImprovement: 0,
        significantImprovementCount: 0,
        regressionCount: 0
      },
      learningPathAnalysis: {
        mostCommonPath: [],
        completionRateByStep: {},
        averageTimePerStep: {}
      },
      engagementMetrics: {
        totalActivitiesCompleted: 0,
        averageSessionLength: 0,
        mostEngagingContentTypes: {},
        peakLearningTimes: []
      },
      topicMasteryAnalysis: {
        averageMastery: 0,
        masteryDistribution: { expert: 0, proficient: 0, developing: 0, beginner: 0 },
        strongestTopics: [],
        weakestTopics: []
      },
      personalizedInsights: {
        recommendedNextSteps: [],
        areasForImprovement: [],
        strengths: [],
        learningStyle: ''
      }
    };
    
    // Enhanced scenario performance analysis
    const scenarioScores = progressWithMetrics.map((entry) => entry.metrics.scenarioPerformanceScore);
    if (scenarioScores.length > 0) {
      analytics.scenarioPerformance.averageScore = averageMetric(scenarioScores, { excludeZero: true });
      analytics.scenarioPerformance.totalScenarios = scenarioScores.filter((s) => s > 0).length;
      analytics.scenarioPerformance.highPerformanceCount = scenarioScores.filter(s => s >= 80).length;
      analytics.scenarioPerformance.lowPerformanceCount = scenarioScores.filter(s => s > 0 && s < 50).length;
      
      // Score distribution (topics with scenario data only)
      scenarioScores.filter((score) => score > 0).forEach(score => {
        if (score >= 90) analytics.scenarioPerformance.scoreDistribution.excellent++;
        else if (score >= 75) analytics.scenarioPerformance.scoreDistribution.good++;
        else if (score >= 60) analytics.scenarioPerformance.scoreDistribution.average++;
        else analytics.scenarioPerformance.scoreDistribution.needsImprovement++;
      });
    }
    
    // Module step progress with effectiveness
    const moduleSteps = [...MODULE_STEP_ORDER];
    analytics.moduleStepProgress = buildModuleStepProgress(validProgress, contents, moduleSteps);
    analytics.totalModuleStepCompletions = countTotalModuleStepCompletions(analytics.moduleStepProgress);

    moduleSteps.forEach(step => {
      const stepScores = [];
      progressWithMetrics.forEach(({ progress: p }) => {
        const topicId = getProgressTopicId(p);
        contents
          .filter((c) => c.topic?.toString() === topicId && c.moduleStep === step)
          .forEach((c) => {
            const quizScore = p.quizScores?.find((q) => q.quizId?.toString() === c._id.toString());
            if (quizScore) stepScores.push(quizScore.score);
          });
      });

      if (stepScores.length > 0) {
        analytics.moduleStepEffectiveness[step] = {
          averageScore: Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length),
          completionRate: validProgress.length > 0
            ? Math.round((analytics.moduleStepProgress[step] / validProgress.length) * 100)
            : 0,
          sampleSize: stepScores.length
        };
      }
    });
    
    // Enhanced application question performance
    let totalApplicationScore = 0;
    let totalApplicationCount = 0;
    let totalCorrectAnswers = 0;
    let totalApplicationQuestions = 0;
    
    progressWithMetrics.forEach(({ progress: p }) => {
      p.quizScores.forEach(qs => {
        const content = contents.find(c => c._id.toString() === qs.quizId.toString());
        if (content && content.quiz && content.quiz.questions) {
          const applicationQuestions = content.quiz.questions.filter(q => q.questionType === 'application');
          if (applicationQuestions.length > 0) {
            totalApplicationScore += qs.score;
            totalApplicationCount++;
            // Estimate correct answers based on score
            totalCorrectAnswers += Math.round((qs.score / 100) * applicationQuestions.length);
            totalApplicationQuestions += applicationQuestions.length;
          }
        }
      });
    });
    
    if (totalApplicationCount > 0) {
      analytics.applicationQuestionPerformance.averageScore = Math.round(totalApplicationScore / totalApplicationCount);
      analytics.applicationQuestionPerformance.totalQuestions = totalApplicationCount;
      analytics.applicationQuestionPerformance.correctRate = Math.round((totalCorrectAnswers / totalApplicationQuestions) * 100);
      
      // Difficulty analysis based on performance
      if (analytics.applicationQuestionPerformance.correctRate >= 80) {
        analytics.applicationQuestionPerformance.difficultyAnalysis.easy = totalApplicationCount;
      } else if (analytics.applicationQuestionPerformance.correctRate >= 60) {
        analytics.applicationQuestionPerformance.difficultyAnalysis.medium = totalApplicationCount;
      } else {
        analytics.applicationQuestionPerformance.difficultyAnalysis.hard = totalApplicationCount;
      }
    }
    
    // Enhanced learning improvement analysis
    analytics.learningImprovement = buildLearningImprovement(validProgress, contents);
    
    // Learning path analysis
    progressWithMetrics.forEach(({ progress: p }) => {
      const completedSteps = [];
      const topicId = getProgressTopicId(p);
      moduleSteps.forEach(step => {
        const stepContent = contents.filter(
          (c) => c.topic?.toString() === topicId && c.moduleStep === step
        );
        const isCompleted = stepContent.some((item) =>
          isContentCompletedInProgress(p, item._id)
        );
        if (isCompleted) completedSteps.push(step);
      });
      if (completedSteps.length > 0) {
        analytics.learningPathAnalysis.mostCommonPath.push(completedSteps);
      }
    });
    
    // Calculate completion rate by step
    moduleSteps.forEach(step => {
      const totalTopics = validProgress.length;
      const completedTopics = analytics.moduleStepProgress[step];
      analytics.learningPathAnalysis.completionRateByStep[step] = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    });
    
    // Engagement metrics
    progressWithMetrics.forEach(({ progress: p }) => {
      analytics.engagementMetrics.totalActivitiesCompleted += p.activities.filter(a => a.completed).length;
      analytics.engagementMetrics.totalActivitiesCompleted += p.quizScores.length;
    });
    
    analytics.engagementMetrics.mostEngagingContentTypes = buildEngagementByContentType(
      validProgress,
      contents
    );
    
    // Topic mastery analysis
    const masteryScores = progressWithMetrics.map((entry) => entry.metrics.topicMastery);
    if (masteryScores.length > 0) {
      analytics.topicMasteryAnalysis.averageMastery = averageMetric(masteryScores);
      
      // Mastery distribution
      masteryScores.forEach(score => {
        if (score >= 90) analytics.topicMasteryAnalysis.masteryDistribution.expert++;
        else if (score >= 75) analytics.topicMasteryAnalysis.masteryDistribution.proficient++;
        else if (score >= 60) analytics.topicMasteryAnalysis.masteryDistribution.developing++;
        else analytics.topicMasteryAnalysis.masteryDistribution.beginner++;
      });
      
      // Identify strongest and weakest topics
      const topicMastery = progressWithMetrics.map(({ progress: p, metrics }) => ({
        topic: p.topic?.title || 'Unknown',
        mastery: metrics.topicMastery
      }));
      
      topicMastery.sort((a, b) => b.mastery - a.mastery);
      analytics.topicMasteryAnalysis.strongestTopics = topicMastery
        .filter((t) => t.mastery > 0)
        .slice(0, 3)
        .map(t => ({ topic: t.topic, mastery: t.mastery }));
      analytics.topicMasteryAnalysis.weakestTopics = [...topicMastery]
        .filter((t) => t.mastery > 0)
        .slice(-3)
        .reverse()
        .map(t => ({ topic: t.topic, mastery: t.mastery }));
    }
    
    // Generate personalized insights
    if (analytics.scenarioPerformance.averageScore < 60) {
      analytics.personalizedInsights.areasForImprovement.push('Practice more scenarios to improve application skills');
    }
    if (analytics.applicationQuestionPerformance.correctRate < 70) {
      analytics.personalizedInsights.areasForImprovement.push('Focus on application questions to strengthen understanding');
    }
    if (analytics.learningImprovement.averageImprovement < 10) {
      analytics.personalizedInsights.areasForImprovement.push('Review pre-test content to maximize learning improvement');
    }
    
    if (analytics.scenarioPerformance.averageScore >= 80) {
      analytics.personalizedInsights.strengths.push('Strong scenario performance');
    }
    if (analytics.applicationQuestionPerformance.correctRate >= 80) {
      analytics.personalizedInsights.strengths.push('Excellent application question skills');
    }
    if (analytics.learningImprovement.averageImprovement >= 20) {
      analytics.personalizedInsights.strengths.push('Significant learning improvement');
    }
    
    // Determine learning style based on engagement
    const engagementTypes = Object.entries(analytics.engagementMetrics.mostEngagingContentTypes);
    if (engagementTypes.length > 0) {
      const mostEngaged = engagementTypes.sort((a, b) => b[1] - a[1])[0][0];
      if (mostEngaged === 'game') analytics.personalizedInsights.learningStyle = 'Interactive learner';
      else if (mostEngaged === 'quiz') analytics.personalizedInsights.learningStyle = 'Assessment-focused learner';
      else if (mostEngaged === 'lesson') analytics.personalizedInsights.learningStyle = 'Reading-focused learner';
      else analytics.personalizedInsights.learningStyle = 'Balanced learner';
    }
    
    // Generate recommended next steps
    if (analytics.moduleStepProgress['reinforcement-activity'] < validProgress.length * 0.5) {
      analytics.personalizedInsights.recommendedNextSteps.push('Complete reinforcement activities to solidify learning');
    }
    if (analytics.moduleStepProgress['case-example'] < validProgress.length * 0.5) {
      analytics.personalizedInsights.recommendedNextSteps.push('Review case examples to understand practical applications');
    }
    if (analytics.topicMasteryAnalysis.weakestTopics.length > 0) {
      const weakest = analytics.topicMasteryAnalysis.weakestTopics[0];
      analytics.personalizedInsights.recommendedNextSteps.push(`Focus on improving mastery in "${weakest.topic}"`);
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Export both router and achievement function
module.exports = router;
module.exports.checkAndAwardAchievements = checkAndAwardAchievements; 
