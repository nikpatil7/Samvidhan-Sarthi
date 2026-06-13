/**
 * Feature: learning-architecture-restructure
 * Property 15: Schema Backward Compatibility
 * Validates: Requirements 5.1, 5.3
 *
 * For any existing Content, Topic, or User document that lacks the new optional
 * fields (moduleStep, plainLanguageValidated, migrationStatus, learningStreak,
 * lastActivityDate), fetching it via Mongoose should return the document with all
 * original fields intact and no Mongoose validation error.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fc = require('fast-check');

// Require models relative to their actual location
const Content = require('../../models/Content');
const Topic = require('../../models/Topic');
const User = require('../../models/User');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up all collections between tests
  await Content.deleteMany({});
  await Topic.deleteMany({});
  await User.deleteMany({});
});

// ---------------------------------------------------------------------------
// Helper: create a minimal valid Topic (needed as FK for Content)
// ---------------------------------------------------------------------------
async function createLegacyTopic(overrides = {}) {
  return Topic.create({
    title: overrides.title || 'Test Topic',
    description: overrides.description || 'A test topic description',
    country: overrides.country || 'India',
    category: overrides.category || 'other',
    // NOTE: migrationStatus is intentionally omitted to simulate a legacy doc
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// 1. Legacy Content documents (no moduleStep, no plainLanguageValidated)
// ---------------------------------------------------------------------------

describe('Property 15 — Legacy Content backward compatibility', () => {
  it('inserts and retrieves legacy Content docs without new optional fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate varied title strings — must not be whitespace-only (trim: true, required: true)
        fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
        // Generate content body text (required, so must have actual chars)
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        // Generate order and points values
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 50 }),
        async (title, contentBody, order, points) => {
          // Create a topic to satisfy the FK ref
          const topic = await createLegacyTopic({ title: `Topic-${title.slice(0, 20)}` });

          // Build a legacy Content document — intentionally omit moduleStep and
          // plainLanguageValidated (the new optional fields added in this feature)
          const legacyData = {
            topic: topic._id,
            title,
            type: 'lesson',
            content: contentBody,
            order,
            points,
            isActive: true,
          };

          // Insert via Mongoose — must not throw a validation error
          let saved;
          try {
            saved = await Content.create(legacyData);
          } catch (err) {
            throw new Error(`Content.create threw unexpectedly: ${err.message}`);
          }

          // Fetch back by ID — simulates the "existing API endpoint" fetch
          const fetched = await Content.findById(saved._id).lean();

          // Assert: document was returned (no null / not-found)
          expect(fetched).not.toBeNull();

          // Assert: all original fields are intact
          // Note: title has trim:true so compare against trimmed value
          expect(fetched.title).toBe(title.trim());
          expect(String(fetched.topic)).toBe(String(topic._id));
          expect(fetched.type).toBe('lesson');
          expect(fetched.content).toBe(contentBody);
          expect(fetched.order).toBe(order);
          expect(fetched.points).toBe(points);
          expect(fetched.isActive).toBe(true);

          // Assert: the new optional fields are absent or carry their defaults
          // (moduleStep defaults to undefined — Mongoose omits it from lean docs
          //  when never set; plainLanguageValidated defaults to false)
          expect(fetched.moduleStep).toBeUndefined();
          expect(fetched.plainLanguageValidated).toBe(false);

          // Cleanup within the property run to avoid ID collisions across runs
          await Content.deleteOne({ _id: saved._id });
          await Topic.deleteOne({ _id: topic._id });
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Legacy Topic documents (no migrationStatus)
// ---------------------------------------------------------------------------

describe('Property 15 — Legacy Topic backward compatibility', () => {
  it('inserts and retrieves legacy Topic docs without migrationStatus field', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.constantFrom('fundamental-rights', 'judiciary', 'legislature', 'other'),
        async (title, description, category) => {
          // Build a legacy Topic — intentionally omit migrationStatus
          const legacyData = {
            title: `Legacy-${title.slice(0, 30)}`,
            description,
            country: 'India',
            category,
          };

          let saved;
          try {
            saved = await Topic.create(legacyData);
          } catch (err) {
            throw new Error(`Topic.create threw unexpectedly: ${err.message}`);
          }

          const fetched = await Topic.findById(saved._id).lean();

          expect(fetched).not.toBeNull();

          // Original fields intact
          // Note: title has trim:true so compare against trimmed value
          expect(fetched.title).toBe(legacyData.title.trim());
          expect(fetched.description).toBe(description);
          expect(fetched.country).toBe('India');
          expect(fetched.category).toBe(category);

          // migrationStatus should carry its schema default ('legacy')
          // because the field has default: 'legacy' — it is inserted by Mongoose
          expect(fetched.migrationStatus).toBe('legacy');

          await Topic.deleteOne({ _id: saved._id });
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Legacy User documents (no learningStreak, no lastActivityDate)
// ---------------------------------------------------------------------------

describe('Property 15 — Legacy User backward compatibility', () => {
  it('inserts and retrieves legacy User docs without learningStreak / lastActivityDate', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate unique-ish usernames using an integer suffix
        fc.integer({ min: 100000, max: 999999 }),
        fc.boolean(),
        async (suffix, isAdmin) => {
          // Build a legacy User — omit learningStreak and lastActivityDate
          const legacyData = {
            username: `user${suffix}`,
            email: `user${suffix}@test.com`,
            password: 'password123',   // will be hashed by pre-save hook
            name: `Test User ${suffix}`,
            preferredCountry: 'India',
            role: isAdmin ? 'admin' : 'user',
          };

          let saved;
          try {
            saved = await User.create(legacyData);
          } catch (err) {
            throw new Error(`User.create threw unexpectedly: ${err.message}`);
          }

          const fetched = await User.findById(saved._id).lean();

          expect(fetched).not.toBeNull();

          // Original fields intact
          expect(fetched.username).toBe(legacyData.username);
          expect(fetched.email).toBe(legacyData.email.toLowerCase());
          expect(fetched.name).toBe(legacyData.name);
          expect(fetched.role).toBe(isAdmin ? 'admin' : 'user');

          // New optional fields should carry schema defaults
          // learningStreak defaults to 0
          expect(fetched.learningStreak).toBe(0);
          // lastActivityDate defaults to null
          expect(fetched.lastActivityDate).toBeNull();

          await User.deleteOne({ _id: saved._id });
        }
      ),
      { numRuns: 50 }
    );
  });
});
