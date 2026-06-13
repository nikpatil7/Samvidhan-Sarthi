// Check analytics data to understand why dashboard is not reflecting progress
// Run with: node check-analytics-data.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const User = require('../models/User');

async function checkAnalyticsData() {
  try {
    console.log('🔄 Check Analytics Data');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get a sample user
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ No users found');
      await mongoose.connection.close();
      return;
    }
    console.log(`👤 Sample user: ${user.username} (${user._id})`);
    
    // Get progress for this user
    const progress = await Progress.find({ user: user._id });
    console.log(`📊 Progress records found: ${progress.length}`);
    
    if (progress.length === 0) {
      console.log('⚠️  No progress records found - this is why analytics are not showing');
    } else {
      progress.forEach((p, index) => {
        console.log(`\n${index + 1}. Topic: ${p.topic}`);
        console.log(`   Completion: ${p.completionPercentage}%`);
        console.log(`   Quiz scores: ${p.quizScores.length}`);
        console.log(`   Activities: ${p.activities.length}`);
        console.log(`   Scenario performance score: ${p.scenarioPerformanceScore}`);
        console.log(`   Topic mastery: ${p.topicMastery}`);
        console.log(`   Last updated: ${new Date(p.lastUpdated).toLocaleString()}`);
        
        if (p.quizScores.length > 0) {
          console.log(`   Quiz score details:`);
          p.quizScores.forEach(qs => {
            console.log(`     - Quiz ID: ${qs.quizId}, Score: ${qs.score}, Date: ${new Date(qs.date).toLocaleString()}`);
          });
        }
        
        if (p.activities.length > 0) {
          console.log(`   Activity details:`);
          p.activities.forEach(a => {
            console.log(`     - Activity ID: ${a.activityId}, Completed: ${a.completed}, Score: ${a.score}, Date: ${new Date(a.date).toLocaleString()}`);
          });
        }
      });
    }
    
    // Check content structure for pre-test and post-test
    console.log('\n📝 Checking content structure for pre-test and post-test...');
    const preTestContent = await Content.findOne({ moduleStep: 'pre-test' });
    const postTestContent = await Content.findOne({ moduleStep: 'post-test' });
    
    console.log(`   Pre-test content found: ${preTestContent ? 'Yes' : 'No'}`);
    console.log(`   Post-test content found: ${postTestContent ? 'Yes' : 'No'}`);
    
    // Check available module steps
    const allModuleSteps = await Content.distinct('moduleStep');
    console.log(`   Available module steps: ${allModuleSteps.join(', ')}`);
    
    // Check game content
    const gameContent = await Content.find({ type: 'game' }).limit(5);
    console.log(`\n🎮 Sample game content: ${gameContent.length} games`);
    gameContent.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title}`);
      console.log(`      Type: ${game.gameConfig?.type || 'unknown'}`);
      console.log(`      Module step: ${game.moduleStep}`);
    });
    
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkAnalyticsData();
