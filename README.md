# SkillForge

SkillForge is a full-stack web app for personal growth across three pillars:
- Learning (course library + AI-generated curriculum)
- Gaming (playable cognitive/strategy mini-games)
- Sports (workout program planner)

It includes authentication, protected routes, user dashboard metrics, and PostgreSQL persistence.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: PostgreSQL (`pg`)
- Auth: Session-based auth (`express-session` + `connect-pg-simple`)
- Password hashing: `argon2`
- AI integration: Ollama local API (`qwen2.5:14b` configured in code)

## Project Structure

```text
Backend/
  src/
    server.js            # Express app entry
    Authentication.js    # Register/login/logout/me
    users.js             # profile + dashboard stats
    learning.js          # user courses CRUD
    gaming.js            # user games CRUD
    sports.js            # user sports programs CRUD
    lesson.js            # lesson content by id
    ai.js                # text/curriculum generation + extension
    db.js                # postgres pool
    requireAuth.js       # auth guard middleware
  Middlewares/
    session.js           # session config + session store
  Games/
    tictactoe.js         # simple API tictactoe engine
    gamesStats.js        # typing/chess stats endpoints
  scripts/
    inspectCurriculum.mjs
    backfillCurriculumContent.mjs

Frontend/
  src/
    App.jsx              # login/register screen
    Home.jsx             # dashboard
    Learning.jsx
    Gaming.jsx
    Sports.jsx
    Profile.jsx
    ProgressHub.jsx
    LessonPage.jsx
    Navbar.jsx
    components/*Modal.jsx # game modals
    config/api.js        # API endpoint mapping
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL running locally or remotely
- (Optional, AI features) Ollama running on `http://localhost:11434`

## Environment Variables

Create a `.env` at project root for backend runtime:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=skillforge
SESSION_SECRET=replace_with_a_long_random_secret
```

Important:
- `SESSION_SECRET` is required. Backend will throw if missing.
- `.env` is gitignored and should never be committed.

Optional frontend env (`Frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5143
```

If not set, frontend defaults to `http://localhost:5143`.

## Install Dependencies

From project root:

```bash
npm install
```

Then frontend dependencies:

```bash
cd Frontend
npm install
```

## How To Run

### 1) Start backend (port 5143)

From project root:

```bash
node Backend/src/server.js
```

Backend base URL: `http://localhost:5143`

### 2) Start frontend (port 5173)

In a new terminal:

```bash
cd Frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

## Build Frontend

```bash
cd Frontend
npm run build
npm run preview
```

## Database Requirements (minimum tables used by code)

The backend expects these tables/columns to exist:

- `users(id, name, email, password_hash)`
- `user_sessions` (session store table used by `connect-pg-simple`)
- `courses(id, title, image_url)`
- `user_courses(user_id, course_id, added_at)`
- `curriculum(id, request_key, title, description)`
- `modules(id, curriculum_id, title, order_index)`
- `lessons(id, module_id, title, content, order_index)`
- `gaming(id, user_id, title, image_url)`
- `sports_programs(id, user_id, title, image_url)`
- `typing_scores(id, user_id, wpm)`
- `chess_results(id, user_id, result)`

If you want, I can generate a full SQL migration file for these tables.

## API Overview

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me` (protected)

### Users
- `GET /users/dashboard-stats`
- `GET /users`
- `GET /users/profile`
- `PUT /users/profile`

### Learning
- `GET /api/learning`
- `POST /api/learning`
- `DELETE /api/learning/:courseId`

### Lessons
- `GET /api/lessons/:id`

### Gaming
- `GET /api/gaming`
- `POST /api/gaming`
- `DELETE /api/gaming/:id`

### Sports
- `GET /api/sports`
- `POST /api/sports`
- `DELETE /api/sports/:id`

### AI
- `POST /api/ai/generate` (typing paragraph text)
- `POST /api/ai/generate-course`
- `POST /api/ai/extend-course`

### Game Stats
- `POST /api/stats/typing`
- `POST /api/stats/chess`

### TicTacToe API (server-side game state)
- `POST /api/tictactoe/new`
- `GET /api/tictactoe/:id`
- `POST /api/tictactoe/:id/move`

## Features Available

### Auth + Session
- Register/login/logout
- Session cookie auth (`sid`)
- Route protection on frontend and backend

### Dashboard (`/home`)
- XP/level/tasks/streak/coins summary
- Weekly goal progress tracking
- Recent activity + quick navigation

### Learning (`/home/learning`)
- Add/delete/search/sort course library
- Favorite + progress tracking (localStorage)
- Focus bundles (one-click course pack add)
- AI curriculum popup with modules + lessons
- Course extension via AI (`extend-course`)
- Deep lesson viewer page (`/home/learning/lesson/:id`)

### Gaming (`/home/gaming`)
- Add/delete/search/filter game library
- Favorites + sessions tracking
- Playable games:
  - Chess Tactics
  - Speed Typing
  - Tic Tac Toe AI
  - Tetris
  - Memory Match
  - Reaction Test
  - Logic Puzzles
  - Word Sprint
  - Math Sprint
  - Sequence Recall
  - Aim Trainer
  - Code Breaker
- Placeholder: Sudoku Master (non-playable currently)

### Sports (`/home/sports`)
- Add/delete/search training programs
- Program builder with manual exercise rows
- Weekly day selection and notes
- AI workout plan generation
- Plan persistence in localStorage

### Profile + Hub
- Profile edit with fallback behavior for older backend states
- Preferences management
- Progress Hub with goals, recommendations, and weekly priorities

## Utility Scripts

From project root:

```bash
node Backend/scripts/inspectCurriculum.mjs
node Backend/scripts/backfillCurriculumContent.mjs
```

Notes:
- These scripts load env from `Backend/.env`.
- `backfillCurriculumContent.mjs` can populate missing curriculum/modules/lessons.

## Troubleshooting

- `SESSION_SECRET environment variable is required`
  - Add `SESSION_SECRET` in `.env`.

- `GET /users/profile 404`
  - Ensure backend is restarted after route updates.
  - Frontend has fallback via `/auth/me` for older backend state.

- CORS / cookie issues
  - Backend expects frontend origin `http://localhost:5173`.
  - Keep frontend+backend on those ports in development or update CORS config.

- AI endpoints fail
  - Start Ollama and ensure model exists:
    - `ollama pull qwen2.5:14b`
  - Confirm Ollama is reachable at `http://localhost:11434`.

## Security Notes

- Keep `.env` local only.
- Use a long random `SESSION_SECRET`.
- For production, set secure cookie config (`secure: true`) and deploy over HTTPS.

