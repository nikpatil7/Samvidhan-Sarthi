// Phase 3.1: Plain Language Validation
// This script validates content for plain language compliance (8th-10th grade reading level)
// Run with: node migrate-phase3-plain-language-validation.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');

// Plain language validation criteria
const plainLanguageCriteria = {
  // Maximum sentence length (words)
  maxSentenceLength: 20,
  // Maximum syllables per word
  maxSyllablesPerWord: 3,
  // Avoid legal jargon
  legalJargon: [
    'hereinafter', 'therein', 'wherein', 'heretofore', 'aforementioned',
    'notwithstanding', 'pursuant to', 'in accordance with', 'hereby',
    'therewith', 'wherewith', 'hereunder', 'thereunder', 'whereunder',
    'herewith', 'therewith', 'wherewith', 'hereof', 'thereof', 'whereof',
    'hereinbefore', 'thereinbefore', 'whereinbefore', 'hereinafter',
    'thereinafter', 'whereinafter', 'heretofore', 'thertofore', 'wheretofore'
  ],
  // Simple alternatives for complex terms
  simpleAlternatives: {
    'utilize': 'use',
    'implement': 'carry out',
    'facilitate': 'help',
    'demonstrate': 'show',
    'illustrate': 'show',
    'indicate': 'show',
    'constitute': 'make up',
    'establish': 'set up',
    'determine': 'decide',
    'approximately': 'about',
    'subsequently': 'later',
    'consequently': 'as a result',
    'furthermore': 'also',
    'moreover': 'also',
    'therefore': 'so',
    'however': 'but',
    'nevertheless': 'still',
    'nonetheless': 'still'
  }
};

// Count syllables in a word (simplified)
function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Check if text uses legal jargon
function containsLegalJargon(text) {
  const lowerText = text.toLowerCase();
  return plainLanguageCriteria.legalJargon.some(jargon => 
    lowerText.includes(jargon)
  );
}

// Check if text uses complex terms that could be simplified
function containsComplexTerms(text) {
  const lowerText = text.toLowerCase();
  const complexTerms = Object.keys(plainLanguageCriteria.simpleAlternatives);
  return complexTerms.some(term => lowerText.includes(term));
}

// Calculate readability score (simplified Flesch-Kincaid)
function calculateReadabilityScore(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => sum + countSyllables(word), 0) / words.length;
  
  // Simplified Flesch-Kincaid Grade Level
  const score = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  return Math.max(0, score);
}

// Validate content for plain language
function validateContentForPlainLanguage(content) {
  const issues = [];
  
  // Check sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.split(/\s+/).length > plainLanguageCriteria.maxSentenceLength);
  if (longSentences.length > 0) {
    issues.push(`${longSentences.length} sentences exceed ${plainLanguageCriteria.maxSentenceLength} words`);
  }
  
  // Check for legal jargon
  if (containsLegalJargon(content)) {
    issues.push('Contains legal jargon that should be simplified');
  }
  
  // Check for complex terms
  if (containsComplexTerms(content)) {
    issues.push('Contains complex terms that could use simpler alternatives');
  }
  
  // Calculate readability score
  const readabilityScore = calculateReadabilityScore(content);
  if (readabilityScore > 10) {
    issues.push(`Readability score ${readabilityScore.toFixed(1)} exceeds 10th grade level`);
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    readabilityScore: readabilityScore
  };
}

async function validatePlainLanguage() {
  try {
    console.log('🔄 Phase 3.1: Plain Language Validation');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all content
    const allContent = await Content.find({});
    console.log(`📝 Found ${allContent.length} content items to validate`);
    
    let contentValidated = 0;
    let contentNeedsImprovement = 0;
    let validationResults = [];
    
    for (const content of allContent) {
      const validation = validateContentForPlainLanguage(content.content);
      
      validationResults.push({
        title: content.title,
        type: content.type,
        isValid: validation.isValid,
        issues: validation.issues,
        readabilityScore: validation.readabilityScore
      });
      
      // Mark content as validated if it passes criteria
      if (validation.isValid) {
        content.plainLanguageValidated = true;
        await content.save();
        contentValidated++;
        console.log(`  ✅ "${content.title}" - Validated (Grade ${validation.readabilityScore.toFixed(1)})`);
      } else {
        content.plainLanguageValidated = false;
        await content.save();
        contentNeedsImprovement++;
        console.log(`  ⚠️ "${content.title}" - Needs improvement: ${validation.issues.join(', ')}`);
      }
    }
    
    // Summary statistics
    const validatedContent = await Content.countDocuments({ plainLanguageValidated: true });
    const needsImprovement = await Content.countDocuments({ plainLanguageValidated: false });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PLAIN LANGUAGE VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Content validated: ${contentValidated}/${allContent.length}`);
    console.log(`  Content needs improvement: ${contentNeedsImprovement}/${allContent.length}`);
    console.log(`  Total validated in system: ${validatedContent}`);
    console.log(`  Total needs improvement: ${needsImprovement}`);
    
    // Show readability score distribution
    const avgReadability = validationResults.reduce((sum, r) => sum + r.readabilityScore, 0) / validationResults.length;
    console.log(`  Average readability score: ${avgReadability.toFixed(1)} grade level`);
    console.log('='.repeat(60));
    console.log('✅ Phase 3.1 Migration Complete!');
    console.log('📝 Note: Content marked as validated meets plain language criteria');
    console.log('📝 Content needing improvement should be rewritten for 8th-10th grade level');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

validatePlainLanguage();
