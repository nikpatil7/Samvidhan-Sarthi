// Canonical database bootstrap — safe, ordered seed pipeline.
// Run from server/:  node seed-all.js
// Or from root:      npm run seed
//
// Excluded (destructive, redundant, or broken):
//   seeds/seed-content.js, seeds/seed-mock-topics.js
//   migrate-add-experiential-content.js, migrate-add-interactive-games.js
//   migrate-phase1-add-more-application-questions.js, migrate-phase1-final-application-questions.js
//   all migrate-add-application-questions-* duplicates

require('dotenv').config();
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverDir = __dirname;

const SEED_SCRIPTS = [
  // Bootstrap
  'seed-database.js',

  // Stream B — module-step content architecture
  'seeds/migrate-phase1-content-classification.js',
  'seeds/migrate-phase1-application-questions.js',
  'seeds/migrate-phase2-scenario-integration.js',
  'seeds/migrate-phase2-pretest-posttest.js',
  'seeds/migrate-complete-module-steps.js',
  'seeds/migrate-phase3-content-template.js',
  'seeds/migrate-phase3-plain-language-validation.js',

  // Stream A — supplementary content (topic-attached, not destructive)
  'seeds/add-constitutional-scenarios.js',
  'seeds/add-card-sort-game.js',
  'seeds/add-constitutional-quizzes.js',
  'seeds/add-user-stories.js',

  // Badges
  'seeds/migrate-phase4-new-badges.js',
];

function runScript(relativePath) {
  const scriptPath = path.join(serverDir, relativePath);

  if (!fs.existsSync(scriptPath)) {
    console.error(`\n❌ Script not found: ${relativePath}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`▶  ${relativePath}`);
  console.log('='.repeat(60) + '\n');

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: serverDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`\n❌ Seed failed at: ${relativePath} (exit code ${result.status})`);
    process.exit(result.status || 1);
  }
}

console.log('🚀 Samvidhan Sarthi — Canonical Database Bootstrap');
console.log(`   ${SEED_SCRIPTS.length} scripts in safe order:\n`);
SEED_SCRIPTS.forEach((script, index) => {
  console.log(`   ${String(index + 1).padStart(2, ' ')}. ${script}`);
});
console.log('');

for (const script of SEED_SCRIPTS) {
  runScript(script);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 Canonical seed pipeline completed successfully!');
console.log('='.repeat(60));
