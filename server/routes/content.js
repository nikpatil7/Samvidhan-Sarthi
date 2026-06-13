const express = require('express');
const { authenticateToken } = require('./auth');
const Topic = require('../models/Topic');
const Content = require('../models/Content');
const Progress = require('../models/Progress');
const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const { MODULE_STEP_ORDER } = require('../utils/constants');
const { persistProgressMetrics } = require('../utils/progressMetrics');

function resolveActivityType(content, override) {
  if (override) return override;
  if (content?.gameConfig?.type) return content.gameConfig.type;
  return content?.type || 'activity';
}

function hasPriorScenarioAttempt(activities, contentId, scenarioIndex) {
  return activities.some(
    (activity) =>
      activity.activityId?.toString() === contentId &&
      activity.scenarioIndex === scenarioIndex
  );
}

function hasPriorCompletedActivity(activities, contentId) {
  return activities.some(
    (activity) => activity.activityId?.toString() === contentId && activity.completed
  );
}

function getCompletedModuleSteps(progress, allContent) {
  const contentById = new Map(allContent.map((item) => [item._id.toString(), item]));
  const completedSteps = new Set();

  progress.quizScores.forEach((quizScore) => {
    const item = contentById.get(quizScore.quizId?.toString());
    if (item?.moduleStep) {
      completedSteps.add(item.moduleStep);
    }
  });

  progress.activities.forEach((activity) => {
    if (!activity.completed) return;
    const item = contentById.get(activity.activityId?.toString());
    if (item?.moduleStep) {
      completedSteps.add(item.moduleStep);
    }
  });

  return completedSteps;
}

// ==================== COUNTRIES ROUTES ====================
// Get all countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await Topic.distinct('country');
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries', error: error.message });
  }
});

// ==================== TOPIC DETAIL ROUTES ====================
// This route must be defined BEFORE any routes with similar patterns like /topics/:param
router.get('/topics/detail/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    let topic;
    
    // Check if topicId is a valid MongoDB ObjectId
    if (topicId.match(/^[0-9a-fA-F]{24}$/)) {
      topic = await Topic.findById(topicId);
    } else {
      // If not a valid ObjectId, try to find by custom ID format
      topic = await Topic.findOne({ customId: topicId });
    }
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Error fetching topic', error: error.message });
  }
});

// ==================== CONTENT ROUTES ====================
// Get a specific content item
router.get('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content item:', error);
    res.status(500).json({ message: 'Error fetching content item', error: error.message });
  }
});

// New endpoint - Get all game types at once
router.get('/games/all', async (req, res) => {
  try {
    // Valid game types
    const gameTypes = ['quiz', 'scenario', 'matching', 'spiral', 'timeline','card-sort'];
    const result = {};
    
    // Process each game type
    for (const gameType of gameTypes) {
      let games;
      
      // Handle different game types
      if (gameType === 'quiz') {
        // Find content with type "quiz"
        games = await Content.find({ 
          type: 'quiz',
          isActive: true
        });
      } else {
        // Find game content with specific gameConfig.type
        games = await Content.find({ 
          type: 'game',
          'gameConfig.type': gameType,
          isActive: true
        });
      }
      
      if (games && games.length > 0) {
        // Format the game data based on type
        if (gameType === 'quiz') {
          const questions = games[0].quiz && games[0].quiz.questions ? games[0].quiz.questions : [];
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: questions
          };
        } else if (gameType === 'scenario') {
          const scenarios = games[0].gameConfig && 
                           games[0].gameConfig.config && 
                           games[0].gameConfig.config.scenarios ? 
                           games[0].gameConfig.config.scenarios : [];
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: scenarios
          };
        } else if (gameType === 'matching') {
          const pairs = games[0].gameConfig && 
                       games[0].gameConfig.config && 
                       games[0].gameConfig.config.pairs ? 
                       games[0].gameConfig.config.pairs : [];
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: pairs
          };
        } else if (gameType === 'card-sort') {
          const config =
            games[0].gameConfig &&
            games[0].gameConfig.config
              ? games[0].gameConfig.config
              : {};
        
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: config
          };
        }else if (gameType === 'spiral') {
          const config = games[0].gameConfig && games[0].gameConfig.config ? 
                        games[0].gameConfig.config : {};
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: config
          };
        } else if (gameType === 'timeline') {
          const events = games[0].gameConfig && 
                        games[0].gameConfig.config && 
                        games[0].gameConfig.config.events ? 
                        games[0].gameConfig.config.events : [];
          result[gameType] = {
            id: games[0]._id,
            topicId: games[0].topic,
            title: games[0].title,
            data: events
          };
        }
      } else {
        // No games found for this type
        result[gameType] = { id: null, topicId: null, title: null, data: [] };
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching all games:', error);
    res.status(500).json({ 
      message: 'Error fetching all games', 
      error: error.message 
    });
  }
});

// New endpoint - Get all games (for debugging)
router.get('/games/list', async (req, res) => {
  try {
    // Find all content with type "quiz" or "game"
    const allGames = await Content.find({
      $or: [
        { type: 'quiz' },
        { type: 'game' }
      ],
      isActive: true
    });
    
    // Return minimal game info to avoid overwhelming the response
    const gameList = allGames.map(game => ({
      id: game._id,
      title: game.title,
      type: game.type,
      gameType: game.type === 'game' && game.gameConfig ? game.gameConfig.type : 'quiz',
      hasConfig: game.type === 'game' && !!game.gameConfig,
      hasQuestions: game.type === 'quiz' && !!game.quiz && Array.isArray(game.quiz.questions),
      questionsCount: game.type === 'quiz' && game.quiz && Array.isArray(game.quiz.questions) ? game.quiz.questions.length : 0
    }));
    
    res.json(gameList);
  } catch (error) {
    console.error('Error listing games:', error);
    res.status(500).json({ 
      message: 'Error listing games', 
      error: error.message 
    });
  }
});

// New endpoint - Get games by type
router.get('/games/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    
    // Validate game type
    const validGameTypes = ['quiz', 'scenario', 'matching', 'spiral', 'timeline','card-sort'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ 
        message: 'Invalid game type',
        validTypes: validGameTypes
      });
    }
    
    let games;
    
    // Handle different game types
    if (gameType === 'quiz') {
      // Find content with type "quiz"
      games = await Content.find({ 
        type: 'quiz',
        isActive: true
      });
    } else {
      // Find game content with specific gameConfig.type
      games = await Content.find({ 
        type: 'game',
        'gameConfig.type': gameType,
        isActive: true
      });
    }
    
    if (!games || games.length === 0) {
      return res.status(404).json({ message: `No ${gameType} games found` });
    }
    
    // Return formatted game data based on type
    const formattedGames = games.map(game => {
      if (gameType === 'quiz') {
        return {
          id: game._id,
          topicId: game.topic,
          title: game.title,
          description: game.content,
          questions: game.quiz?.questions || []
        };
      } else if (gameType === 'scenario') {
        return {
          id: game._id,
          topicId: game.topic,
          title: game.title,
          description: game.content,
          scenarios: game.gameConfig?.config?.scenarios || []
        };
      } else {
        return {
          id: game._id,
          topicId: game.topic,
          title: game.title,
          description: game.content,
          config: game.gameConfig?.config || {}
        };
      }
    });
    
    res.json(formattedGames);
  } catch (error) {
    console.error(`Error fetching ${req.params.gameType} games:`, error);
    res.status(500).json({ 
      message: `Error fetching ${req.params.gameType} games`, 
      error: error.message 
    });
  }
});

// New endpoint - Get specific game by ID
router.get('/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Find the game by ID
    const game = await Content.findById(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Return formatted game data based on type
    let gameData;
    
    if (game.type === 'quiz') {
      gameData = {
        id: game._id,
        title: game.title,
        type: 'quiz',
        description: game.content,
        questions: game.quiz.questions
      };
    } else if (game.type === 'game' && game.gameConfig && game.gameConfig.type === 'scenario') {
      gameData = {
        id: game._id,
        title: game.title,
        type: 'scenario',
        description: game.content,
        scenarios: game.gameConfig.config.scenarios
      };
    } else if (game.type === 'game') {
      gameData = {
        id: game._id,
        title: game.title,
        type: game.gameConfig.type,
        description: game.content,
        config: game.gameConfig.config
      };
    } else {
      gameData = {
        id: game._id,
        title: game.title,
        type: game.type,
        description: game.content
      };
    }
    
    res.json(gameData);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

// ==================== TOPIC CONTENT ROUTES ====================
// Get all content for a topic
router.get('/topics/:topicId/content', async (req, res) => {
  try {
    const { topicId } = req.params;
    let content = [];
    
    // Check if topicId is a valid MongoDB ObjectId
    if (topicId.match(/^[0-9a-fA-F]{24}$/)) {
      content = await Content.find({ 
        topic: topicId,
        isActive: true 
      }).sort({ order: 1 });
    } else {
      // For custom IDs, try to find the topic first
      const topic = await Topic.findOne({ customId: topicId });
      
      if (topic) {
        content = await Content.find({ 
          topic: topic._id,
          isActive: true 
        }).sort({ order: 1 });
      } else {
        // If no topic found, return empty array
        return res.json([]);
      }
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

// ==================== TOPIC SUBTOPICS ROUTES ====================
// Get subtopics for a parent topic
router.get('/topics/:topicId/subtopics', async (req, res) => {
  try {
    const { topicId } = req.params;
    let subtopics = [];
    
    // Check if topicId is a valid MongoDB ObjectId
    if (topicId.match(/^[0-9a-fA-F]{24}$/)) {
      subtopics = await Topic.find({ 
        parentTopic: topicId,
        isActive: true 
      }).sort({ order: 1 });
    } else {
      // For custom IDs, try to find the topic first
      const topic = await Topic.findOne({ customId: topicId });
      
      if (topic) {
        subtopics = await Topic.find({ 
          parentTopic: topic._id,
          isActive: true 
        }).sort({ order: 1 });
      }
    }
    
    res.json(subtopics);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).json({ message: 'Error fetching subtopics', error: error.message });
  }
});

// ==================== TOPICS BY COUNTRY ROUTES ====================
// Get all topics for a country
router.get('/topics/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const topics = await Topic.find({ 
      country, 
      isActive: true,
      parentTopic: null // Get only top-level topics
    }).sort({ order: 1 });
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics', error: error.message });
  }
});

// ==================== SEARCH ROUTES ====================
// Search topics and content
router.get('/search', async (req, res) => {
  try {
    const { query, country } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const normalizedQuery = query.trim();
    if (normalizedQuery.length > 100) {
      return res.status(400).json({ message: 'Search query must be 100 characters or fewer' });
    }
    
    const searchRegex = new RegExp(escapeRegex(normalizedQuery), 'i');
    const filter = country ? { country } : {};
    
    // Search in topics
    const topics = await Topic.find({
      ...filter,
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }).limit(10);
    
    // Search in content
    const contentItems = await Content.find({
      isActive: true,
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    }).populate('topic').limit(10);
    
    // Filter content by country if specified
    const filteredContent = (country 
      ? contentItems.filter(item => item.topic && item.topic.country === country)
      : contentItems.filter(item => item.topic != null)
    );
    
    res.json({
      topics,
      content: filteredContent.map(item => ({
        _id: item._id,
        title: item.title,
        type: item.type,
        topic: {
          _id: item.topic._id,
          title: item.topic.title,
          country: item.topic.country
        }
      }))
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Error searching', error: error.message });
  }
});

// ==================== PROGRESS TRACKING ROUTES ====================
// Track content completion (requires auth)
router.post('/track', authenticateToken, async (req, res) => {
  try {
    let {
      topicId,
      contentId,
      type,
      score,
      completed,
      stepType,
      activityType,
      isFirstAttempt,
      isCorrect,
      scenarioIndex,
      chosenOptionIndex,
      scenarioAttempts
    } = req.body;
    
    // If topicId is missing or invalid, try to get it from the content
    let topic = null;
    if (topicId && topicId.match(/^[0-9a-fA-F]{24}$/)) {
      topic = await Topic.findById(topicId);
    } else if (topicId) {
      topic = await Topic.findOne({ customId: topicId });
      if (topic) {
        topicId = topic._id.toString();
      }
    }
    
    // If topic not found from topicId, try to find it from contentId
    if (!topic && contentId && contentId.match(/^[0-9a-fA-F]{24}$/)) {
      const contentDoc = await Content.findById(contentId);
      if (contentDoc && contentDoc.topic) {
        topic = await Topic.findById(contentDoc.topic);
        if (topic) {
          topicId = topic._id.toString();
        }
      }
    }
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Find or create progress record
    let progress = await Progress.findOne({
      user: req.user.id,
      topic: topicId,
      country: topic.country
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        topic: topicId,
        country: topic.country,
        completionPercentage: 0,
        quizScores: [],
        activities: []
      });
    }
    
    const content = await Content.findById(contentId);
    const resolvedActivityType = resolveActivityType(content, activityType);
    const resolvedStepType = stepType || content?.moduleStep || null;
    const contentIdStr = contentId?.toString();

    if (type === 'quiz') {
      const existingQuizIndex = progress.quizScores.findIndex(
        (quiz) => quiz.quizId.toString() === contentId
      );
      
      const quizEntry = {
        quizId: contentId,
        score: score,
        date: Date.now(),
        ...(resolvedStepType ? { stepType: resolvedStepType } : {})
      };

      if (existingQuizIndex >= 0) {
        progress.quizScores[existingQuizIndex].score = score;
        progress.quizScores[existingQuizIndex].date = Date.now();
        if (resolvedStepType) {
          progress.quizScores[existingQuizIndex].stepType = resolvedStepType;
        }
      } else {
        progress.quizScores.push(quizEntry);
      }
    } else {
      if (Array.isArray(scenarioAttempts) && scenarioAttempts.length > 0) {
        scenarioAttempts.forEach((attempt) => {
          const attemptIndex = attempt.scenarioIndex;
          const firstAttempt = !hasPriorScenarioAttempt(progress.activities, contentIdStr, attemptIndex);

          progress.activities.push({
            activityId: contentId,
            completed: false,
            score: attempt.isCorrect ? 100 : 0,
            date: Date.now(),
            activityType: 'scenario',
            scenarioIndex: attemptIndex,
            chosenOptionIndex: attempt.chosenOptionIndex,
            isCorrect: Boolean(attempt.isCorrect),
            isFirstAttempt: firstAttempt
          });
        });
      }

      const existingActivityIndex = progress.activities.findIndex(
        (activity) =>
          activity.activityId.toString() === contentId &&
          activity.completed &&
          activity.scenarioIndex == null
      );

      const resolvedFirstAttempt =
        isFirstAttempt != null
          ? Boolean(isFirstAttempt)
          : !hasPriorCompletedActivity(progress.activities, contentIdStr);

      const activityEntry = {
        activityId: contentId,
        completed: Boolean(completed),
        score: score !== undefined && score !== null ? score : 0,
        date: Date.now(),
        activityType: resolvedActivityType,
        ...(scenarioIndex != null ? { scenarioIndex } : {}),
        ...(chosenOptionIndex != null ? { chosenOptionIndex } : {}),
        ...(isCorrect != null ? { isCorrect: Boolean(isCorrect) } : {}),
        isFirstAttempt: resolvedFirstAttempt,
        ...(completed ? { completedAt: Date.now() } : {})
      };
      
      if (existingActivityIndex >= 0) {
        Object.assign(progress.activities[existingActivityIndex], activityEntry);
      } else {
        progress.activities.push(activityEntry);
      }
    }
    
    const allContent = await Content.find({ topic: topicId, isActive: true });
    const totalContentCount = allContent.length;
    
    if (totalContentCount > 0) {
      const allContentIds = allContent.map((item) => item._id.toString());
      const completedQuizzes = progress.quizScores
        .filter((quiz) => allContentIds.includes(quiz.quizId.toString()))
        .length;
      
      const completedActivities = progress.activities
        .filter((activity) => activity.completed && allContentIds.includes(activity.activityId.toString()))
        .length;
      
      const completedContent = completedQuizzes + completedActivities;
      progress.completionPercentage = Math.round((completedContent / totalContentCount) * 100);
    }
    
    persistProgressMetrics(progress, allContent);

    const completedModuleSteps = getCompletedModuleSteps(progress, allContent);
    if (completedModuleSteps.size >= MODULE_STEP_ORDER.length) {
      progress.completedAt = progress.completedAt || Date.now();
    }
    
    progress.lastUpdated = Date.now();
    await progress.save();
    
    const { checkAndAwardAchievements } = require('./users');
    const newBadges = await checkAndAwardAchievements(req.user.id);
    
    res.json({
      progress,
      achievementsChecked: true,
      newBadges: newBadges || 0
    });
  } catch (error) {
    console.error('Error tracking progress:', error);
    res.status(500).json({ message: 'Error tracking progress', error: error.message });
  }
});

module.exports = router; 
