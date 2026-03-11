# Story 1.1: Project Scaffolding and Infrastructure

Status: done

## Story

As a developer,
I want the full-stack project structure initialized with Docker Compose orchestration,
So that I have a working development environment with frontend, backend, and database containers ready for feature development.

## Acceptance Criteria (BDD)

### AC1: Docker Compose starts all services
**Given** a fresh clone of the repository
**When** I run `docker compose up`
**Then** three services start: PostgreSQL 16 (db), FastAPI backend (backend on port 8000), and Vite React frontend (frontend on port 3000)
**And** the frontend serves the default Vite React page at `http://localhost:3000`
**And** the backend returns `{"status": "ok"}` at `http://localhost:8000/api/health`
**And** PostgreSQL is running with a persistent named volume for data

### AC2: Project file structure matches architecture
**Given** the project repository
**When** I inspect the file structure
**Then** it matches the architecture document's directory layout (frontend/, backend/, docker-compose.yml, .env.example)
**And** `.env.example` contains placeholder values for all required environment variables
**And** `.gitignore` excludes `.env`, `node_modules`, `__pycache__`, `venv`, and build artifacts

### AC3: Frontend toolchain configured
**Given** the frontend project
**When** I inspect the configuration
**Then** Vite is configured with React, TypeScript (strict mode), Tailwind CSS, and Vitest
**And** the Vite dev server proxies `/api/*` requests to `http://localhost:8000`
**And** ESLint is configured with the TypeScript plugin

### AC4: Backend framework and ORM configured
**Given** the backend project
**When** I inspect the configuration
**Then** FastAPI is configured with CORS (allowing the frontend origin), pydantic-settings for config
**And** SQLAlchemy 2.0 async engine is configured with asyncpg driver
**And** Alembic is initialized and configured for async migrations
**And** the app structure follows: `app/main.py`, `app/config.py`, `app/database.py`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`

## Tasks / Subtasks

- [ ] Task 1: Initialize project root (AC: #2)
  - [ ] 1.1 Create `docker-compose.yml` with db, backend, frontend services
  - [ ] 1.2 Create `.env.example` with placeholder values for POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_URL, CORS_ORIGINS
  - [ ] 1.3 Create `.gitignore` excluding .env, node_modules, __pycache__, venv, build artifacts, dist, .pytest_cache, coverage, playwright-report
  - [ ] 1.4 Create placeholder `README.md`
- [ ] Task 2: Scaffold frontend (AC: #3)
  - [ ] 2.1 Run `npm create vite@latest frontend -- --template react-ts`
  - [ ] 2.2 Install dev dependencies: tailwindcss, @tailwindcss/vite, vitest, @testing-library/react, @testing-library/jest-dom, jsdom
  - [ ] 2.3 Configure `vite.config.ts` with Tailwind plugin, Vitest, and `/api` proxy to `http://localhost:8000`
  - [ ] 2.4 Configure `tsconfig.json` with strict mode
  - [ ] 2.5 Set up `index.css` with Tailwind import (`@import "tailwindcss"`)
  - [ ] 2.6 Create frontend `Dockerfile` (multi-stage: node build → nginx)
  - [ ] 2.7 Create `nginx.conf` (SPA routing + /api proxy to backend)
  - [ ] 2.8 Verify `npm run dev` serves default Vite page
- [ ] Task 3: Scaffold backend (AC: #4)
  - [ ] 3.1 Create `backend/` directory structure: `app/__init__.py`, `app/main.py`, `app/config.py`, `app/database.py`, `app/models/__init__.py`, `app/schemas/__init__.py`, `app/routers/__init__.py`, `app/services/__init__.py`
  - [ ] 3.2 Create `requirements.txt` with pinned dependencies
  - [ ] 3.3 Implement `app/config.py` using pydantic-settings (DATABASE_URL, CORS_ORIGINS)
  - [ ] 3.4 Implement `app/database.py` with async engine and session factory
  - [ ] 3.5 Implement `app/main.py` with FastAPI app, CORS middleware, health router
  - [ ] 3.6 Implement `app/routers/health.py` returning `{"status": "ok"}`
  - [ ] 3.7 Initialize Alembic with async configuration (`alembic init -t async alembic`)
  - [ ] 3.8 Configure `alembic.ini` and `alembic/env.py` for async SQLAlchemy
  - [ ] 3.9 Create backend `Dockerfile` (multi-stage: deps → runtime, non-root user)
  - [ ] 3.10 Create `entrypoint.sh` that runs `alembic upgrade head` then starts uvicorn
  - [ ] 3.11 Create `backend/tests/conftest.py` stub
- [ ] Task 4: Docker Compose integration (AC: #1)
  - [ ] 4.1 Configure db service (postgres:16-alpine, named volume, health check with pg_isready)
  - [ ] 4.2 Configure backend service (depends_on db healthy, port 8000, env vars)
  - [ ] 4.3 Configure frontend service (depends_on backend, port 3000)
  - [ ] 4.4 Verify `docker compose up` starts all three services
  - [ ] 4.5 Verify frontend accessible at localhost:3000
  - [ ] 4.6 Verify backend health check at localhost:8000/api/health
  - [ ] 4.7 Verify PostgreSQL accepts connections
- [ ] Task 5: Development workflow verification (AC: #1, #2, #3, #4)
  - [ ] 5.1 Verify local dev workflow: `docker compose up db` + local backend + local frontend
  - [ ] 5.2 Verify Vite proxy forwards /api/* to backend

## Dev Notes

### Architecture Compliance

This is a **greenfield** scaffolding story. No existing code exists — the repository currently contains only BMAD planning artifacts under `_bmad/`, `_bmad-output/`, and `docs/`. All code files are created from scratch.

#### Critical Architecture Constraints

1. **File structure MUST match exactly** as defined in the architecture document. Every directory and file has a specific location — do not deviate:
   ```
   mattodos/
   ├── docker-compose.yml
   ├── .env.example
   ├── .gitignore
   ├── README.md
   ├── frontend/
   │   ├── Dockerfile
   │   ├── nginx.conf
   │   ├── package.json
   │   ├── tsconfig.json
   │   ├── vite.config.ts
   │   ├── index.html
   │   ├── public/
   │   ├── src/
   │   │   ├── index.css
   │   │   ├── main.tsx
   │   │   ├── App.tsx
   │   │   ├── components/
   │   │   ├── hooks/
   │   │   ├── services/
   │   │   └── types/
   │   └── e2e/
   ├── backend/
   │   ├── Dockerfile
   │   ├── requirements.txt
   │   ├── alembic.ini
   │   ├── alembic/
   │   │   ├── env.py
   │   │   └── versions/
   │   ├── app/
   │   │   ├── __init__.py
   │   │   ├── main.py
   │   │   ├── config.py
   │   │   ├── database.py
   │   │   ├── models/__init__.py
   │   │   ├── schemas/__init__.py
   │   │   ├── routers/__init__.py
   │   │   ├── routers/health.py
   │   │   └── services/__init__.py
   │   └── tests/
   │       └── conftest.py
   └── docs/
   ```

2. **Backend layers**: Router → Service → Model. Routers NEVER import models directly.

3. **Frontend layers**: Component → Hook → Service. Components NEVER call `api.ts` directly.

4. **No database table creation in this story.** The `todos` table is created in Story 1.2 via Alembic migrations. This story only initializes Alembic and configures the async engine. Do NOT create any migration files for the todos table.

5. **Health endpoint is simple** for this story: just return `{"status": "ok"}`. The full health check with DB connectivity check (`{"status": "healthy", "db": "connected"}`) is in Story 3.4.

### Technology Stack — Exact Versions

| Technology | Version | Notes |
|---|---|---|
| Node.js | 24.x | Use `node:24-alpine` in Dockerfile |
| Vite | 7.x | Latest 7.x via `npm create vite@latest` |
| React | 19.x | Comes with Vite react-ts template |
| TypeScript | 5.x | Strict mode enabled |
| Tailwind CSS | 4.x | Via `@tailwindcss/vite` plugin |
| Vitest | 4.x | Configured in `vite.config.ts` |
| Python | 3.11+ | Use `python:3.11-slim` in Dockerfile |
| FastAPI | 0.124.x | With `fastapi[standard]` |
| SQLAlchemy | 2.0.x | Async with asyncpg |
| Alembic | 1.17.x | Async migrations |
| Pydantic | 2.x | Built into FastAPI |
| pydantic-settings | latest | For type-safe config |
| asyncpg | latest | Async PostgreSQL driver |
| Uvicorn | 0.38.x | ASGI server |
| PostgreSQL | 16 | `postgres:16-alpine` image |

### Key Implementation Details

#### Docker Compose Configuration

```yaml
# docker-compose.yml key structure:
services:
  db:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
    environment: from .env

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    ports: ["8000:8000"]
    environment: from .env

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["3000:80"]  # nginx serves on 80 inside container

volumes:
  postgres_data:
```

#### .env.example Values

```bash
POSTGRES_DB=mattodos
POSTGRES_USER=mattodos_user
POSTGRES_PASSWORD=mattodos_password
DATABASE_URL=postgresql+asyncpg://mattodos_user:mattodos_password@db:5432/mattodos
CORS_ORIGINS=http://localhost:3000
```

#### Backend Config (pydantic-settings)

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    cors_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env"}

settings = Settings()
```

#### Backend Database Setup (async)

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

#### Backend Main App

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health

app = FastAPI(title="mattodos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
```

#### Health Router (simple for this story)

```python
# app/routers/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}
```

#### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

#### Tailwind CSS Setup (v4)

```css
/* src/index.css */
@import "tailwindcss";
```

Tailwind CSS v4 uses the Vite plugin (`@tailwindcss/vite`) — no `tailwind.config.js` file needed. Configuration is done via CSS if customization is required.

#### Frontend Dockerfile (multi-stage)

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser
EXPOSE 80
```

#### nginx.conf

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Backend Dockerfile (multi-stage)

```dockerfile
# Stage 1: Dependencies
FROM python:3.11-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .
RUN useradd -r -s /bin/false appuser
USER appuser
EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
```

#### Backend entrypoint.sh

```bash
#!/bin/sh
set -e
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Alembic Async Configuration

The `alembic/env.py` must use the async engine. Key configuration:
- Import `run_async_migrations` pattern
- Use `connectable = create_async_engine(settings.database_url)`
- Run migrations with `async with connectable.connect() as connection: await connection.run_sync(do_run_migrations)`
- Set `target_metadata = Base.metadata` from `app.database`

### Project Structure Notes

- This is a **monorepo** — `frontend/` and `backend/` are siblings under repo root
- `docker-compose.yml` lives at repo root (not inside either project)
- `.env.example` lives at repo root and is shared by Docker Compose
- Each sub-project has its own `Dockerfile`
- `_bmad/`, `_bmad-output/`, and `docs/` are NOT part of the application — they're planning artifacts
- `docs/ai-integration-log.md` should be created during this first sprint (per NFR30) — but it's a separate concern, not blocking for this story

### What This Story Does NOT Include

- **No `todos` table or migration** — that's Story 1.2
- **No frontend components** beyond the default Vite page — Story 1.3 creates the shell
- **No API endpoints** beyond `/api/health` — Story 1.2 adds CRUD endpoints
- **No Playwright setup** — that's Story 3.3
- **No full health check with DB status** — Story 3.4 enhances it
- **No `docs/ai-integration-log.md`** — Story 3.4 creates it

### Anti-Patterns to Avoid

- **Do NOT use Create React App** — it's deprecated; use Vite
- **Do NOT install a CSS component library** (MUI, Chakra, etc.) — Tailwind CSS only (per architecture)
- **Do NOT add `tailwind.config.js`** — Tailwind v4 uses the Vite plugin, no config file needed
- **Do NOT create database tables directly** — always use Alembic migrations
- **Do NOT use `psycopg2`** — use `asyncpg` for async PostgreSQL access
- **Do NOT use synchronous SQLAlchemy** — must be fully async (`create_async_engine`)
- **Do NOT hardcode credentials** — use environment variables via pydantic-settings
- **Do NOT expose the database port to the host** — only frontend and backend ports

### References

- [Source: architecture.md — Starter Template Evaluation](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Project Structure & Boundaries](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Infrastructure & Deployment](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Implementation Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: epics.md — Story 1.1 Acceptance Criteria](../_bmad-output/planning-artifacts/epics.md)
- [Source: prd.md — NFR25-NFR28 Docker requirements](../_bmad-output/planning-artifacts/prd.md)
- [Source: ux-design-specification.md — Tailwind/design system](../_bmad-output/planning-artifacts/ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

<!-- To be filled by dev agent -->

### Debug Log References

<!-- To be filled during implementation -->

### Completion Notes List

<!-- To be filled during implementation -->

### Change Log

| Date | Change | Author |
|---|---|---|
| 2026-03-06 | Story created by create-story workflow | SM (Bob) |

### File List

<!-- To be filled by dev agent with all files created/modified -->
