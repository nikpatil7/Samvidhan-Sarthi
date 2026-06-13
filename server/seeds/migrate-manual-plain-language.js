// Manual Rewrite of Remaining 6 Content Items for Plain Language
// This script manually rewrites the final content items with proper plain language
// Run with: node migrate-manual-plain-language.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

async function manualRewritePlainLanguage() {
  try {
    console.log('🔄 Manual Rewrite of Remaining 6 Content Items');
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
    
    // Manual rewrites for remaining items
    const manualRewrites = {
      'Directive Principles & Landmark Cases Quiz': {
        title: 'Policy and Cases Quiz',
        content: 'Test your knowledge of policy guidelines and important court cases.'
      },
      'Constitutional Governance & Structure Quiz': {
        title: 'Government Structure Quiz',
        content: 'Check your understanding of how the government is organized.'
      },
      'Constitutional Principles Quiz': {
        title: 'Core Principles Quiz',
        content: 'Test your knowledge of the main constitutional principles.'
      },
      'Fundamental Rights Quiz': {
        title: 'Basic Rights Quiz',
        content: 'Check your understanding of fundamental rights.'
      },
      'Constitutional Amendments Quiz': {
        title: 'Constitution Changes Quiz',
        content: 'See how well you know the changes made to the Constitution.'
      },
      'Constitutional Concepts': {
        title: 'Constitution Ideas',
        content: 'Learn the key ideas that shape our Constitution.'
      }
    };
    
    let contentImproved = 0;
    
    for (const content of needsImprovement) {
      const rewrite = manualRewrites[content.title];
      
      if (rewrite) {
        content.title = rewrite.title;
        if (rewrite.content && content.content) {
          content.content = rewrite.content;
        }
        content.plainLanguageValidated = true;
        await content.save();
        contentImproved++;
        console.log(`  ✅ Rewritten: "${content.title}"`);
      }
    }
    
    // Summary statistics
    const validatedContent = await Content.countDocuments({ plainLanguageValidated: true });
    const stillNeedsImprovement = await Content.countDocuments({ plainLanguageValidated: false });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MANUAL PLAIN LANGUAGE REWRITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Content improved: ${contentImproved}/${needsImprovement.length}`);
    console.log(`  Total validated content: ${validatedContent}`);
    console.log(`  Content still needs improvement: ${stillNeedsImprovement}`);
    console.log('='.repeat(60));
    console.log('✅ Manual Plain Language Rewrite Complete!');
    
    if (stillNeedsImprovement === 0) {
      console.log('🎉 All content items now validated for plain language!');
    } else {
      console.log(`⚠️ ${stillNeedsImprovement} items still need manual review`);
    }
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Rewrite failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

manualRewritePlainLanguage();
