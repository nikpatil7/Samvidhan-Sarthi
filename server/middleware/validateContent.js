/**
 * validateContent middleware
 *
 * Runs save-time validations on Content create/update requests, in order:
 *  1. Constitutional-concept word limit (> 800 → 422)
 *  2. Compute and set estimatedTime on req.body
 *  3. Plain-language suppression check
 *  4. Priority_Topic real-life-scenario citizen-role validation
 *  5. Priority_Topic case-example landmark case name validation
 *  6. Quiz question count and application-ratio validation
 *
 * All 422 responses share the shape: { error: "ValidationFailed", details: [string] }
 *
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 11.2
 */

'use strict';

const { countWords, computeEstimatedTime } = require('../utils/wordCount');
const { isPriorityTopic } = require('../utils/constants');
const Topic = require('../models/Topic');

// ─── Constants ───────────────────────────────────────────────────────────────

/** Five forbidden legalese phrases (tested case-insensitively). */
const FORBIDDEN_PHRASES = [
  'thereof',
  'hereinafter',
  'as per Article',
  'notwithstanding the provisions of',
  'subject to the provisions of'
];

/**
 * Landmark case names that must appear verbatim (case-sensitive) in a
 * Priority_Topic case-example Content document.
 */
const LANDMARK_CASES = [
  'Kesavananda Bharati',
  'Maneka Gandhi',
  'Vishaka',
  'S.R. Bommai',
  'Indra Sawhney',
  'Minerva Mills'
];

/** Words whose presence in real-life-scenario content is acceptable (ordinary citizens). */
const CITIZEN_INCLUSION_LIST = [
  'student', 'teacher', 'farmer', 'worker', 'voter',
  'resident', 'citizen', 'family', 'parent', 'child'
];

/** Words whose presence in real-life-scenario content is NOT acceptable (officials/lawyers). */
const CITIZEN_EXCLUSION_LIST = [
  'minister', 'politician', 'judge', 'advocate',
  'lawyer', 'official', 'bureaucrat'
];

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Returns true if `text` contains `phrase` in a case-insensitive search.
 * @param {string} text
 * @param {string} phrase
 * @returns {boolean}
 */
function containsCaseInsensitive(text, phrase) {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

/**
 * Returns true if `text` contains `word` as a whole word (case-insensitive).
 * Uses a simple word-boundary pattern so "farmer" does not match "farmerly".
 * @param {string} text
 * @param {string} word
 * @returns {boolean}
 */
function containsWord(text, word) {
  const pattern = new RegExp(`\\b${word}\\b`, 'i');
  return pattern.test(text);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Express async middleware that validates Content documents before save.
 * Attaches a computed `estimatedTime` to `req.body` on success.
 * Returns HTTP 422 with { error, details } on any validation failure.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function validateContent(req, res, next) {
  const {
    moduleStep,
    content = '',
    plainLanguageValidated,
    type,
    quiz,
    topic: topicId
  } = req.body;

  // ── 1. Constitutional-concept word limit ──────────────────────────────────
  if (moduleStep === 'constitutional-concept') {
    const wordCount = countWords(content);
    if (wordCount > 800) {
      return res.status(422).json({
        error: 'ValidationFailed',
        details: ['Content exceeds 800-word limit']
      });
    }
  }

  // ── 2. Compute and attach estimatedTime ───────────────────────────────────
  req.body.estimatedTime = computeEstimatedTime(content);

  // ── 3. Plain-language suppression check ───────────────────────────────────
  if (plainLanguageValidated === true) {
    const forbidden = FORBIDDEN_PHRASES.find((phrase) =>
      containsCaseInsensitive(content, phrase)
    );
    if (forbidden) {
      return res.status(422).json({
        error: 'ValidationFailed',
        details: [
          'Content contains formal legal language ("' + forbidden + '"). ' +
          'Remove the plainLanguageValidated flag or rewrite the content ' +
          'before publishing.'
        ]
      });
    }
  }

  // ── 4 & 5. Priority_Topic checks — resolve topic title once ───────────────
  const needsPriorityCheck =
    moduleStep === 'real-life-scenario' || moduleStep === 'case-example';

  if (needsPriorityCheck && topicId) {
    let topicTitle = req.body.topicTitle; // caller may pre-resolve it

    if (!topicTitle) {
      try {
        const topicDoc = await Topic.findById(topicId).select('title').lean();
        if (topicDoc) {
          topicTitle = topicDoc.title;
        }
      } catch (_err) {
        // If the DB query fails we cannot confirm Priority_Topic status;
        // pass through to avoid false-positive rejections.
        topicTitle = null;
      }
    }

    const priority = topicTitle ? isPriorityTopic(topicTitle) : false;

    if (priority) {
      // ── 4. Citizen-role validation for real-life-scenario ─────────────────
      if (moduleStep === 'real-life-scenario') {
        const hasInclusionWord = CITIZEN_INCLUSION_LIST.some((word) =>
          containsWord(content, word)
        );
        const hasExclusionWord = CITIZEN_EXCLUSION_LIST.some((word) =>
          containsWord(content, word)
        );

        if (!hasInclusionWord || hasExclusionWord) {
          return res.status(422).json({
            error: 'ValidationFailed',
            details: [
              'real-life-scenario for a Priority_Topic must feature an ordinary ' +
              'citizen (student, voter, etc.) and must not reference official or ' +
              'legal roles (minister, politician, judge, etc.).'
            ]
          });
        }
      }

      // ── 5. Landmark case name validation for case-example ─────────────────
      if (moduleStep === 'case-example') {
        const hasLandmarkCase = LANDMARK_CASES.some((caseName) =>
          content.includes(caseName)  // case-sensitive per requirements
        );

        if (!hasLandmarkCase) {
          return res.status(422).json({
            error: 'ValidationFailed',
            details: [
              'case-example for a Priority_Topic must reference at least one ' +
              'landmark case: ' + LANDMARK_CASES.join(', ') + '.'
            ]
          });
        }
      }
    }
  }

  // ── 6. Quiz question count and application-ratio validation ───────────────
  if (type === 'quiz' && quiz && Array.isArray(quiz.questions)) {
    const questions = quiz.questions;
    const details = [];

    if (questions.length < 5) {
      details.push('Quiz must have at least 5 questions');
    }

    const applicationCount = questions.filter(
      (q) => q.questionType === 'application'
    ).length;
    const total = questions.length;
    const ratio = total > 0 ? applicationCount / total : 0;

    if (ratio < 0.7) {
      details.push('At least 70% of questions must be application type');
    }

    if (details.length > 0) {
      return res.status(422).json({
        error: 'ValidationFailed',
        details
      });
    }
  }

  // All checks passed — continue to the route handler
  next();
}

module.exports = { validateContent };
