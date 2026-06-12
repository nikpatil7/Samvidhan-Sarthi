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
- 🏆 **8 Achievement Badges**: Earn rewards like Quiz Master, Preamble Scholar, Constitutional Expert
- 📊 **Real-Time Dashboard**: Track progress per topic, quiz scores, activities — filtered by country
- 🌙 **Beautiful Dark UI**: Modern design with Framer Motion animations
- 🔐 **Secure Auth**: JWT-based authentication with bcrypt password hashing
- 📱 **Fully Responsive**: Desktop, tablet, and mobile
- 📚 **21 Topics, 59 Content Items**: From Preamble to Landmark Judgments

---

## 💻 Tech Stack

| Layer        | Technology                            |
| ------------ | ------------------------------------- |
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **Backend**  | Node.js, Express.js                   |
| **Database** | MongoDB with Mongoose ODM             |
| **Auth**     | JWT + bcrypt                          |
| **Tools**    | Concurrently, Morgan, Axios           |

---
## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or later
- **MongoDB** running locally (or a MongoDB Atlas URI)

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
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
cd server
node seed-database.js       # Seeds all topics, content, games, and badges
node check-topics.js        # Verify everything was created
```

This creates:
- **21 Topics** across 5 difficulty levels (Preamble → Landmark Judgments)
- **59 Content items** (21 lessons, 21 quizzes, 17 interactive games)
- **8 Achievement badges** (Common → Epic rarity)

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
├── setup.js                  # Setup helper
│
├── client/                   # React frontend
│   ├── public/               # Static assets & index.html
│   ├── src/
│   │   ├── App.js            # Routes & layout
│   │   ├── index.js          # Entry point
│   │   ├── index.css         # Global styles (Tailwind)
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Layout.js     # Main layout with sidebar
│   │   │   ├── TypingText.js # Animated typing effect
│   │   │   ├── ConstitutionMap.js
│   │   │   ├── ConstitutionalTopicCard.js
│   │   │   └── ConstitutionalGames/
│   │   │       ├── QuizGame.js
│   │   │       ├── ScenarioGame.js
│   │   │       ├── MatchingGame.js
│   │   │       ├── TimelineGame.js
│   │   │       └── SpiralGame.js
│   │   ├── pages/            # Page-level components
│   │   │   ├── Dashboard.js          # Progress dashboard
│   │   │   ├── Topics.js             # Topic listing
│   │   │   ├── TopicDetail.js        # Topic content view
│   │   │   ├── ContentDetail.js      # Lesson/quiz/game viewer
│   │   │   ├── ConstitutionalGamePage.js  # Games hub
│   │   │   ├── ConstitutionalTopics.js
│   │   │   ├── ConstitutionMapPage.js
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
    ├── seed-database.js      # Master database seeder
    ├── check-topics.js       # Database verification tool
    ├── models/               # Mongoose schemas
    │   ├── Topic.js          # Topics with customId, category, difficulty
    │   ├── Content.js        # Lessons, quizzes, games, articles
    │   ├── Progress.js       # Per-user per-topic progress tracking
    │   ├── Badge.js          # Achievement badges
    │   └── User.js           # User accounts with bcrypt
    ├── routes/               # API route handlers
    │   ├── auth.js           # Register, login, JWT
    │   ├── users.js          # Profile, dashboard, achievements
    │   ├── content.js        # Topics, content, games, progress tracking
    │   ├── progress.js       # Progress queries, badge checking
    │   └── topics.js         # Topic detail routes
    └── seeds/                # Individual seed scripts
        ├── seed-mock-topics.js
        ├── seed-content.js
        ├── add-initial-badges.js
        ├── add-game-content.js
        ├── add-constitutional-quizzes.js
        ├── add-constitutional-scenarios.js
        └── update-games.js
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| POST   | `/api/auth/register`  | Register new user     |
| POST   | `/api/auth/login`     | Login & get JWT token |
| GET    | `/api/auth/me`        | Get current user      |

### Users (Protected)
| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/users/profile`          | Get user profile             |
| PUT    | `/api/users/profile`          | Update profile               |
| GET    | `/api/users/dashboard?country=India` | Get dashboard stats   |
| GET    | `/api/users/achievements`     | Get badges & achievements    |
| POST   | `/api/users/process-achievements` | Check & award new badges |
| PUT    | `/api/users/change-password`  | Change password              |

### Content
| Method | Endpoint                              | Description                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/api/content/topics/:country`        | List topics by country     |
| GET    | `/api/content/topics/detail/:topicId` | Get topic details          |
| GET    | `/api/content/topics/:topicId/content`| Get content for a topic    |
| GET    | `/api/content/content/:contentId`     | Get specific content item  |
| GET    | `/api/content/games/all`              | Get all game types at once |
| GET    | `/api/content/games/:gameType`        | Get games by type          |
| POST   | `/api/content/track`                  | Track content completion   |
| GET    | `/api/content/search?query=...`       | Search topics & content    |

### Progress (Protected)
| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/api/progress`              | Get all user progress        |
| GET    | `/api/progress/summary`      | Get progress summary stats   |
| GET    | `/api/progress/:topicId`     | Get progress for a topic     |
| POST   | `/api/progress/check-badges` | Check & award badges         |

---

## 🎓 Academic Excellence

**Final Year Engineering Project** demonstrating:

- ✅ Full-stack MERN architecture (MongoDB, Express, React, Node.js)
- ✅ JWT authentication & bcrypt encryption
- ✅ RESTful API design with 20+ endpoints
- ✅ Mongoose ODM with indexed schemas
- ✅ Database seeding & migration scripts
- ✅ Responsive UI with Tailwind CSS & Framer Motion
- ✅ Gamification: 5 game types, 8 badges, progress tracking
- ✅ Real-time dashboard with country-filtered analytics

---

## 🌟 Features in Detail

### 📚 Learning Modules
- 21 topics across 5 levels (Beginner → Advanced)
- Lessons with rich Markdown content
- Quizzes with explanations for each answer
- Interactive games: Matching, Scenario, Timeline, Spiral, Quiz

### 👤 User System
- Secure signup & login with JWT tokens
- Profile management with preferred country
- Password hashing with bcrypt (10 salt rounds)

### 🎖️ Achievements & Progress
- 8 badges from Common to Epic rarity
- Real-time progress tracking per topic
- Auto-calculated completion percentages
- Badge auto-award after quiz/game completion

### 📊 Dashboard
- Overall progress, completed topics, quiz averages
- Recent activity feed with timestamps
- Country-filtered stats (India, USA, UK)
- Manual refresh + auto-refresh on navigation
- Continue Learning section for in-progress topics

### 🎨 UI/UX
- Dark theme with custom color palette
- Framer Motion animations & hover effects
- Responsive grid layouts
- Clean card-based design throughout

---

## 📦 Key Dependencies

### Frontend
- `react` `react-dom` `react-router-dom` — Core framework & routing
- `tailwindcss` — Utility-first CSS
- `framer-motion` — Animations
- `axios` — HTTP client
- `react-markdown` `remark-gfm` — Markdown rendering
- `jwt-decode` — Client-side token decoding

### Backend
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken` — JWT generation & verification
- `bcrypt` — Password hashing
- `cors` — Cross-origin requests
- `morgan` — HTTP request logging
- `dotenv` — Environment variable management

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
