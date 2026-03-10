# mattodos

A warm, personal todo application built with React, FastAPI, and PostgreSQL.

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker compose up
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

## Development

### Prerequisites

- Docker & Docker Compose
- Node.js 24+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Local Development

```bash
# Start database only
docker compose up db

# Backend (in separate terminal)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && python -m pytest
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4
- **Backend**: FastAPI, SQLAlchemy 2.0 (async), Alembic
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker Compose
