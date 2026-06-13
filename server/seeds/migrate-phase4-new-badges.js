// Phase 4.1: New Badge Categories - Add Experiential Learning Badges
// This script adds new badge categories for scenario mastery, module completion, and constitutional reasoning
// Run with: node migrate-phase4-new-badges.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Badge = require('../models/Badge');

// New experiential learning badges
const experientialLearningBadges = [
  {
    name: 'Scenario Master',
    description: 'Achieve 80% or higher scenario performance score across 5 different topics',
    icon: 'scenario-master',
    category: 'mastery',
    requirements: {
      minScenarioPerformance: 80,
      minTopics: 5
    },
    points: 200,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'First Steps',
    description: 'Complete the "Why It Matters" module step for 3 different topics',
    icon: 'first-steps',
    category: 'progress',
    requirements: {
      moduleStep: 'why-it-matters',
      minTopics: 3
    },
    points: 50,
    rarity: 'common',
    isActive: true
  },
  {
    name: 'Constitutional Reasoner',
    description: 'Score 80% or higher on application questions across 5 different quizzes',
    icon: 'constitutional-reasoner',
    category: 'mastery',
    requirements: {
      questionType: 'application',
      minScore: 80,
      minQuizzes: 5
    },
    points: 150,
    rarity: 'uncommon',
    isActive: true
  },
  {
    name: 'Module Journey Complete',
    description: 'Complete all 7 module steps for a single topic',
    icon: 'module-journey-complete',
    category: 'achievement',
    requirements: {
      moduleStepsCompleted: 7,
      singleTopic: true
    },
    points: 100,
    rarity: 'uncommon',
    isActive: true
  },
  {
    name: 'Learning Journey Expert',
    description: 'Complete all 7 module steps for 5 different topics',
    icon: 'learning-journey-expert',
    category: 'mastery',
    requirements: {
      moduleStepsCompleted: 7,
      minTopics: 5
    },
    points: 300,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Case Study Analyst',
    description: 'Complete case example module steps for 3 different topics',
    icon: 'case-study-analyst',
    category: 'achievement',
    requirements: {
      moduleStep: 'case-example',
      minTopics: 3
    },
    points: 75,
    rarity: 'common',
    isActive: true
  },
  {
    name: 'Reinforcement Champion',
    description: 'Complete reinforcement activities for 5 different topics',
    icon: 'reinforcement-champion',
    category: 'achievement',
    requirements: {
      moduleStep: 'reinforcement-activity',
      minTopics: 5
    },
    points: 100,
    rarity: 'uncommon',
    isActive: true
  },
  {
    name: 'Pre-Test Achiever',
    description: 'Score 70% or higher on pre-tests for 3 different topics',
    icon: 'pre-test-achiever',
    category: 'achievement',
    requirements: {
      moduleStep: 'pre-test',
      minScore: 70,
      minTopics: 3
    },
    points: 60,
    rarity: 'common',
    isActive: true
  },
  {
    name: 'Learning Growth',
    description: 'Show 20% or more improvement between pre-test and post-test for any topic',
    icon: 'learning-growth',
    category: 'special',
    requirements: {
      improvementPercentage: 20
    },
    points: 150,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Key Takeaways Master',
    description: 'Complete key takeaways module step for 5 different topics',
    icon: 'key-takeaways-master',
    category: 'achievement',
    requirements: {
      moduleStep: 'key-takeaways',
      minTopics: 5
    },
    points: 75,
    rarity: 'common',
    isActive: true
  },
  {
    name: 'Application Expert',
    description: 'Answer 50 application questions correctly across all quizzes',
    icon: 'application-expert',
    category: 'mastery',
    requirements: {
      questionType: 'application',
      correctAnswers: 50
    },
    points: 200,
    rarity: 'rare',
    isActive: true
  },
  {
    name: 'Experiential Learner',
    description: 'Complete at least one scenario, one case example, and one reinforcement activity',
    icon: 'experiential-learner',
    category: 'participation',
    requirements: {
      scenarioCompleted: 1,
      caseExampleCompleted: 1,
      reinforcementCompleted: 1
    },
    points: 80,
    rarity: 'uncommon',
    isActive: true
  }
];

async function addExperientialLearningBadges() {
  try {
    console.log('🔄 Phase 4.1: New Badge Categories - Add Experiential Learning Badges');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    let badgesAdded = 0;
    let badgesSkipped = 0;
    
    for (const badgeData of experientialLearningBadges) {
      // Check if badge already exists
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      
      if (existingBadge) {
        console.log(`  ⏭️ Badge "${badgeData.name}" already exists, skipping`);
        badgesSkipped++;
        continue;
      }
      
      // Create new badge
      const badge = new Badge(badgeData);
      await badge.save();
      badgesAdded++;
      console.log(`  ✅ Added badge "${badgeData.name}" (${badgeData.category})`);
    }
    
    // Summary statistics
    const totalBadges = await Badge.countDocuments({ isActive: true });
    const masteryBadges = await Badge.countDocuments({ category: 'mastery', isActive: true });
    const achievementBadges = await Badge.countDocuments({ category: 'achievement', isActive: true });
    const progressBadges = await Badge.countDocuments({ category: 'progress', isActive: true });
    const specialBadges = await Badge.countDocuments({ category: 'special', isActive: true });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 NEW BADGE CATEGORIES SUMMARY');
    console.log('='.repeat(60));
    console.log(`  New badges added: ${badgesAdded}`);
    console.log(`  Badges skipped (already exist): ${badgesSkipped}`);
    console.log(`  Total active badges: ${totalBadges}`);
    console.log(`  Mastery badges: ${masteryBadges}`);
    console.log(`  Achievement badges: ${achievementBadges}`);
    console.log(`  Progress badges: ${progressBadges}`);
    console.log(`  Special badges: ${specialBadges}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 4.1 Migration Complete!');
    console.log('📝 New experiential learning badges now available for users to earn');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Badge addition failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addExperientialLearningBadges();
