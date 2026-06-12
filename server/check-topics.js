// Check what data exists in the database
// Run with: node check-topics.js

require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const Content = require('./models/Content');
const Badge = require('./models/Badge');
const User = require('./models/User');
const Progress = require('./models/Progress');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB:', MONGO_URI);
    console.log('\n' + '='.repeat(60));
    console.log('  DATABASE STATUS CHECK');
    console.log('='.repeat(60));

    // --- Topics ---
    const topicCount = await Topic.countDocuments();
    console.log(`\n📚 TOPICS: ${topicCount}`);
    if (topicCount > 0) {
      const topics = await Topic.find({}).sort({ order: 1 });
      topics.forEach(t => {
        console.log(`   [${t.customId || t._id}] ${t.title} (${t.difficulty}, ${t.country})`);
      });
    } else {
      console.log('   ⚠️ No topics found! Run: node seed-database.js');
    }

    // --- Content ---
    const contentCount = await Content.countDocuments();
    const lessonCount = await Content.countDocuments({ type: 'lesson' });
    const quizCount = await Content.countDocuments({ type: 'quiz' });
    const gameCount = await Content.countDocuments({ type: 'game' });
    console.log(`\n📝 CONTENT: ${contentCount} total`);
    console.log(`   Lessons: ${lessonCount}`);
    console.log(`   Quizzes: ${quizCount}`);
    console.log(`   Games:   ${gameCount}`);

    if (gameCount > 0) {
      const games = await Content.find({ type: 'game' });
      console.log('\n   🎮 Game types:');
      games.forEach(g => {
        const gType = g.gameConfig?.type || 'unknown';
        console.log(`      [${gType}] ${g.title}`);
      });
    }

    // --- Badges ---
    const badgeCount = await Badge.countDocuments();
    console.log(`\n🏆 BADGES: ${badgeCount}`);
    if (badgeCount > 0) {
      const badges = await Badge.find({});
      badges.forEach(b => {
        console.log(`   [${b.rarity}] ${b.name} - ${b.description}`);
      });
    }

    // --- Users ---
    const userCount = await User.countDocuments();
    console.log(`\n👤 USERS: ${userCount}`);

    // --- Progress ---
    const progressCount = await Progress.countDocuments();
    console.log(`📊 PROGRESS ENTRIES: ${progressCount}`);

    console.log('\n' + '='.repeat(60));
    if (topicCount === 0 || contentCount === 0) {
      console.log('⚠️  Database is empty! Run this to seed data:');
      console.log('    cd server');
      console.log('    node seed-database.js');
    } else {
      console.log('✅ Database has data and is ready!');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
  }
}

checkDatabase();
