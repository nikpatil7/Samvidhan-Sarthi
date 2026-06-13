// Add Compatible Games Using Existing Structure
// This script adds new games using the existing compatible structure (scenario and matching types)
// Run with: node migrate-add-compatible-games.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

async function addCompatibleGames() {
  try {
    console.log('🔄 Add Compatible Games Using Existing Structure');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all topics
    const topics = await Topic.find({});
    console.log(`📚 Found ${topics.length} topics`);
    
    // New compatible scenario games
    const newScenarioGames = [
      {
        title: 'Digital Rights Scenario',
        type: 'game',
        content: 'A social media company removes your post without explanation. What constitutional rights protect you in the digital age?',
        gameConfig: {
          type: 'scenario',
          config: {
            scenarios: [
              {
                title: 'Social Media Content Removal',
                description: 'A social media company removes your post about government policy without explanation',
                choices: [
                  { text: 'Accept the removal as company policy', outcome: 'passive', feedback: 'While companies have policies, constitutional rights still apply to digital platforms.' },
                  { text: 'Demand explanation citing Article 19 freedom of speech', outcome: 'correct', feedback: 'Correct! Article 19(1)(a) protects freedom of speech, which extends to digital platforms with reasonable restrictions.' },
                  { text: 'Create a new account to bypass the removal', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional issue. The right approach is to understand and exercise your rights.' },
                  { text: 'Report to police immediately', outcome: 'incorrect', feedback: 'While legal action may be appropriate, the first step is understanding your constitutional rights under Article 19.' }
                ]
              }
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
          config: {
            scenarios: [
              {
                title: 'Government Data Access',
                description: 'Government agencies request access to your phone data citing national security concerns',
                choices: [
                  { text: 'Allow access immediately to support national security', outcome: 'incorrect', feedback: 'While national security is important, Article 21 protects privacy. Access must follow proper legal procedures.' },
                  { text: 'Refuse access citing Article 21 right to privacy', outcome: 'correct', feedback: 'Correct! Article 21 protects privacy. Government access requires proper legal procedures and judicial oversight.' },
                  { text: 'Delete all data before government can access it', outcome: 'incorrect', feedback: 'This could be illegal. The correct approach is to ensure proper legal procedures are followed.' },
                  { text: 'Share data only with trusted friends', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional issue. Privacy rights must be protected through proper legal channels.' }
                ]
              }
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
        title: 'Religious Freedom Scenario',
        type: 'game',
        content: 'A school prohibits religious symbols. How do constitutional principles apply?',
        gameConfig: {
          type: 'scenario',
          config: {
            scenarios: [
              {
                title: 'School Religious Symbol Policy',
                description: 'A public school prohibits students from wearing religious symbols, citing secularism',
                choices: [
                  { text: 'Accept the policy as promoting secularism', outcome: 'incorrect', feedback: 'While secularism is important, Article 25 protects religious freedom. Restrictions must be reasonable and non-discriminatory.' },
                  { text: 'Challenge the policy citing Article 25 religious freedom', outcome: 'correct', feedback: 'Correct! Article 25 protects religious freedom. School policies must balance secularism with individual religious rights.' },
                  { text: 'Wear religious symbols secretly', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional issue. The right approach is to challenge discriminatory policies.' },
                  { text: 'Transfer to a private religious school', outcome: 'incorrect', feedback: 'This doesn\'t address the constitutional violation. Religious freedom should be protected in public institutions.' }
                ]
              }
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
    
    // New compatible matching games
    const newMatchingGames = [
      {
        title: 'Constitutional Rights Matching',
        type: 'game',
        content: 'Match constitutional rights with their descriptions.',
        gameConfig: {
          type: 'matching',
          config: {
            pairs: [
              { term: 'Article 14', definition: 'Equality before law' },
              { term: 'Article 19', definition: 'Freedom of speech and expression' },
              { term: 'Article 21', definition: 'Right to life and personal liberty' },
              { term: 'Article 32', definition: 'Right to constitutional remedies' },
              { term: 'Article 25', definition: 'Freedom of religion' },
              { term: 'Article 26', definition: 'Freedom to manage religious affairs' },
              { term: 'Article 29', definition: 'Protection of minority interests' },
              { term: 'Article 30', definition: 'Right of minorities to establish educational institutions' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Government Structure Matching',
        type: 'game',
        content: 'Match government institutions with their functions.',
        gameConfig: {
          type: 'matching',
          config: {
            pairs: [
              { term: 'Parliament', definition: 'Legislative body that makes laws' },
              { term: 'Executive', definition: 'Implements laws and runs the government' },
              { term: 'Judiciary', definition: 'Interprets laws and ensures constitutionality' },
              { term: 'President', definition: 'Head of state with ceremonial powers' },
              { term: 'Prime Minister', definition: 'Head of government with executive powers' },
              { term: 'Supreme Court', definition: 'Highest court in the judicial system' },
              { term: 'Rajya Sabha', definition: 'Upper house of Parliament' },
              { term: 'Lok Sabha', definition: 'Lower house of Parliament' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Amendment Process Matching',
        type: 'game',
        content: 'Match constitutional amendment concepts with their descriptions.',
        gameConfig: {
          type: 'matching',
          config: {
            pairs: [
              { term: 'Article 368', definition: 'Constitutional amendment procedure' },
              { term: 'Special Majority', definition: '2/3 majority of members present and voting' },
              { term: 'Ratification', definition: 'Approval by half of state legislatures' },
              { term: 'Basic Structure', definition: 'Core principles that cannot be amended' },
              { term: '42nd Amendment', definition: 'Added "Socialist, Secular, Integrity" to Preamble' },
              { term: '44th Amendment', definition: 'Restored judicial review and fundamental rights' },
              { term: '73rd Amendment', definition: 'Panchayati Raj institutions' },
              { term: '74th Amendment', definition: 'Urban local bodies' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Fundamental Duties Matching',
        type: 'game',
        content: 'Match fundamental duties with their descriptions.',
        gameConfig: {
          type: 'matching',
          config: {
            pairs: [
              { term: 'Article 51A(a)', definition: 'Abide by the Constitution' },
              { term: 'Article 51A(b)', definition: 'Respect the National Flag and Anthem' },
              { term: 'Article 51A(c)', definition: 'Uphold and protect sovereignty' },
              { term: 'Article 51A(d)', definition: 'Defend the country' },
              { term: 'Article 51A(e)', definition: 'Promote harmony and spirit of common brotherhood' },
              { term: 'Article 51A(f)', definition: 'Value and preserve rich heritage' },
              { term: 'Article 51A(g)', definition: 'Protect and improve natural environment' },
              { term: 'Article 51A(h)', definition: 'Develop scientific temper and humanism' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Emergency Provisions Matching',
        type: 'game',
        content: 'Match emergency provisions with their descriptions.',
        gameConfig: {
          type: 'matching',
          config: {
            pairs: [
              { term: 'Article 352', definition: 'National Emergency' },
              { term: 'Article 356', definition: 'President\'s Rule in States' },
              { term: 'Article 360', definition: 'Financial Emergency' },
              { term: 'Article 358', definition: 'Suspension of Fundamental Rights during emergency' },
              { term: 'Article 359', definition: 'Suspension of enforcement of rights' },
              { term: '44th Amendment', definition: 'Limited emergency duration to 6 months' },
              { term: 'Parliamentary Approval', definition: 'Required within 1 month of emergency proclamation' },
              { term: 'Judicial Review', definition: 'Courts can review emergency actions' }
            ]
          }
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      }
    ];
    
    let gamesAdded = 0;
    
    // Add scenario games to first 10 topics
    for (let i = 0; i < Math.min(topics.length, 10); i++) {
      const topic = topics[i];
      
      for (const game of newScenarioGames) {
        const newGame = new Content({
          ...game,
          topic: topic._id,
          title: `${topic.title} - ${game.title}`,
          order: 100 + gamesAdded
        });
        await newGame.save();
        gamesAdded++;
        console.log(`  ✅ Added scenario game: "${newGame.title}"`);
      }
    }
    
    // Add matching games to all topics
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      
      for (const game of newMatchingGames) {
        const newGame = new Content({
          ...game,
          topic: topic._id,
          title: `${topic.title} - ${game.title}`,
          order: 100 + gamesAdded
        });
        await newGame.save();
        gamesAdded++;
        console.log(`  ✅ Added matching game: "${newGame.title}"`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPATIBLE GAMES ADDITION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total games added: ${gamesAdded}`);
    console.log(`  Scenario games: ${newScenarioGames.length * 10}`);
    console.log(`  Matching games: ${newMatchingGames.length * topics.length}`);
    console.log(`  Topics enhanced: ${topics.length}`);
    console.log('='.repeat(60));
    console.log('✅ Compatible Games Addition Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Addition failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addCompatibleGames();
