# Requirements Document

## Introduction

Samvidhan Sarthi is a gamified constitutional literacy platform — a "Duolingo for Constitutional Literacy" — whose goal is to help Indian citizens understand Rights, Duties, Constitutional Values, Civic Responsibilities, and Real-life Constitutional Application. The platform currently follows a content-delivery model (Topic → Long Lesson → Quiz). This feature transforms it into an experiential learning architecture where every topic follows a structured module flow: Why It Matters → Real-Life Scenario → Constitutional Concept → Case Example → Interactive Assessment → Reinforcement Activity → Key Takeaways.

All changes must be backward compatible. Existing MongoDB schemas, frontend routes, APIs, games, and badges must continue working during and after the transition.

**Current Architecture (as discovered in codebase):**
- Topics stored in `Topic` model with fields: title, description, country, category, difficulty, order, parentTopic, customId.
- Content stored in `Content` model with fields: topic (ref), title, type (lesson/quiz/game/article/video), content (markdown string), quiz.questions[], gameConfig (Mixed), order, estimatedTime, points.
- Progress stored in `Progress` model per user-topic-country, tracking quizScores[] and activities[].
- Assessment model stores preTestScore, postTestScore, completionPercentage.
- Badge model has name, description, icon, category, requirements (Mixed), rarity.
- User model stores badges[] as ObjectId refs.
- Frontend routes: `/topics`, `/topics/:topicId`, `/content/:contentId`, `/constitution`, `/constitution/games`, `/constitution/map`.
- Existing games: MatchingGame, QuizGame, ScenarioGame, SpiralGame, TimelineGame.

---

## Glossary

- **Platform**: The Samvidhan Sarthi web application.
- **Learner**: Any authenticated user consuming learning content (students, first-time voters, adult learners).
- **Topic**: A top-level constitutional subject (e.g., Fundamental Rights, Preamble).
- **Module**: The structured seven-step learning unit attached to a Topic: Why It Matters → Real-Life Scenario → Constitutional Concept → Case Example → Interactive Assessment → Reinforcement Activity → Key Takeaways.
- **Module_Step**: One of the seven ordered steps within a Module.
- **Scenario**: A real-world situation presented to the Learner that requires a constitutional decision, followed by an explanation and learning outcome.
- **Assessment**: A quiz item that tests constitutional understanding through application questions, not article-number recall.
- **Pre_Test**: A platform-wide baseline quiz taken before the Learner starts any topic learning.
- **Post_Test**: A platform-wide quiz taken after completing a learning journey, used to measure improvement.
- **KYR_Assistant**: The Know Your Rights Assistant — a natural-language interface that answers constitutional rights questions in plain language and links Learners to relevant modules.
- **Badge**: A visual reward that represents a learning achievement (understanding, mastery, or progress milestone).
- **Learning_Streak**: A count of consecutive days on which a Learner completes at least one Module_Step.
- **Topic_Mastery**: A per-topic score (0–100%) reflecting a Learner's quiz and scenario performance within that topic.
- **Content_Schema**: The existing MongoDB `Content` collection and its Mongoose schema.
- **Legacy_Content**: Existing content documents in the `Content` collection that predate this restructure.
- **Priority_Topic**: One of the ten highest-priority constitutional topics: Preamble, Fundamental Rights, Directive Principles, Fundamental Duties, Right to Equality, Right to Freedom, Union Government, Judiciary, Emergency Provisions, Basic Structure Doctrine.

---

## Requirements

---

### Requirement 1: Experiential Module Structure

**User Story:** As a Learner, I want every constitutional topic to guide me through a structured experience — from why it matters to real scenarios to interactive reinforcement — so that I understand constitutional concepts in the context of my daily life rather than just memorising article numbers.

#### Acceptance Criteria

1. THE Platform SHALL attach exactly one Module to each Topic, containing the seven ordered Module_Steps: Why It Matters, Real-Life Scenario, Constitutional Concept, Case Example, Interactive Assessment, Reinforcement Activity, and Key Takeaways.

2. WHEN a Learner opens a Topic, THE Platform SHALL display the Module_Steps in the fixed order: Why It Matters → Real-Life Scenario → Constitutional Concept → Case Example → Interactive Assessment → Reinforcement Activity → Key Takeaways.

3. THE Platform SHALL prevent a Learner from navigating to a later Module_Step without completing the immediately preceding Module_Step, where completion is defined as: for passive steps (Why It Matters, Constitutional Concept, Case Example, Key Takeaways) — the Learner has scrolled to the bottom of the step content and acknowledged it; for the Interactive Assessment step — the Learner has submitted all quiz answers; for the Reinforcement Activity step — the Learner has completed at least one game or scenario interaction.

4. WHEN a Learner satisfies the completion signal for the seventh Module_Step (Key Takeaways) in a Topic, THE Platform SHALL record a `completedAt` timestamp on the Progress record for that Learner–Topic pair and set the topic's completion flag to true.

5. THE Platform SHALL store each Module_Step as a structured document within the existing Content_Schema, using a new `moduleStep` field that accepts one of exactly seven string enum values: `why-it-matters`, `real-life-scenario`, `constitutional-concept`, `case-example`, `interactive-assessment`, `reinforcement-activity`, `key-takeaways`; documents without this field SHALL continue to render using the existing content display pipeline.

6. WHERE a Topic is a Priority_Topic, THE Platform SHALL require all seven Module_Steps to be present with a `content` field of at least 50 characters each before the Topic is marked as publishable; an attempt to mark a Priority_Topic publishable with any missing or undersized step SHALL return a 422 error with the names of the incomplete steps.

7. IF a Module_Step document is missing for a non-priority Topic, THEN THE Platform SHALL display a placeholder card showing the step name and the text "Coming soon" in place of that step, and SHALL NOT block the Learner from navigating to the next available step.

---

### Requirement 2: Content Writing and Plain Language Standard

**User Story:** As a Learner with limited legal knowledge, I want all lesson content to be written in plain language at an 8th–10th grade reading level so that I can understand constitutional concepts without a law degree.

#### Acceptance Criteria

1. THE Platform SHALL render all Module_Step content using the Markdown renderer already in use in `ContentDetail.js`, preserving the existing prose display pipeline.

2. IF a Content document has `plainLanguageValidated: true` and its `content` field contains any of the following strings (case-insensitive): "thereof", "hereinafter", "as per Article", "notwithstanding the provisions of", or "subject to the provisions of", THEN THE Platform SHALL suppress display of that document and show an author warning indicating the plain-language validation flag must be removed before content with formal legal language can be published.

3. WHEN content for a step with `moduleStep: 'constitutional-concept'` is created or updated, THE Platform SHALL count the number of words in the `content` field (defined as sequences of non-whitespace characters separated by whitespace or punctuation) and SHALL return a 422 validation error with the message "Content exceeds 800-word limit" if the count exceeds 800.

4. THE Platform SHALL compute the reading time for each Module_Step at save time as `Math.ceil(wordCount / 200)` minutes and store the result in the existing `estimatedTime` field (in minutes), which `ContentDetail.js` SHALL display as "[N] min read".

5. IF a Topic is a Priority_Topic (one of: Preamble, Fundamental Rights, Directive Principles, Fundamental Duties, Right to Equality, Right to Freedom, Union Government, Judiciary, Emergency Provisions, Basic Structure Doctrine) and its `real-life-scenario` step content does not contain at least one word from the citizen-role inclusion list (student, teacher, farmer, worker, voter, resident, citizen, family, parent, child) AND contains a word from the exclusion list (minister, politician, judge, advocate, lawyer, official, bureaucrat), THEN THE Platform SHALL return a 422 validation error on save indicating the scenario must feature an ordinary citizen.

---

### Requirement 3: Quiz Restructure — Application-Focused Assessment

**User Story:** As a Learner, I want quiz questions to test whether I understand constitutional principles in real situations, not whether I have memorised article numbers, so that I develop genuine constitutional literacy.

#### Acceptance Criteria

1. THE Platform SHALL classify every quiz question with a `questionType` field, accepting values `recall` or `application`.

2. WHEN a new quiz is created or edited via the admin interface or seeding scripts, THE Platform SHALL validate that: (a) the quiz contains at least 5 questions, and (b) the ratio of `application` questions to total questions is at least 70%; if either condition is not met, the platform SHALL return a 422 validation error identifying which condition failed.

3. THE Platform SHALL store `questionType` in the existing `quiz.questions[]` array within the Content_Schema as an additional optional field; Legacy_Content quiz documents without the field SHALL be treated as having `questionType: 'recall'` for ratio calculations, ensuring they continue to render without error.

4. WHEN a Learner submits all answers in the Interactive Assessment step and the step score is recorded, THE Platform SHALL display a results screen that shows each question with the Learner's chosen answer, the correct answer, and the constitutional principle from the `explanation` field of `quiz.questions[].explanation`.

5. WHEN a Learner submits all answers in the Interactive Assessment step of a Module, THE Platform SHALL record the score in the Progress record's `quizScores[]` array with a `stepType: 'module-assessment'` tag alongside the existing `contentId` and `score` fields.

6. IF a Learner's score on the Interactive Assessment step is below 60%, THEN THE Platform SHALL display a prompt offering two navigation options: "Review Constitutional Concept" (links to the `constitutional-concept` step) and "Review Case Example" (links to the `case-example` step), and SHALL make the retake button available after the Learner dismisses the prompt.

---

### Requirement 4: Scenario Engine

**User Story:** As a Learner, I want to face real-life constitutional scenarios where I make a decision, receive an explanation of the constitutional principle involved, and understand the learning outcome, so that I can reason constitutionally in everyday situations.

#### Acceptance Criteria

1. THE Platform SHALL support a Scenario data structure where each scenario contains: a `situation` string (the scenario description), an `options` array of 2 to 4 objects each with a `text` string, a `isCorrect` boolean, and a `constitutionalExplanation` string, plus a `learningOutcome` string.

2. WHEN a Learner selects an option in a Scenario, THE Platform SHALL render — within the same page view without a navigation change — the `constitutionalExplanation` for the selected option and the `learningOutcome` for the scenario, before the action to proceed to the next scenario becomes available.

3. THE Platform SHALL store Scenarios for the Real-Life Scenario step and the Reinforcement Activity step using the existing `gameConfig` Mixed field within the Content_Schema, under a `scenarios` array key, preserving backward compatibility with existing ScenarioGame component data format.

4. WHERE a Topic is a Priority_Topic, THE Platform SHALL require a minimum of 3 Scenario objects across the `scenarios` arrays of all Module_Step Content documents associated with that Topic.

5. THE Platform SHALL record each Scenario interaction in the Progress record's `activities[]` array as an object with: `activityType: 'scenario'`, `contentId` (the Content document's `_id`), `scenarioIndex` (zero-based index of the scenario in its `scenarios` array), `chosenOptionIndex` (zero-based index of the option the Learner selected), `isCorrect` (boolean), `isFirstAttempt` (true if the Learner has not previously interacted with this scenario in this session), and `completedAt` (ISO timestamp).

6. WHEN a Learner has submitted an answer for every Scenario associated with a Topic, THE Platform SHALL calculate `scenarioPerformanceScore` as `(count of scenarios where isFirstAttempt is true AND isCorrect is true) / (total scenario count) * 100`, rounded to the nearest integer, and SHALL store this value in the Progress record for that Learner–Topic pair.

---

### Requirement 5: Backward-Compatible Schema Extension

**User Story:** As a developer, I want all new content fields to extend the existing MongoDB schemas without breaking any existing documents, routes, or frontend components, so that the platform remains stable throughout the incremental rollout.

#### Acceptance Criteria

1. THE Platform SHALL add the following new fields to the existing Mongoose schemas as optional fields with the specified types and defaults: `moduleStep` (String, enum of seven values, default `undefined`) on Content; `questionType` (String, enum `['recall', 'application']`, default `'recall'`) on each element of `quiz.questions[]`; `plainLanguageValidated` (Boolean, default `false`) on Content; `migrationStatus` (String, enum `['legacy', 'partial', 'complete']`, default `'legacy'`) on Topic; `learningStreak` (Number, default `0`) and `lastActivityDate` (Date, default `null`) on User — ensuring all documents lacking these fields remain valid against the updated schema.

2. THE Platform SHALL preserve the URL paths, HTTP methods, required request body fields, and non-`analyticsData` response body fields of all existing API routes (`/api/content/topics/:country`, `/api/content/content/:contentId`, `/api/content/topics/:topicId/content`, `/api/content/track`, `/api/progress/:topicId`, `/api/users/dashboard`); additive optional fields in responses are permitted.

3. WHEN a Content document without any of the new optional fields is fetched via any existing API endpoint, THE Platform SHALL return an HTTP 200 response containing the document's existing fields and SHALL NOT throw a Mongoose validation error.

4. THE Platform SHALL NOT remove or rename any existing fields (topic, title, type, content, quiz, gameConfig, order, estimatedTime, points on Content; title, description, country, category, difficulty, order, parentTopic, customId on Topic; userId, topicId, country, quizScores, activities, completionPercentage on Progress; name, description, icon, category, requirements, rarity on Badge; badges on User).

5. THE Platform SHALL render the existing `/topics/:topicId` route using Module_Step navigation UI when the Topic's `migrationStatus` is `complete` or `partial`, and SHALL render the existing flat content list when `migrationStatus` is `legacy`; no new URL routes for Module_Steps SHALL be added to `App.js`.

6. IF a migration script targets Content documents where `moduleStep` is absent (using the MongoDB query `{ moduleStep: { $exists: false } }`), THEN THE Platform SHALL apply `$set: { moduleStep: null }` using `updateMany`, and the post-migration document count for the Content collection SHALL equal the pre-migration count, with all pre-existing field values unchanged.

---

### Requirement 6: Pre-Test and Post-Test Framework

**User Story:** As a Learner, I want to take a short assessment before I start learning and another one after I finish so that I can see exactly how much my constitutional knowledge has improved.

#### Acceptance Criteria

1. WHEN a Learner's Assessment document has `completedPreTest: false` (or no Assessment document exists for that user) and the Learner navigates to any route other than `/pre-test`, `/login`, or `/register`, THE Platform SHALL redirect the Learner to `/pre-test`; the Pre_Test SHALL consist of exactly 10 `application`-type questions with at least one question per Priority_Topic.

2. THE Platform SHALL store the Pre_Test result in the Assessment model with fields: `userId`, `preTestScore` (integer, 0–10), `completedPreTest: true`, `postTestScore` (null until Post_Test is taken), `completedPostTest: false`, and `createdAt`.

3. WHEN a Learner's Progress records show at least 5 distinct Topics with `completionPercentage === 100` and the Learner's Assessment document has `completedPostTest: false`, THE Platform SHALL display a non-dismissible banner on the Dashboard page on every visit until `completedPostTest` becomes true.

4. WHEN a Learner submits the Post_Test and `preTestScore > 0`, THE Platform SHALL calculate `improvement` as `Math.round(((postTestScore - preTestScore) / preTestScore) * 1000) / 10` (one decimal place) and store it in the Assessment document's `improvement` field alongside `postTestScore` and `completedPostTest: true`.

5. IF the Learner's Assessment document has `completedPostTest: false`, THEN THE Platform SHALL display "—" in place of Post_Test score and Improvement % on the Profile page; once both tests are completed, the Platform SHALL display all three values (Pre_Test score, Post_Test score, Improvement %).

6. IF the Learner has not yet completed the Pre_Test and attempts to access a Topic, THEN THE Platform SHALL redirect the Learner to the Pre_Test page before allowing access to Topic content.

7. WHEN the Pre_Test or Post_Test question bank is seeded, THE Platform SHALL generate exactly 10 questions that include at least one question per Priority_Topic, using the `application` question type exclusively, with each question having a non-empty `explanation` field.

---

### Requirement 7: Enhanced Badge System

**User Story:** As a Learner, I want to earn badges that reflect my genuine understanding and progress through constitutional learning, so that the achievement system motivates me to deepen my knowledge rather than just click through content.

#### Acceptance Criteria

1. THE Platform SHALL support the following seven new named badges with the specified award thresholds: "Preamble Scholar (New)" — complete the Preamble topic with Topic_Mastery ≥ 80%; "Rights Protector" — complete all Fundamental Rights sub-topics with average Topic_Mastery ≥ 75%; "Constitution Navigator" — complete any 5 Priority_Topics; "Democracy Champion" — achieve a Learning_Streak of 7 consecutive days; "Article Detective" — complete 3 or more topics with a scenario performance score ≥ 80%; "Judicial Thinker" — complete the Judiciary topic with Topic_Mastery ≥ 80%; "Samvidhan Sarthi" — complete all Module_Steps for all ten Priority_Topics.

2. THE Platform SHALL define badge award criteria using the existing `requirements` Mixed field in the Badge model with a structured object containing one or more of: `topicsCompleted` (integer), `averageScenarioScore` (integer, 0–100, scoped to the specific topic or topics listed in a `topicScope` array), `topicMastery` (integer, 0–100), `streakDays` (integer), and `improvementPercent` (number).

3. WHEN a Learner completes all Module_Steps for a Priority_Topic with a Topic_Mastery score of 80% or above, THE Platform SHALL evaluate all badge criteria against the Learner's current Progress and Assessment data and include all newly qualifying badge IDs in the same API response under a `newBadges` array.

4. THE Platform SHALL preserve all existing badges (Quiz Master, Constitution Defender, Preamble Scholar, Rights Expert, Amendment Tracker, Perfect Score, Fast Learner, Constitutional Expert) and their current award logic in the `checkAndAwardAchievements` function without modification; the new badge evaluation in criterion 3 SHALL run as an additive step after the existing function.

5. WHEN one or more new badges are earned, THE Platform SHALL display a badge notification using the existing `badgeNotification` state in `ConstitutionalGamePage.js`; if multiple badges are earned simultaneously, THE Platform SHALL display them sequentially, one per notification.

6. THE Platform SHALL NOT delete any Badge documents from the database; new badges SHALL be seeded using `Badge.insertMany()` targeting only documents where `name` does not already exist in the collection, preventing duplicate badge creation on repeated seed runs.

---

### Requirement 8: Learning Analytics and Topic Mastery

**User Story:** As a Learner, I want to see a detailed view of my learning journey — including quiz performance, scenario performance, game performance, streaks, and topic mastery — so that I can understand where I am strong and where I need to focus.

#### Acceptance Criteria

1. THE Platform SHALL calculate Topic_Mastery for each Topic as `Math.round((quizScore * 0.5) + (scenarioPerformanceScore * 0.3) + (gameScore * 0.2))` where each component score is a 0–100 integer from the most recent recorded value in the Progress record; if a component has no recorded value, it SHALL default to 0 for the calculation.

2. THE Platform SHALL expose `topicMastery` as a computed integer (0–100) per topic in the `/api/users/dashboard` response's `progress` array, added alongside existing per-topic fields; the existing fields in the `progress` array SHALL remain unchanged.

3. THE Platform SHALL add `learningStreak` (Number, default 0) and `lastActivityDate` (Date, default null) to the User model as optional fields; the `learningStreak` field SHALL represent the count of consecutive calendar days on which the Learner completed at least one Module_Step.

4. WHEN a Module_Step completion is recorded and the UTC calendar date of the completion differs from the value stored in `lastActivityDate` by exactly 1 day, THE Platform SHALL increment `learningStreak` by 1 and update `lastActivityDate` to the current UTC date.

5. IF the UTC calendar date of a Module_Step completion differs from the value stored in `lastActivityDate` by more than 1 day, THEN THE Platform SHALL set `learningStreak` to 1 (counting the current day) and update `lastActivityDate` to the current UTC date.

6. THE Platform SHALL add an `analyticsData` key to the `/api/users/dashboard` response containing: `scenarioPerformance` (average `scenarioPerformanceScore` across all topics with at least one scenario attempted, integer 0–100), `gamePerformance` (average game score across all tracked game completions, integer 0–100), `quizPerformance` (average quiz score across all `quizScores[]` entries, integer 0–100), `badgeProgress` (object with `earned` count and `total` count of all Badge documents), `topicsCompleted` (count of Progress records where `completionPercentage === 100`), and `learningStreak` (current value from the User document); this key SHALL be absent from responses for existing API clients that do not request it, preserving backward compatibility.

7. THE Platform SHALL display a Topic Mastery percentage badge on the `TopicDetail.js` page alongside the existing `completionPercentage` progress bar, showing the computed `topicMastery` value from the dashboard endpoint.

---

### Requirement 9: Game-to-Learning Alignment

**User Story:** As a Learner, I want every game I play to reinforce what I just learned in the corresponding module, so that games feel like a natural part of my learning journey rather than disconnected entertainment.

#### Acceptance Criteria

1. THE Platform SHALL store a non-empty `learningObjective` string (maximum 200 characters) in the `gameConfig` document of each Content record whose `moduleStep` is `reinforcement-activity`, describing the specific constitutional concept from the same Topic's `constitutional-concept` step that the game is intended to reinforce.

2. THE Platform SHALL render the existing five game components (MatchingGame, QuizGame, ScenarioGame, SpiralGame, TimelineGame) within the Reinforcement Activity Module_Step for any Topic whose `reinforcement-activity` Content document has a `gameConfig` object with a valid `type` field matching one of the five game identifiers.

3. THE Platform SHALL NOT remove any existing props from, or change the type signature of any props currently accepted by, MatchingGame, QuizGame, ScenarioGame, SpiralGame, or TimelineGame; the standalone `/constitution/games` page SHALL continue to render all five game types without modification.

4. WHEN a Learner completes a game within the Reinforcement Activity step, THE Platform SHALL call the existing `/api/content/track` endpoint with `{ contentId, type: 'game', score, completed: true }`, where `contentId` is the `_id` of the Reinforcement Activity Content document for that Topic.

5. WHEN a game component is rendered from within the Reinforcement Activity Module_Step, A wrapper component SHALL render a "Return to Module" button that navigates to `/topics/:topicId` on click; this button SHALL be rendered by the wrapper, not by the game component itself, so the game component's props interface is not modified.

---

### Requirement 10: Know Your Rights (KYR) Assistant Foundation

**User Story:** As a Learner, I want to type a plain-language question about my constitutional rights and receive a clear, jargon-free answer that points me to the relevant learning module, so that I can apply constitutional knowledge to real situations I face.

#### Acceptance Criteria

1. THE Platform SHALL provide a KYR_Assistant interface accessible from the main navigation, rendered as a new page at `/rights-assistant` added to `App.js` without removing any existing routes.

2. WHEN a Learner submits a non-empty rights question, THE Platform SHALL perform case-insensitive keyword matching of the question text against Topic `title` and `description` fields, returning up to 5 matched Topics (those sharing at least 1 keyword token of 4 or more characters with the query) as a list of Topic names each hyperlinked to `/topics/:topicId`.

3. THE Platform SHALL display the disclaimer "This is educational information, not legal advice. For legal matters, consult a qualified legal professional." on every KYR_Assistant response, whether or not any Topics were matched.

4. THE Platform SHALL store each submitted KYR_Assistant query in a new `RightsQuery` collection document containing: `userId` (ObjectId, or `null` if the user is unauthenticated), `queryText` (String, max 500 characters), `matchedTopicIds` (Array of ObjectId), and `createdAt` (Date) — without modifying any existing collection schema.

5. IF no Topic matches the submitted query, THEN THE Platform SHALL display the message "No matching topics found. Browse all topics to find what you're looking for." with a link to `/topics`, and SHALL return an HTTP 200 response (not 4xx or 5xx) to the frontend.

6. THE Platform SHALL NOT transmit KYR_Assistant query text to any external API or third-party service in the initial implementation; all matching SHALL be done server-side using the existing Topic data.

7. IF the submitted query is empty or contains only whitespace, THEN THE Platform SHALL NOT call the server-side matching route and SHALL display an inline validation message "Please enter a question" without storing a RightsQuery document.

---

### Requirement 11: Priority Topic Content Enrichment

**User Story:** As a Learner focused on fundamental constitutional literacy, I want the ten highest-priority topics to have the richest, most complete experiential learning content, so that I get the deepest understanding of the constitutional concepts that most affect my daily life.

#### Acceptance Criteria

1. THE Platform SHALL identify the ten Priority_Topics by performing a case-insensitive exact match of a Topic's `title` field against the following values: "Preamble", "Fundamental Rights", "Directive Principles", "Fundamental Duties", "Right to Equality", "Right to Freedom", "Union Government", "Judiciary", "Emergency Provisions", "Basic Structure Doctrine"; any Topic whose title does not match one of these ten values exactly SHALL NOT be classified as a Priority_Topic.

2. WHERE a Topic is a Priority_Topic, THE Platform SHALL require that the Content document with `moduleStep: 'case-example'` for that Topic contains at least one literal string occurrence (case-sensitive) of one of the following landmark case names in its `content` field: "Kesavananda Bharati", "Maneka Gandhi", "Vishaka", "S.R. Bommai", "Indra Sawhney", or "Minerva Mills".

3. THE Platform SHALL display a "Featured" text label as a sibling element to the topic card's content on the Topics listing page (`/topics`) for each Priority_Topic, without adding, removing, or modifying any props on the topic card component.

4. WHEN a Learner's Progress records show `completionPercentage === 100` for all ten Priority_Topics and the Learner does not already have the "Samvidhan Sarthi" badge, THE Platform SHALL award the "Samvidhan Sarthi" badge and add it to the User's `badges[]` array.

5. THE Platform SHALL provide a seeding script that calls `Content.insertMany()` with Content documents covering all seven Module_Steps for the three Priority_Topics (Preamble, Fundamental Rights, Right to Equality); each seeded document SHALL include non-null values for `topic` (ObjectId ref), `title` (String), `type` (one of the existing enum values), `content` (String, ≥ 50 characters), and `moduleStep` (one of the seven enum values), so that `Content.insertMany()` resolves without a Mongoose `ValidationError`.

6. IF a Priority_Topic's Content record for any Module_Step is missing or has a `content` field shorter than 50 characters, THEN the publishability check (Requirement 1, Criterion 6) SHALL return a 422 error listing the specific step names that are incomplete, and THE Platform SHALL NOT mark the Topic as `migrationStatus: 'complete'`.

---

### Requirement 12: Incremental Rollout and Backward Compatibility

**User Story:** As a developer, I want to roll out the new learning architecture gradually — topic by topic — without taking the site down or breaking the existing experience for learners who are mid-way through their learning journey.

#### Acceptance Criteria

1. THE Platform SHALL use the Topic's `migrationStatus` field as the single authoritative source for render-mode selection in `TopicDetail.js`: `migrationStatus: 'legacy'` → flat content list; `migrationStatus: 'partial'` or `'complete'` → Module_Step navigation UI.

2. THE Platform SHALL serve all existing API endpoints (`/api/auth/*`, `/api/users/*`, `/api/content/*`, `/api/progress/*`, `/api/topics/*`) without modification to their URL paths, HTTP methods, or required request/response fields during and after the rollout.

3. IF a Topic's `migrationStatus` is `partial`, THEN THE Platform SHALL render Content documents that have a `moduleStep` value in their defined Module_Step order, and SHALL render Content documents without a `moduleStep` value as a flat list appended after the last Module_Step, without throwing an error.

4. THE Platform SHALL support a `migrationStatus` field on the Topic model (values: `legacy`, `partial`, `complete`) that is manually set by an admin; valid transitions are: `legacy` → `partial`, `partial` → `complete`, and `complete` → `partial` (rollback); the field SHALL default to `legacy` for all existing Topic documents.

5. IF the `migrationStatus` of a Topic is `legacy`, THEN THE Platform SHALL display the flat content list using the existing `TopicDetail.js` render path and SHALL NOT render any Module_Step progress indicator, step navigation, or Module_Step-specific UI elements.

6. THE Platform SHALL NOT alter the `_id` field of any existing Topic, Content, or Progress document; all existing `/topics/:topicId` and `/content/:contentId` URL paths that were bookmarkable before the migration SHALL continue to resolve to the same documents after the migration.
