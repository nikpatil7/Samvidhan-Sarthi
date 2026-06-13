// Phase 1.1: Content Classification Migration
// This script migrates existing content to moduleStep structure
// Run with: node migrate-phase1-content-classification.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

// Priority topics for migration (from phase1_content.md)
const PRIORITY_TOPICS = [
  'Preamble',
  'Fundamental Rights', 
  'Directive Principles',
  'Fundamental Duties',
  'Right to Equality',
  'Right to Freedom',
  'Union Government',
  'Judiciary',
  'Emergency Provisions',
  'Basic Structure Doctrine'
];

// Module step mapping based on content type and order
function getModuleStepForContent(content, index, totalContent) {
  const { type, title, order } = content;
  
  // For existing content, map to module steps based on type and order
  if (type === 'lesson') {
    if (title.toLowerCase().includes('introduction')) {
      return 'constitutional-concept'; // Main lesson content
    }
    if (title.toLowerCase().includes('why') || title.toLowerCase().includes('matters')) {
      return 'why-it-matters';
    }
    return 'constitutional-concept';
  }
  
  if (type === 'quiz') {
    return 'interactive-assessment';
  }
  
  if (type === 'game') {
    // Check game config type
    if (content.gameConfig && content.gameConfig.type === 'scenario') {
      if (title.toLowerCase().includes('scenario') || title.toLowerCase().includes('rights')) {
        return 'real-life-scenario';
      }
      if (title.toLowerCase().includes('case') || title.toLowerCase().includes('judgment')) {
        return 'case-example';
      }
      return 'real-life-scenario';
    }
    return 'reinforcement-activity';
  }
  
  // Default for other types
  return 'constitutional-concept';
}

// Classify quiz questions as recall vs application
function classifyQuestion(question) {
  const questionText = question.question.toLowerCase();
  
  // Recall indicators: article numbers, specific dates, factual recall
  const recallIndicators = [
    'which article',
    'article number',
    'what year',
    'when was',
    'who was',
    'how many',
    'list of',
    'name the',
    'what is called',
    'amendment number'
  ];
  
  // Application indicators: scenarios, reasoning, application, constitutional principles
  const applicationIndicators = [
    'scenario',
    'situation',
    'case',
    'would you rule',
    'constitutional principle',
    'how would',
    'which principle',
    'apply',
    'reasoning',
    'real-world',
    'practical',
    'violate',
    'constitutional'
  ];
  
  // Check for application indicators first
  const hasApplicationIndicator = applicationIndicators.some(indicator => 
    questionText.includes(indicator)
  );
  
  if (hasApplicationIndicator) {
    return 'application';
  }
  
  // Check for recall indicators
  const hasRecallIndicator = recallIndicators.some(indicator => 
    questionText.includes(indicator)
  );
  
  if (hasRecallIndicator) {
    return 'recall';
  }
  
  // Default to recall for existing questions
  return 'recall';
}

async function migrateContentClassification() {
  try {
    console.log('🔄 Phase 1.1: Content Classification Migration');
    console.log('='.repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all topics
    const topics = await Topic.find({});
    console.log(`📚 Found ${topics.length} topics`);
    
    // Mark all topics for module-step migration (not just title-matched priority list)
    let topicsMarkedPartial = 0;
    for (const topic of topics) {
      if (topic.migrationStatus !== 'complete') {
        topic.migrationStatus = 'partial';
        await topic.save();
        topicsMarkedPartial++;
      }
    }
    console.log(`✅ Marked ${topicsMarkedPartial} topics with migrationStatus: 'partial'`);
    
    // Get all content
    const allContent = await Content.find({});
    console.log(`📝 Found ${allContent.length} content items`);
    
    // Migrate content to moduleStep structure
    let contentMigrationCount = 0;
    let questionClassificationCount = 0;
    
    for (const content of allContent) {
      let needsUpdate = false;
      
      // Set moduleStep if not already set
      if (!content.moduleStep) {
        const topicContents = await Content.find({ topic: content.topic }).sort({ order: 1 });
        const contentIndex = topicContents.findIndex(c => c._id.toString() === content._id.toString());
        
        content.moduleStep = getModuleStepForContent(content, contentIndex, topicContents.length);
        needsUpdate = true;
        contentMigrationCount++;
      }
      
      // Classify quiz questions if not already classified
      if (content.quiz && content.quiz.questions) {
        for (const question of content.quiz.questions) {
          if (!question.questionType) {
            question.questionType = classifyQuestion(question);
            needsUpdate = true;
            questionClassificationCount++;
          }
        }
      }
      
      if (needsUpdate) {
        await content.save();
      }
    }
    
    console.log(`✅ Migrated ${contentMigrationCount} content items to moduleStep structure`);
    console.log(`✅ Classified ${questionClassificationCount} quiz questions as recall/application`);
    
    // Summary statistics
    const contentWithModuleStep = await Content.countDocuments({ moduleStep: { $exists: true, $ne: null } });
    const contentWithQuestionType = await Content.countDocuments({ 'quiz.questions.questionType': { $exists: true } });
    const topicsWithMigrationStatus = await Topic.countDocuments({ migrationStatus: { $exists: true, $ne: null } });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Content with moduleStep: ${contentWithModuleStep}/${allContent.length}`);
    console.log(`  Content with questionType: ${contentWithQuestionType}/${allContent.length}`);
    console.log(`  Topics with migrationStatus: ${topicsWithMigrationStatus}/${topics.length}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 1.1 Migration Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateContentClassification();
