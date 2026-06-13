// Recalculate analytics for existing progress records
// Run with: node seeds/migrate-recalculate-analytics.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Content = require('../models/Content');
const { persistProgressMetrics } = require('../utils/progressMetrics');

async function recalculateAnalytics() {
  try {
    console.log('🔄 Recalculate Analytics for Existing Progress');
    console.log('='.repeat(60));

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi');
    console.log('✅ Connected to MongoDB');

    const allProgress = await Progress.find({});
    console.log(`📊 Found ${allProgress.length} progress records`);

    let updatedCount = 0;

    for (const progress of allProgress) {
      const allContent = await Content.find({ topic: progress.topic, isActive: true });
      const before = JSON.stringify({
        quizScore: progress.quizScore,
        gameScore: progress.gameScore,
        scenarioPerformanceScore: progress.scenarioPerformanceScore,
        topicMastery: progress.topicMastery
      });

      persistProgressMetrics(progress, allContent);
      const after = JSON.stringify({
        quizScore: progress.quizScore,
        gameScore: progress.gameScore,
        scenarioPerformanceScore: progress.scenarioPerformanceScore,
        topicMastery: progress.topicMastery
      });

      if (before !== after) {
        await progress.save();
        updatedCount += 1;
        console.log(`  ✅ Updated progress for topic ${progress.topic}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Records updated: ${updatedCount}/${allProgress.length}`);
    console.log('✅ Analytics Recalculation Complete!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Recalculation failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

recalculateAnalytics();
