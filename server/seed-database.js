// Master seed script - seeds ALL data into the database
// Run with: node seed-database.js
// This runs from the server/ directory

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Topic = require('./models/Topic');
const Content = require('./models/Content');
const Badge = require('./models/Badge');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/samvidhan_sarthi';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB:', MONGO_URI);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

// ==================== STEP 1: Seed Topics ====================
async function seedTopics() {
  console.log('\n📚 STEP 1: Seeding Topics...');

  const mockTopics = [
    // Level 0: Introduction topics
    { customId: 'l0-1', title: 'Preamble', description: 'Introduction to the Constitution, its purpose, and ideals including sovereignty, socialism, secularism, democracy, justice, liberty, equality, and fraternity.', category: 'other', difficulty: 'beginner', country: 'India', order: 1, isActive: true },
    { customId: 'l0-2', title: 'History of Constitution', description: 'Timeline of formation, Constituent Assembly, and the drafting process of the Indian Constitution.', category: 'other', difficulty: 'beginner', country: 'India', order: 2, isActive: true },
    { customId: 'l0-3', title: 'Features of Constitution', description: 'Federalism, Parliamentary System, Secularism, and other unique features of the Indian Constitution.', category: 'other', difficulty: 'beginner', country: 'India', order: 3, isActive: true },

    // Level 1: Basic Structure topics
    { customId: 'l1-1', title: 'Part I: Union and its Territory', description: 'Articles 1-4: Name and territory of the Union, admission of new states, formation of new states, and alteration of boundaries.', category: 'other', difficulty: 'beginner', country: 'India', order: 4, isActive: true },
    { customId: 'l1-2', title: 'Part III: Fundamental Rights', description: 'Articles 12-35: Six fundamental rights including Right to Equality, Right to Freedom, Right against Exploitation, and more.', category: 'fundamental-rights', difficulty: 'beginner', country: 'India', order: 5, isActive: true },
    { customId: 'l1-3', title: 'Part IV: Directive Principles', description: 'Articles 36-51: Guidelines provided to the government to ensure social and economic democracy through welfare approach.', category: 'directive-principles', difficulty: 'intermediate', country: 'India', order: 6, isActive: true },
    { customId: 'l1-4', title: 'Part IV-A: Fundamental Duties', description: 'Article 51A: List of duties that citizens are expected to abide by.', category: 'other', difficulty: 'beginner', country: 'India', order: 7, isActive: true },
    { customId: 'l1-5', title: 'Part V: Union Government', description: 'Articles 52-151: Structure and functioning of the President, Vice-President, Prime Minister, and Parliament.', category: 'other', difficulty: 'intermediate', country: 'India', order: 8, isActive: true },
    { customId: 'l1-6', title: 'Part XVIII: Emergency Provisions', description: 'Articles 352-360: Three types of emergencies - National, State, and Financial, and their implications.', category: 'other', difficulty: 'advanced', country: 'India', order: 9, isActive: true },

    // Level 2: Schedules topics
    { customId: 'l2-1', title: 'Schedule 1: States and UTs', description: 'List of states and union territories in India with their territories.', category: 'other', difficulty: 'beginner', country: 'India', order: 10, isActive: true },
    { customId: 'l2-2', title: 'Schedule 7: Division of Powers', description: 'Union List, State List, and Concurrent List defining the division of powers between the Centre and States.', category: 'other', difficulty: 'intermediate', country: 'India', order: 11, isActive: true },
    { customId: 'l2-3', title: 'Schedule 8: Official Languages', description: 'The 22 official languages recognized by the Constitution of India.', category: 'other', difficulty: 'beginner', country: 'India', order: 12, isActive: true },
    { customId: 'l2-4', title: 'Schedule 9 & 10: Special Acts & Anti-Defection', description: 'Schedule 9 protects certain laws from judicial review, while Schedule 10 contains anti-defection provisions.', category: 'other', difficulty: 'advanced', country: 'India', order: 13, isActive: true },

    // Level 3: Amendments topics
    { customId: 'l3-1', title: '1st Amendment (1951)', description: 'Added Ninth Schedule to protect land reform laws from judicial review.', category: 'amendments', difficulty: 'intermediate', country: 'India', order: 14, isActive: true },
    { customId: 'l3-2', title: '42nd Amendment (1976)', description: 'The "Mini-Constitution" that made significant changes during the Emergency period.', category: 'amendments', difficulty: 'advanced', country: 'India', order: 15, isActive: true },
    { customId: 'l3-3', title: '73rd & 74th Amendments', description: 'Constitutional status to Panchayati Raj Institutions and Municipalities.', category: 'amendments', difficulty: 'intermediate', country: 'India', order: 16, isActive: true },
    { customId: 'l3-4', title: '101st Amendment (GST)', description: 'Introduction of Goods and Services Tax (GST) in India.', category: 'amendments', difficulty: 'intermediate', country: 'India', order: 17, isActive: true },

    // Level 4: Advanced topics
    { customId: 'l4-1', title: 'Doctrine of Basic Structure', description: 'Explore the judicial doctrine that sets limits on Parliament\'s power to amend the Constitution.', category: 'other', difficulty: 'advanced', country: 'India', order: 18, isActive: true },
    { customId: 'l4-2', title: 'Judicial Review', description: 'Study the power of the Supreme Court and High Courts to review the constitutionality of laws.', category: 'judiciary', difficulty: 'advanced', country: 'India', order: 19, isActive: true },
    { customId: 'l4-3', title: 'Landmark Judgments', description: 'Analyze landmark Supreme Court judgments that have shaped constitutional interpretation.', category: 'judiciary', difficulty: 'advanced', country: 'India', order: 20, isActive: true },
    { customId: 'l4-4', title: 'Constitution in Modern India', description: 'Evaluate the role and relevance of the Constitution in contemporary Indian society.', category: 'other', difficulty: 'advanced', country: 'India', order: 21, isActive: true }
  ];

  // Clear existing topics
  await Topic.deleteMany({});
  console.log('  Cleared existing topics');

  const result = await Topic.insertMany(mockTopics);
  console.log(`  ✅ Created ${result.length} topics`);
  return result;
}

// ==================== STEP 2: Seed Content (Lessons + Quizzes + Games) ====================
async function seedContent() {
  console.log('\n📝 STEP 2: Seeding Content (Lessons, Quizzes, Games)...');

  // Clear existing content
  await Content.deleteMany({});
  console.log('  Cleared existing content');

  const topics = await Topic.find({});
  let totalCreated = 0;

  for (const topic of topics) {
    const contentItems = [];

    // --- Lesson ---
    contentItems.push({
      topic: topic._id,
      title: `Introduction to ${topic.title}`,
      type: 'lesson',
      content: generateLessonContent(topic),
      order: 1,
      estimatedTime: 10,
      points: 20,
      isActive: true
    });

    // --- Quiz ---
    contentItems.push({
      topic: topic._id,
      title: `Quiz: ${topic.title}`,
      type: 'quiz',
      content: 'Test your knowledge about this topic.',
      order: 2,
      estimatedTime: 5,
      points: 30,
      quiz: { questions: generateQuizQuestions(topic) },
      isActive: true
    });

    // --- Game for intermediate/advanced ---
    if (topic.difficulty === 'intermediate' || topic.difficulty === 'advanced') {
      contentItems.push({
        topic: topic._id,
        title: `Interactive: ${topic.title}`,
        type: 'game',
        content: 'Interactive game to reinforce learning.',
        order: 3,
        estimatedTime: 8,
        points: 40,
        gameConfig: generateGameConfig(topic),
        isActive: true
      });
    }

    const created = await Content.insertMany(contentItems);
    totalCreated += created.length;
    console.log(`  Created ${created.length} items for: ${topic.title}`);
  }

  console.log(`  ✅ Total content created: ${totalCreated}`);
}

// ==================== STEP 3: Seed Game Content (Matching, Spiral, Timeline) ====================
async function seedGameContent() {
  console.log('\n🎮 STEP 3: Seeding additional game content...');

  const constitutionTopic = await Topic.findOne({ title: { $regex: /fundamental rights/i }, country: 'India' })
    || await Topic.findOne({ title: { $regex: /constitution/i }, country: 'India' })
    || await Topic.findOne({ country: 'India' });

  if (!constitutionTopic) {
    console.log('  ⚠️ No topic found for games, skipping');
    return;
  }

  const games = [
    {
      topic: constitutionTopic._id,
      title: 'Constitutional Matching Game',
      type: 'game',
      content: 'Match each constitutional term with its correct definition.',
      order: 10,
      estimatedTime: 10,
      points: 50,
      gameConfig: {
        type: 'matching',
        config: {
          pairs: [
            { term: 'Article 14', definition: 'Right to Equality - Equality before law and equal protection of laws' },
            { term: 'Article 19', definition: 'Right to Freedom - Speech, expression, assembly, association, movement, residence, and profession' },
            { term: 'Article 21', definition: 'Right to Life and Personal Liberty' },
            { term: 'Article 32', definition: 'Right to Constitutional Remedies - Approach the Supreme Court directly' },
            { term: 'Article 51A', definition: 'Fundamental Duties - Duties citizens are expected to abide by' },
            { term: 'Article 368', definition: 'Power of Parliament to amend the Constitution' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Constitution Structure Spiral',
      type: 'game',
      content: 'Explore the structure of the Constitution through this interactive spiral visualization.',
      order: 11,
      estimatedTime: 5,
      points: 30,
      gameConfig: {
        type: 'spiral',
        config: {
          centerTitle: 'Indian Constitution',
          levels: [
            { title: 'Level 0: Introduction', items: ['Preamble', 'History', 'Features'], color: '#3498db' },
            { title: 'Level 1: Basic Structure', items: ['Parts I-VIII', 'Parts IX-XV', 'Parts XVI-XXII'], color: '#2ecc71' },
            { title: 'Level 2: Schedules', items: ['Schedules 1-4', 'Schedules 5-8', 'Schedules 9-12'], color: '#9b59b6' },
            { title: 'Level 3: Amendments', items: ['1st-42nd', '43rd-86th', '87th-105th'], color: '#f39c12' },
            { title: 'Level 4: Advanced', items: ['Basic Structure', 'Judicial Review', 'Landmark Cases'], color: '#e74c3c' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Constitutional Timeline',
      type: 'game',
      content: 'Learn the timeline of constitutional events in India.',
      order: 12,
      estimatedTime: 8,
      points: 40,
      gameConfig: {
        type: 'timeline',
        config: {
          events: [
            { year: 1946, event: 'Formation of Constituent Assembly' },
            { year: 1949, event: 'Constitution was adopted on November 26' },
            { year: 1950, event: 'Constitution came into effect on January 26' },
            { year: 1951, event: 'First Amendment to Constitution' },
            { year: 1952, event: 'First General Elections in India' },
            { year: 1976, event: '42nd Amendment (Mini Constitution)' },
            { year: 1978, event: '44th Amendment (Right to Property removed)' },
            { year: 1992, event: '73rd and 74th Amendments (Panchayati Raj)' },
            { year: 2016, event: '101st Amendment (GST Implementation)' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Constitutional Amendments Timeline',
      type: 'game',
      content: 'Arrange important constitutional amendments in chronological order.',
      order: 13,
      estimatedTime: 8,
      points: 40,
      gameConfig: {
        type: 'timeline',
        config: {
          events: [
            { year: 1951, event: '1st Constitutional Amendment' },
            { year: 1971, event: '24th Constitutional Amendment' },
            { year: 1976, event: '42nd Constitutional Amendment (Mini Constitution)' },
            { year: 1978, event: '44th Constitutional Amendment' },
            { year: 1992, event: '73rd Constitutional Amendment' },
            { year: 1992, event: '74th Constitutional Amendment' },
            { year: 2002, event: '86th Constitutional Amendment (Right to Education)' },
            { year: 2016, event: '101st Constitutional Amendment (GST)' },
            { year: 2019, event: '103rd Constitutional Amendment (EWS Reservation)' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Landmark Cases Timeline',
      type: 'game',
      content: 'Arrange important Supreme Court judgments in chronological order.',
      order: 14,
      estimatedTime: 10,
      points: 50,
      gameConfig: {
        type: 'timeline',
        config: {
          events: [
            { year: 1951, event: 'Shankari Prasad Case' },
            { year: 1967, event: 'Golaknath Case' },
            { year: 1973, event: 'Kesavananda Bharati Case' },
            { year: 1975, event: 'Indira Gandhi vs Raj Narain' },
            { year: 1980, event: 'Minerva Mills Case' },
            { year: 1994, event: 'S.R. Bommai Case' },
            { year: 1997, event: 'Vishaka Case' },
            { year: 2017, event: 'Puttaswamy Privacy Judgment' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Emergency Era Timeline',
      type: 'game',
      content: 'Arrange key events related to the Emergency period.',
      order: 15,
      estimatedTime: 8,
      points: 45,
      gameConfig: {
        type: 'timeline',
        config: {
          events: [
            { year: 1975, event: 'Allahabad High Court Judgment' },
            { year: 1975, event: 'National Emergency Declared' },
            { year: 1976, event: '42nd Amendment Passed' },
            { year: 1977, event: 'Emergency Withdrawn' },
            { year: 1977, event: 'Janata Party Government Formed' },
            { year: 1978, event: '44th Amendment Passed' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Women and Constitution Timeline',
      type: 'game',
      content: 'Arrange important constitutional and legal milestones for women in India.',
      order: 16,
      estimatedTime: 8,
      points: 45,
      gameConfig: {
        type: 'timeline',
        config: {
          events: [
            { year: 1950, event: 'Constitution Guarantees Equality' },
            { year: 1961, event: 'Dowry Prohibition Act' },
            { year: 1976, event: 'Equal Remuneration Act' },
            { year: 1992, event: 'Women Reservation in Panchayats (73rd Amendment)' },
            { year: 1997, event: 'Vishaka Guidelines' },
            { year: 2005, event: 'Hindu Succession Amendment Act' },
            { year: 2013, event: 'Criminal Law Amendment Act' },
            { year: 2023, event: 'Nari Shakti Vandan Adhiniyam' }
          ]
        }
      },
      isActive: true
    },
    {
      topic: constitutionTopic._id,
      title: 'Constitutional Rights Scenarios',
      type: 'game',
      content: 'Apply your understanding of constitutional rights to real-world scenarios.',
      order: 13,
      estimatedTime: 15,
      points: 60,
      gameConfig: {
        type: 'scenario',
        config: {
          scenarios: [
            {
              title: 'Freedom of Speech and Expression',
              description: 'A student organization at a government-funded university wants to organize a peaceful protest. The university denies permission, citing concerns about disturbing academic activities.',
              hint: 'Consider Article 19 and reasonable restrictions.',
              options: [
                { text: 'The university has a right to restrict any activities on its campus.', isCorrect: false, feedback: 'A blanket ban on peaceful protests violates Article 19(1)(a) freedom of speech.' },
                { text: 'The students can protest as long as it meets reasonable restrictions under Article 19(2).', isCorrect: true, feedback: 'Correct! Article 19(1)(a) protects free speech, while 19(2) allows reasonable restrictions.' },
                { text: 'Students have absolute right to protest anywhere.', isCorrect: false, feedback: 'No right is absolute. Article 19(2) provides for reasonable restrictions.' },
                { text: 'Only the central government can restrict protests.', isCorrect: false, feedback: 'Both central and state bodies can impose reasonable restrictions under Article 19(2).' }
              ]
            },
            {
              title: 'Right to Equality',
              description: 'A private company refuses to hire someone based on their caste.',
              hint: 'Consider against whom Fundamental Rights are enforceable.',
              options: [
                { text: 'This violates Article 15 on non-discrimination.', isCorrect: false, feedback: 'Article 15 applies to the State, not private entities directly.' },
                { text: 'Fundamental Rights are generally enforceable only against the State.', isCorrect: true, feedback: 'Correct! Fundamental Rights are mainly enforceable against the State (Article 12), with limited exceptions like Articles 15(2), 17, 23, 24.' },
                { text: 'The Constitution permits private discrimination.', isCorrect: false, feedback: 'The Constitution does not permit discrimination. Other laws may apply against private entities.' },
                { text: 'Article 16 covers all employment equally.', isCorrect: false, feedback: 'Article 16 applies to public/government employment, not private sector.' }
              ]
            },
            {
              title: 'Emergency Provisions',
              description: 'The President imposes President\'s Rule in a state where the elected government has lost majority.',
              hint: 'Look at emergency provisions in the Constitution.',
              options: [
                { text: 'Article 352 - National Emergency', isCorrect: false, feedback: 'Article 352 is for national emergency due to war or armed rebellion.' },
                { text: 'Article 356 - State Emergency (President\'s Rule)', isCorrect: true, feedback: 'Correct! Article 356 deals with failure of constitutional machinery in a state.' },
                { text: 'Article 360 - Financial Emergency', isCorrect: false, feedback: 'Article 360 deals with financial emergency.' },
                { text: 'Article 370 - Special Status', isCorrect: false, feedback: 'Article 370 dealt with special status of J&K (now abrogated).' }
              ]
            }
          ]
        }
      },
      isActive: true
    }
  ];

  const created = await Content.insertMany(games);
  console.log(`  ✅ Created ${created.length} game content items`);
}

// ==================== STEP 4: Seed Badges ====================
async function seedBadges() {
  console.log('\n🏆 STEP 4: Seeding Badges...');

  const badges = [
    { name: 'Quiz Master', description: 'Complete 5 quizzes with a score of 80% or higher.', icon: 'quiz-master', category: 'mastery', requirements: { minQuizzes: 5, minScore: 80 }, points: 100, rarity: 'uncommon', isActive: true },
    { name: 'Constitution Defender', description: 'Complete 3 or more constitutional scenario challenges.', icon: 'constitution-defender', category: 'achievement', requirements: { minScenarios: 3 }, points: 150, rarity: 'uncommon', isActive: true },
    { name: 'Preamble Scholar', description: 'Score 80% or higher on a Preamble-related quiz.', icon: 'preamble-scholar', category: 'mastery', requirements: { specificQuiz: 'preamble', minScore: 80 }, points: 75, rarity: 'common', isActive: true },
    { name: 'Rights Expert', description: 'Score 80% or higher on a Fundamental Rights quiz.', icon: 'rights-expert', category: 'mastery', requirements: { specificQuiz: 'rights', minScore: 80 }, points: 75, rarity: 'common', isActive: true },
    { name: 'Amendment Tracker', description: 'Score 80% or higher on a Constitutional Amendments quiz.', icon: 'amendment-tracker', category: 'mastery', requirements: { specificQuiz: 'amendments', minScore: 80 }, points: 75, rarity: 'common', isActive: true },
    { name: 'Perfect Score', description: 'Achieve a perfect 100% score on any quiz.', icon: 'perfect-score', category: 'achievement', requirements: { perfectScore: true }, points: 200, rarity: 'rare', isActive: true },
    { name: 'Fast Learner', description: 'Complete 10 different learning activities.', icon: 'fast-learner', category: 'progress', requirements: { minActivities: 10 }, points: 100, rarity: 'common', isActive: true },
    { name: 'Constitutional Expert', description: 'Complete a topic with 100% mastery.', icon: 'constitutional-expert', category: 'mastery', requirements: { topicCompletion: 100 }, points: 250, rarity: 'epic', isActive: true }
  ];

  // Clear existing badges
  await Badge.deleteMany({});
  console.log('  Cleared existing badges');

  const created = await Badge.insertMany(badges);
  console.log(`  ✅ Created ${created.length} badges`);
}

// ==================== Helper Functions ====================
function generateLessonContent(topic) {
  const contentByCategory = {
    'fundamental-rights': `# ${topic.title}\n\n## Overview\nThe Fundamental Rights in India are enshrined in Part III of the Constitution.\n\n## Key Points\n1. **Article 14-18**: Right to Equality\n2. **Article 19-22**: Right to Freedom\n3. **Article 23-24**: Right against Exploitation\n4. **Article 25-28**: Right to Freedom of Religion\n5. **Article 29-30**: Cultural and Educational Rights\n6. **Article 32-35**: Right to Constitutional Remedies\n\n## Importance\nFundamental Rights are essential for individual development and maintaining dignity. They are enforceable by courts, subject to certain restrictions.`,
    'directive-principles': `# ${topic.title}\n\n## Overview\nThe Directive Principles of State Policy (DPSP) are in Part IV (Articles 36-51). Unlike Fundamental Rights, these are not enforceable by courts.\n\n## Key Principles\n1. **Economic Principles** - Equal distribution, prevention of wealth concentration\n2. **Social Principles** - Nutrition, public health, education\n3. **Gandhian Principles** - Village panchayats, cottage industries\n4. **International Principles** - Peace, security, international law`,
    'judiciary': `# ${topic.title}\n\n## Overview\nThe Indian Judiciary is one of the three branches of the government.\n\n## Structure\n1. **Supreme Court** - Apex judicial body\n2. **High Courts** - State level\n3. **District Courts** - Local level\n\n## Key Powers\n- Original, Appellate, Advisory, and Review Jurisdiction\n- Power of Judicial Review`,
    'amendments': `# ${topic.title}\n\n## Overview\nThe Constitution can be amended through Article 368.\n\n## Amendment Process\n1. **Simple Majority** - Creation of new states\n2. **Special Majority** - Fundamental Rights, DPSPs\n3. **Special Majority + State Ratification** - Federal structure changes`
  };

  return contentByCategory[topic.category] || `# ${topic.title}\n\n## Overview\n${topic.description}\n\n## Key Features\n- The Indian Constitution was adopted on 26th November 1949\n- Came into effect on 26th January 1950\n- Dr. B.R. Ambedkar was the Chairman of the Drafting Committee\n- Originally 395 Articles, 8 Schedules, 22 Parts\n- Currently 448 Articles, 12 Schedules, 25 Parts`;
}

function generateQuizQuestions(topic) {
  const questionsByCategory = {
    'fundamental-rights': [
      { question: 'Which article abolishes untouchability?', options: [{ text: 'Article 14', isCorrect: false }, { text: 'Article 15', isCorrect: false }, { text: 'Article 17', isCorrect: true }, { text: 'Article 19', isCorrect: false }], explanation: 'Article 17 abolishes untouchability.' },
      { question: 'Right to Constitutional Remedies is under which article?', options: [{ text: 'Article 30', isCorrect: false }, { text: 'Article 31', isCorrect: false }, { text: 'Article 32', isCorrect: true }, { text: 'Article 33', isCorrect: false }], explanation: 'Article 32 provides the Right to Constitutional Remedies.' },
      { question: 'Right to Freedom of Religion covers which Articles?', options: [{ text: 'Articles 19-22', isCorrect: false }, { text: 'Articles 23-24', isCorrect: false }, { text: 'Articles 25-28', isCorrect: true }, { text: 'Articles 29-30', isCorrect: false }], explanation: 'Articles 25-28 cover Right to Freedom of Religion.' }
    ],
    'directive-principles': [
      { question: 'Directive Principles are:', options: [{ text: 'Legally enforceable by courts', isCorrect: false }, { text: 'Fundamental in governance', isCorrect: true }, { text: 'Less important than FR', isCorrect: false }, { text: 'Only for state govts', isCorrect: false }], explanation: 'DPSPs are fundamental in governance but not enforceable by courts.' },
      { question: 'Which Part contains DPSPs?', options: [{ text: 'Part II', isCorrect: false }, { text: 'Part III', isCorrect: false }, { text: 'Part IV', isCorrect: true }, { text: 'Part V', isCorrect: false }], explanation: 'Part IV (Articles 36-51) contains DPSPs.' },
      { question: 'Which is NOT a DPSP?', options: [{ text: 'Cottage industries', isCorrect: false }, { text: 'Right to equality', isCorrect: true }, { text: 'Uniform civil code', isCorrect: false }, { text: 'Monument protection', isCorrect: false }], explanation: 'Right to equality is a Fundamental Right, not a DPSP.' }
    ]
  };

  return questionsByCategory[topic.category] || [
    { question: `What is the primary focus of ${topic.title}?`, options: [{ text: 'Constitutional provisions', isCorrect: true }, { text: 'International relations', isCorrect: false }, { text: 'Economic policies', isCorrect: false }, { text: 'Military strategy', isCorrect: false }], explanation: `${topic.title} primarily focuses on constitutional provisions.` },
    { question: `Which document is ${topic.title} part of?`, options: [{ text: 'Indian Constitution', isCorrect: true }, { text: 'UN Charter', isCorrect: false }, { text: 'IPC', isCorrect: false }, { text: 'CrPC', isCorrect: false }], explanation: `${topic.title} is part of the Indian Constitution.` },
    { question: `${topic.title} is important because:`, options: [{ text: 'It provides the structural framework', isCorrect: true }, { text: 'It is optional', isCorrect: false }, { text: 'Only applies to judges', isCorrect: false }, { text: 'It has been repealed', isCorrect: false }], explanation: `${topic.title} provides an important structural framework.` }
  ];
}

function generateGameConfig(topic) {
  if (topic.difficulty === 'intermediate') {
    return {
      type: 'matching',
      config: {
        pairs: [
          { term: 'Article 14', definition: 'Equality before law' },
          { term: 'Article 19', definition: 'Right to freedom' },
          { term: 'Article 21', definition: 'Right to life and personal liberty' },
          { term: 'Article 32', definition: 'Right to constitutional remedies' },
          { term: 'Article 44', definition: 'Uniform civil code' },
          { term: 'Article 368', definition: 'Amendment procedure' }
        ],
        timeLimit: 120
      }
    };
  }

  return {
    type: 'scenario',
    config: {
      scenarios: [
        {
          title: 'Constitutional Amendment Review',
          description: 'Parliament passes a bill to amend a part of the Constitution affecting the federal structure.',
          hint: 'Consider the Basic Structure doctrine.',
          options: [
            { text: 'Amendments are beyond judicial review', isCorrect: false, feedback: 'Incorrect. The Kesavananda Bharati case (1973) established that amendments can be reviewed.' },
            { text: 'Yes, if it violates the Basic Structure doctrine', isCorrect: true, feedback: 'Correct! The Basic Structure doctrine allows the Supreme Court to review amendments.' },
            { text: 'Only with the President\'s permission', isCorrect: false, feedback: 'The Supreme Court does not need the President\'s permission.' },
            { text: 'Only if it affects fundamental rights', isCorrect: false, feedback: 'The court can review amendments affecting any part of the Basic Structure.' }
          ]
        }
      ],
      timeLimit: 300
    }
  };
}

// ==================== MAIN ====================
async function main() {
  console.log('🚀 Starting complete database seed...\n');
  console.log('='.repeat(50));

  await connectDB();

  try {
    await seedTopics();
    await seedContent();
    await seedGameContent();
    await seedBadges();

    // Print summary
    const topicCount = await Topic.countDocuments();
    const contentCount = await Content.countDocuments();
    const badgeCount = await Badge.countDocuments();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEED COMPLETE!');
    console.log('='.repeat(50));
    console.log(`  📚 Topics:  ${topicCount}`);
    console.log(`  📝 Content: ${contentCount}`);
    console.log(`  🏆 Badges:  ${badgeCount}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
  }
}

main();
