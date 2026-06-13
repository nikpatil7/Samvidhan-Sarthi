// Recalculate analytics for existing progress records
// This script fixes scenario performance scores and topic mastery for existing users
// Run with: node migrate-recalculate-analytics.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const { computeTopicMastery } = require('../utils/topicMastery');

async function recalculateAnalytics() {
  try {
    console.log('🔄 Recalculate Analytics for Existing Progress');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all progress records
    const allProgress = await Progress.find({});
    console.log(`📊 Found ${allProgress.length} progress records`);
    
    let updatedCount = 0;
    let scenarioScoreUpdated = 0;
    let topicMasteryUpdated = 0;
    let gameScoreUpdated = 0;
    let quizScoreUpdated = 0;
    
    for (const progress of allProgress) {
      let needsUpdate = false;
      
      // Get all content for this topic
      const allContent = await Content.find({ topic: progress.topic, isActive: true });
      
      // Calculate scenario performance score based on scenario game activities
      const scenarioGames = allContent.filter(c => 
        c.type === 'game' && 
        c.gameConfig && 
        c.gameConfig.type === 'scenario'
      );
      
      if (scenarioGames.length > 0) {
        const scenarioActivityIds = scenarioGames.map(g => g._id.toString());
        const scenarioActivities = progress.activities.filter(a => 
          scenarioActivityIds.includes(a.activityId.toString()) && a.completed
        );
        
        if (scenarioActivities.length > 0) {
          const scenarioScores = scenarioActivities.map(a => a.score).filter(s => s > 0);
          if (scenarioScores.length > 0) {
            const newScenarioScore = Math.round(scenarioScores.reduce((a, b) => a + b, 0) / scenarioScores.length);
            if (progress.scenarioPerformanceScore !== newScenarioScore) {
              progress.scenarioPerformanceScore = newScenarioScore;
              scenarioScoreUpdated++;
              needsUpdate = true;
            }
          }
        }
      }
      
      // Calculate game score based on all game activities
      const allGames = allContent.filter(c => c.type === 'game');
      if (allGames.length > 0) {
        const gameActivityIds = allGames.map(g => g._id.toString());
        const gameActivities = progress.activities.filter(a => 
          gameActivityIds.includes(a.activityId.toString()) && a.completed
        );
        
        if (gameActivities.length > 0) {
          const gameScores = gameActivities.map(a => a.score).filter(s => s > 0);
          if (gameScores.length > 0) {
            const newGameScore = Math.round(gameScores.reduce((a, b) => a + b, 0) / gameScores.length);
            if (progress.gameScore !== newGameScore) {
              progress.gameScore = newGameScore;
              gameScoreUpdated++;
              needsUpdate = true;
            }
          }
        }
      }
      
      // Calculate quiz score average
      if (progress.quizScores.length > 0) {
        const quizScores = progress.quizScores.map(q => q.score).filter(s => s > 0);
        if (quizScores.length > 0) {
          const newQuizScore = Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length);
          if (progress.quizScore !== newQuizScore) {
            progress.quizScore = newQuizScore;
            quizScoreUpdated++;
            needsUpdate = true;
          }
        }
      }
      
      // Calculate topic mastery using the utility function
      const newTopicMastery = computeTopicMastery({
        quizScore: progress.quizScore,
        scenarioPerformanceScore: progress.scenarioPerformanceScore,
        gameScore: progress.gameScore
      });
      
      if (progress.topicMastery !== newTopicMastery) {
        progress.topicMastery = newTopicMastery;
        topicMasteryUpdated++;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await progress.save();
        updatedCount++;
        console.log(`  ✅ Updated progress for topic: ${progress.topic}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYTICS RECALCULATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total progress records: ${allProgress.length}`);
    console.log(`  Records updated: ${updatedCount}`);
    console.log(`  Scenario scores updated: ${scenarioScoreUpdated}`);
    console.log(`  Game scores updated: ${gameScoreUpdated}`);
    console.log(`  Quiz scores updated: ${quizScoreUpdated}`);
    console.log(`  Topic mastery updated: ${topicMasteryUpdated}`);
    console.log('='.repeat(60));
    console.log('✅ Analytics Recalculation Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Recalculation failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

recalculateAnalytics();
