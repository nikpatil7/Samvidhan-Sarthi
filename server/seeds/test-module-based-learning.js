// Test Module-Based Learning Flow
// This script validates the module-based learning structure and functionality
// Run with: node test-module-based-learning.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

async function testModuleBasedLearning() {
  try {
    console.log('🔄 Test Module-Based Learning Flow');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all topics
    const topics = await Topic.find({});
    console.log(`📚 Found ${topics.length} topics`);
    
    const moduleSteps = ['why-it-matters', 'real-life-scenario', 'constitutional-concept', 'case-example', 'interactive-assessment', 'reinforcement-activity', 'key-takeaways'];
    
    let topicsWithCompleteSteps = 0;
    let topicsWithPartialSteps = 0;
    let topicsWithNoSteps = 0;
    
    const topicValidationResults = [];
    
    for (const topic of topics) {
      const topicContent = await Content.find({ topic: topic._id });
      const stepsPresent = new Set();
      
      topicContent.forEach(content => {
        if (content.moduleStep) {
          stepsPresent.add(content.moduleStep);
        }
      });
      
      const hasAllSteps = moduleSteps.every(step => stepsPresent.has(step));
      const hasSomeSteps = stepsPresent.size > 0;
      
      if (hasAllSteps) {
        topicsWithCompleteSteps++;
      } else if (hasSomeSteps) {
        topicsWithPartialSteps++;
      } else {
        topicsWithNoSteps++;
      }
      
      topicValidationResults.push({
        topicTitle: topic.title,
        migrationStatus: topic.migrationStatus,
        stepsPresent: Array.from(stepsPresent),
        stepsMissing: moduleSteps.filter(step => !stepsPresent.has(step)),
        hasAllSteps,
        totalContent: topicContent.length
      });
    }
    
    // Detailed validation report
    console.log('\n' + '='.repeat(60));
    console.log('📊 MODULE-BASED LEARNING VALIDATION REPORT');
    console.log('='.repeat(60));
    console.log(`Topics with complete 7-step journey: ${topicsWithCompleteSteps}/${topics.length}`);
    console.log(`Topics with partial steps: ${topicsWithPartialSteps}/${topics.length}`);
    console.log(`Topics with no module steps: ${topicsWithNoSteps}/${topics.length}`);
    console.log('='.repeat(60));
    
    // Show topics missing steps
    const incompleteTopics = topicValidationResults.filter(t => !t.hasAllSteps);
    if (incompleteTopics.length > 0) {
      console.log('\n📋 Topics Missing Module Steps:');
      incompleteTopics.forEach(topic => {
        console.log(`  ⚠️ "${topic.topicTitle}" (${topic.migrationStatus})`);
        console.log(`     Missing: ${topic.stepsMissing.join(', ')}`);
      });
    }
    
    // Show complete topics
    const completeTopics = topicValidationResults.filter(t => t.hasAllSteps);
    if (completeTopics.length > 0) {
      console.log('\n✅ Topics with Complete 7-Step Journey:');
      completeTopics.forEach(topic => {
        console.log(`  ✅ "${topic.topicTitle}" (${topic.migrationStatus})`);
      });
    }
    
    // Content order validation
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTENT ORDER VALIDATION');
    console.log('='.repeat(60));
    
    let orderIssues = 0;
    for (const topic of topics) {
      const topicContent = await Content.find({ topic: topic._id }).sort({ order: 1 });
      
      const stepOrder = {
        'pre-test': 0,
        'why-it-matters': 1,
        'real-life-scenario': 2,
        'constitutional-concept': 3,
        'case-example': 4,
        'interactive-assessment': 5,
        'reinforcement-activity': 6,
        'key-takeaways': 7,
        'post-test': 8
      };
      
      let previousOrder = -1;
      let topicOrderIssues = false;
      
      topicContent.forEach(content => {
        if (content.moduleStep && stepOrder[content.moduleStep] !== undefined) {
          const expectedOrder = stepOrder[content.moduleStep] * 10;
          if (content.order !== expectedOrder) {
            topicOrderIssues = true;
          }
        }
      });
      
      if (topicOrderIssues) {
        orderIssues++;
        console.log(`  ⚠️ Order issues in: "${topic.title}"`);
      }
    }
    
    if (orderIssues === 0) {
      console.log('  ✅ All content properly ordered by module steps');
    }
    
    console.log('='.repeat(60));
    console.log('✅ Module-Based Learning Flow Test Complete!');
    
    if (topicsWithCompleteSteps === topics.length) {
      console.log('🎉 All topics have complete 7-step experiential learning journey!');
    } else {
      console.log(`📈 ${topicsWithCompleteSteps}/${topics.length} topics have complete learning journey`);
    }
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testModuleBasedLearning();
