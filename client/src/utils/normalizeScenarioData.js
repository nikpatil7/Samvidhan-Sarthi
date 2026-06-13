/**
 * Normalizes scenario payloads from legacy (options + isCorrect)
 * and migrated (choices + outcome) schemas into a single shape.
 */

function isChoiceCorrect(choice) {
  if (!choice || typeof choice !== 'object') return false;
  if (choice.isCorrect != null) return Boolean(choice.isCorrect);
  if (choice.correct != null) return Boolean(choice.correct);
  if (choice.outcome != null) {
    const outcome = String(choice.outcome).toLowerCase();
    return outcome === 'correct' || outcome === 'true';
  }
  return false;
}

function normalizeChoice(choice) {
  return {
    text: choice?.text || '',
    isCorrect: isChoiceCorrect(choice),
    feedback: choice?.feedback || ''
  };
}

function normalizeScenario(scenario) {
  if (!scenario || typeof scenario !== 'object') return null;

  const rawOptions = scenario.options || scenario.choices || [];
  const options = rawOptions.map(normalizeChoice).filter((option) => option.text);

  return {
    title: scenario.title || 'Constitutional Scenario',
    situation: scenario.situation || scenario.description || '',
    description: scenario.description || scenario.situation || '',
    question: scenario.question || 'What would you decide?',
    hint: scenario.hint,
    options
  };
}

export function normalizeScenarioData(input) {
  if (!input) return [];

  if (!Array.isArray(input)) {
    const normalized = normalizeScenario(input);
    return normalized && normalized.options.length > 0 ? [normalized] : [];
  }

  return input
    .map(normalizeScenario)
    .filter((scenario) => scenario && scenario.options.length > 0);
}

export default normalizeScenarioData;
