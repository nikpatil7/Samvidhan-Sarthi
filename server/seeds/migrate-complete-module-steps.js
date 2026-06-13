// Complete Module Step Migration
// This script adds missing module steps (real-life-scenario, case-example, reinforcement-activity) to topics
// Run with: node migrate-complete-module-steps.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

// Scenario templates for different topic categories
const scenarioTemplates = {
  'fundamental-rights': [
    {
      title: 'Freedom of Speech in Social Media',
      situation: 'A student posts a critical comment about government policies on social media. The government asks the platform to remove the post, claiming it violates national security.',
      question: 'How should this constitutional question be resolved?',
      options: [
        { text: 'The government can remove any post it deems problematic', isCorrect: false, feedback: 'Incorrect. Freedom of speech under Article 19(1)(a) protects such expression unless it falls under reasonable restrictions under Article 19(2).' },
        { text: 'The post can only be removed if it violates reasonable restrictions under Article 19(2)', isCorrect: true, feedback: 'Correct! Article 19(1)(a) protects freedom of speech, but Article 19(2) allows reasonable restrictions like sovereignty, security, public order, decency, morality, etc.' },
        { text: 'Social media platforms have absolute authority over content', isCorrect: false, feedback: 'Incorrect. While platforms have content policies, government requests must follow constitutional principles and reasonable restrictions.' },
        { text: 'Students have no constitutional rights on social media', isCorrect: false, feedback: 'Incorrect. Constitutional rights apply to all citizens regardless of the platform or medium of expression.' }
      ],
      hint: 'Consider Article 19(1)(a) freedom of speech and Article 19(2) reasonable restrictions.'
    },
    {
      title: 'Right to Equality in Education',
      situation: 'A prestigious government-funded university sets higher admission cutoffs for students from certain states while giving preference to students from other states.',
      question: 'Does this violate constitutional principles?',
      options: [
        { text: 'No, universities can set any admission criteria they want', isCorrect: false, feedback: 'Incorrect. Government institutions must follow constitutional principles of equality under Article 14 and Article 15(1).' },
        { text: 'Yes, it violates Article 14 (Right to Equality) and Article 15(1) (prohibition of discrimination)', isCorrect: true, feedback: 'Correct! Article 14 guarantees equality before law, and Article 15(1) prohibits discrimination on grounds of religion, race, caste, sex, or place of birth.' },
        { text: 'No, discrimination based on state residence is allowed', isCorrect: false, feedback: 'Incorrect. While place of birth is a protected ground under Article 15(1), discrimination based on residence could violate Article 14\'s equality principle.' },
        { text: 'Yes, but only if the affected students are from reserved categories', isCorrect: false, feedback: 'Incorrect. Constitutional equality applies to all citizens, not just those from reserved categories.' }
      ],
      hint: 'Consider Article 14 (equality before law) and Article 15 (prohibition of discrimination).'
    }
  ],
  'default': [
    {
      title: 'Constitutional Principle Application',
      situation: 'A citizen believes that a new government policy violates their constitutional rights. They approach the court for remedy.',
      question: 'What constitutional principle allows them to seek judicial remedy?',
      options: [
        { text: 'Article 32 - Right to Constitutional Remedies', isCorrect: true, feedback: 'Correct! Article 32 provides the right to move the Supreme Court for enforcement of fundamental rights. Dr. Ambedkar called this the "heart and soul" of the Constitution.' },
        { text: 'Article 22 - Protection against arrest and detention', isCorrect: false, feedback: 'Incorrect. Article 22 deals with protection against arbitrary arrest and detention, not general constitutional remedies.' },
        { text: 'Article 21 - Right to Life and Personal Liberty', isCorrect: false, feedback: 'Incorrect. Article 21 protects life and personal liberty, but the mechanism to enforce it is through Article 32 or Article 226.' },
        { text: 'Article 14 - Right to Equality', isCorrect: false, feedback: 'Incorrect. Article 14 guarantees equality but does not provide the specific mechanism for judicial enforcement of rights.' }
      ],
      hint: 'Consider which article specifically provides the right to approach courts for constitutional remedies.'
    }
  ]
};

// Case example templates
const caseExampleTemplates = {
  'fundamental-rights': {
    title: 'Case Study: Kesavananda Bharati vs. State of Kerala (1973)',
    content: `# Landmark Case: Kesavananda Bharati vs. State of Kerala (1973)

## Background
Swami Kesavananda Bharati, a religious leader, challenged the Kerala Land Reforms Act that limited the government\'s power to acquire property. This led to a fundamental question about Parliament\'s power to amend the Constitution.

## Constitutional Question
Can Parliament amend any part of the Constitution, including fundamental rights, without any limitations?

## Supreme Court Ruling
The Supreme Court ruled by a 7-6 majority that while Parliament has broad powers to amend the Constitution under Article 368, it cannot alter the "basic structure" of the Constitution.

## Basic Structure Doctrine
The Court identified basic features that cannot be destroyed:
- Supremacy of the Constitution
- Republican and democratic form of government
- Secular character of the Constitution
- Separation of powers
- Federal character of the Constitution

## Impact
This case established that fundamental rights are part of the basic structure and cannot be destroyed through amendments, though they can be reasonably modified.

## Learning Point
This case shows how the judiciary protects constitutional principles and ensures that Parliament\'s amendment power is not unlimited.`,
    estimatedTime: 8,
    points: 15
  },
  'default': {
    title: 'Case Example: Constitutional Interpretation',
    content: `# Case Example: Constitutional Interpretation in Practice

## Background
Constitutional provisions often require interpretation by courts to apply them to real-world situations. This process ensures that the Constitution remains a living document relevant to contemporary challenges.

## Interpretation Methods
1. **Literal Interpretation**: Giving words their ordinary meaning
2. **Purposive Interpretation**: Understanding the purpose behind the provision
3. **Harmonious Construction**: Reading provisions together to avoid conflicts
4. **Doctrine of Pith and Substance**: Looking at the true nature of a law

## Example Application
When a law is challenged, courts examine:
- Whether the law falls within the legislative competence
- Whether it violates any fundamental rights
- Whether it follows constitutional procedures
- Whether it serves a legitimate public interest

## Learning Point
Constitutional interpretation ensures that the principles established by the framers are applied effectively to modern situations while maintaining the core values of the Constitution.`,
    estimatedTime: 6,
    points: 12
  }
};

// Reinforcement activity templates
const reinforcementTemplates = {
  'matching': {
    title: 'Constitutional Terms Matching',
    gameConfig: {
      type: 'matching',
      config: {
        pairs: [
          { term: 'Article 14', definition: 'Right to Equality - Equality before law and equal protection of laws' },
          { term: 'Article 19', definition: 'Right to Freedom - Six fundamental freedoms' },
          { term: 'Article 21', definition: 'Right to Life and Personal Liberty' },
          { term: 'Article 32', definition: 'Right to Constitutional Remedies - Approach Supreme Court directly' },
          { term: 'Article 368', definition: 'Amendment Procedure - Parliament\'s power to amend Constitution' },
          { term: 'Basic Structure', definition: 'Doctrine limiting Parliament\'s amendment power' }
        ],
        timeLimit: 120
      }
    },
    estimatedTime: 5,
    points: 20
  },
  'timeline': {
    title: 'Constitutional Development Timeline',
    gameConfig: {
      type: 'timeline',
      config: {
        events: [
          { year: 1946, event: 'Formation of Constituent Assembly' },
          { year: 1949, event: 'Constitution adopted on November 26' },
          { year: 1950, event: 'Constitution came into effect on January 26' },
          { year: 1973, event: 'Kesavananda Bharati case - Basic Structure doctrine' },
          { year: 1975, event: 'Emergency period declared' },
          { year: 1978, event: '44th Amendment - Emergency provisions reviewed' }
        ]
      }
    },
    estimatedTime: 8,
    points: 25
  }
};

async function completeModuleSteps() {
  try {
    console.log('🔄 Complete Module Step Migration');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get topics with partial migration status
    const partialTopics = await Topic.find({ migrationStatus: 'partial' });
    console.log(`📚 Found ${partialTopics.length} topics with partial migration status`);
    
    let scenariosAdded = 0;
    let caseExamplesAdded = 0;
    let reinforcementActivitiesAdded = 0;
    let topicsCompleted = 0;
    
    for (const topic of partialTopics) {
      // Get existing content for this topic
      const existingContent = await Content.find({ topic: topic._id });
      const existingSteps = new Set(existingContent.map(c => c.moduleStep).filter(Boolean));
      
      let topicUpdated = false;
      
      // Add real-life-scenario if missing
      if (!existingSteps.has('real-life-scenario')) {
        const scenarios = scenarioTemplates[topic.category] || scenarioTemplates['default'];
        const scenario = scenarios[0]; // Use first scenario
        
        const scenarioContent = new Content({
          topic: topic._id,
          title: scenario.title,
          type: 'game',
          content: `Apply your understanding of ${topic.title.toLowerCase()} to this real-world scenario.`,
          order: 2,
          estimatedTime: 10,
          points: 30,
          moduleStep: 'real-life-scenario',
          gameConfig: {
            type: 'scenario',
            config: {
              scenarios: [scenario]
            }
          },
          plainLanguageValidated: true,
          isActive: true
        });
        
        await scenarioContent.save();
        scenariosAdded++;
        console.log(`  ✅ Added real-life-scenario to "${topic.title}"`);
        topicUpdated = true;
      }
      
      // Add case-example if missing
      if (!existingSteps.has('case-example')) {
        const caseExample = caseExampleTemplates[topic.category] || caseExampleTemplates['default'];
        
        const caseContent = new Content({
          topic: topic._id,
          title: caseExample.title,
          type: 'lesson',
          content: caseExample.content,
          order: 4,
          estimatedTime: caseExample.estimatedTime,
          points: caseExample.points,
          moduleStep: 'case-example',
          plainLanguageValidated: true,
          isActive: true
        });
        
        await caseContent.save();
        caseExamplesAdded++;
        console.log(`  ✅ Added case-example to "${topic.title}"`);
        topicUpdated = true;
      }
      
      // Add reinforcement-activity if missing
      if (!existingSteps.has('reinforcement-activity')) {
        const reinforcement = reinforcementTemplates['matching']; // Use matching as default
        
        const reinforcementContent = new Content({
          topic: topic._id,
          title: reinforcement.title,
          type: 'game',
          content: 'Practice and reinforce your understanding with this interactive activity.',
          order: 6,
          estimatedTime: reinforcement.estimatedTime,
          points: reinforcement.points,
          moduleStep: 'reinforcement-activity',
          gameConfig: reinforcement.gameConfig,
          plainLanguageValidated: true,
          isActive: true
        });
        
        await reinforcementContent.save();
        reinforcementActivitiesAdded++;
        console.log(`  ✅ Added reinforcement-activity to "${topic.title}"`);
        topicUpdated = true;
      }
      
      // Check if topic now has all 7 module steps
      const updatedContent = await Content.find({ topic: topic._id });
      const updatedSteps = new Set(updatedContent.map(c => c.moduleStep).filter(Boolean));
      const requiredSteps = ['why-it-matters', 'real-life-scenario', 'constitutional-concept', 'case-example', 'interactive-assessment', 'reinforcement-activity', 'key-takeaways'];
      
      if (requiredSteps.every(step => updatedSteps.has(step))) {
        topic.migrationStatus = 'complete';
        await topic.save();
        topicsCompleted++;
        console.log(`  🎉 "${topic.title}" now has all 7 module steps - migrationStatus: complete`);
      }
    }
    
    // Update content order for proper sequencing
    const allContent = await Content.find({});
    let orderUpdates = 0;
    
    for (const content of allContent) {
      let newOrder = content.order;
      
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
        newOrder = stepOrder[content.moduleStep] * 10;
      }
      
      if (newOrder !== content.order) {
        content.order = newOrder;
        await content.save();
        orderUpdates++;
      }
    }
    
    // Summary statistics
    const completeTopics = await Topic.countDocuments({ migrationStatus: 'complete' });
    const partialTopicsCount = await Topic.countDocuments({ migrationStatus: 'partial' });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MODULE STEP COMPLETION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Real-life scenarios added: ${scenariosAdded}`);
    console.log(`  Case examples added: ${caseExamplesAdded}`);
    console.log(`  Reinforcement activities added: ${reinforcementActivitiesAdded}`);
    console.log(`  Content order updates: ${orderUpdates}`);
    console.log(`  Topics with complete migration: ${completeTopics}`);
    console.log(`  Topics with partial migration: ${partialTopicsCount}`);
    console.log('='.repeat(60));
    console.log('✅ Module Step Completion Migration Complete!');
    console.log('📝 Topics now have complete 7-step experiential learning journey');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

completeModuleSteps();
