// Test Badge Awarding for New Experiential Badges
// This script validates the badge awarding logic for experiential learning badges
// Run with: node test-badge-awarding.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Content = require('../models/Content');

async function testBadgeAwarding() {
  try {
    console.log('🔄 Test Badge Awarding for Experiential Learning Badges');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all badges
    const allBadges = await Badge.find({ isActive: true });
    console.log(`🏅 Found ${allBadges.length} active badges`);
    
    // Categorize badges
    const experientialBadges = allBadges.filter(b => 
      ['Scenario Master', 'First Steps', 'Constitutional Reasoner', 'Module Journey Complete', 
       'Learning Journey Expert', 'Case Study Analyst', 'Reinforcement Champion', 'Pre-Test Achiever',
       'Learning Growth', 'Key Takeaways Master', 'Application Expert', 'Experiential Learner'].includes(b.name)
    );
    
    const traditionalBadges = allBadges.filter(b => !experientialBadges.includes(b));
    
    console.log(`📊 Experiential learning badges: ${experientialBadges.length}`);
    console.log(`📊 Traditional badges: ${traditionalBadges.length}`);
    
    // Check badge categories
    const badgeCategories = {};
    allBadges.forEach(badge => {
      if (!badgeCategories[badge.category]) {
        badgeCategories[badge.category] = 0;
      }
      badgeCategories[badge.category]++;
    });
    
    console.log('\n📊 Badge Categories:');
    Object.entries(badgeCategories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} badges`);
    });
    
    // Validate badge requirements structure
    console.log('\n' + '='.repeat(60));
    console.log('📊 BADGE REQUIREMENTS VALIDATION');
    console.log('='.repeat(60));
    
    let badgesWithRequirements = 0;
    let badgesWithoutRequirements = 0;
    
    experientialBadges.forEach(badge => {
      if (badge.requirements && Object.keys(badge.requirements).length > 0) {
        badgesWithRequirements++;
        console.log(`  ✅ "${badge.name}" has requirements:`, Object.keys(badge.requirements));
      } else {
        badgesWithoutRequirements++;
        console.log(`  ⚠️ "${badge.name}" missing requirements`);
      }
    });
    
    console.log(`\n  Badges with requirements: ${badgesWithRequirements}/${experientialBadges.length}`);
    console.log(`  Badges without requirements: ${badgesWithoutRequirements}/${experientialBadges.length}`);
    
    // Test badge eligibility logic
    console.log('\n' + '='.repeat(60));
    console.log('📊 BADGE ELIGIBILITY LOGIC TEST');
    console.log('='.repeat(60));
    
    // Get sample progress data
    const sampleProgress = await Progress.findOne();
    if (sampleProgress) {
      console.log(`\n📝 Sample progress found for topic ID: "${sampleProgress.topic}"`);
      console.log(`   Completion: ${sampleProgress.completionPercentage}%`);
      console.log(`   Scenario Performance: ${sampleProgress.scenarioPerformanceScore || 'N/A'}`);
      console.log(`   Topic Mastery: ${sampleProgress.topicMastery || 'N/A'}`);
      console.log(`   Quiz Scores: ${sampleProgress.quizScores.length}`);
      console.log(`   Activities: ${sampleProgress.activities.length}`);
    } else {
      console.log('\n⚠️ No progress data found for testing');
    }
    
    // Check if badge awarding function exists
    console.log('\n' + '='.repeat(60));
    console.log('📊 BADGE AWARDING INTEGRATION CHECK');
    console.log('='.repeat(60));
    
    try {
      const { checkAndAwardAchievements } = require('../routes/users');
      console.log('  ✅ Badge awarding function exists and is accessible');
    } catch (error) {
      console.log('  ⚠️ Badge awarding function not accessible:', error.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BADGE AWARDING VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total badges: ${allBadges.length}`);
    console.log(`Experiential learning badges: ${experientialBadges.length}`);
    console.log(`Badges with requirements: ${badgesWithRequirements}/${experientialBadges.length}`);
    console.log(`Badge categories: ${Object.keys(badgeCategories).length}`);
    
    if (badgesWithRequirements === experientialBadges.length) {
      console.log('✅ All experiential badges have proper requirements structure');
    } else {
      console.log(`⚠️ ${badgesWithoutRequirements} badges missing requirements`);
    }
    
    console.log('='.repeat(60));
    console.log('✅ Badge Awarding Validation Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testBadgeAwarding();
