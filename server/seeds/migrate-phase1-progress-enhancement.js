// Phase 1.3: Progress Tracking Enhancement
// This script adds scenarioPerformanceScore calculation and module step completion tracking
// Run with: node migrate-phase1-progress-enhancement.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Content = require('../models/Content');

async function enhanceProgressTracking() {
  try {
    console.log('🔄 Phase 1.3: Progress Tracking Enhancement');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all progress records
    const allProgress = await Progress.find({});
    console.log(`📊 Found ${allProgress.length} progress records`);
    
    let progressUpdated = 0;
    let scenarioScoresCalculated = 0;
    let moduleStepsTracked = 0;
    
    for (const progress of allProgress) {
      let needsUpdate = false;
      
      // Calculate scenarioPerformanceScore if not already calculated
      if (progress.scenarioPerformanceScore === null || progress.scenarioPerformanceScore === undefined) {
        // Find scenario activities (games with scenario type)
        const scenarioActivities = progress.activities.filter(a => a.activityType === 'scenario');
        
        if (scenarioActivities.length > 0) {
          // Calculate first-attempt correct rate
          const firstAttemptCorrect = scenarioActivities.filter(a => a.isFirstAttempt && a.isCorrect).length;
          const totalScenarioAttempts = scenarioActivities.filter(a => a.isFirstAttempt).length;
          
          if (totalScenarioAttempts > 0) {
            progress.scenarioPerformanceScore = Math.round((firstAttemptCorrect / totalScenarioAttempts) * 100);
            scenarioScoresCalculated++;
            needsUpdate = true;
          } else {
            progress.scenarioPerformanceScore = 0;
            scenarioScoresCalculated++;
            needsUpdate = true;
          }
        } else {
          progress.scenarioPerformanceScore = null;
          needsUpdate = true;
        }
      }
      
      // Track module step completion if not already tracked
      if (!progress.completedAt) {
        // Get all content for this topic
        const allContent = await Content.find({ topic: progress.topic, isActive: true });
        
        // Count completed module steps
        const completedModuleSteps = new Set();
        
        // Check quiz scores for module step completion
        for (const quizScore of progress.quizScores) {
          const content = await Content.findById(quizScore.quizId);
          if (content && content.moduleStep) {
            completedModuleSteps.add(content.moduleStep);
          }
        }
        
        // Check activities for module step completion
        for (const activity of progress.activities) {
          if (activity.completed) {
            const content = await Content.findById(activity.activityId);
            if (content && content.moduleStep) {
              completedModuleSteps.add(content.moduleStep);
            }
          }
        }
        
        // If all 7 module steps are completed, set completedAt
        if (completedModuleSteps.size >= 7) {
          progress.completedAt = Date.now();
          moduleStepsTracked++;
          needsUpdate = true;
        }
      }
      
      // Add stepType to quiz scores if missing
      for (const quizScore of progress.quizScores) {
        if (!quizScore.stepType) {
          const content = await Content.findById(quizScore.quizId);
          if (content && content.moduleStep) {
            quizScore.stepType = content.moduleStep;
            needsUpdate = true;
          }
        }
      }
      
      // Add activityType to activities if missing
      for (const activity of progress.activities) {
        if (!activity.activityType) {
          const content = await Content.findById(activity.activityId);
          if (content) {
            activity.activityType = content.type;
            if (content.gameConfig && content.gameConfig.type) {
              activity.activityType = content.gameConfig.type;
            }
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await progress.save();
        progressUpdated++;
      }
    }
    
    console.log(`✅ Updated ${progressUpdated} progress records`);
    console.log(`✅ Calculated scenarioPerformanceScore for ${scenarioScoresCalculated} records`);
    console.log(`✅ Tracked module step completion for ${moduleStepsTracked} records`);
    
    // Summary statistics
    const progressWithScenarioScore = await Progress.countDocuments({ scenarioPerformanceScore: { $ne: null } });
    const progressWithCompletedAt = await Progress.countDocuments({ completedAt: { $ne: null } });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PROGRESS TRACKING SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Progress with scenarioPerformanceScore: ${progressWithScenarioScore}/${allProgress.length}`);
    console.log(`  Progress with completedAt (module completion): ${progressWithCompletedAt}/${allProgress.length}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 1.3 Migration Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

enhanceProgressTracking();
