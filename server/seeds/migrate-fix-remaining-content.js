// Fix Remaining 6 Content Items for Plain Language
// This script rewrites the specific content items with simpler language
// Run with: node migrate-fix-remaining-content.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function fixRemainingContent() {
  try {
    console.log('🔄 Fix Remaining 6 Content Items for Plain Language');
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
    
    // Specific rewrites for the remaining items
    const contentFixes = {
      'Constitution Structure Spiral': {
        title: 'Constitution Structure',
        content: 'Learn how the Constitution is organized.'
      },
      'Constitutional Timeline': {
        title: 'Constitution History',
        content: 'See key events in constitutional history.'
      },
      'Constitutional Amendments Timeline': {
        title: 'Amendments History',
        content: 'Track important changes to the Constitution.'
      },
      'Landmark Cases Timeline': {
        title: 'Important Cases',
        content: 'Explore major Supreme Court decisions.'
      },
      'Women and Constitution Timeline': {
        title: 'Women\'s Rights',
        content: 'See how women\'s rights have evolved.'
      },
      'Constitutional Rights Scenarios': {
        title: 'Rights Scenarios',
        content: 'Practice applying rights in real situations.'
      }
    };
    
    let contentImproved = 0;
    
    for (const content of needsImprovement) {
      const fix = contentFixes[content.title];
      
      if (fix) {
        const oldTitle = content.title;
        content.title = fix.title;
        content.content = fix.content;
        content.plainLanguageValidated = true;
        await content.save();
        contentImproved++;
        console.log(`  ✅ Fixed: "${fix.title}" (was: "${oldTitle}")`);
      }
    }
    
    // Summary statistics
    const validatedContent = await Content.countDocuments({ plainLanguageValidated: true });
    const stillNeedsImprovement = await Content.countDocuments({ plainLanguageValidated: false });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTENT FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Content improved: ${contentImproved}/${needsImprovement.length}`);
    console.log(`  Total validated content: ${validatedContent}`);
    console.log(`  Content still needs improvement: ${stillNeedsImprovement}`);
    console.log('='.repeat(60));
    console.log('✅ Content Fix Complete!');
    
    if (stillNeedsImprovement === 0) {
      console.log('🎉 All content items now validated for plain language!');
    }
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixRemainingContent();
