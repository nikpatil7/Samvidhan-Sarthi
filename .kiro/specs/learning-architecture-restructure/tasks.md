# Implementation Plan: Learning Architecture Restructure

## Overview

Transform Samvidhan Sarthi from a flat content-delivery model into a structured seven-step experiential learning architecture. All changes are strictly additive and backward-compatible. The `migrationStatus` field on the Topic model gates which render path `TopicDetail.js` uses, ensuring zero disruption to topics not yet migrated. The implementation proceeds in logical layers: schema extensions → shared utilities → backend routes and validation → new frontend components → pre-test/KYR features → badge/analytics → seeding and migration scripts.

## Tasks

---

- [x] 1. Extend Mongoose schemas with new optional fields
  - [x] 1.1 Add `moduleStep`, `plainLanguageValidated`, and `questionType` fields to `server/models/Content.js`
    - Add `moduleStep` as an optional `String` enum with values `['why-it-matters', 'real-life-scenario', 'constitutional-concept', 'case-example', 'interactive-assessment', 'reinforcement-activity', 'key-takeaways']` and `default: undefined`
    - Add `plainLanguageValidated` as `Boolean` with `default: false`
    - Add `questionType` to each element of `quiz.questions[]` as `String` enum `['recall', 'application']` with `default: 'recall'`
    - Ensure all three additions are optional so existing documents without these fields pass validation without error
    - _Requirements: 5.1, 5.4_

  - [x] 1.2 Add `migrationStatus` field to `server/models/Topic.js`
    - Add `migrationStatus` as `String` enum `['legacy', 'partial', 'complete']` with `default: 'legacy'`
    - _Requirements: 5.1, 12.4_

  - [x] 1.3 Add `scenarioPerformanceScore` and `completedAt` fields to `server/models/Progress.js`
    - Add `scenarioPerformanceScore` as `Number` with `min: 0, max: 100, default: null`
    - Add `completedAt` as `Date` with `default: null`
    - Extend `quizScores[]` element inline to accept an optional `stepType` string field
    - Extend `activities[]` element inline to accept optional fields: `activityType`, `scenarioIndex`, `chosenOptionIndex`, `isCorrect`, `isFirstAttempt`, `completedAt`
    - _Requirements: 5.1, 5.4_

  - [x] 1.4 Add `learningStreak` and `lastActivityDate` fields to `server/models/User.js`
    - Add `learningStreak` as `Number` with `default: 0`
    - Add `lastActivityDate` as `Date` with `default: null`
    - _Requirements: 5.1, 8.3_

  - [x] 1.5 Formalise `Assessment` model in `server/models/Assessment.js`
    - Replace the existing plain-object comment with a proper Mongoose schema
    - Fields: `userId` (ObjectId ref User, required, unique), `preTestScore` (Number, min 0, max 10, default null), `postTestScore` (Number, min 0, max 10, default null), `completedPreTest` (Boolean, default false), `completedPostTest` (Boolean, default false), `improvement` (Number, default null), `createdAt` (Date, default Date.now)
    - Export as `mongoose.model('Assessment', assessmentSchema)`
    - _Requirements: 6.2_

  - [x] 1.6 Create `RightsQuery` model in `server/models/RightsQuery.js`
    - Fields: `userId` (ObjectId, default null), `queryText` (String, required, maxlength 500), `matchedTopicIds` (Array of ObjectId), `createdAt` (Date, default Date.now)
    - _Requirements: 10.4_

  - [x] 1.7 Write property test for schema backward compatibility (Property 15)
    - **Property 15: Schema Backward Compatibility**
    - **Validates: Requirements 5.1, 5.3**
    - Use `mongodb-memory-server` to insert legacy Content/Topic/User documents without new fields, then fetch via existing API paths; assert HTTP 200 and all original fields intact

---

- [ ] 2. Implement shared server utilities
  - [x] 2.1 Create `server/utils/constants.js` — canonical step order and priority topic list
    - Export `MODULE_STEP_ORDER` array with the seven step slugs in canonical order
    - Export `PRIORITY_TOPICS` array with the ten exact title strings (case-insensitive matching helper `isPriorityTopic(title)` exported alongside)
    - _Requirements: 1.1, 11.1_

  - [x] 2.2 Write property test for Priority_Topic classification (Property 28)
    - **Property 28: Priority_Topic Classification**
    - **Validates: Requirements 11.1**
    - Use `fc.string()` and `fc.constantFrom(...PRIORITY_TOPICS)` to test that `isPriorityTopic` returns `true` only for exact (case-insensitive) matches against the ten canonical values

  - [x] 2.3 Create `server/utils/streakUtils.js` — learning streak update logic
    - Export `updateStreak(user, completionDateUtc)` function
    - If `lastActivityDate` is null → set `learningStreak = 1`, set `lastActivityDate` to today
    - If UTC day difference is exactly 1 → increment `learningStreak`, update `lastActivityDate`
    - If UTC day difference > 1 → reset `learningStreak = 1`, update `lastActivityDate`
    - If UTC day difference is 0 → no change
    - Export `utcDayDiff(dateA, dateB)` helper used internally
    - _Requirements: 8.4, 8.5_

  - [x] 2.4 Write property test for learning streak arithmetic (Property 22)
    - **Property 22: Learning Streak Arithmetic**
    - **Validates: Requirements 8.4, 8.5**
    - Use `fc.date()` generators to test: day diff = 1 → streak+1; day diff > 1 → streak=1; day diff = 0 → streak unchanged; `lastActivityDate` null → streak=1

  - [x] 2.5 Create `server/utils/wordCount.js` — word count and reading time utilities
    - Export `countWords(content)` that counts sequences of non-whitespace characters delimited by whitespace or punctuation
    - Export `computeEstimatedTime(content)` that returns `Math.ceil(countWords(content) / 200)`
    - _Requirements: 2.3, 2.4_

  - [x] 2.6 Write property test for reading time calculation (Property 5)
    - **Property 5: Reading Time Calculation**
    - **Validates: Requirements 2.4**
    - Use `fc.string({ minLength: 1 })` to assert `computeEstimatedTime(s) === Math.ceil(countWords(s) / 200)` for any non-empty string

  - [x] 2.7 Create `server/utils/topicMastery.js` — topic mastery formula
    - Export `computeTopicMastery({ quizScore, scenarioPerformanceScore, gameScore })` that returns `Math.round(quizScore * 0.5 + scenarioPerformanceScore * 0.3 + gameScore * 0.2)`, defaulting missing components to 0
    - _Requirements: 8.1_

  - [x] 2.8 Write property test for topic mastery formula (Property 21)
    - **Property 21: Topic Mastery Formula**
    - **Validates: Requirements 8.1**
    - Use three `fc.integer({ min: 0, max: 100 })` generators to assert the weighted formula holds for all input triples including defaults for absent components

---

- [ ] 3. Implement content validation middleware
  - [x] 3.1 Create `server/middleware/validateContent.js`
    - Implement the `validateContent` middleware for Content create/update routes with these checks in order:
      1. If `moduleStep === 'constitutional-concept'`: count words; return 422 `"Content exceeds 800-word limit"` if > 800
      2. Compute `estimatedTime` via `computeEstimatedTime` and set on `req.body.estimatedTime`
      3. If `plainLanguageValidated === true` and content contains any of the five forbidden phrases (case-insensitive): return 422 author warning
      4. If `moduleStep === 'real-life-scenario'` and topic is a Priority_Topic: validate citizen-role inclusion/exclusion list; return 422 if fails
      5. If `moduleStep === 'case-example'` and topic is a Priority_Topic: require at least one landmark case name (case-sensitive); return 422 if missing
      6. If `type === 'quiz'` and `quiz.questions` present: validate ≥ 5 questions and ≥ 70% application-type ratio; return 422 identifying which condition failed
    - All 422 responses use the shape `{ "error": "ValidationFailed", "details": [...] }`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 11.2_

  - [ ] 3.2 Write property test for constitutional concept word limit (Property 7)
    - **Property 7: Constitutional Concept Word Limit**
    - **Validates: Requirements 2.3**
    - Use `fc.string()` to generate content strings; assert middleware returns 422 iff word count > 800 when `moduleStep === 'constitutional-concept'`

  - [ ] 3.3 Write property test for plain language suppression (Property 6)
    - **Property 6: Plain Language Suppression**
    - **Validates: Requirements 2.2**
    - Use `fc.constantFrom(...FORBIDDEN_PHRASES)` combined with `fc.string()` context; assert suppression occurs iff `plainLanguageValidated === true` AND content contains a forbidden phrase

  - [ ] 3.4 Write property test for Priority_Topic scenario citizen-role validation (Property 8)
    - **Property 8: Priority_Topic Scenario Citizen-Role Validation**
    - **Validates: Requirements 2.5**
    - Use `fc.string()` generators to build content with/without citizen-role words; assert 422 iff exclusion words present AND no inclusion word present for a Priority_Topic `real-life-scenario`

  - [ ] 3.5 Write property test for quiz application ratio validation (Property 9)
    - **Property 9: Quiz Application Ratio Validation**
    - **Validates: Requirements 3.2**
    - Use `fc.array()` of question records to test boundary cases; assert 422 for < 5 questions or < 70% application ratio, HTTP 200 for compliant quizzes

  - [ ] 3.6 Write property test for Priority_Topic case-example landmark validation (Property 29)
    - **Property 29: Priority_Topic Case Example Landmark Validation**
    - **Validates: Requirements 11.2**
    - Use `fc.constantFrom(...LANDMARK_CASES)` to confirm save succeeds only when content includes at least one landmark case string (case-sensitive)

- [ ] 4. Checkpoint — Ensure utilities and middleware tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

- [ ] 5. Extend existing backend routes (content, progress, users, topics)
  - [ ] 5.1 Add `moduleStep` field to Content create/update routes in `server/routes/content.js`
    - Apply `validateContent` middleware to the POST and PUT/PATCH Content endpoints
    - Ensure the `estimatedTime` computed by the middleware overwrites any client-supplied value
    - Preserve all existing request/response fields and URL paths
    - _Requirements: 2.4, 5.2_

  - [ ] 5.2 Add publishability check endpoint to `server/routes/content.js`
    - Add `GET /api/content/topics/:topicId/publishability`
    - Fetch all Content documents for the topic where `moduleStep` is set; check all seven steps are present with `content.length >= 50`; return 422 with `details` array naming incomplete steps if the topic is a Priority_Topic and any step fails; return 200 otherwise
    - _Requirements: 1.6, 11.6_

  - [ ] 5.3 Write property test for Priority_Topic publishability guard (Property 4)
    - **Property 4: Priority_Topic Publishability Guard**
    - **Validates: Requirements 1.6, 11.6**
    - Use `fc.subarray(MODULE_STEP_ORDER)` to generate subsets of missing steps; assert the endpoint returns 422 and lists exactly the missing/undersized step names

  - [ ] 5.4 Extend `/api/content/track` in `server/routes/content.js` to handle Module_Step completions
    - After recording the activity, call `updateStreak(user, today)` and save the User document
    - If `stepType === 'module-assessment'`, record the score in `quizScores[]` with `stepType` tag
    - If `activityType === 'scenario'`, record the full scenario interaction in `activities[]` with all six required fields; then recalculate and store `scenarioPerformanceScore` on the Progress record
    - If all seven Module_Step content IDs for the topic are now present in quizScores or completed activities, set `completedAt` = now and `completionPercentage = 100` on the Progress record
    - If the topic is a Priority_Topic and the computed `topicMastery >= 80`, run the additive badge evaluation (task 10.3) and include `newBadges` in the response
    - _Requirements: 1.4, 3.5, 4.5, 4.6, 8.3, 8.4, 8.5_

  - [ ] 5.5 Write property test for scenario interaction tracking completeness (Property 13)
    - **Property 13: Scenario Interaction Tracking Completeness**
    - **Validates: Requirements 4.5**
    - Use `fc.record()` to generate scenario interaction events; assert the resulting `activities[]` entry always contains all six required fields

  - [ ] 5.6 Write property test for scenario performance score formula (Property 14)
    - **Property 14: Scenario Performance Score Formula**
    - **Validates: Requirements 4.6**
    - Use `fc.array()` of interaction objects; assert `scenarioPerformanceScore === Math.round((C / T) * 100)` where C = first-attempt-correct count and T = total count

  - [ ] 5.7 Write property test for assessment score recording (Property 10)
    - **Property 10: Assessment Score Recording**
    - **Validates: Requirements 3.5**
    - Use `fc.integer({ min: 0, max: 100 })` for score; after track call, assert the Progress document contains a `quizScores[]` entry with the exact score and `stepType: 'module-assessment'`

  - [ ] 5.8 Add PATCH `/api/topics/:id` migration status endpoint to `server/routes/topics.js`
    - Accept body `{ migrationStatus }` and validate the value is one of `['legacy', 'partial', 'complete']`
    - Enforce valid transitions: `legacy→partial`, `partial→complete`, `complete→partial`; return 422 for all other pairs using the standard `ValidationFailed` shape
    - Update the Topic document and return the updated document on success (200)
    - _Requirements: 12.4_

  - [ ] 5.9 Write property test for migration status transition validity (Property 32)
    - **Property 32: Migration Status Transition Validity**
    - **Validates: Requirements 12.4**
    - Use `fc.oneof(fc.constant('legacy'), fc.constant('partial'), fc.constant('complete'))` for both `from` and `to`; assert 200 for valid transitions and 422 for invalid ones across all nine combinations

  - [ ] 5.10 Extend `/api/users/dashboard` in `server/routes/users.js` to add `topicMastery` and `analyticsData`
    - For each topic in the `progress` array, compute `topicMastery` via `computeTopicMastery` and attach it alongside existing fields
    - Add `analyticsData` key with: `scenarioPerformance`, `gamePerformance`, `quizPerformance`, `badgeProgress` (earned/total), `topicsCompleted`, `learningStreak`
    - Preserve all existing fields in the `progress` array and all other existing response keys
    - _Requirements: 8.2, 8.6_

- [ ] 6. Checkpoint — Ensure all backend route tests pass and existing API contract is preserved
  - Ensure all tests pass, ask the user if questions arise.

---

- [ ] 7. Implement new backend routes (pre-test, rights assistant)
  - [ ] 7.1 Create `server/routes/preTest.js` and wire into `server/index.js` as `/api/pre-test`
    - `GET /api/pre-test` — fetch exactly 10 `application`-type questions from the Assessment question bank (stored as Content documents with `type: 'quiz'` and `moduleStep: 'interactive-assessment'`), ensuring at least one question per Priority_Topic; return the question array without correct-answer flags
    - `POST /api/pre-test/submit` — validate answers, compute `preTestScore` (0–10), create or update the `Assessment` document for `req.user.id` with `completedPreTest: true`; return the score and the Assessment document id
    - _Requirements: 6.1, 6.2, 6.7_

  - [ ] 7.2 Write property test for improvement formula (Property 19)
    - **Property 19: Improvement Formula**
    - **Validates: Requirements 6.4**
    - Use `fc.integer({ min: 1, max: 10 })` for `preTestScore` and `fc.integer({ min: 0, max: 10 })` for `postTestScore`; assert stored `improvement === Math.round(((post - pre) / pre) * 1000) / 10`

  - [ ] 7.3 Create `server/routes/rightsAssistant.js` and wire into `server/index.js` as `/api/rights-assistant`
    - `GET /api/rights-assistant?q=...` — tokenise query (split on whitespace/punctuation, keep tokens ≥ 4 chars); query `Topic.find` with case-insensitive regex against `title` and `description`; return up to 5 matching topics with `_id` and `title`; always include `disclaimer` string in response; store a `RightsQuery` document (with `userId: null` for unauthenticated requests)
    - Return HTTP 200 with an empty `topics` array and the disclaimer when no matches are found (never 4xx)
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 7.4 Write property test for KYR keyword matching correctness (Property 25)
    - **Property 25: KYR Keyword Matching Correctness**
    - **Validates: Requirements 10.2**
    - Use `fc.string()` for query and `fc.array()` of topic stubs; assert the matching function returns only topics sharing ≥ 1 token of ≥ 4 chars with the query AND result count ≤ 5

  - [ ] 7.5 Write property test for KYR disclaimer invariant (Property 26)
    - **Property 26: KYR Disclaimer Invariant**
    - **Validates: Requirements 10.3**
    - Use `fc.string()` queries (including empty, whitespace, no-match, and matching cases); assert the response payload always contains the full disclaimer string

---

- [ ] 8. Implement core frontend components
  - [ ] 8.1 Create `client/src/components/ModuleStepNavigator.js`
    - Props: `topicId: string`, `steps: ContentDocument[]`, `legacyContent: ContentDocument[]`, `progress: ProgressDocument`, `migrationStatus: string`
    - Sort `steps` by `MODULE_STEP_ORDER` canonical index; for `migrationStatus: 'partial'` append `legacyContent` as a flat list after the last step
    - Implement `canProceedToStep(stepIndex, progress)`: passive steps (indices 0, 2, 3, 6) gated on acknowledgment flag in progress; index 4 (interactive-assessment) gated on quiz submission; index 5 (reinforcement-activity) gated on at least one scenario/game activity recorded
    - For missing steps (non-priority topics), render a placeholder card with step name + "Coming soon"
    - _Requirements: 1.2, 1.3, 1.7, 12.1, 12.3_

  - [ ] 8.2 Write property test for step gating logic (Property 3)
    - **Property 3: Step Gating Logic**
    - **Validates: Requirements 1.3**
    - Use `fc.integer({ min: 0, max: 6 })` for step index and `fc.record()` for progress state; assert `canProceedToStep` returns `false` iff the preceding step's completion condition is unmet for every step/progress combination

  - [ ] 8.3 Write property test for step order invariant (Property 2)
    - **Property 2: Step Order Invariant**
    - **Validates: Requirements 1.2, 12.1**
    - Use `fc.shuffledSubarray(MODULE_STEP_ORDER)` to generate reordered step arrays; assert that after sorting by canonical index the `moduleStep` sequence matches `MODULE_STEP_ORDER` for every valid permutation

  - [ ] 8.4 Write property test for partial migration ordering (Property 31)
    - **Property 31: Partial Migration Ordering**
    - **Validates: Requirements 12.3**
    - Use `fc.array()` of mixed step/legacy content documents; assert Module_Step docs appear before legacy docs and are in canonical step order in the rendered list

  - [ ] 8.5 Create `client/src/components/ModuleStepCard.js`
    - Props: `step: ContentDocument | null`, `stepName: string`, `isLocked: boolean`, `isCompleted: boolean`, `onComplete: (stepId) => void`
    - Render step content using existing `<ReactMarkdown>` pipeline (same as `ContentDetail.js`)
    - Show "Coming soon" placeholder when `step` is null
    - Show lock indicator when `isLocked` is true
    - For passive steps, emit `onComplete(step._id)` when user scrolls to bottom and clicks an "I've read this" acknowledgment button
    - Display `estimatedTime` as "[N] min read"
    - _Requirements: 1.3, 1.7, 2.1, 2.4_

  - [ ] 8.6 Create `client/src/components/ScenarioViewer.js`
    - Props: `scenarios: ScenarioObject[]`, `onComplete: (interactions: ScenarioInteraction[]) => void`
    - Display `situation` text and 2–4 option buttons; on option click, render `constitutionalExplanation` and `learningOutcome` inline without navigation change
    - Track `isFirstAttempt` per scenario per session (use local `Set` of scenario indices already answered)
    - Show "Continue" button to advance to the next scenario only after the explanation is visible
    - Emit `onComplete` with the full interactions array after the last scenario is answered
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 8.7 Create `client/src/components/ReinforcementActivityWrapper.js`
    - Props: `topicId: string`, `gameConfig: object`, `contentId: string`, `onComplete: (score) => void`
    - Read `gameConfig.type` and render the matching existing game component (MatchingGame, QuizGame, ScenarioGame, SpiralGame, or TimelineGame) passing through all required game props unchanged
    - Render a "Return to Module" button as a sibling element (not inside the game component) that calls `navigate('/topics/:topicId')`
    - On game completion, call `onComplete(score)` which the parent uses to call `/api/content/track`
    - _Requirements: 9.2, 9.3, 9.5_

- [ ] 9. Checkpoint — Ensure all new frontend component tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

- [ ] 10. Modify `TopicDetail.js` and `Topics.js`
  - [ ] 10.1 Modify `client/src/pages/TopicDetail.js` to branch on `migrationStatus`
    - Import `ModuleStepNavigator` component
    - After fetching topic + content, split content into `moduleSteps` (documents with a `moduleStep` value, sorted by canonical order) and `legacyContent` (documents without)
    - Branch: if `topic.migrationStatus === 'legacy'` → render existing flat content list (no changes to existing JSX); if `'partial'` or `'complete'` → render `<ModuleStepNavigator>`
    - Fetch `topicMastery` from the dashboard endpoint and display it as a percentage badge alongside the existing `completionPercentage` progress bar
    - _Requirements: 5.5, 8.7, 12.1, 12.5_

  - [ ] 10.2 Write property test for render-mode selection (Property 17)
    - **Property 17: Render-Mode Selection by migrationStatus**
    - **Validates: Requirements 5.5, 12.1, 12.5**
    - Use `fc.oneof(fc.constant('legacy'), fc.constant('partial'), fc.constant('complete'))` to assert the render-mode selector function returns `'module-step-ui'` for `partial`/`complete` and `'flat-list'` for `legacy`

  - [ ] 10.3 Modify `client/src/pages/Topics.js` to show "Featured" label on Priority_Topic cards
    - After the existing topic card JSX, conditionally render `<span className="featured-label">Featured</span>` as a sibling element when `isPriorityTopic(topic.title)` returns true
    - Do not add, remove, or modify any props on the existing topic card component
    - _Requirements: 11.3_

  - [ ] 10.4 Write property test for Priority_Topic featured label (Property 30)
    - **Property 30: Priority_Topic Featured Label**
    - **Validates: Requirements 11.3**
    - Use `fc.constantFrom(...PRIORITY_TOPICS)` and `fc.string()` to assert "Featured" label renders iff `isPriorityTopic` returns true for the given title

---

- [ ] 11. Implement Pre-Test pages and redirect guard
  - [ ] 11.1 Create `client/src/pages/PreTestPage.js`
    - Fetch 10 questions from `GET /api/pre-test`; render each with radio-button options; on submit POST to `/api/pre-test/submit`
    - On completion, redirect to the original destination route (stored in location state) or to `/` if none
    - Display a loading state while fetching; disable submit until all 10 questions are answered
    - _Requirements: 6.1, 6.2_

  - [ ] 11.2 Create `client/src/components/PreTestGuard.js`
    - Context-aware wrapper component that wraps all protected routes in `App.js`
    - On mount, fetch or read the cached Assessment document for the current user
    - If `completedPreTest === false` (or no Assessment exists) and current path is not in `['/pre-test', '/login', '/register']`, redirect to `/pre-test` using `<Navigate to="/pre-test" replace />`
    - _Requirements: 6.1, 6.6_

  - [ ] 11.3 Write property test for pre-test redirect guard (Property 18)
    - **Property 18: Pre-Test Redirect Guard**
    - **Validates: Requirements 6.1, 6.6**
    - Use `fc.webPath()` or `fc.string()` for route paths and a boolean for `completedPreTest`; assert redirect to `/pre-test` occurs iff `completedPreTest === false` AND path is not in the exempt list

  - [ ] 11.4 Add `/pre-test` route and wire `PreTestGuard` into `client/src/App.js`
    - Import `PreTestPage` and `PreTestGuard`
    - Add `<Route path="pre-test" element={<PreTestPage />} />` inside the public routes section
    - Wrap the existing protected `<Layout />` route with `<PreTestGuard>` so all authenticated routes are guarded
    - Do not remove or rename any existing routes
    - _Requirements: 6.1, 10.1_

  - [ ] 11.5 Write property test for post-test banner threshold (Property 20)
    - **Property 20: Post-Test Banner Threshold**
    - **Validates: Requirements 6.3**
    - Use `fc.integer({ min: 0, max: 20 })` for `topicsCompleted` and a boolean for `completedPostTest`; assert the banner visibility logic returns true iff `topicsCompleted >= 5 && !completedPostTest`

---

- [ ] 12. Implement Know Your Rights (KYR) Assistant page
  - [ ] 12.1 Create `client/src/pages/RightsAssistantPage.js`
    - Render a text input and submit button for constitutional rights questions
    - On submit: validate input is non-empty/non-whitespace; if invalid, show inline message "Please enter a question" and do NOT call the server
    - Call `GET /api/rights-assistant?q=<query>`; display matched topics as hyperlinks to `/topics/:topicId`
    - Always render the disclaimer text "This is educational information, not legal advice. For legal matters, consult a qualified legal professional." below the results
    - If no topics matched, display the "No matching topics found…" message with a link to `/topics`
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.7_

  - [ ] 12.2 Write property test for empty KYR query validation (Property 27)
    - **Property 27: Empty KYR Query Validation**
    - **Validates: Requirements 10.7**
    - Use `fc.string().filter(s => s.trim() === '')` to generate whitespace-only strings; assert the client-side validation prevents any network call and displays the "Please enter a question" message

  - [ ] 12.3 Add `/rights-assistant` route to `client/src/App.js`
    - Import `RightsAssistantPage`
    - Add `<Route path="rights-assistant" element={<RightsAssistantPage />} />` inside the protected routes section without removing any existing route
    - _Requirements: 10.1_

- [ ] 13. Checkpoint — Ensure all pre-test and KYR tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

- [ ] 14. Implement badge system enhancements
  - [ ] 14.1 Create `server/utils/badgeEvaluator.js` — additive badge evaluation function
    - Export `evaluateNewBadges(userId, progress, assessment, user)` that checks each of the seven new badge criteria:
      - "Preamble Scholar (New)": Preamble topic `topicMastery >= 80`
      - "Rights Protector": all Fundamental Rights sub-topics complete with average mastery ≥ 75%
      - "Constitution Navigator": any 5 Priority_Topics completed (`completionPercentage === 100`)
      - "Democracy Champion": `user.learningStreak >= 7`
      - "Article Detective": ≥ 3 topics with `scenarioPerformanceScore >= 80`
      - "Judicial Thinker": Judiciary topic `topicMastery >= 80`
      - "Samvidhan Sarthi": all 10 Priority_Topics with `completionPercentage === 100`
    - Returns array of `Badge._id` values for newly qualifying badges the user does not already have
    - This function runs AFTER the existing `checkAndAwardAchievements` function; it must not modify that function
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 14.2 Write property test for badge award logic (Property 23)
    - **Property 23: Badge Award Logic**
    - **Validates: Requirements 7.1, 7.3, 11.4**
    - Use `fc.record()` to generate arbitrary learner states (progress, assessment, user); assert `evaluateNewBadges` awards exactly the badges whose threshold conditions are fully satisfied and no badge whose threshold is not satisfied

  - [ ] 14.3 Create `server/seeds/badgeSeed.js` — idempotent badge seeding script
    - Define the seven new badge documents with all required fields (name, description, icon, category, requirements object matching the structured format, rarity)
    - Use `Badge.insertMany()` with `ordered: false` after filtering out any badge names already present in the database (`Badge.find({ name: { $in: names } })`)
    - Never delete existing Badge documents
    - _Requirements: 7.2, 7.6_

  - [ ] 14.4 Write property test for badge seed idempotence (Property 24)
    - **Property 24: Badge Seed Idempotence**
    - **Validates: Requirements 7.6**
    - Use `mongodb-memory-server`; run the seed function N times (N from `fc.integer({ min: 1, max: 5 })`); assert the total Badge document count after N runs equals the count after 1 run

---

- [ ] 15. Implement interactive assessment quiz result screen
  - [ ] 15.1 Add quiz result screen to `ModuleStepCard.js` for `interactive-assessment` step
    - After the learner submits all answers in the Interactive Assessment step, render a results screen showing each question with: learner's chosen answer, correct answer, and the `explanation` field from `quiz.questions[].explanation`
    - If score < 60, display a prompt with two navigation links: "Review Constitutional Concept" (links to the `constitutional-concept` step card) and "Review Case Example" (links to the `case-example` step card); make "Retake" button available only after the learner dismisses the prompt
    - If score ≥ 60, emit `onComplete(stepId)` to allow progression
    - _Requirements: 3.4, 3.6_

  - [ ] 15.2 Write property test for low score review prompt threshold (Property 11)
    - **Property 11: Low Score Review Prompt Threshold**
    - **Validates: Requirements 3.6**
    - Use `fc.integer({ min: 0, max: 100 })` for score; assert the review prompt renders iff `score < 60`

- [ ] 16. Implement Dashboard and Profile page enhancements
  - [ ] 16.1 Modify `client/src/pages/Dashboard.js` to show Post_Test completion banner
    - After fetching dashboard data, if `analyticsData.topicsCompleted >= 5` and user's Assessment has `completedPostTest === false`, render a non-dismissible banner prompting the user to take the Post_Test
    - Fetch Assessment status from `/api/pre-test` (reuse existing endpoint or add a `GET /api/pre-test/status` sub-route)
    - _Requirements: 6.3_

  - [ ] 16.2 Modify `client/src/pages/Profile.js` to display Pre_Test score, Post_Test score, and improvement
    - Fetch Assessment data and display all three values when both tests are complete
    - If `completedPostTest === false`, display "—" in place of Post_Test score and Improvement %
    - _Requirements: 6.5_

  - [ ] 16.3 Add badge notification display to `client/src/pages/ConstitutionalGamePage.js` for new badges
    - After a track call returns `newBadges`, display each badge notification sequentially using the existing `badgeNotification` state
    - If multiple badges are earned simultaneously, queue them and show one per notification cycle
    - _Requirements: 7.5_

---

- [ ] 17. Implement Module_Step enum round-trip and scenario data round-trip verification
  - [ ] 17.1 Write property test for Module_Step enum round-trip (Property 1)
    - **Property 1: Module_Step Enum Round-Trip**
    - **Validates: Requirements 1.5**
    - Use `fc.constantFrom(...MODULE_STEP_ORDER)` to create Content documents in `mongodb-memory-server`; assert fetched document contains identical `moduleStep` value

  - [ ] 17.2 Write property test for scenario data round-trip (Property 12)
    - **Property 12: Scenario Data Round-Trip**
    - **Validates: Requirements 4.1, 4.3**
    - Use `fc.array(fc.record({ situation: fc.string(), options: fc.array(...), learningOutcome: fc.string() }))` to store scenarios in `gameConfig.scenarios`; assert fetched document contains identical scenario values

---

- [ ] 18. Write migration script and content seeding scripts
  - [ ] 18.1 Create `server/scripts/migrateContentModuleStep.js` — migration script for legacy Content documents
    - Query `Content.find({ moduleStep: { $exists: false } })` and store the pre-migration count
    - Run `Content.updateMany({ moduleStep: { $exists: false } }, { $set: { moduleStep: null } })`
    - Query the post-migration count; log an error if the counts differ
    - Do not modify any other field on any document
    - _Requirements: 5.6_

  - [ ] 18.2 Write property test for migration script document count and ID preservation (Property 16)
    - **Property 16: Migration Script Preserves Document Count and IDs**
    - **Validates: Requirements 5.6, 12.6**
    - Use `mongodb-memory-server`; insert N legacy Content documents; run migration script; assert post-migration count equals pre-migration count and all `_id` values and other fields are unchanged

  - [ ] 18.3 Create `server/seeds/contentSeed.js` — Priority_Topic content seeding script
    - Call `Content.insertMany()` with Content documents covering all seven Module_Steps for three Priority_Topics: Preamble, Fundamental Rights, Right to Equality
    - Each document must include: `topic` (ObjectId ref to the existing Topic), `title`, `type` (valid enum value), `content` (≥ 50 characters), `moduleStep` (one of the seven enum values), `plainLanguageValidated: false`, `questionType` where applicable
    - For `case-example` steps on Priority_Topics, include at least one of the landmark case names in `content`
    - For `real-life-scenario` steps, include at least one citizen-role word in `content`
    - Run script with a guard to skip documents where a Content with the same `topic + moduleStep` already exists
    - _Requirements: 11.5_

- [ ] 19. Checkpoint — Ensure migration and seeding scripts run cleanly without ValidationError
  - Ensure all tests pass, ask the user if questions arise.

---

- [ ] 20. Write integration and smoke tests
  - [ ] 20.1 Write integration tests for all existing API routes to verify backward compatibility
    - Test all preserved routes against a `mongodb-memory-server` instance: `/api/content/topics/:country`, `/api/content/content/:contentId`, `/api/content/topics/:topicId/content`, `/api/content/track`, `/api/progress/:topicId`, `/api/users/dashboard`
    - Assert HTTP methods, URL paths, and all pre-existing response fields are unchanged
    - Confirm legacy documents without new optional fields return HTTP 200 with no Mongoose validation errors
    - _Requirements: 5.2, 5.3, 12.2_

  - [ ] 20.2 Write smoke tests for new schema fields and component signatures
    - Verify User schema contains `learningStreak` and `lastActivityDate` with correct defaults
    - Verify all five game component prop type signatures match pre-migration baselines (snapshot or manual prop-type check)
    - Verify `/rights-assistant` route exists in `App.js` and `RightsAssistantPage` renders without crash
    - Verify KYR matching makes no external HTTP calls (mock `axios` and assert zero outbound calls in the route handler)
    - _Requirements: 9.3, 10.6_

- [ ] 21. Final checkpoint — Ensure all tests pass across the full suite
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; all 32 design properties are covered by the `*`-marked tasks
- Every property test is tagged with a comment `// Feature: learning-architecture-restructure, Property N: <title>` and a minimum of 100 runs via `{ numRuns: 100 }`
- The `fast-check` library must be installed in the server as a dev dependency: `npm install --save-dev fast-check mongodb-memory-server` before running property tests
- The `migrationStatus` field is the only switch needed to activate the new UI per-topic; no data migration is required before rolling out
- Seeding scripts must be safe to run multiple times (idempotent) — always use existence checks before inserting
- Backward compatibility is enforced by keeping all new Mongoose fields optional with falsy defaults; never remove or rename an existing field

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.5", "2.7", "1.7"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.6", "2.8", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "5.1", "5.2", "5.8", "5.10"] },
    { "id": 4, "tasks": ["5.3", "5.4", "5.9", "7.1", "7.3"] },
    { "id": 5, "tasks": ["5.5", "5.6", "5.7", "7.2", "7.4", "7.5", "8.1", "8.5", "8.6", "8.7"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "10.1", "10.3", "11.1", "11.2", "12.1", "14.1", "17.1", "17.2"] },
    { "id": 7, "tasks": ["10.2", "10.4", "11.3", "11.4", "11.5", "12.2", "12.3", "14.2", "14.3", "15.1", "16.1", "16.2", "16.3", "18.1", "18.3"] },
    { "id": 8, "tasks": ["14.4", "15.2", "18.2", "20.1", "20.2"] }
  ]
}
```
