// Check existing game structure to understand frontend expectations
// Run with: node check-game-structure.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function checkGameStructure() {
  try {
    console.log('🔄 Check Existing Game Structure');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get existing games
    const existingGames = await Content.find({ type: 'game', gameConfig: { $exists: true, $ne: null } }).limit(5);
    console.log(`📝 Found ${existingGames.length} existing games`);
    
    existingGames.forEach((game, index) => {
      console.log(`\n${index + 1}. ${game.title}`);
      console.log(`   Type: ${game.gameConfig?.type || 'unknown'}`);
      console.log(`   Structure: ${JSON.stringify(game.gameConfig, null, 2).substring(0, 200)}...`);
    });
    
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkGameStructure();
