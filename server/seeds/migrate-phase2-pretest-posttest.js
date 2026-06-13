// Phase 2.3: Pre-Test/Post-Test Integration
// This script adds pre-test and post-test functionality to topics
// Run with: node migrate-phase2-pretest-posttest.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

// Pre-test questions for different topic categories
const preTestQuestions = {
  'fundamental-rights': [
    {
      question: 'What are Fundamental Rights?',
      options: [
        { text: 'Rights guaranteed by the Constitution to all citizens', isCorrect: true },
        { text: 'Rights that can be taken away by the government', isCorrect: false },
        { text: 'Rights only for government officials', isCorrect: false },
        { text: 'Rights that are optional to follow', isCorrect: false }
      ],
      explanation: 'Fundamental Rights are basic rights guaranteed by the Constitution to all citizens, protecting individual liberties and freedoms.',
      questionType: 'recall'
    },
    {
      question: 'Which article deals with Right to Equality?',
      options: [
        { text: 'Article 19', isCorrect: false },
        { text: 'Article 14-18', isCorrect: true },
        { text: 'Article 21', isCorrect: false },
        { text: 'Article 32', isCorrect: false }
      ],
      explanation: 'Articles 14-18 deal with Right to Equality, including equality before law and prohibition of discrimination.',
      questionType: 'recall'
    },
    {
      question: 'Can Fundamental Rights be suspended during emergency?',
      options: [
        { text: 'All Fundamental Rights can be suspended', isCorrect: false },
        { text: 'Only Article 19 can be suspended, Articles 20-21 cannot', isCorrect: true },
        { text: 'No Fundamental Rights can be suspended', isCorrect: false },
        { text: 'Only the President decides which rights to suspend', isCorrect: false }
      ],
      explanation: 'During National Emergency, Article 19 can be suspended, but Articles 20 (protection in respect of conviction) and 21 (protection of life) cannot be suspended.',
      questionType: 'application'
    }
  ],
  'default': [
    {
      question: 'What is the primary purpose of this constitutional topic?',
      options: [
        { text: 'To provide a framework for governance and rights', isCorrect: true },
        { text: 'To restrict citizen freedoms', isCorrect: false },
        { text: 'To give unlimited power to the government', isCorrect: false },
        { text: 'To serve as historical document only', isCorrect: false }
      ],
      explanation: 'Constitutional topics provide the framework for governance, define rights and duties, and establish the structure of government.',
      questionType: 'recall'
    },
    {
      question: 'How does this topic affect daily life of citizens?',
      options: [
        { text: 'It has no practical impact', isCorrect: false },
        { text: 'It provides rights and protections that affect citizens directly', isCorrect: true },
        { text: 'It only applies during elections', isCorrect: false },
        { text: 'It is only relevant for lawyers', isCorrect: false }
      ],
      explanation: 'Constitutional provisions create the legal framework that governs rights, duties, and governance, directly impacting citizens\' daily lives.',
      questionType: 'application'
    },
    {
      question: 'What happens if constitutional provisions are violated?',
      options: [
        { text: 'Nothing happens', isCorrect: false },
        { text: 'Citizens can approach courts for constitutional remedies', isCorrect: true },
        { text: 'Only the government can take action', isCorrect: false },
        { text: 'The Constitution becomes invalid', isCorrect: false }
      ],
      explanation: 'Citizens can approach courts (Supreme Court under Article 32 or High Courts under Article 226) for constitutional remedies if their rights are violated.',
      questionType: 'application'
    }
  ]
};

async function integratePreTestPostTest() {
  try {
    console.log('🔄 Phase 2.3: Pre-Test/Post-Test Integration');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Add pre/post tests for all active topics in the learning journey
    const priorityTopics = await Topic.find({ isActive: true });
    console.log(`📚 Found ${priorityTopics.length} topics for pre-test/post-test integration`);
    
    let preTestsCreated = 0;
    let postTestsCreated = 0;
    
    for (const topic of priorityTopics) {
      // Check if pre-test already exists
      const existingPreTest = await Content.findOne({ 
        topic: topic._id, 
        type: 'quiz',
        moduleStep: 'pre-test'
      });
      
      if (!existingPreTest) {
        // Get appropriate questions based on topic category
        const questions = preTestQuestions[topic.category] || preTestQuestions['default'];
        
        const preTest = new Content({
          topic: topic._id,
          title: `Pre-Test: ${topic.title}`,
          type: 'quiz',
          content: 'This pre-test assesses your current understanding of this topic. Your results will be compared with your post-test score to measure learning improvement.',
          order: 0, // Pre-test should come first
          estimatedTime: 5,
          points: 10,
          moduleStep: 'pre-test',
          quiz: {
            questions: questions
          },
          isActive: true
        });
        
        await preTest.save();
        preTestsCreated++;
        console.log(`  ✅ Created pre-test for "${topic.title}"`);
      }
      
      // Check if post-test already exists
      const existingPostTest = await Content.findOne({ 
        topic: topic._id, 
        type: 'quiz',
        moduleStep: 'post-test'
      });
      
      if (!existingPostTest) {
        // Get appropriate questions based on topic category (can use same as pre-test for now)
        const questions = preTestQuestions[topic.category] || preTestQuestions['default'];
        
        const postTest = new Content({
          topic: topic._id,
          title: `Post-Test: ${topic.title}`,
          type: 'quiz',
          content: 'This post-test assesses your understanding after completing the learning journey. Compare your score with your pre-test to see your improvement.',
          order: 999, // Post-test should come last
          estimatedTime: 5,
          points: 20,
          moduleStep: 'post-test',
          quiz: {
            questions: questions
          },
          isActive: true
        });
        
        await postTest.save();
        postTestsCreated++;
        console.log(`  ✅ Created post-test for "${topic.title}"`);
      }
    }
    
    // Update existing content order to make room for pre-test and post-test
    const allContent = await Content.find({});
    let orderUpdates = 0;
    
    for (const content of allContent) {
      if (content.moduleStep === 'pre-test') {
        content.order = 0;
        await content.save();
        orderUpdates++;
      } else if (content.moduleStep === 'post-test') {
        content.order = 999;
        await content.save();
        orderUpdates++;
      } else if (content.order === 0 || content.order === 999) {
        // Move other content that might have conflicting order
        content.order = content.order + 1;
        await content.save();
        orderUpdates++;
      }
    }
    
    // Summary statistics
    const totalPreTests = await Content.countDocuments({ moduleStep: 'pre-test' });
    const totalPostTests = await Content.countDocuments({ moduleStep: 'post-test' });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRE-TEST/POST-TEST INTEGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Pre-tests created: ${preTestsCreated}`);
    console.log(`  Post-tests created: ${postTestsCreated}`);
    console.log(`  Content order updates: ${orderUpdates}`);
    console.log(`  Total pre-tests in system: ${totalPreTests}`);
    console.log(`  Total post-tests in system: ${totalPostTests}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 2.3 Migration Complete!');
    console.log('📝 Note: UI integration needed to display pre-test/post-test and calculate improvement');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

integratePreTestPostTest();
