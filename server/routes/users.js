const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./auth');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const Topic = require('../models/Topic');
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
    
    // Calculate average quiz score
    const averageQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, q) => sum + q.score, 0) / quizScores.length)
      : 0;
    
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
        totalBadges: user.badges.length,
        totalActivitiesCompleted,
        totalQuizzesTaken
      },
      recentActivities,
      quizScores: quizScores.slice(0, 5),
      progress: validProgress.map(p => ({
        topicId: p.topic._id,
        topicTitle: p.topic.title,
        completionPercentage: p.completionPercentage,
        country: p.country,
        lastUpdated: p.lastUpdated
      })).slice(0, 10)
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
    // Get user
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Get user progress across all topics
    const userProgress = await Progress.find({ user: userId });
    
    // Get all available badges
    const allBadges = await Badge.find({ isActive: true });
    
    // Get all user content activity
    const contentIds = userProgress.flatMap(p => [
      ...p.quizScores.map(q => q.quizId),
      ...p.activities.map(a => a.activityId)
    ]);
    
    const contents = await Content.find({ _id: { $in: contentIds } });
    
    // Calculate stats
    const stats = {
      totalQuizzes: userProgress.reduce((total, p) => total + p.quizScores.length, 0),
      highScoreQuizzes: userProgress.reduce((total, p) => total + p.quizScores.filter(q => q.score >= 80).length, 0),
      perfectScoreQuizzes: userProgress.reduce((total, p) => total + p.quizScores.filter(q => q.score >= 95).length, 0),
      totalScenarios: userProgress.reduce((total, p) => total + p.activities.filter(a => 
        contents.some(c => c._id.toString() === a.activityId.toString() && 
                    c.type === 'game' && 
                    c.gameConfig && 
                    c.gameConfig.type === 'scenario')
      ).length, 0),
      completedTopics: userProgress.filter(p => p.completionPercentage >= 90).length,
      constitutionalQuizzes: userProgress.reduce((total, p) => {
        const constitutionalQuizzes = p.quizScores.filter(q => 
          contents.some(c => c._id.toString() === q.quizId.toString() && 
                      c.topic && 
                      (c.topic.toString().includes('constitution') || 
                       contents.some(tc => tc._id.toString() === c.topic.toString() && 
                                    tc.title.toLowerCase().includes('constitution'))))
        );
        return total + constitutionalQuizzes.length;
      }, 0),
      totalActivities: userProgress.reduce((total, p) => total + p.activities.length, 0)
    };
    
    // Check each badge requirement and award if eligible
    const newBadges = [];
    const userBadgeIds = user.badges.map(b => b.toString());
    
    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (userBadgeIds.includes(badge._id.toString())) continue;
      
      let eligible = false;
      
      // Check requirements based on badge category
      switch (badge.name) {
        case 'Quiz Master':
          eligible = stats.highScoreQuizzes >= 5;
          break;
        case 'Constitution Defender':
          eligible = stats.totalScenarios >= 3;
          break;
        case 'Preamble Scholar':
          eligible = userProgress.some(p => 
            p.quizScores.some(q => 
              contents.some(c => c._id.toString() === q.quizId.toString() && 
                          c.title.toLowerCase().includes('preamble') && 
                          q.score >= 80)
            )
          );
          break;
        case 'Rights Expert':
          eligible = userProgress.some(p => 
            p.quizScores.some(q => 
              contents.some(c => c._id.toString() === q.quizId.toString() && 
                          c.title.toLowerCase().includes('right') && 
                          q.score >= 80)
            )
          );
          break;
        case 'Amendment Tracker':
          eligible = userProgress.some(p => 
            p.quizScores.some(q => 
              contents.some(c => c._id.toString() === q.quizId.toString() && 
                          c.title.toLowerCase().includes('amendment') && 
                          q.score >= 80)
            )
          );
          break;
        // Add more badge checks here
        default:
          // For unknown badges, check the requirements field if it's structured
          if (badge.requirements) {
            if (badge.requirements.minQuizzes && stats.totalQuizzes >= badge.requirements.minQuizzes) {
              eligible = true;
            } else if (badge.requirements.minScenarios && stats.totalScenarios >= badge.requirements.minScenarios) {
              eligible = true;
            } else if (badge.requirements.minCompletedTopics && stats.completedTopics >= badge.requirements.minCompletedTopics) {
              eligible = true;
            }
          }
          break;
      }
      
      // Award badge if eligible
      if (eligible) {
        newBadges.push(badge._id);
      }
    }
    
    // Update user with new badges
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

// Export both router and achievement function
module.exports = router;
module.exports.checkAndAwardAchievements = checkAndAwardAchievements; 
