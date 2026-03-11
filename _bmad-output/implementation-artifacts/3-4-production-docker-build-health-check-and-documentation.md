# Story 3.4: Production Docker Build, Health Check, and Documentation

Status: done

## Story

As a developer,
I want the app to be production-ready with optimized Docker images, health monitoring, and clear documentation,
So that the project is deployable, maintainable, and serves as a portfolio piece.

## Acceptance Criteria (BDD)

### AC1: Enhanced health check endpoint
**Given** the backend health check endpoint
**When** I send `GET /api/health`
**Then** I receive `200` with `{ "status": "healthy", "db": "connected" }` when PostgreSQL is reachable
**And** I receive `503` with `{ "status": "unhealthy", "db": "disconnected" }` when PostgreSQL is unreachable
**And** the backend has an integration test for the health endpoint

### AC2: Frontend Dockerfile production build
**Given** the frontend Dockerfile
**When** I build the image
**Then** it uses a multi-stage build: Node stage for `npm run build` → nginx stage for serving static files
**And** the final image runs as a non-root user
**And** nginx is configured to serve the SPA (all routes → `index.html`) and proxy `/api/*` to the backend

### AC3: Backend Dockerfile production build
**Given** the backend Dockerfile
**When** I build the image
**Then** it uses a multi-stage build: deps stage → runtime stage
**And** the final image runs as a non-root user
**And** the entrypoint runs Alembic migrations before starting Uvicorn
**And** a Docker HEALTHCHECK instruction pings `/api/health`

### AC4: Docker Compose orchestration
**Given** the `docker-compose.yml`
**When** I run `docker compose up`
**Then** all three services start in the correct order: db → backend (depends on db healthy) → frontend
**And** PostgreSQL uses a persistent named volume
**And** internal Docker networking connects frontend → backend → db
**And** only frontend (port 3000) and backend (port 8000) are exposed to the host

### AC5: Docker Compose test profile
**Given** the Docker Compose profiles
**When** I run `docker compose --profile test up`
**Then** test runners execute in containers

### AC6: Environment configuration
**Given** the `.env.example` file
**When** I inspect it
**Then** it contains placeholder values for: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `CORS_ORIGINS`

### AC7: README documentation
**Given** the README.md at the repository root
**When** I read it
**Then** it includes: project description, tech stack overview, prerequisites (Docker, Node, Python), setup instructions (`docker compose up`), local development instructions, how to run tests, and project structure overview

### AC8: AI integration log
**Given** the `docs/ai-integration-log.md`
**When** I read it
**Then** it documents AI agent usage throughout the project, including: tools used, limitations encountered, and learnings

## Tasks / Subtasks

- [ ] Task 1: Enhance health check endpoint with DB status (AC: #1)
  - [ ] 1.1 Update `backend/app/routers/health.py`:
    - Import `get_db` from `app.database`
    - Import `text` from `sqlalchemy`
    - Change the health endpoint to check DB connectivity:
      ```python
      @router.get("/health")
      async def health_check(db: AsyncSession = Depends(get_db)):
          try:
              await db.execute(text("SELECT 1"))
              return {"status": "healthy", "db": "connected"}
          except Exception:
              return JSONResponse(
                  status_code=503,
                  content={"status": "unhealthy", "db": "disconnected"}
              )
      ```
    - Make the `db` dependency optional so the endpoint still works during startup if DB is slow
  - [ ] 1.2 Write health check tests in `backend/tests/routers/test_health.py`:
    - `test_health_check_healthy` — with connected DB, returns 200 + `{"status": "healthy", "db": "connected"}`
    - `test_health_check_unhealthy` — mock DB failure, returns 503 + `{"status": "unhealthy", "db": "disconnected"}`

- [ ] Task 2: Harden frontend Dockerfile (AC: #2)
  - [ ] 2.1 Update `frontend/Dockerfile`:
    - Current state: two-stage build (Node → nginx) — ✅ already present
    - ADD: non-root user in nginx stage
      ```dockerfile
      RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
      USER appuser
      ```
      Note: nginx:alpine needs special handling — the default `nginx` user may suffice, or use `nginx:alpine-slim` which runs as non-root
    - Alternatively: use `nginx:alpine` and configure to run as non-root by changing listen port to 8080 and adjusting permissions
    - ADD: HEALTHCHECK instruction:
      ```dockerfile
      HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -q --spider http://localhost:80/ || exit 1
      ```
  - [ ] 2.2 Verify `frontend/nginx.conf`:
    - SPA routing (`try_files $uri $uri/ /index.html`) — ✅ already present
    - API proxy (`proxy_pass http://backend:8000`) — ✅ already present

- [ ] Task 3: Harden backend Dockerfile (AC: #3)
  - [ ] 3.1 Update `backend/Dockerfile`:
    - Multi-stage build — ✅ already present
    - Non-root user — ✅ already present (`appuser`)
    - Entrypoint runs migrations — ✅ already present (`entrypoint.sh` runs `alembic upgrade head`)
    - ADD: Docker HEALTHCHECK instruction:
      ```dockerfile
      HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1
      ```
      Or use `curl` if available:
      ```dockerfile
      RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
      HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD curl -f http://localhost:8000/api/health || exit 1
      ```
      Note: `python:3.11-slim` has Python available, so the `urllib` approach avoids installing curl.
      But HEALTHCHECK runs as the appuser — verify urllib works without root.

- [ ] Task 4: Update Docker Compose (AC: #4, #5)
  - [ ] 4.1 Update `docker-compose.yml`:
    - Fix backend port mapping: currently `8080:8000`, spec says expose port 8000 → change to `8000:8000`
    - Add health check for backend service using the `/api/health` endpoint:
      ```yaml
      backend:
        healthcheck:
          test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"]
          interval: 10s
          timeout: 5s
          retries: 5
          start_period: 15s
      ```
    - Make frontend depend on backend being healthy:
      ```yaml
      frontend:
        depends_on:
          backend:
            condition: service_healthy
      ```
    - Backend already depends on db healthy — ✅ correct
  - [ ] 4.2 Add test profile to `docker-compose.yml`:
    ```yaml
    backend-test:
      build: ./backend
      profiles: ["test"]
      command: python -m pytest
      environment:
        DATABASE_URL: ${DATABASE_URL}
      depends_on:
        db:
          condition: service_healthy

    frontend-test:
      build: ./frontend
      profiles: ["test"]
      command: npm test
    ```
    Or configure as override: `docker-compose.test.yml`

- [ ] Task 5: Create/update .env.example (AC: #6)
  - [ ] 5.1 Create or update `.env.example` at project root:
    ```
    POSTGRES_DB=mattodos
    POSTGRES_USER=mattodos_user
    POSTGRES_PASSWORD=mattodos_password
    DATABASE_URL=postgresql+asyncpg://mattodos_user:mattodos_password@db:5432/mattodos
    CORS_ORIGINS=http://localhost:3000
    ```
  - [ ] 5.2 Verify `.gitignore` excludes `.env` but NOT `.env.example`

- [ ] Task 6: Write comprehensive README (AC: #7)
  - [ ] 6.1 Update `README.md` at project root with:
    - **Project description**: mattodos — a full-stack todo application
    - **Tech stack**: React 19 + TypeScript + Tailwind CSS (frontend), FastAPI + SQLAlchemy + PostgreSQL (backend), Docker Compose (infrastructure)
    - **Prerequisites**: Docker and Docker Compose
    - **Quick start**: `cp .env.example .env && docker compose up`
    - **Local development**:
      - Frontend: `cd frontend && npm install && npm run dev`
      - Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
      - Database: `docker compose up db`
    - **Running tests**:
      - Frontend unit tests: `cd frontend && npm test`
      - Backend tests: `cd backend && python -m pytest`
      - E2E tests: `cd frontend && npx playwright test`
      - Full test suite in Docker: `docker compose --profile test up`
    - **Project structure**: brief directory overview
    - **API endpoints**: table of endpoints (GET /api/todos, POST /api/todos, PATCH /api/todos/:id, DELETE /api/todos/:id, GET /api/health)

- [ ] Task 7: Create AI integration log (AC: #8)
  - [ ] 7.1 Create `docs/ai-integration-log.md`:
    - Document the BMAD method usage (PM, Architect, UX Designer, Scrum Master, Developer agents)
    - Document the tools used (GitHub Copilot with Claude models)
    - Document the workflow: brainstorming → PRD → architecture → UX design → epics → sprint planning → story creation → implementation
    - Document limitations and learnings
    - Keep factual and concise

## Dev Notes

### Architecture Compliance

This story closes out the project by making it production-ready. It involves Docker configuration, backend endpoint enhancement, and documentation. No frontend component changes.

#### Critical Architecture Constraints

1. **Health check must test actual DB connectivity**: The current health endpoint returns `{"status": "ok"}` without checking the database. It MUST be enhanced to execute a simple query (`SELECT 1`) and return the DB connection status.

2. **Health check must not crash on DB unavailability**: If PostgreSQL is down, the endpoint must catch the exception and return 503 — NOT throw a 500 error.

3. **Docker HEALTHCHECK in Dockerfiles**: Both Dockerfiles need a HEALTHCHECK instruction so Docker itself can monitor container health. This is separate from the API health endpoint.

4. **Backend port**: The `docker-compose.yml` currently maps port `8080:8000` but the architecture spec says port 8000 should be exposed. Verify which is intended — the frontend Vite dev proxy uses port 8000, and the architecture doc says backend on port 8000.

5. **Non-root Docker users**: Frontend already uses nginx's default config. Backend already has `appuser`. Verify nginx can serve on port 80 as non-root (it can't by default — may need to change to a high port like 8080 and update the compose port mapping, or keep running as root for nginx).

6. **README must be accurate**: Test every command mentioned in the README to ensure it actually works.

7. **Do NOT log todo descriptions** in health check or any new code (NFR8).

### Existing Code to Build On

**Backend — files to modify:**
- `backend/app/routers/health.py` — Enhance with DB check (currently returns static `{"status": "ok"}`)
- `backend/Dockerfile` — Add HEALTHCHECK instruction

**Backend — files to create:**
- `backend/tests/routers/test_health.py` — Health endpoint tests

**Frontend — files to modify:**
- `frontend/Dockerfile` — Add non-root user, HEALTHCHECK instruction

**Infrastructure — files to modify:**
- `docker-compose.yml` — Fix port, add backend healthcheck, add test profile, add frontend dependency on backend health

**Root — files to create or modify:**
- `.env.example` — Create/update with all required env vars
- `README.md` — Rewrite with comprehensive documentation
- `docs/ai-integration-log.md` — Create AI integration log

### Existing Patterns to Follow

```python
# Pattern from existing health endpoint:
@router.get("/health")
async def health_check():
    return {"status": "ok"}
# ENHANCE with DB check — follow the dependency injection pattern from todos router

# Pattern from todos router — Depends injection:
async def list_todos(db: AsyncSession = Depends(get_db)):
```

```yaml
# Pattern from docker-compose.yml — health check:
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 5s
    timeout: 5s
    retries: 5
# FOLLOW SAME PATTERN for backend service
```

### What This Story Does NOT Include

- **No responsive layout changes** — Story 3.1
- **No accessibility improvements** — Story 3.2
- **No E2E or unit test writing** — Story 3.3 (except health check tests)
- **No application feature changes** — only infrastructure, health check, and docs

### Anti-Patterns to Avoid

- **Do NOT hardcode credentials in Dockerfiles** — use env vars from compose
- **Do NOT expose the database port to the host** — only frontend and backend ports
- **Do NOT make health check endpoint slow** — `SELECT 1` only, no complex queries
- **Do NOT skip the integration test for health** — it's a production-critical endpoint
- **Do NOT write aspirational README** — only document what actually works
- **Do NOT fake the AI integration log** — document actual agent usage and real learnings

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — Docker section, health check, deployment]
- [Source: backend/app/routers/health.py — Current basic health endpoint]
- [Source: backend/Dockerfile — Current multi-stage build with non-root user]
- [Source: frontend/Dockerfile — Current multi-stage build without non-root user]
- [Source: docker-compose.yml — Current orchestration with db healthcheck]
- [Source: backend/entrypoint.sh — Current migration + uvicorn entrypoint]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
