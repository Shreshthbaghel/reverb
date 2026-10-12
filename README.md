# Voice Agent Platform

AI-powered voice agent management — Phase 1 MVP

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (or SQLite for local)
- **Frontend:** React (Vite) + Tailwind CSS
- **AI:** Groq (`llama-3.3-70b-versatile` by default — free tier)
- **Database:** PostgreSQL via Docker (optional)
- **Admin UI:** PgAdmin (optional)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free [Groq API key](https://console.groq.com)
- Docker Desktop (optional, for PostgreSQL)

### 1. Database (optional)

```bash
docker-compose up -d
```

Without Docker, the backend uses SQLite via `DATABASE_URL` in `backend/.env`.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Set GROQ_API_KEY in .env (copy from .env.example)
python -m uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (landing page)  
Console: `http://localhost:5173/app`

## Environment

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Free key from console.groq.com |
| `GROQ_MODEL` | Default `llama-3.3-70b-versatile` |
| `DATABASE_URL` | SQLite or PostgreSQL connection string |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/agents/` | List agents |
| POST | `/api/agents/` | Create agent |
| PUT | `/api/agents/{id}` | Update agent |
| DELETE | `/api/agents/{id}` | Delete agent |
| GET | `/api/calls/` | List calls |
| POST | `/api/calls/` | Log a call (scores transcript via Groq) |
| GET | `/api/calls/analytics/{agent_id}` | Analytics |

## Features

- Marketing landing page (portfolio / resume walkthrough)
- Description → Groq-generated master system prompt
- Embeddable widget (`embed.js` / iframe) for third-party sites
- Public agent chat API for embeds
- Agent CRUD + call logging + analytics
- Groq LLM for replies and transcript scoring
- REST API with OpenAPI docs

## Phase 2 Roadmap

- Real-time voice streaming (LiveKit)
- JWT authentication
- Redis caching
- Docker CI/CD
- Prometheus + Grafana
