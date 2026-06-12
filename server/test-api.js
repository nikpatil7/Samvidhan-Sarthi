require('dotenv').config();
const axios = require('axios');

const BASE = 'http://localhost:5000/api';

async function run() {
  const suffix = Date.now();
  const errors = [];

  try {
    const reg = await axios.post(`${BASE}/auth/register`, {
      username: `u${suffix}`.slice(0, 20),
      email: `test${suffix}@example.com`,
      password: 'test123',
      name: 'Test User',
    });
    const token = reg.data.token;
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✓ Register');

    await axios.get(`${BASE}/auth/me`, auth);
    console.log('✓ Auth me');

    const topics = await axios.get(`${BASE}/content/topics/India`);
    const topicId = topics.data[0]._id;
    console.log(`✓ Topics (${topics.data.length})`);

    const content = await axios.get(`${BASE}/content/topics/${topicId}/content`);
    console.log(`✓ Content (${content.data.length})`);

    const progressBefore = await axios.get(`${BASE}/progress/${topicId}`, auth);
    console.log(`✓ Progress before: ${progressBefore.data.completionPercentage}%`);

    const lesson = content.data.find((c) => c.type === 'lesson') || content.data[0];
    const track = await axios.post(
      `${BASE}/content/track`,
      {
        topicId,
        contentId: lesson._id,
        type: lesson.type,
        completed: true,
      },
      auth
    );
    console.log(`✓ Track lesson: ${track.data.progress.completionPercentage}%`);

    const progressAfter = await axios.get(`${BASE}/progress/${topicId}`, auth);
    console.log(`✓ Progress after: ${progressAfter.data.completionPercentage}%`);

    const dashboard = await axios.get(`${BASE}/users/dashboard?country=India`, auth);
    console.log(`✓ Dashboard overall: ${dashboard.data.stats.overallProgress}%`);

    const games = await axios.get(`${BASE}/content/games/all`);
    for (const type of ['quiz', 'scenario', 'matching', 'spiral', 'timeline']) {
      const g = games.data[type];
      if (!g || !g.data || (Array.isArray(g.data) && g.data.length === 0)) {
        errors.push(`Game type ${type} has empty data`);
      }
    }
    console.log('✓ Games/all');

    const achievements = await axios.get(`${BASE}/users/achievements`, auth);
    console.log(`✓ Achievements (${achievements.data.badges.length})`);

    const search = await axios.get(`${BASE}/content/search?query=preamble`);
    console.log(`✓ Search (${search.data.topics.length} topics)`);

    if (progressAfter.data.completionPercentage <= progressBefore.data.completionPercentage) {
      errors.push('Progress did not increase after tracking completion');
    }
  } catch (err) {
    errors.push(err.response?.data?.message || err.message);
  }

  if (errors.length) {
    console.error('\nFAILURES:');
    errors.forEach((e) => console.error(' -', e));
    process.exit(1);
  }
  console.log('\nAll API tests passed');
}

run();
