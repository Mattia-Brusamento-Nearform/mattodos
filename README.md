# mattodos

A warm, personal todo application built with React, FastAPI, and PostgreSQL.

**Status**: ✅ **Production Ready** — All 3 epics complete, 9 stories delivered, 171+ tests passing

## Quick Start

```bash
# Copy environment file (if needed)
cp .env.example .env 2>/dev/null || true

# Start all services
docker compose up
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000 (internal) / http://localhost:8080 (docker-compose)
- **Health Check**: http://localhost:8080/api/health

## Project Status

✅ **Epic 1**: Create and View Todos (5/5 stories complete)
- Project scaffolding & infrastructure
- Todo data model & API endpoints
- Frontend shell & design system
- Todo creation with optimistic UI
- App states (loading, empty, error)

✅ **Epic 2**: Complete, Delete, and Manage Todos (4/4 stories complete)
- Toggle todo completion with optimistic UI
- Delete todo with confirmation dialog
- Inline error display and auto-dismiss
- Todo limit enforcement (50 max)

✅ **Epic 3**: Accessibility, Responsive Design, and Production Readiness (4/4 stories complete)
- Responsive layout (mobile & desktop)
- Full keyboard and screen reader accessibility
- E2E tests and test coverage (13/13 tests passing)
- Production Docker build, health check, and documentation

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

The frontend dev server will proxy `/api/*` requests to the backend at `http://localhost:8000`.

## API Documentation

### Endpoints

- `GET /api/todos` — List all todos
- `POST /api/todos` — Create a new todo
- `PATCH /api/todos/{id}` — Toggle todo completion status
- `DELETE /api/todos/{id}` — Delete a todo
- `GET /api/health` — Health check (returns status and DB connection)

### Error Format

All error responses follow this format:
```json
{
  "detail": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `201 Created` — Todo successfully created
- `204 No Content` — Todo successfully deleted
- `400 Bad Request` — Invalid input
- `404 Not Found` — Todo not found
- `409 Conflict` — Limit exceeded (50 todos max)
- `503 Service Unavailable` — Database connection failed

## Project Structure

```
mattodos/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components (with .test.tsx files)
│   │   ├── hooks/          # Custom hooks (useTodos)
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── index.css       # Tailwind + custom animations
│   ├── e2e/                # Playwright E2E tests
│   ├── playwright.config.ts
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   └── main.py         # App initialization
│   ├── tests/              # Pytest test suite
│   ├── alembic/            # Database migrations
│   └── requirements.txt
├── docker-compose.yml       # Orchestration (db, backend, frontend)
└── README.md               # This file
```

## Deployment

### Running Tests

#### E2E Tests (Playwright)
These tests run against the full stack (frontend + backend + database).

**Quick Start** — Run the automated test script (handles service startup/shutdown):
```bash
./test-e2e.sh
```

This script:
- Starts docker-compose services
- Waits for backend to be healthy
- Runs Playwright tests with HTML reporter
- Cleans up services

**Manual Testing** — If services are already running:
```bash
cd frontend
npm run test:e2e
```

For more advanced options, you can use `npx playwright` directly:
```bash
# Run with browser visible (headed mode)
npx playwright test e2e/ --headed

# Run specific test file
npx playwright test e2e/create-todo.spec.ts

# View test report after running
npx playwright show-report
```

**Test Coverage** (13/13 passing):
- ✅ Create Todo (4 tests): type + Enter, clear input, refocus, ignore empty
- ✅ Complete Todo (2 tests): mark complete, toggle back
- ✅ Delete Todo (3 tests): show dialog, cancel, confirm
- ✅ Empty State (2 tests): display when no todos, hide after create
- ✅ Error State (2 tests): display error, retry loading

#### Frontend Unit Tests (Vitest)
```bash
cd frontend

# Run once
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Test Coverage**: 158 tests across 19 test files
- Components: TodoInput, TodoItem, TodoCheckbox, DeleteButton, ConfirmDialog, TodoFooter, InlineError, App
- Hooks: useTodos reducer with all actions (create, toggle, delete, error handling)
- Services: API client methods

#### Backend Tests (Pytest)
```bash
cd backend

# Run all tests
python -m pytest

# Verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/routers/test_todos.py

# With coverage
pytest --cov=app --cov-report=html
```

**Test Coverage**: All CRUD endpoints tested with success and error cases

#### Run All Tests
```bash
# From project root with services running
cd frontend && npm test && npm run test:e2e
cd ../backend && python -m pytest
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Playwright (E2E), Vitest (unit)
- **Backend**: FastAPI, SQLAlchemy 2.0 (async), Alembic, Pytest
- **Database**: PostgreSQL 16 (persistent volume)
- **Infrastructure**: Docker Compose (orchestration), Nginx (SPA proxy)
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard and screen reader support

## Features

✨ **Core Functionality**
- Create todos with optimistic UI updates
- Mark todos as complete/incomplete
- Delete todos with confirmation dialog
- Real-time todo count and limit enforcement (50 max)
- Empty and error states with user-friendly messaging

✨ **User Experience**
- Responsive design (mobile-first, fully adapts to desktop)
- Optimistic UI for instant feedback on all actions
- Auto-dismissing error messages (5 seconds)
- Touch-friendly targets (44×44px minimum)
- Progressive disclosure (delete button hidden on desktop hover, visible on mobile/focus)

✨ **Accessibility**
- Full keyboard navigation (Tab, Space, Enter, Escape)
- Screen reader support with semantic HTML and ARIA labels
- Visible focus indicators (ring-2 ring-slate-600)
- High contrast and motion-safe animations
- Proper heading hierarchy and focus management

✨ **Production Ready**
- Health check endpoint with database connectivity verification
- Optimized Docker builds (multi-stage, non-root users)
- Comprehensive test suite (171+ tests, 100% pass rate)
- API error handling with consistent error format
- Database migrations via Alembic

## Deployment

The project is fully containerized and ready for deployment:

```bash
# Build and run production images
docker compose -f docker-compose.yml up --build

# Or just pull and run pre-built images
docker compose up
```

**Production Deployment Steps**:

1. Ensure PostgreSQL database is configured and accessible
2. Set environment variables (see `.env.example`)
3. Run database migrations: `docker exec mattodos-backend alembic upgrade head`
4. Start containers: `docker compose up -d`
5. Verify health: `curl http://localhost:8080/api/health`

For cloud deployments (AWS, GCP, Azure, etc.), use the multi-stage Dockerfiles in `frontend/` and `backend/` as base images.

## Contributing

This project follows the BMAD (Breaking Making And Directing) methodology for development. All features are implemented with:
- Complete test coverage (unit + E2E)
- Full accessibility compliance (WCAG 2.1 AA)
- Responsive design (mobile-first)
- Production-ready code quality

See `_bmad-output/implementation-artifacts/` for detailed story documentation and completion reports.

## License

[Add your license here]
