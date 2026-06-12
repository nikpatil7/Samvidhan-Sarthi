# 📜 Samvidhan Sarathi

> **Learn the Constitution. Master Citizenship. Have Fun Doing It.**

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-13AA52?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-ISC-blue)](#license)

---

## 🎯 What is Samvidhan Sarathi?

Samvidhan Sarathi is a **gamified civic-tech learning platform** that transforms constitutional education into an engaging, interactive experience. Designed for citizens and students across India, it makes understanding the Constitution simple, fun, and empowering.

### ⭐ Key Highlights

- 🎮 **5 Game Types**: Quizzes, Scenario Challenges, Matching, Timeline, and Spiral Learning
- 🤖 **Samvidhan AI**: Floating constitutional assistant powered by OpenRouter (LLM chat with cached responses)
- 📖 **User Stories**: Real-world civic case studies showing constitutional rights in action
- 🗺️ **Constitution Map**: Interactive level-based map of constitutional topics (list + circle view)
- 🏆 **8 Achievement Badges**: Earn rewards like Quiz Master, Preamble Scholar, Constitutional Expert
- 📊 **Real-Time Dashboard**: Track progress per topic, quiz scores, activities — filtered by country
- 🔍 **Global Search**: Search topics and content from the sidebar header
- 🌙 **Beautiful Dark UI**: Modern design with Framer Motion animations
- 🔐 **Secure Auth**: JWT-based authentication with bcrypt password hashing
- 📱 **Fully Responsive**: Desktop, tablet, and mobile
- 📚 **21 Topics, 59 Content Items**: From Preamble to Landmark Judgments

---

## 💻 Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Frontend** | React 18, Tailwind CSS, Framer Motion, GSAP     |
| **Backend**  | Node.js, Express.js                             |
| **Database** | MongoDB with Mongoose ODM                       |
| **Auth**     | JWT + bcrypt                                    |
| **AI**       | OpenRouter API (via OpenAI SDK)                 |
| **Tools**    | Concurrently, Morgan, Axios, React Markdown     |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or later
- **MongoDB** running locally (or a MongoDB Atlas URI)
- **OpenRouter API key** (optional — required for Samvidhan AI chatbot)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Samvidhan_Sarthi

# Install all dependencies (root + client + server)
npm run install-all
```

Or install individually:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/samvidhan_sarthi
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Samvidhan AI (Constitutional Assistant)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODEL=mistralai/mistral-7b-instruct:free
SITE_URL=http://localhost:3000
SITE_NAME=Samvidhan Sarthi
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
cd server
node seed-database.js              # Seeds all topics, content, games, and badges
node seeds/add-user-stories.js     # Seeds 10 civic user stories (optional)
node check-topics.js               # Verify everything was created
```

This creates:
- **21 Topics** across 5 difficulty levels (Preamble → Landmark Judgments)
- **59 Content items** (21 lessons, 21 quizzes, 17 interactive games)
- **8 Achievement badges** (Common → Epic rarity)
- **10 User Stories** (when running `add-user-stories.js`)

### 4. Run the Application

```bash
# From the root directory
npm run dev          # Starts both client (port 3000) & server (port 5000)
```

Or run separately:

```bash
npm run server       # Backend only (port 5000)
npm run client       # Frontend only (port 3000)
```

---

## 📋 Available Scripts

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start frontend + backend concurrently      |
| `npm run server`     | Run backend only                           |
| `npm run client`     | Run frontend only                          |
| `npm run install-all`| Install all dependencies                   |
| `npm run build-client`| Build frontend for production             |
| `npm start`          | Start production server                    |

### Database Scripts (run from `server/`)

| Command                         | Purpose                              |
| -------------------------------- | ------------------------------------ |
| `node seed-database.js`         | Seed all data (topics, content, badges) |
| `node seeds/add-user-stories.js`| Seed civic user stories              |
| `node check-topics.js`          | Verify database contents             |
| `node seeds/add-constitutional-quizzes.js`   | Add extra quiz games    |
| `node seeds/add-constitutional-scenarios.js` | Add extra scenario games |
| `node seeds/add-game-content.js`| Add matching/spiral/timeline games   |
| `node seeds/update-games.js`    | Update existing game configs         |

---

## 📁 Project Structure

```
Samvidhan_Sarthi/
├── package.json              # Root scripts (dev, install-all, etc.)
│
├── client/                   # React frontend
│   ├── public/               # Static assets & index.html
│   ├── src/
│   │   ├── App.js            # Routes & protected route wrapper
│   │   ├── index.js          # Entry point (Router + AuthProvider)
│   │   ├── index.css         # Global styles (Tailwind)
│   │   ├── assets/
│   │   │   └── samvidhan-logo.png   # Samvidhan AI chatbot logo
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Layout.js     # Main layout with sidebar, search, nav
│   │   │   ├── TypingText.js # Animated typing effect (GSAP)
│   │   │   ├── ConstitutionMap.js
│   │   │   ├── ConstitutionalTopicCard.js
│   │   │   ├── UserStoryCard.js
│   │   │   ├── ConstitutionalAssistant/
│   │   │   │   ├── ConstitutionalAssistant.js
│   │   │   │   └── ConstitutionalAssistant.module.css
│   │   │   └── ConstitutionalGames/
│   │   │       ├── QuizGame.js
│   │   │       ├── ScenarioGame.js
│   │   │       ├── MatchingGame.js
│   │   │       ├── TimelineGame.js
│   │   │       └── SpiralGame.js
│   │   ├── pages/            # Page-level components
│   │   │   ├── Dashboard.js          # Progress dashboard
│   │   │   ├── Topics.js             # Topic listing by country
│   │   │   ├── TopicDetail.js        # Topic content view
│   │   │   ├── ContentDetail.js      # Lesson/quiz/game viewer
│   │   │   ├── ConstitutionalGamePage.js  # Games hub
│   │   │   ├── ConstitutionalTopics.js    # Level-based constitution topics
│   │   │   ├── ConstitutionMapPage.js     # Constitution map page
│   │   │   ├── UserStories.js             # User stories listing
│   │   │   ├── UserStoryDetail.js         # Single user story view
│   │   │   ├── Profile.js
│   │   │   ├── Login.js / Register.js
│   │   │   └── NotFound.js
│   │   └── contexts/
│   │       └── AuthContext.js # Auth state, JWT, axios interceptors
│   └── build/                # Production build output
│
└── server/                   # Node.js/Express backend
    ├── index.js              # Server entry point & middleware
    ├── .env                  # Environment configuration
    ├── .env.example          # Environment template
    ├── seed-database.js      # Master database seeder
    ├── check-topics.js       # Database verification tool
    ├── constitution_of_india.json  # Constitutional reference data
    ├── uploads/              # Uploaded files (avatars)
    │   └── avatars/
    ├── models/               # Mongoose schemas
    │   ├── Topic.js          # Topics with customId, category, difficulty
    │   ├── Content.js        # Lessons, quizzes, games, articles, videos
    │   ├── Progress.js       # Per-user per-topic progress tracking
    │   ├── Badge.js          # Achievement badges
    │   ├── User.js           # User accounts with bcrypt
    │   └── UserStory.js      # Civic user stories
    ├── routes/               # API route handlers
    │   ├── auth.js           # Register, login, JWT
    │   ├── users.js          # Profile, dashboard, achievements, avatar
    │   ├── content.js        # Topics, content, games, search, tracking
    │   ├── progress.js       # Progress queries, badge checking
    │   ├── topics.js         # Topic detail routes
    │   ├── userStories.js    # User stories (read-only)
    │   └── constitutionalAssistant.js  # Samvidhan AI chatbot
    └── seeds/                # Individual seed scripts
        ├── seed-mock-topics.js
        ├── seed-content.js
        ├── add-initial-badges.js
        ├── add-game-content.js
        ├── add-constitutional-quizzes.js
        ├── add-constitutional-scenarios.js
        ├── add-user-stories.js
        └── update-games.js
```

---

## 🗺️ Frontend Routes

| Path | Page | Auth |
|------|------|------|
| `/login`, `/register` | Login, Register | Public |
| `/` | Dashboard | Protected |
| `/topics` | Topics (by country) | Protected |
| `/topics/:topicId` | Topic Detail | Protected |
| `/content/:contentId` | Content Detail (lesson/quiz/game) | Protected |
| `/constitution` | Constitutional Topics (5 levels) | Protected |
| `/constitution/games` | Learning Games Hub | Protected |
| `/constitution/map` | Constitution Map | Protected |
| `/user-stories` | User Stories listing | Protected |
| `/user-stories/:id` | User Story detail | Protected |
| `/profile` | Profile & settings | Protected |
| `*` | 404 Not Found | Public |

> **Samvidhan AI** chatbot is available on all protected pages via a floating button in the layout.

---

## 🔌 API Endpoints

### Health
| Method | Endpoint   | Description        |
| ------ | ---------- | ------------------ |
| GET    | `/health`  | Server health check |

### Authentication
| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| POST   | `/api/auth/register`  | Register new user     |
| POST   | `/api/auth/login`     | Login & get JWT token |
| GET    | `/api/auth/me`        | Get current user (protected) |

### Users (Protected)
| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/users/profile`          | Get user profile             |
| PUT    | `/api/users/profile`          | Update profile               |
| POST   | `/api/users/upload-avatar`    | Upload profile picture (base64) |
| GET    | `/api/users/dashboard?country=India` | Get dashboard stats   |
| GET    | `/api/users/achievements`     | Get badges & achievements    |
| POST   | `/api/users/process-achievements` | Check & award new badges |
| PUT    | `/api/users/change-password`  | Change password              |

### Content
| Method | Endpoint                              | Description                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/api/content/countries`              | List all available countries |
| GET    | `/api/content/topics/:country`        | List topics by country     |
| GET    | `/api/content/topics/detail/:topicId` | Get topic details (ObjectId or customId) |
| GET    | `/api/content/topics/:topicId/content`| Get content for a topic    |
| GET    | `/api/content/topics/:topicId/subtopics` | Get subtopics for a topic |
| GET    | `/api/content/content/:contentId`     | Get specific content item  |
| GET    | `/api/content/games/all`              | Get all game types at once |
| GET    | `/api/content/games/list`             | List all games (debug/minimal info) |
| GET    | `/api/content/games/:gameType`        | Get games by type (quiz, scenario, matching, spiral, timeline) |
| GET    | `/api/content/game/:gameId`           | Get a specific game by ID  |
| POST   | `/api/content/track`                  | Track content completion (protected) |
| GET    | `/api/content/search?query=...&country=...` | Search topics & content |

### Topics
| Method | Endpoint              | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/topics/:topicId`| Get topic by ObjectId or customId    |

### Progress (Protected)
| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/api/progress`              | Get all user progress        |
| GET    | `/api/progress/summary`      | Get progress summary stats   |
| GET    | `/api/progress/:topicId`     | Get progress for a topic     |
| POST   | `/api/progress/check-badges` | Check & award badges         |

### User Stories (Public)
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/user-stories`       | List all user stories    |
| GET    | `/api/user-stories/:id`   | Get a single user story  |

### Constitutional Assistant — Samvidhan AI (Public)
| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| POST   | `/api/constitutional-assistant` | Ask a constitutional question (LLM) |

**Request body:**
```json
{ "question": "What are Fundamental Rights?" }
```

**Response:**
```json
{
  "success": true,
  "answer": "...",
  "modelUsed": "meta-llama/llama-3.3-70b-instruct:free"
}
```

---

## 🎓 Academic Excellence

**Final Year Engineering Project** demonstrating:

- ✅ Full-stack MERN architecture (MongoDB, Express, React, Node.js)
- ✅ JWT authentication & bcrypt encryption
- ✅ RESTful API design with 30+ endpoints
- ✅ Mongoose ODM with indexed schemas
- ✅ Database seeding & migration scripts
- ✅ Responsive UI with Tailwind CSS & Framer Motion
- ✅ Gamification: 5 game types, 8 badges, progress tracking
- ✅ Real-time dashboard with country-filtered analytics
- ✅ AI-powered constitutional assistant (OpenRouter integration)
- ✅ Civic education through user stories and interactive maps

---

## 🌟 Features in Detail

### 📚 Learning Modules
- 21 topics across 5 levels (Beginner → Advanced)
- Level-based organization via `customId` prefixes (`l0-*` through `l4-*`)
- Lessons with rich Markdown content
- Quizzes with explanations for each answer
- Interactive games: Matching, Scenario, Timeline, Spiral, Quiz
- Video and article content types supported

### 🤖 Samvidhan AI (Constitutional Assistant)
- Floating chatbot on all authenticated pages
- Powered by OpenRouter (primary + fallback free models)
- In-memory response cache (up to 100 questions)
- Chat history persisted in browser localStorage
- Suggested starter questions (Fundamental Rights, Article 21, etc.)
- Markdown-rendered AI responses

### 📖 User Stories
- Civic case studies inspired by constitutional principles
- Categories: RTI, Education, Freedom of Speech, Voting Rights, and more
- Structured content: Problem → Constitutional Awareness → Outcome → Impact
- Educational disclaimer on the listing page
- Seeded via `node seeds/add-user-stories.js`

### 🗺️ Constitution Map
- Visual exploration of topics grouped by 5 levels
- Toggle between **List View** and **Interactive Map** (circular layout)
- Links to topic detail pages via `customId`
- Fetches live topic data from the API

### 👤 User System
- Secure signup & login with JWT tokens (7-day expiry)
- Remember Me (localStorage vs sessionStorage)
- Profile management with preferred country
- Profile picture upload (base64 → server `/uploads/avatars/`)
- Password hashing with bcrypt (10 salt rounds)

### 🎖️ Achievements & Progress
- 8 badges from Common to Epic rarity
- Real-time progress tracking per topic
- Auto-calculated completion percentages
- Badge auto-award after quiz/game completion (score ≥ 80%)

### 📊 Dashboard
- Overall progress, completed topics, quiz averages
- Recent activity feed with timestamps
- Country-filtered stats (India, USA, UK)
- Manual refresh + auto-refresh on navigation
- Continue Learning section for in-progress topics

### 🔍 Search
- Global search bar in the layout header
- Searches topics and content simultaneously
- Results grouped by type with quick navigation

### 🎨 UI/UX
- Dark theme with custom color palette
- Framer Motion animations & hover effects
- GSAP-powered typing animation on login/register
- Responsive grid layouts
- Clean card-based design throughout

---

## 📦 Key Dependencies

### Frontend
- `react` `react-dom` `react-router-dom` — Core framework & routing
- `tailwindcss` — Utility-first CSS
- `framer-motion` — Page & component animations
- `gsap` — Typing text animation
- `axios` — HTTP client
- `react-markdown` `remark-gfm` — Markdown rendering (lessons + AI chat)
- `jwt-decode` — Client-side token decoding

### Backend
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken` — JWT generation & verification
- `bcrypt` — Password hashing
- `openai` — OpenRouter API client (Samvidhan AI)
- `axios` — HTTP client
- `cors` — Cross-origin requests
- `morgan` — HTTP request logging
- `dotenv` — Environment variable management

---

## 🏗️ Production Deployment

In production (`NODE_ENV=production`), the Express server serves the React build from `client/build` as a single-process deployment:

```bash
npm run build-client   # Build React app
npm start              # Start server (serves API + static frontend)
```

Static uploads are served at `/uploads`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests with improvements.

---

## 📄 License

ISC License — See LICENSE file for details.

---

## 📞 Contact & Support

For questions or support, please open an issue on the repository.

---

**Made with ❤️ to empower Indian citizens through constitutional literacy**
