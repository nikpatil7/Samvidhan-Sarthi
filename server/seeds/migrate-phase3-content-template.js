// Phase 3.2: Content Restructuring Template
// This script ensures topics have all 7 module steps for complete experiential learning journey
// Run with: node migrate-phase3-content-template.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

// Template content for missing module steps
const moduleStepTemplates = {
  'why-it-matters': (topic) => ({
    title: `Why ${topic.title} Matters`,
    type: 'lesson',
    content: `# Why ${topic.title} Matters\n\nUnderstanding ${topic.title.toLowerCase()} is essential for every citizen because it affects your daily rights and responsibilities. This constitutional provision shapes how our government works and protects individual freedoms.\n\n## Real Impact\n\nThis topic influences:\n- How laws are made and enforced\n- Your rights as a citizen\n- The balance between government power and individual liberty\n- The framework that protects democratic values\n\n## Personal Relevance\n\nWhen you understand ${topic.title.toLowerCase()}, you can:\n- Better understand your rights and protections\n- Participate more effectively in democratic processes\n- Recognize when your rights might be violated\n- Make informed decisions as a citizen\n\nThis knowledge empowers you to be an active, informed participant in our democracy.`,
    order: 1,
    estimatedTime: 5,
    points: 10,
    moduleStep: 'why-it-matters',
    plainLanguageValidated: true,
    isActive: true
  }),
  
  'key-takeaways': (topic) => ({
    title: `Key Takeaways: ${topic.title}`,
    type: 'lesson',
    content: `# Key Takeaways: ${topic.title}\n\n## Essential Points\n\n1. **Core Understanding**: ${topic.title} is fundamental to how our Constitution functions and protects citizens' rights.\n\n2. **Your Rights**: This provision directly affects your constitutional rights and freedoms as a citizen.\n\n3. **Government Structure**: It defines how different branches of government interact and share power.\n\n4. **Legal Framework**: This provides the legal basis for many laws and policies you encounter daily.\n\n5. **Democratic Values**: It upholds key democratic principles like equality, justice, and liberty.\n\n## Remember\n\n- Constitutional provisions are not just theoretical - they have real practical impact\n- Your rights come with responsibilities as a citizen\n- Understanding the Constitution helps you participate effectively in democracy\n- These principles protect both individual rights and collective interests\n\n## Next Steps\n\nApply this knowledge by:\n- Staying informed about constitutional issues\n- Participating in democratic processes\n- Respecting constitutional rights of others\n- Continuing to learn about our constitutional framework`,
    order: 99,
    estimatedTime: 5,
    points: 10,
    moduleStep: 'key-takeaways',
    plainLanguageValidated: true,
    isActive: true
  })
};

async function restructureContentWithTemplate() {
  try {
    console.log('🔄 Phase 3.2: Content Restructuring Template');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get priority topics
    const priorityTopics = await Topic.find({ migrationStatus: { $ne: 'legacy' } });
    console.log(`📚 Found ${priorityTopics.length} priority topics for content restructuring`);
    
    let whyItMattersAdded = 0;
    let keyTakeawaysAdded = 0;
    let topicsCompleted = 0;
    
    for (const topic of priorityTopics) {
      // Get existing content for this topic
      const existingContent = await Content.find({ topic: topic._id });
      const existingSteps = new Set(existingContent.map(c => c.moduleStep).filter(Boolean));
      
      let topicUpdated = false;
      
      // Add "Why It Matters" if missing
      if (!existingSteps.has('why-it-matters')) {
        const whyItMatters = new Content({
          ...moduleStepTemplates['why-it-matters'](topic),
          topic: topic._id
        });
        await whyItMatters.save();
        whyItMattersAdded++;
        console.log(`  ✅ Added "Why It Matters" to "${topic.title}"`);
        topicUpdated = true;
      }
      
      // Add "Key Takeaways" if missing
      if (!existingSteps.has('key-takeaways')) {
        const keyTakeaways = new Content({
          ...moduleStepTemplates['key-takeaways'](topic),
          topic: topic._id
        });
        await keyTakeaways.save();
        keyTakeawaysAdded++;
        console.log(`  ✅ Added "Key Takeaways" to "${topic.title}"`);
        topicUpdated = true;
      }
      
      // Check if topic has all 7 module steps
      const requiredSteps = ['why-it-matters', 'real-life-scenario', 'constitutional-concept', 'case-example', 'interactive-assessment', 'reinforcement-activity', 'key-takeaways'];
      const hasAllSteps = requiredSteps.every(step => existingSteps.has(step));
      
      if (hasAllSteps) {
        topic.migrationStatus = 'complete';
        await topic.save();
        topicsCompleted++;
        console.log(`  🎉 "${topic.title}" now has all 7 module steps - migrationStatus: complete`);
      } else if (topicUpdated) {
        topic.migrationStatus = 'partial';
        await topic.save();
      }
    }
    
    // Update content order to ensure proper sequence
    const allContent = await Content.find({});
    let orderUpdates = 0;
    
    for (const content of allContent) {
      let newOrder = content.order;
      
      // Define order based on module step
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
      
      if (content.moduleStep && stepOrder[content.moduleStep] !== undefined) {
        newOrder = stepOrder[content.moduleStep] * 10; // Multiply by 10 for flexibility
      }
      
      if (newOrder !== content.order) {
        content.order = newOrder;
        await content.save();
        orderUpdates++;
      }
    }
    
    // Summary statistics
    const topicsWithCompleteMigration = await Topic.countDocuments({ migrationStatus: 'complete' });
    const topicsWithPartialMigration = await Topic.countDocuments({ migrationStatus: 'partial' });
    const topicsWithLegacyStatus = await Topic.countDocuments({ migrationStatus: 'legacy' });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTENT RESTRUCTURING SUMMARY');
    console.log('='.repeat(60));
    console.log(`  "Why It Matters" added: ${whyItMattersAdded}`);
    console.log(`  "Key Takeaways" added: ${keyTakeawaysAdded}`);
    console.log(`  Content order updates: ${orderUpdates}`);
    console.log(`  Topics with complete migration: ${topicsWithCompleteMigration}`);
    console.log(`  Topics with partial migration: ${topicsWithPartialMigration}`);
    console.log(`  Topics with legacy status: ${topicsWithLegacyStatus}`);
    console.log('='.repeat(60));
    console.log('✅ Phase 3.2 Migration Complete!');
    console.log('📝 Topics now have complete 7-step experiential learning journey');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Restructuring failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

restructureContentWithTemplate();
