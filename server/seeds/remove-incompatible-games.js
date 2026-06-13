// Remove incompatible games that broke the frontend
// This script removes the games with incompatible gameConfig structure
// Run with: node remove-incompatible-games.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function removeIncompatibleGames() {
  try {
    console.log('🔄 Remove Incompatible Games');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Find games with incompatible structure (those without config.scenarios for scenario type)
    const incompatibleGames = await Content.find({ 
      type: 'game',
      title: { $regex: /Constitutional (Flashcards|Drag and Drop|Word Search|Memory Match|Timeline Challenge|Quiz Showdown|Crossword Puzzle|Role-Play Scenario|Leaderboard Challenge|Streak Challenge)/ }
    });
    
    console.log(`📝 Found ${incompatibleGames.length} incompatible games`);
    
    if (incompatibleGames.length === 0) {
      console.log('✅ No incompatible games found');
      await mongoose.connection.close();
      return;
    }
    
    let gamesRemoved = 0;
    
    for (const game of incompatibleGames) {
      await Content.deleteOne({ _id: game._id });
      gamesRemoved++;
      console.log(`  ✅ Removed: "${game.title}"`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 INCOMPATIBLE GAMES REMOVAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Games removed: ${gamesRemoved}`);
    console.log('='.repeat(60));
    console.log('✅ Incompatible Games Removal Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Removal failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

removeIncompatibleGames();
