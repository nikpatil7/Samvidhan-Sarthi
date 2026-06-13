// Check Remaining Content Items That Need Plain Language Improvement
// This script identifies the exact content items that still need improvement
// Run with: node check-remaining-content.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function checkRemainingContent() {
  try {
    console.log('🔄 Check Remaining Content Items');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get content that still needs improvement
    const needsImprovement = await Content.find({ plainLanguageValidated: false });
    console.log(`📝 Found ${needsImprovement.length} content items still needing improvement`);
    
    if (needsImprovement.length === 0) {
      console.log('✅ All content items already validated!');
      await mongoose.connection.close();
      return;
    }
    
    console.log('\n📋 Content Items Needing Improvement:');
    needsImprovement.forEach((content, index) => {
      console.log(`  ${index + 1}. Title: "${content.title}"`);
      console.log(`     Type: ${content.type}`);
      console.log(`     Content length: ${content.content ? content.content.length : 0} chars`);
      console.log(`     Module Step: ${content.moduleStep || 'N/A'}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkRemainingContent();
