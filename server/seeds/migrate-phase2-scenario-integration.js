// Phase 2.2: Scenario Integration into Module Steps
// This script moves scenario games into appropriate module steps
// Run with: node migrate-phase2-scenario-integration.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function integrateScenariosIntoModuleSteps() {
  try {
    console.log('🔄 Phase 2.2: Scenario Integration into Module Steps');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all scenario games
    const scenarioGames = await Content.find({ 
      type: 'game',
      'gameConfig.type': 'scenario'
    });
    console.log(`🎮 Found ${scenarioGames.length} scenario games`);
    
    let scenariosUpdated = 0;
    
    for (const scenario of scenarioGames) {
      let needsUpdate = false;
      
      // Determine appropriate module step based on title and content
      const titleLower = scenario.title.toLowerCase();
      const contentLower = scenario.content?.toLowerCase() || '';
      
      // Assign module step based on scenario type
      if (!scenario.moduleStep) {
        if (titleLower.includes('scenario') || titleLower.includes('rights') || titleLower.includes('freedom')) {
          scenario.moduleStep = 'real-life-scenario';
          needsUpdate = true;
        } else if (titleLower.includes('case') || titleLower.includes('judgment') || titleLower.includes('landmark')) {
          scenario.moduleStep = 'case-example';
          needsUpdate = true;
        } else if (titleLower.includes('amendment') || titleLower.includes('constitutional')) {
          // Constitutional scenarios go to real-life-scenario
          scenario.moduleStep = 'real-life-scenario';
          needsUpdate = true;
        } else {
          // Default to real-life-scenario for scenarios
          scenario.moduleStep = 'real-life-scenario';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await scenario.save();
        scenariosUpdated++;
        console.log(`  ✅ Updated "${scenario.title}" to moduleStep: "${scenario.moduleStep}"`);
      }
    }
    
    // Also update other game types to appropriate module steps
    const otherGames = await Content.find({ 
      type: 'game',
      'gameConfig.type': { $in: ['matching', 'spiral', 'timeline'] }
    });
    console.log(`🎮 Found ${otherGames.length} other games (matching, spiral, timeline)`);
    
    let otherGamesUpdated = 0;
    
    for (const game of otherGames) {
      let needsUpdate = false;
      
      if (!game.moduleStep) {
        // Matching, spiral, and timeline games are reinforcement activities
        game.moduleStep = 'reinforcement-activity';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await game.save();
        otherGamesUpdated++;
        console.log(`  ✅ Updated "${game.title}" to moduleStep: "${game.moduleStep}"`);
      }
    }
    
    // Update quizzes to interactive-assessment if not already set
    const quizzes = await Content.find({ type: 'quiz' });
    console.log(`📝 Found ${quizzes.length} quizzes`);
    
    let quizzesUpdated = 0;
    
    for (const quiz of quizzes) {
      let needsUpdate = false;
      
      if (!quiz.moduleStep) {
        quiz.moduleStep = 'interactive-assessment';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await quiz.save();
        quizzesUpdated++;
        console.log(`  ✅ Updated "${quiz.title}" to moduleStep: "${quiz.moduleStep}"`);
      }
    }
    
    // Update lessons to constitutional-concept if not already set
    const lessons = await Content.find({ type: 'lesson' });
    console.log(`📚 Found ${lessons.length} lessons`);
    
    let lessonsUpdated = 0;
    
    for (const lesson of lessons) {
      let needsUpdate = false;
      
      if (!lesson.moduleStep) {
        lesson.moduleStep = 'constitutional-concept';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await lesson.save();
        lessonsUpdated++;
        console.log(`  ✅ Updated "${lesson.title}" to moduleStep: "${lesson.moduleStep}"`);
      }
    }
    
    // Summary statistics
    const contentWithModuleStep = await Content.countDocuments({ moduleStep: { $exists: true, $ne: null } });
    const totalContent = await Content.countDocuments();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCENARIO INTEGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Scenarios updated: ${scenariosUpdated}/${scenarioGames.length}`);
    console.log(`  Other games updated: ${otherGamesUpdated}/${otherGames.length}`);
    console.log(`  Quizzes updated: ${quizzesUpdated}/${quizzes.length}`);
    console.log(`  Lessons updated: ${lessonsUpdated}/${lessons.length}`);
    console.log(`  Total content with moduleStep: ${contentWithModuleStep}/${totalContent}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 2.2 Migration Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

integrateScenariosIntoModuleSteps();
