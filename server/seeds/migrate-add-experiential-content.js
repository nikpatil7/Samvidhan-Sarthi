// Add More Scenarios, Case Examples, and Reinforcement Activities
// This script adds additional experiential learning content to enhance the learning experience
// Run with: node migrate-add-experiential-content.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

async function addExperientialContent() {
  try {
    console.log('🔄 Add More Scenarios, Case Examples, and Reinforcement Activities');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all topics
    const topics = await Topic.find({});
    console.log(`📚 Found ${topics.length} topics`);
    
    // Additional experiential content templates
    const additionalScenarios = [
      {
        title: 'Digital Rights Scenario',
        type: 'game',
        content: 'A social media company removes your post without explanation. What constitutional rights protect you in the digital age?',
        gameConfig: {
          type: 'scenario',
          scenario: {
            situation: 'Your post about government policy is removed from social media without explanation',
            choices: [
              { text: 'Accept the removal as company policy', outcome: 'passive', feedback: 'While companies have policies, constitutional rights still apply to digital platforms.' },
              { text: 'Demand explanation citing Article 19 freedom of speech', outcome: 'correct', feedback: 'Correct! Article 19(1)(a) protects freedom of speech, which extends to digital platforms with reasonable restrictions.' },
              { text: 'Create a new account to bypass the removal', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional issue. The right approach is to understand and exercise your rights.' },
              { text: 'Report to police immediately', outcome: 'incorrect', feedback: 'While legal action may be appropriate, the first step is understanding your constitutional rights under Article 19.' }
            ]
          }
        },
        moduleStep: 'real-life-scenario',
        estimatedTime: 10,
        points: 50,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Privacy vs Security Scenario',
        type: 'game',
        content: 'Government wants to access your phone data for national security. What constitutional principles apply?',
        gameConfig: {
          type: 'scenario',
          scenario: {
            situation: 'Government agencies request access to your phone data citing national security concerns',
            choices: [
              { text: 'Allow access immediately to support national security', outcome: 'incorrect', feedback: 'While national security is important, Article 21 protects privacy. Access must follow proper legal procedures.' },
              { text: 'Refuse access citing Article 21 right to privacy', outcome: 'correct', feedback: 'Correct! Article 21 protects privacy. Government access requires proper legal procedures and judicial oversight.' },
              { text: 'Delete all data before government can access it', outcome: 'incorrect', feedback: 'This could be illegal. The correct approach is to ensure proper legal procedures are followed.' },
              { text: 'Share data only with trusted friends', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional issue. Privacy rights must be protected through proper legal channels.' }
            ]
          }
        },
        moduleStep: 'real-life-scenario',
        estimatedTime: 10,
        points: 50,
        isActive: true,
        plainLanguageValidated: true
      }
    ];
    
    const additionalCaseExamples = [
      {
        title: 'Right to Education Case',
        type: 'lesson',
        content: 'In 2002, the 86th Amendment made education a fundamental right. This came from the Supreme Court case that recognized education as essential for meaningful life under Article 21.',
        moduleStep: 'case-example',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Right to Information Case',
        type: 'lesson',
        content: 'The Right to Information Act was inspired by Supreme Court rulings that freedom of speech includes the right to receive information. This shows how judicial decisions shape policy.',
        moduleStep: 'case-example',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      }
    ];
    
    const additionalReinforcementActivities = [
      {
        title: 'Constitutional Rights Matching',
        type: 'game',
        content: 'Match constitutional rights with real-life situations where they apply.',
        gameConfig: {
          type: 'matching',
          pairs: [
            { item1: 'Article 14 - Equality', item2: 'Equal access to public places' },
            { item1: 'Article 19 - Freedom of Speech', item2: 'Right to express opinions' },
            { item1: 'Article 21 - Right to Life', item2: 'Protection from arbitrary arrest' },
            { item1: 'Article 32 - Constitutional Remedies', item2: 'Right to approach Supreme Court' }
          ]
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 12,
        points: 40,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Rights Scenario Practice',
        type: 'game',
        content: 'Practice identifying which constitutional rights apply in different situations.',
        gameConfig: {
          type: 'scenario',
          scenario: {
            situation: 'A government job requires candidates to be of a particular religion',
            choices: [
              { text: 'Article 14 - Right to Equality', outcome: 'correct', feedback: 'Correct! Article 14 prohibits discrimination in government employment.' },
              { text: 'Article 19 - Freedom of Speech', outcome: 'incorrect', feedback: 'This is about equality, not speech.' },
              { text: 'Article 21 - Right to Life', outcome: 'incorrect', feedback: 'This is about equality in employment, not life rights.' },
              { text: 'Article 32 - Constitutional Remedies', outcome: 'incorrect', feedback: 'This is the remedy, not the right being violated.' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 10,
        points: 40,
        isActive: true,
        plainLanguageValidated: true
      }
    ];
    
    let contentAdded = 0;
    
    // Add additional scenarios to first few topics
    for (let i = 0; i < Math.min(topics.length, 5); i++) {
      const topic = topics[i];
      
      for (const scenario of additionalScenarios) {
        const newScenario = new Content({
          ...scenario,
          topic: topic._id,
          title: `${topic.title} - ${scenario.title}`,
          order: 20 + contentAdded // Place after existing content
        });
        await newScenario.save();
        contentAdded++;
        console.log(`  ✅ Added scenario: "${newScenario.title}"`);
      }
    }
    
    // Add additional case examples to middle topics
    for (let i = 5; i < Math.min(topics.length, 10); i++) {
      const topic = topics[i];
      
      for (const caseExample of additionalCaseExamples) {
        const newCaseExample = new Content({
          ...caseExample,
          topic: topic._id,
          title: `${topic.title} - ${caseExample.title}`,
          order: 40 + contentAdded
        });
        await newCaseExample.save();
        contentAdded++;
        console.log(`  ✅ Added case example: "${newCaseExample.title}"`);
      }
    }
    
    // Add additional reinforcement activities to last topics
    for (let i = 10; i < topics.length; i++) {
      const topic = topics[i];
      
      for (const activity of additionalReinforcementActivities) {
        const newActivity = new Content({
          ...activity,
          topic: topic._id,
          title: `${topic.title} - ${activity.title}`,
          order: 60 + contentAdded
        });
        await newActivity.save();
        contentAdded++;
        console.log(`  ✅ Added reinforcement activity: "${newActivity.title}"`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXPERIENTIAL CONTENT ADDITION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total content added: ${contentAdded}`);
    console.log(`  Additional scenarios: ${additionalScenarios.length * 5}`);
    console.log(`  Additional case examples: ${additionalCaseExamples.length * 5}`);
    console.log(`  Additional reinforcement activities: ${additionalReinforcementActivities.length * 11}`);
    console.log('='.repeat(60));
    console.log('✅ Experiential Content Addition Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Addition failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addExperientialContent();
