// Phase 5.2: Topic Mastery Calculation
// This script calculates and updates topic mastery scores for existing progress records
// Run with: node migrate-phase5-topic-mastery.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const { computeTopicMastery } = require('../utils/topicMastery');

async function calculateTopicMastery() {
  try {
    console.log('🔄 Phase 5.2: Topic Mastery Calculation');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all progress records
    const allProgress = await Progress.find({});
    console.log(`📊 Found ${allProgress.length} progress records`);
    
    let masteryUpdated = 0;
    
    for (const progress of allProgress) {
      // Get all content for this topic
      const topicContent = await Content.find({ topic: progress.topic });
      
      // Calculate average quiz score
      let quizScore = 0;
      if (progress.quizScores.length > 0) {
        quizScore = Math.round(progress.quizScores.reduce((sum, q) => sum + q.score, 0) / progress.quizScores.length);
      }
      
      // Get scenario performance score (already calculated)
      const scenarioPerformanceScore = progress.scenarioPerformanceScore || 0;
      
      // Calculate average game score
      let gameScore = 0;
      const gameActivities = progress.activities.filter(a => {
        const content = topicContent.find(c => c._id.toString() === a.activityId.toString());
        return content && content.type === 'game';
      });
      
      if (gameActivities.length > 0) {
        gameScore = Math.round(gameActivities.reduce((sum, a) => sum + (a.score || 0), 0) / gameActivities.length);
      }
      
      // Calculate topic mastery using the utility function
      const mastery = computeTopicMastery({
        quizScore,
        scenarioPerformanceScore,
        gameScore
      });
      
      // Update progress with mastery score
      progress.topicMastery = mastery;
      await progress.save();
      masteryUpdated++;
      
      console.log(`  ✅ Updated mastery for topic: ${mastery}% (Quiz: ${quizScore}%, Scenario: ${scenarioPerformanceScore}%, Game: ${gameScore}%)`);
    }
    
    // Summary statistics
    const progressWithMastery = await Progress.countDocuments({ topicMastery: { $ne: null } });
    const avgMastery = await Progress.aggregate([
      { $match: { topicMastery: { $ne: null } } },
      { $group: { _id: null, avgMastery: { $avg: '$topicMastery' } } }
    ]);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TOPIC MASTERY CALCULATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Progress records updated: ${masteryUpdated}/${allProgress.length}`);
    console.log(`  Progress with mastery: ${progressWithMastery}/${allProgress.length}`);
    console.log(`  Average mastery: ${avgMastery[0]?.avgMastery?.toFixed(1) || 0}%`);
    console.log('='.repeat(60));
    console.log('✅ Phase 5.2 Migration Complete!');
    console.log('📝 Topic mastery now calculated and stored for all progress records');
    console.log('📝 Formula: 50% quiz + 30% scenario + 20% game performance');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Calculation failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

calculateTopicMastery();
