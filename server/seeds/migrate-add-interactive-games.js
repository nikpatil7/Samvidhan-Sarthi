// Add More Interactive Elements and Learning Games
// This script adds new interactive games and gamification elements to enhance engagement
// Run with: node migrate-add-interactive-games.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

async function addInteractiveGames() {
  try {
    console.log('🔄 Add More Interactive Elements and Learning Games');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all topics
    const topics = await Topic.find({});
    console.log(`📚 Found ${topics.length} topics`);
    
    // New interactive game templates
    const newGames = [
      {
        title: 'Constitutional Flashcards',
        type: 'game',
        content: 'Test your knowledge with flashcards covering key constitutional concepts.',
        gameConfig: {
          type: 'flashcards',
          flashcards: [
            { front: 'Article 14', back: 'Right to Equality - All citizens are equal before law' },
            { front: 'Article 19', back: 'Six freedoms including speech, assembly, and movement' },
            { front: 'Article 21', back: 'Right to Life and Personal Liberty' },
            { front: 'Article 32', back: 'Right to Constitutional Remedies' },
            { front: 'Fundamental Rights', back: 'Basic rights guaranteed to all citizens' },
            { front: 'Directive Principles', back: 'Guidelines for government policy-making' },
            { front: 'Basic Structure', back: 'Core constitutional principles that cannot be amended' },
            { front: 'Judicial Review', back: 'Power of courts to review constitutionality of laws' }
          ]
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Drag and Drop',
        type: 'game',
        content: 'Drag and drop constitutional concepts to their correct categories.',
        gameConfig: {
          type: 'drag-drop',
          categories: {
            'Fundamental Rights': ['Right to Equality', 'Freedom of Speech', 'Right to Life', 'Religious Freedom'],
            'Directive Principles': ['Social Justice', 'Economic Welfare', 'Foreign Policy', 'Legal Aid'],
            'Fundamental Duties': ['Respect Constitution', 'Protect Environment', 'Develop Scientific Temper', 'Promote Harmony']
          }
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 10,
        points: 40,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Word Search',
        type: 'game',
        content: 'Find constitutional terms hidden in the word search puzzle.',
        gameConfig: {
          type: 'word-search',
          words: ['Preamble', 'Fundamental', 'Rights', 'Directive', 'Principles', 'Amendment', 'Judiciary', 'Federal', 'Secular', 'Sovereign', 'Republic', 'Justice', 'Liberty', 'Equality', 'Fraternity'],
          gridSize: 12
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 7,
        points: 25,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Memory Match',
        type: 'game',
        content: 'Match pairs of constitutional concepts and their descriptions.',
        gameConfig: {
          type: 'memory-match',
          pairs: [
            { item1: 'Article 14', item2: 'Right to Equality' },
            { item1: 'Article 19', item2: 'Freedom of Speech' },
            { item1: 'Article 21', item2: 'Right to Life' },
            { item1: 'Article 32', item2: 'Constitutional Remedies' },
            { item1: 'Preamble', item2: 'Introduction to Constitution' },
            { item1: 'Fundamental Rights', item2: 'Basic Rights' },
            { item1: 'Directive Principles', item2: 'Policy Guidelines' },
            { item1: 'Basic Structure', item2: 'Core Principles' }
          ]
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 30,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Timeline Challenge',
        type: 'game',
        content: 'Arrange constitutional events in the correct chronological order.',
        gameConfig: {
          type: 'timeline-sort',
          events: [
            { year: 1946, event: 'Constituent Assembly formed' },
            { year: 1947, event: 'Independence and Constitution drafting begins' },
            { year: 1949, event: 'Constitution adopted' },
            { year: 1950, event: 'Constitution came into force' },
            { year: 1951, event: 'First Amendment' },
            { year: 1975, event: 'Emergency declared' },
            { year: 1976, event: '42nd Amendment' },
            { year: 1991, event: 'Economic reforms and liberalization' }
          ]
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 10,
        points: 45,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Quiz Showdown',
        type: 'game',
        content: 'Compete against the clock in a fast-paced constitutional quiz.',
        gameConfig: {
          type: 'quiz-showdown',
          timeLimit: 60, // seconds
          questions: [
            {
              question: 'How many fundamental rights are guaranteed by the Constitution?',
              options: ['5', '6', '7', '8'],
              correctAnswer: 1,
              points: 10
            },
            {
              question: 'Which article is called the "heart and soul" of the Constitution?',
              options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
              correctAnswer: 3,
              points: 15
            },
            {
              question: 'What is the minimum age to become President of India?',
              options: ['25 years', '30 years', '35 years', '40 years'],
              correctAnswer: 2,
              points: 10
            },
            {
              question: 'Which amendment introduced the concept of "Basic Structure"?',
              options: ['24th Amendment', '25th Amendment', '42nd Amendment', '44th Amendment'],
              correctAnswer: 2,
              points: 15
            },
            {
              question: 'How many members are in the Rajya Sabha?',
              options: ['245', '250', '545', '543'],
              correctAnswer: 0,
              points: 10
            }
          ]
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 5,
        points: 50,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Crossword Puzzle',
        type: 'game',
        content: 'Solve the crossword puzzle using constitutional terms.',
        gameConfig: {
          type: 'crossword',
          words: [
            { word: 'PREAMBLE', clue: 'Introduction to the Constitution', direction: 'across' },
            { word: 'RIGHTS', clue: 'Fundamental freedoms', direction: 'across' },
            { word: 'JUSTICE', clue: 'Social, economic, and political', direction: 'down' },
            { word: 'LIBERTY', clue: 'Freedom of thought and expression', direction: 'down' },
            { word: 'EQUALITY', clue: 'Equal treatment before law', direction: 'across' },
            { word: 'FEDERAL', clue: 'Division of powers between center and states', direction: 'down' },
            { word: 'SECULAR', clue: 'Equal respect for all religions', direction: 'across' },
            { word: 'REPUBLIC', clue: 'Elected head of state', direction: 'down' }
          ]
        },
        moduleStep: 'reinforcement-activity',
        estimatedTime: 12,
        points: 35,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Role-Play Scenario',
        type: 'game',
        content: 'Step into the role of a constitutional decision-maker.',
        gameConfig: {
          type: 'role-play',
          scenario: {
            role: 'Constitutional Judge',
            situation: 'A new law is challenged for violating fundamental rights',
            choices: [
              { 
                text: 'Strike down the law immediately', 
                outcome: 'premature', 
                feedback: 'While protecting rights is important, you must first examine whether the restriction is reasonable and proportionate.' 
              },
              { 
                text: 'Examine if the restriction is reasonable and proportionate', 
                outcome: 'correct', 
                feedback: 'Correct! The court must examine whether the restriction is reasonable, proportionate, and serves a legitimate constitutional purpose.' 
              },
              { 
                text: 'Always uphold government laws', 
                outcome: 'incorrect', 
                feedback: 'The court must protect fundamental rights and examine constitutionality, not automatically uphold government actions.' 
              },
              { 
                text: 'Dismiss the case without hearing', 
                outcome: 'incorrect', 
                feedback: 'The court has a duty to hear constitutional challenges and protect fundamental rights.' 
              }
            ]
          }
        },
        moduleStep: 'real-life-scenario',
        estimatedTime: 15,
        points: 60,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Leaderboard Challenge',
        type: 'game',
        content: 'Compete with other learners on constitutional knowledge.',
        gameConfig: {
          type: 'leaderboard',
          categories: ['Fundamental Rights', 'Directive Principles', 'Constitutional History', 'Amendments'],
          scoring: {
            correct: 10,
            incorrect: -5,
            timeBonus: true
          }
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 8,
        points: 55,
        isActive: true,
        plainLanguageValidated: true
      },
      {
        title: 'Constitutional Streak Challenge',
        type: 'game',
        content: 'Build a streak by answering questions correctly in a row.',
        gameConfig: {
          type: 'streak-challenge',
          questions: [
            {
              question: 'Who is known as the Father of the Indian Constitution?',
              options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Sardar Patel'],
              correctAnswer: 2
            },
            {
              question: 'How many articles were there in the original Constitution?',
              options: ['395', '400', '450', '495'],
              correctAnswer: 0
            },
            {
              question: 'Which schedule deals with anti-defection?',
              options: ['Schedule 8', 'Schedule 9', 'Schedule 10', 'Schedule 11'],
              correctAnswer: 1
            },
            {
              question: 'What is the term length for Lok Sabha members?',
              options: ['4 years', '5 years', '6 years', '7 years'],
              correctAnswer: 1
            },
            {
              question: 'Which article protects against double jeopardy?',
              options: ['Article 20', 'Article 21', 'Article 22', 'Article 23'],
              correctAnswer: 0
            }
          ],
          streakBonus: {
            3: 1.2,
            5: 1.5,
            10: 2.0
          }
        },
        moduleStep: 'interactive-assessment',
        estimatedTime: 6,
        points: 40,
        isActive: true,
        plainLanguageValidated: true
      }
    ];
    
    let gamesAdded = 0;
    
    // Add games to first few topics
    for (let i = 0; i < Math.min(topics.length, 10); i++) {
      const topic = topics[i];
      
      for (const game of newGames) {
        const newGame = new Content({
          ...game,
          topic: topic._id,
          title: `${topic.title} - ${game.title}`,
          order: 100 + gamesAdded // Place after existing content
        });
        await newGame.save();
        gamesAdded++;
        console.log(`  ✅ Added game: "${newGame.title}"`);
      }
    }
    
    // Add specific games to remaining topics
    for (let i = 10; i < topics.length; i++) {
      const topic = topics[i];
      
      // Add flashcards and memory match to all topics
      const flashcardGame = new Content({
        ...newGames[0], // Flashcards
        topic: topic._id,
        title: `${topic.title} - ${newGames[0].title}`,
        order: 100 + gamesAdded
      });
      await flashcardGame.save();
      gamesAdded++;
      console.log(`  ✅ Added game: "${flashcardGame.title}"`);
      
      const memoryGame = new Content({
        ...newGames[3], // Memory Match
        topic: topic._id,
        title: `${topic.title} - ${newGames[3].title}`,
        order: 100 + gamesAdded
      });
      await memoryGame.save();
      gamesAdded++;
      console.log(`  ✅ Added game: "${memoryGame.title}"`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTERACTIVE GAMES ADDITION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total games added: ${gamesAdded}`);
    console.log(`  Game types added: 10 different interactive game types`);
    console.log(`  Topics enhanced: ${topics.length}`);
    console.log('='.repeat(60));
    console.log('✅ Interactive Games Addition Complete!');
    
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Addition failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addInteractiveGames();
