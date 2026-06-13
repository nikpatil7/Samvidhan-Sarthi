// Add card-sort reinforcement games per topic
// Run with:
// node seeds/add-card-sort-game.js

require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env')
});

const mongoose = require('mongoose');
const Content = require('../models/Content');
const Topic = require('../models/Topic');

const REINFORCEMENT_ORDER = 60;

mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb://localhost:27017/samvidhan_sarthi'
  )
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedCardSortGame();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

async function findTopicByTitle(titlePattern) {
  return Topic.findOne({
    title: { $regex: titlePattern, $options: 'i' },
    country: 'India'
  });
}

async function seedCardSortGame() {
  try {
    console.log('🎮 Seeding Card Sort reinforcement games...');

    const topicMap = {
      fundamentalRights: await findTopicByTitle('Part III: Fundamental Rights'),
      fundamentalDuties: await findTopicByTitle('Part IV-A: Fundamental Duties'),
      unionGovernment: await findTopicByTitle('Part V: Union Government'),
      divisionOfPowers: await findTopicByTitle('Schedule 7: Division of Powers'),
      landmarkJudgments: await findTopicByTitle('Landmark Judgments')
    };

    const missingTopics = Object.entries(topicMap)
      .filter(([, topic]) => !topic)
      .map(([key]) => key);

    if (missingTopics.length > 0) {
      console.log(`⚠️ Missing topics: ${missingTopics.join(', ')}. Run seed-database.js first.`);
    }

    const cardSortGames = [
      {
        topic: topicMap.fundamentalRights?._id,
        title: 'Fundamental Rights Classification Challenge',
        type: 'game',
        content:
          'Classify constitutional articles into the correct Fundamental Rights category.',
        order: REINFORCEMENT_ORDER,
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 50,
        gameConfig: {
          type: 'card-sort',
          config: {
            categories: [
              'Right to Equality',
              'Right to Freedom',
              'Right Against Exploitation',
              'Freedom of Religion',
              'Cultural & Educational Rights',
              'Constitutional Remedies'
            ],
            cards: [
              { text: 'Article 14', category: 'Right to Equality' },
              { text: 'Article 15', category: 'Right to Equality' },
              { text: 'Article 19', category: 'Right to Freedom' },
              { text: 'Article 21', category: 'Right to Freedom' },
              { text: 'Article 23', category: 'Right Against Exploitation' },
              { text: 'Article 24', category: 'Right Against Exploitation' },
              { text: 'Article 25', category: 'Freedom of Religion' },
              { text: 'Article 26', category: 'Freedom of Religion' },
              { text: 'Article 29', category: 'Cultural & Educational Rights' },
              { text: 'Article 30', category: 'Cultural & Educational Rights' },
              { text: 'Article 32', category: 'Constitutional Remedies' },
              { text: 'Right to move Supreme Court', category: 'Constitutional Remedies' }
            ]
          }
        },
        isActive: true
      },
      {
        topic: topicMap.fundamentalDuties?._id,
        title: 'Fundamental Duties Classification Challenge',
        type: 'game',
        content: 'Classify Fundamental Duties into their correct categories.',
        order: REINFORCEMENT_ORDER,
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 50,
        gameConfig: {
          type: 'card-sort',
          config: {
            categories: [
              'National Duty',
              'Social Duty',
              'Environmental Duty',
              'Scientific & Educational Duty'
            ],
            cards: [
              { text: 'Respect Constitution', category: 'National Duty' },
              { text: 'Respect National Flag', category: 'National Duty' },
              { text: 'Protect Sovereignty', category: 'National Duty' },
              { text: 'Promote Harmony', category: 'Social Duty' },
              { text: 'Safeguard Public Property', category: 'Social Duty' },
              { text: 'Protect Environment', category: 'Environmental Duty' },
              { text: 'Protect Forests', category: 'Environmental Duty' },
              { text: 'Develop Scientific Temper', category: 'Scientific & Educational Duty' },
              { text: 'Strive Towards Excellence', category: 'Scientific & Educational Duty' }
            ]
          }
        },
        isActive: true
      },
      {
        topic: topicMap.unionGovernment?._id,
        title: 'Constitutional Bodies Classification Challenge',
        type: 'game',
        content:
          'Classify institutions into their correct constitutional category.',
        order: REINFORCEMENT_ORDER,
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 50,
        gameConfig: {
          type: 'card-sort',
          config: {
            categories: [
              'Constitutional Bodies',
              'Statutory Bodies',
              'Executive Bodies'
            ],
            cards: [
              { text: 'Election Commission', category: 'Constitutional Bodies' },
              { text: 'UPSC', category: 'Constitutional Bodies' },
              { text: 'Finance Commission', category: 'Constitutional Bodies' },
              { text: 'CAG', category: 'Constitutional Bodies' },
              { text: 'NHRC', category: 'Statutory Bodies' },
              { text: 'CIC', category: 'Statutory Bodies' },
              { text: 'NCPCR', category: 'Statutory Bodies' },
              { text: 'NITI Aayog', category: 'Executive Bodies' },
              { text: 'National Development Council', category: 'Executive Bodies' }
            ]
          }
        },
        isActive: true
      },
      {
        topic: topicMap.divisionOfPowers?._id,
        title: 'Union-State-Concurrent List Challenge',
        type: 'game',
        content: 'Classify subjects into Union, State and Concurrent Lists.',
        order: REINFORCEMENT_ORDER,
        moduleStep: 'reinforcement-activity',
        estimatedTime: 8,
        points: 50,
        gameConfig: {
          type: 'card-sort',
          config: {
            categories: ['Union List', 'State List', 'Concurrent List'],
            cards: [
              { text: 'Defence', category: 'Union List' },
              { text: 'Foreign Affairs', category: 'Union List' },
              { text: 'Atomic Energy', category: 'Union List' },
              { text: 'Police', category: 'State List' },
              { text: 'Agriculture', category: 'State List' },
              { text: 'Public Health', category: 'State List' },
              { text: 'Education', category: 'Concurrent List' },
              { text: 'Forests', category: 'Concurrent List' },
              { text: 'Marriage', category: 'Concurrent List' },
              { text: 'Criminal Law', category: 'Concurrent List' }
            ]
          }
        },
        isActive: true
      },
      {
        topic: topicMap.landmarkJudgments?._id,
        title: 'Landmark Supreme Court Cases Challenge',
        type: 'game',
        content:
          'Classify landmark cases according to their constitutional significance.',
        order: REINFORCEMENT_ORDER,
        moduleStep: 'reinforcement-activity',
        estimatedTime: 10,
        points: 60,
        gameConfig: {
          type: 'card-sort',
          config: {
            categories: [
              'Basic Structure',
              'Fundamental Rights',
              'Federalism',
              'Privacy Rights'
            ],
            cards: [
              { text: 'Kesavananda Bharati', category: 'Basic Structure' },
              { text: 'Minerva Mills', category: 'Basic Structure' },
              { text: 'Maneka Gandhi', category: 'Fundamental Rights' },
              { text: 'Golaknath', category: 'Fundamental Rights' },
              { text: 'S.R. Bommai', category: 'Federalism' },
              { text: 'Puttaswamy', category: 'Privacy Rights' }
            ]
          }
        },
        isActive: true
      }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const game of cardSortGames) {
      if (!game.topic) {
        console.log(`⏭️ Skipping ${game.title} — topic not found`);
        skipped += 1;
        continue;
      }

      const existingGame = await Content.findOne({ title: game.title });

      if (existingGame) {
        console.log(`🔄 Updating ${game.title}`);
        await Content.findByIdAndUpdate(existingGame._id, game);
        updated += 1;
      } else {
        console.log(`➕ Creating ${game.title}`);
        await Content.create(game);
        created += 1;
      }
    }

    console.log(`✅ Card Sort games complete (${created} created, ${updated} updated, ${skipped} skipped)`);

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error seeding game:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}
