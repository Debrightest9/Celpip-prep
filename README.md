# CELPIP Prep AI

AI-powered CELPIP preparation platform. Practice all 4 skills with real-time GPT-4 feedback. Achieve CLB 9+.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, Tailwind CSS, Recharts, Zustand |
| Backend | Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 |
| AI | OpenAI GPT-4o (questions, grading, coaching) |
| Speech | OpenAI Whisper (speaking transcription) |

## Quick Start

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15 (or use Docker Compose)
- OpenAI API key

### 2. Database

**Option A — Docker (recommended)**
```bash
docker compose up -d postgres
```

**Option B — Local PostgreSQL**
Create a database named `celpip_db`.

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, OPENAI_API_KEY, JWT_SECRET

npm install
npm run db:push       # push schema to DB
npm run dev           # start API on :3000
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000

npm install
npm run dev           # start UI on :3001
```

Open **http://localhost:3001**

---

## Features

### Authentication
- Register with email + optional password
- Login with email OR auto-generated User ID (e.g., `CP1A2B3C`)
- JWT auth, 7-day tokens

### Dashboard
- Overall CLB estimate
- Per-skill CLB scores with progress bars
- Weak area detection
- Recent sessions list
- Progress chart (line chart over time)

### Practice Modes
| Mode | Description |
|------|-------------|
| Quick Practice | 1 question, any skill, instant AI feedback |
| Full Test | All 5 sections in sequence, timed, like real CELPIP |
| Weak Area | AI picks your weakest skill automatically |

### AI Question Generation
- **Listening**: Audio scripts (conversations, announcements) + MCQ
- **Reading**: Passages + comprehension MCQ
- **Writing Task 1**: Email writing prompts with 3 content points
- **Writing Task 2**: Survey/opinion response prompts
- **Speaking**: Task-based prompts (advice, describe, compare, etc.)
- Difficulty adapts based on your recent CLB scores (1–10 scale)

### AI Evaluation Engine
**Writing**:
- Task Achievement, Coherence, Vocabulary, Grammar scores
- Inline grammar corrections with explanations
- Improved version of your answer (your ideas, CLB 9 language)
- Band 9 model answer

**Speaking**:
- Whisper transcription of your recording
- Fluency, Pronunciation, Vocabulary, Content scores
- Better phrasing suggestions

**Reading/Listening**:
- Auto-graded MCQ
- Explanation of correct answer
- Why each option is wrong/right

### AI Coach Feedback
After every session:
- Weak pattern identification (recurring mistakes)
- Personalized improvement tips
- Templates (email structure, speaking framework, linking words)
- Readiness assessment for your target CLB
- Study focus priorities

### Study Plan
- 7-day AI-generated study plan
- Tailored to your weak areas and days until test
- Checkable tasks with time estimates

### Progress Tracking
- CLB trends per skill over 60 days
- Line charts for all 4 skills
- Session history with links to full feedback

### Gamification
- XP earned per session (10 XP/question + CLB bonus)
- Day streak tracking

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/users/me` | Get profile |
| GET | `/api/users/me/dashboard` | Dashboard data |
| POST | `/api/users/me/study-plan` | Generate study plan |
| POST | `/api/questions/generate` | Generate question |
| POST | `/api/questions/band9` | Generate Band 9 answer |
| POST | `/api/sessions` | Start session |
| POST | `/api/sessions/:id/respond` | Submit text answer |
| POST | `/api/sessions/:id/respond-audio` | Submit audio answer |
| POST | `/api/sessions/:id/complete` | Complete + get coach feedback |
| GET | `/api/sessions/:id` | Get session details |
| GET | `/api/progress` | Progress history |
| GET | `/api/progress/stats` | Stats summary |

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/celpip_db
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Database Schema

```
User → sessions, progress, studyPlans
Session → responses
Response (stores question, answer, score, detailed feedback)
Progress (CLB score snapshots per skill, per date)
StudyPlan (AI-generated 7-day JSON plans)
```
