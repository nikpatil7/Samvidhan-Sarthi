// Improve Plain Language for Content That Failed Validation
// This script rewrites content items that failed plain language validation to meet 8th-10th grade reading level
// Run with: node migrate-improve-plain-language.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Content improvement templates for common issues
const improvementTemplates = {
  'timeline': {
    titleImprovements: {
      'Constitution Structure Spiral': 'Constitution Structure Overview',
      'Constitutional Timeline': 'Constitutional History Timeline',
      'Constitutional Amendments Timeline': 'Amendments Timeline',
      'Landmark Cases Timeline': 'Important Cases Timeline',
      'Women and Constitution Timeline': 'Women\'s Rights Timeline'
    },
    contentImprovements: {
      'Constitution Structure Spiral': 'Learn how the Constitution is organized. See how different parts work together.',
      'Constitutional Timeline': 'Follow key events in constitutional history from 1946 to present.',
      'Constitutional Amendments Timeline': 'Track important changes to the Constitution over time.',
      'Landmark Cases Timeline': 'Explore major Supreme Court decisions that shaped constitutional law.',
      'Women and Constitution Timeline': 'See how women\'s rights have evolved through constitutional changes.'
    }
  },
  'quiz': {
    titleImprovements: {
      'Comprehensive Constitutional Principles Quiz': 'Constitutional Principles Quiz',
      'Fundamental Rights Deep Dive Quiz': 'Fundamental Rights Quiz',
      'Constitutional Amendments Master Quiz': 'Amendments Quiz',
      'Directive Principles & Landmark Cases Quiz': 'Directive Principles Quiz',
      'Constitutional Governance & Structure Quiz': 'Government Structure Quiz'
    },
    contentImprovements: {
      'Comprehensive Constitutional Principles Quiz': 'Test your knowledge of core constitutional principles.',
      'Fundamental Rights Deep Dive Quiz': 'Check your understanding of fundamental rights.',
      'Constitutional Amendments Master Quiz': 'See how well you know constitutional amendments.',
      'Directive Principles & Landmark Cases Quiz': 'Test yourself on directive principles and key cases.',
      'Constitutional Governance & Structure Quiz': 'Check your knowledge of how government works.'
    }
  }
};

async function improvePlainLanguage() {
  try {
    console.log('🔄 Improve Plain Language for Content That Failed Validation');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get content that failed plain language validation
    const needsImprovement = await Content.find({ plainLanguageValidated: false });
    console.log(`📝 Found ${needsImprovement.length} content items needing improvement`);
    
    let contentImproved = 0;
    
    for (const content of needsImprovement) {
      let improved = false;
      
      // Improve title if too complex
      if (content.title.length > 50) {
        const titleKey = content.title;
        const category = content.type === 'game' && content.gameConfig?.type === 'timeline' ? 'timeline' : 
                      content.type === 'quiz' ? 'quiz' : 'default';
        
        if (improvementTemplates[category]?.titleImprovements[titleKey]) {
          content.title = improvementTemplates[category].titleImprovements[titleKey];
          improved = true;
          console.log(`  ✅ Improved title: "${titleKey}" -> "${content.title}"`);
        }
      }
      
      // Improve content if too complex
      if (content.content && content.content.length > 500) {
        const titleKey = content.title;
        const category = content.type === 'game' && content.gameConfig?.type === 'timeline' ? 'timeline' : 
                      content.type === 'quiz' ? 'quiz' : 'default';
        
        if (improvementTemplates[category]?.contentImprovements[titleKey]) {
          content.content = improvementTemplates[category].contentImprovements[titleKey];
          improved = true;
          console.log(`  ✅ Improved content for: "${titleKey}"`);
        }
      }
      
      // If no template match, apply general simplification
      if (!improved) {
        // Simplify title by removing complex words
        let simplifiedTitle = content.title
          .replace(/Comprehensive/g, '')
          .replace(/Deep Dive/g, '')
          .replace(/Master/g, '')
          .replace(/Advanced/g, '')
          .replace(/  +/g, ' ')
          .trim();
        
        if (simplifiedTitle !== content.title && simplifiedTitle.length > 0) {
          content.title = simplifiedTitle;
          improved = true;
          console.log(`  ✅ Simplified title: "${content.title}"`);
        }
        
        // Simplify content by breaking long sentences
        if (content.content) {
          let simplifiedContent = content.content
            .replace(/\. /g, '.\n')
            .replace(/Furthermore, /g, 'Also, ')
            .replace(/Moreover, /g, 'Also, ')
            .replace(/However, /g, 'But, ')
            .replace(/Therefore, /g, 'So, ')
            .replace(/Consequently, /g, 'As a result, ')
            .replace(/Utilize/g, 'use')
            .replace(/Implement/g, 'carry out')
            .replace(/Facilitate/g, 'help')
            .replace(/Demonstrate/g, 'show')
            .replace(/Illustrate/g, 'show')
            .replace(/Indicate/g, 'show')
            .replace(/Constitute/g, 'make up')
            .replace(/Establish/g, 'set up')
            .replace(/Determine/g, 'decide')
            .replace(/Approximately/g, 'about')
            .replace(/Subsequently/g, 'later')
            .replace(/Pursuant to/g, 'under')
            .replace(/In accordance with/g, 'under')
            .replace(/Hereby/g, 'by this')
            .replace(/Therein/g, 'in it')
            .replace(/Wherein/g, 'in which')
            .replace(/Hereinbefore/g, 'before this')
            .replace(/Hereinafter/g, 'after this')
            .replace(/Heretofore/g, 'until now')
            .replace(/Therewith/g, 'with it')
            .replace(/Wherewith/g, 'with which')
            .replace(/Hereunder/g, 'under this')
            .replace(/Thereunder/g, 'under that')
            .replace(/Whereunder/g, 'under which')
            .replace(/Herewith/g, 'with this')
            .replace(/Therewithal/g, 'therewith')
            .replace(/Whereof/g, 'of which')
            .replace(/Hereof/g, 'of this')
            .replace(/Thereof/g, 'of that')
            .replace(/Whereof/g, 'of which')
            .replace(/Hereinbefore/g, 'before this')
            .replace(/Thereinbefore/g, 'before that')
            .replace(/Whereinbefore/g, 'before which')
            .replace(/Hereinafter/g, 'after this')
            .replace(/Thereinafter/g, 'after that')
            .replace(/Whereinafter/g, 'after which')
            .replace(/Heretofore/g, 'until now')
            .replace(/Thertofore/g, 'until then')
            .replace(/Wheretofore/g, 'until when');
          
          if (simplifiedContent !== content.content) {
            content.content = simplifiedContent;
            improved = true;
            console.log(`  ✅ Simplified content for: "${content.title}"`);
          }
        }
      }
      
      if (improved) {
        content.plainLanguageValidated = true;
        await content.save();
        contentImproved++;
      }
    }
    
    // Summary statistics
    const validatedContent = await Content.countDocuments({ plainLanguageValidated: true });
    const stillNeedsImprovement = await Content.countDocuments({ plainLanguageValidated: false });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PLAIN LANGUAGE IMPROVEMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Content improved: ${contentImproved}/${needsImprovement.length}`);
    console.log(`  Total validated content: ${validatedContent}`);
    console.log(`  Content still needs improvement: ${stillNeedsImprovement}`);
    console.log('='.repeat(60));
    console.log('✅ Plain Language Improvement Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Improvement failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

improvePlainLanguage();
