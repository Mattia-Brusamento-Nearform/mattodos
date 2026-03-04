---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/Product Requirement Document (PRD) for the Todo App.md
  - docs/Technical Requirements.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-04'
project_name: 'mattodos'
user_name: 'Mattia'
date: '2026-03-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
25 FRs covering a single-entity CRUD application. Architecturally, the requirements decompose into:
- **Data layer:** One entity (todo) with 3 fields — text description, completion boolean, creation timestamp (FR1–FR6). No relationships, no complex queries.
- **Mutation layer:** Create, toggle complete, delete — each with optimistic UI + background sync + rollback on failure (FR11, FR12, FR17–FR19). This is the primary source of frontend architectural complexity.
- **Validation layer:** Client-side silent rejection of empty input (FR7), server-side enforcement of 50-item limit (FR8–FR9), server-side input sanitization (NFR7).
- **State management:** Four app states — loading, empty, populated, error (FR13–FR15). Plus per-item transient states for sync/error.
- **Presentation layer:** Responsive single-screen SPA (FR20–FR21), keyboard-driven (FR22), accessible (FR23–FR24).
- **Operational:** Health check endpoint (FR25).

**Non-Functional Requirements:**
30 NFRs that drive architectural decisions across 8 categories:
- **Performance:** FCP <2s, optimistic renders <50ms, API p95 <200ms, minimal bundle, smooth at 50 items.
- **Security:** HTTPS, server-side input validation, no content logging, least-privilege API.
- **Reliability:** Durable persistence across restarts, 100% rollback correctness, graceful API unavailability handling.
- **Accessibility:** WCAG 2.1 AA, full keyboard navigation, contrast compliance, screen reader support.
- **Maintainability:** Consistent patterns, extensible without refactoring (new fields = predictable changes), independent frontend/backend deployment.
- **Testing:** Jest/Vitest + Playwright, 70% meaningful coverage, E2E for all user journeys, component tests alongside components.
- **Containerization:** Docker Compose orchestration, multi-stage builds, non-root users, health checks, dev/test profiles.
- **Documentation:** README with setup instructions, AI integration log.

**Scale & Complexity:**
- Primary domain: Full-stack web (SPA + REST API)
- Complexity level: Low
- Estimated architectural components: ~8 frontend components, ~5 API endpoints, 1 database table, Docker orchestration layer

### Technical Constraints & Dependencies

- **Deployment:** Must run via `docker-compose up` — all infrastructure containerized
- **Testing frameworks:** Jest or Vitest (unit/integration), Playwright (E2E) — explicit requirement, not a choice
- **CSS framework:** Tailwind CSS (established in UX spec) — no component library
- **Browser support:** Modern evergreen only (latest 2 versions of Chrome, Firefox, Safari, Edge)
- **No SSR required** — SPA with static asset serving
- **No auth in v1** — but architecture must support addition without refactoring
- **No offline support** — error state with retry is sufficient
- **50-item hard limit** — eliminates need for pagination/virtualization

### Cross-Cutting Concerns Identified

1. **Optimistic UI + rollback pattern** — Affects every mutation endpoint. Must be consistently implemented: instant UI update → background sync → revert + inline error on failure. Text restoration on failed create. Per-item error scoping.
2. **Error handling strategy** — Dual-layer: server returns structured errors, client maps them to scoped inline messages. Errors are local (per-row), not global. Auto-dismiss after 5s.
3. **Accessibility** — Pervasive: semantic HTML, ARIA attributes, focus management (auto-focus input, focus after delete, focus trap in dialog), keyboard navigation, screen reader announcements via aria-live regions, reduced motion support.
4. **Testing integration** — Tests written alongside code, not after. Backend integration tests per endpoint, frontend component tests per component, E2E covering all user journeys.
5. **Extensibility** — Architecture must allow adding fields (due date), auth, multi-user without structural changes. Clean separation of concerns, predictable file locations.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: **React SPA (TypeScript) + Python REST API (FastAPI) + PostgreSQL**, organized as separate directories in a single monorepo, orchestrated via Docker Compose.

### Starter Options Considered

**Frontend — Vite React TypeScript starter:**

| Option | What It Is | Verdict |
|---|---|---|
| `create-vite` (react-ts template) | Official Vite scaffolding — React + TypeScript, minimal, unopinionated | **Selected** — lightest starting point, full control over structure |
| Create React App | Legacy React scaffolding — webpack-based, officially deprecated | Rejected — deprecated, slow builds, Vite is the successor |
| Next.js | Full-stack React framework with SSR/SSG | Rejected — SSR not needed, adds routing complexity for a single-screen app |
| Remix | Full-stack React with loaders/actions | Rejected — server-side patterns unnecessary for this SPA |

**Backend — FastAPI starter:**

| Option | What It Is | Verdict |
|---|---|---|
| Manual FastAPI setup | `pip install fastapi uvicorn sqlalchemy alembic` — build structure yourself | **Selected** — FastAPI projects are simple enough that generators add little value. Manual setup gives full control and teaches the framework. |
| FastAPI project generator (tiangolo) | Full-stack template with auth, Docker, Celery | Rejected — massively overscoped. Includes auth, email, Celery workers — all excluded from v1. |
| cookiecutter-fastapi | Community template | Rejected — opinionated structure that may not match our needs, adds a dependency on cookiecutter |

**Database:**

PostgreSQL 16 — containerized via Docker Compose. No starter needed — just a `docker-compose.yml` service definition.

### Selected Starters

#### Frontend: Vite + React + TypeScript

**Initialization Command:**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

**Architectural Decisions Provided:**

- **Language & Runtime:** TypeScript 5.9, strict mode, Node.js 24.x
- **Build tool:** Vite 7.3 — ESBuild for dev (instant HMR), Rollup for production bundling
- **Styling:** Tailwind CSS 4.2 (added manually — aligns with UX spec)
- **Testing:** Vitest 4.0 (unit/component) + Playwright 1.58 (E2E) — both added manually
- **Linting:** ESLint with TypeScript plugin (included by Vite template)
- **Project structure:** `src/` flat structure — we'll organize into components/hooks/services/types

#### Backend: FastAPI (Manual Setup)

**Initialization:**

```bash
mkdir backend && cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi[standard] uvicorn sqlalchemy[asyncio] alembic psycopg asyncpg pydantic-settings
pip freeze > requirements.txt
```

**Architectural Decisions Provided:**

- **Language & Runtime:** Python 3.11+, type hints throughout
- **Framework:** FastAPI 0.124 — async request handling, auto-generated OpenAPI docs
- **ORM:** SQLAlchemy 2.0 (async) — declarative models, relationship support for future extensibility
- **Migrations:** Alembic — version-controlled database schema changes
- **Validation:** Pydantic v2 (built into FastAPI) — request/response models with automatic validation
- **Server:** Uvicorn (ASGI) — async-capable, production-grade
- **DB driver:** asyncpg (async PostgreSQL driver via SQLAlchemy async engine)

#### Infrastructure: Docker Compose

**No starter — hand-crafted `docker-compose.yml` at repo root:**

- **PostgreSQL 16** container with persistent volume
- **Backend** container (multi-stage Python build, non-root user, health check)
- **Frontend** container (multi-stage Node build → nginx for static serving, non-root user)
- **Networking:** Internal Docker network, only frontend/backend ports exposed
- **Profiles:** `dev` (with hot-reload mounts), `test` (with test runners)

### Verified Versions (as of 2026-03-04)

| Technology | Version | Source |
|---|---|---|
| Node.js | 24.4.0 | `node --version` |
| Vite | 7.3.1 | npm registry |
| React | 19.2.4 | npm registry |
| TypeScript | 5.9.3 | npm registry |
| Tailwind CSS | 4.2.1 | npm registry |
| Vitest | 4.0.18 | npm registry |
| Playwright | 1.58.2 | npm registry |
| Python | 3.11+ | `python3 --version` |
| FastAPI | 0.124.0 | PyPI |
| SQLAlchemy | 2.0.44 | PyPI |
| Pydantic | 2.12.5 | PyPI |
| Uvicorn | 0.38.0 | PyPI |
| Alembic | 1.17.2 | PyPI |
| PostgreSQL | 16 | Docker Hub |
| Docker | 28.2.2 | `docker --version` |
| Docker Compose | 2.37.1 | `docker compose version` |

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model schema (todo table with UUID primary keys)
- API endpoint design (REST with `/api/` prefix)
- Frontend state management approach (`useReducer`, no external library)
- Docker Compose service topology

**Important Decisions (Shape Architecture):**
- Optimistic UI with rollback pattern
- Error response format standardization
- API client isolation layer
- Component architecture (7 custom components)

**Deferred Decisions (Post-MVP):**
- Authentication method and provider
- CI/CD pipeline tooling
- External monitoring/APM
- Rate limiting strategy
- Caching layer

### Data Architecture

**Database:** PostgreSQL 16 (containerized)

**Schema — `todos` table:**

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | UUIDs support optimistic UI (client-generated temp IDs) and future multi-user |
| `description` | TEXT | NOT NULL, max 500 chars (app-level) | Validated by Pydantic model, no DB-level CHECK to keep migration simple |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | Toggle target |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Immutable after creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Auto-updated on any change via SQLAlchemy event |

**Modeling Approach:** SQLAlchemy 2.0 declarative models with async engine. Single model class `Todo` maps to the table. Pydantic schemas handle request/response validation separately from the ORM model.

**Migrations:** Alembic with auto-generation from SQLAlchemy models. One migration file per schema change, version-controlled alongside code.

**Caching:** None. 50-item max, single user, no complex queries — PostgreSQL handles this trivially.

### Authentication & Security

**Authentication (v1):** None — explicitly excluded from scope. Architecture is prepared for future addition:
- API routes organized so auth middleware can be injected as a FastAPI dependency
- Todo model has no `user_id` yet; adding one is a single migration + query filter

**API Security (v1):**
- **CORS:** Configured to allow only the frontend origin
- **Input sanitization:** Pydantic models validate and constrain all inputs; SQLAlchemy parameterized queries prevent SQL injection
- **XSS prevention:** React escapes rendered text by default; no `dangerouslySetInnerHTML`
- **HTTPS:** Required in production (handled at deployment/reverse proxy level)
- **No content logging:** Todo text never appears in server logs (NFR8)
- **Least-privilege API:** Only CRUD endpoints exposed, no admin routes, no bulk operations

### API & Communication Patterns

**API Style:** REST — JSON over HTTP. CRUD operations map directly to HTTP verbs.

**Endpoints:**

| Method | Path | Purpose | Request Body | Response | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/todos` | List all todos | — | `Todo[]` | 200, 500 |
| POST | `/api/todos` | Create a todo | `{ description }` | `Todo` | 201, 400, 422, 500 |
| PATCH | `/api/todos/{id}` | Toggle completion | `{ completed }` | `Todo` | 200, 404, 422, 500 |
| DELETE | `/api/todos/{id}` | Delete a todo | — | — | 204, 404, 500 |
| GET | `/api/health` | Health check | — | `{ status, db }` | 200, 503 |

**API Conventions:**
- All endpoints prefixed with `/api/` — clean separation from frontend static files
- PATCH for partial updates (not PUT) — we toggle one field, not replace the resource
- 204 No Content on delete — no response body needed
- FastAPI auto-generates OpenAPI docs at `/api/docs` (Swagger UI)

**Error Response Format:**
```json
{
  "detail": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE"
}
```

**Error Code Mapping:**

| HTTP Status | Code | Client Behavior |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Display inline error |
| 404 | `NOT_FOUND` | Remove item from UI (already deleted) |
| 422 | `UNPROCESSABLE` | Display validation detail |
| 500 | `INTERNAL_ERROR` | Display retry option |
| 503 | `SERVICE_UNAVAILABLE` | Display error state with retry |

### Frontend Architecture

**State Management:** React `useReducer` — no external library.

The complete app state:
```typescript
type Todo = {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  optimistic?: boolean;  // true while awaiting server confirmation
  error?: string;        // per-item error message
};

type AppState = {
  todos: Todo[];
  loading: boolean;
  error: string | null;  // global error (initial load failure)
};
```

A single reducer handles all state transitions: LOAD, CREATE (optimistic), CONFIRM_CREATE, ROLLBACK_CREATE, TOGGLE (optimistic), CONFIRM_TOGGLE, ROLLBACK_TOGGLE, DELETE (optimistic), CONFIRM_DELETE, ROLLBACK_DELETE, SET_ERROR, CLEAR_ERROR.

**API Client Layer:** Single `api.ts` module isolating all HTTP calls:
```typescript
const api = {
  getTodos(): Promise<Todo[]>,
  createTodo(description: string): Promise<Todo>,
  toggleTodo(id: string, completed: boolean): Promise<Todo>,
  deleteTodo(id: string): Promise<void>,
};
```

If the API contract changes, only this file changes.

**Custom Hooks:**
- `useTodos()` — manages todo state via `useReducer`, exposes action functions (create, toggle, delete), handles optimistic updates and rollback internally. This is the core architectural piece.
- `useAutoFocus(ref)` — manages input focus after operations

**Component Architecture:** 7 components (from UX spec) + 1 root App:
- `App` → layout shell, state provider, orchestrates hooks
- `TodoInput` → captures new todo text, Enter to submit
- `TodoItem` → single todo row (checkbox + text + timestamp + delete)
- `TodoCheckbox` → animated completion toggle
- `DeleteButton` → progressive disclosure delete trigger
- `ConfirmDialog` → modal delete confirmation with focus trap
- `InlineError` → scoped error display with auto-dismiss
- `AppStateDisplay` → loading skeleton, empty state, error state

**Routing:** None. Single screen, single URL. No router.

### Infrastructure & Deployment

**Docker Compose Services:**

| Service | Image | Port | Health Check | Notes |
|---|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 (internal only) | `pg_isready` | Persistent named volume for data |
| `backend` | Custom multi-stage | 8000 | `GET /api/health` | Depends on `db` healthy, non-root user |
| `frontend` | Custom multi-stage → nginx | 3000 | nginx status | Serves static build output, non-root user |

**Environment Configuration:**
- `.env` file at repo root (gitignored) for secrets (DB credentials)
- `.env.example` committed with placeholder values for documentation
- `docker-compose.yml` references env vars with dev defaults
- Backend reads config via `pydantic-settings` (type-safe, validates on startup)

**Development Workflow:**
- `docker compose up` — runs everything containerized (satisfies NFR25)
- Local alternative: run frontend (`npm run dev`) and backend (`uvicorn`) directly for faster iteration
- `docker compose --profile test up` — runs test suites in containers

**CI/CD:** Deferred to post-MVP.

**Monitoring & Logging:** Uvicorn access logs + Python `logging` module. No external monitoring for v1. Health check endpoint satisfies operational requirements.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (scaffolding, Docker Compose, DB container)
2. Backend: database model + migrations + CRUD endpoints + health check
3. Frontend: component shell + API client + state management hook
4. Frontend: all 7 components with optimistic UI
5. Integration: connect frontend to backend, Docker networking
6. Testing: unit/integration tests alongside code, E2E tests last
7. Polish: accessibility audit, performance check, documentation

**Cross-Component Dependencies:**
- Frontend `api.ts` depends on backend endpoint contracts (OpenAPI spec is the contract)
- Frontend `useTodos()` reducer actions mirror backend CRUD operations 1:1
- Docker Compose networking connects frontend container to backend container
- Alembic migrations must run before backend starts (entrypoint script)
- Pydantic response models define the TypeScript `Todo` type (manual sync — no codegen for v1)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 14 areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
- Tables: **plural, snake_case** → `todos` (not `todo`, not `Todo`)
- Columns: **snake_case** → `created_at`, `updated_at` (not `createdAt`)
- Primary keys: always `id` (not `todo_id`)
- Foreign keys (future): `{referenced_table_singular}_id` → `user_id`
- Indexes: `ix_{table}_{column}` → `ix_todos_created_at`
- Constraints: `uq_{table}_{column}` for unique, `ck_{table}_{name}` for check

**API Naming Conventions:**
- Endpoints: **plural nouns, lowercase** → `/api/todos`, `/api/todos/{id}`
- Path parameters: `{id}` (FastAPI style, not `:id`)
- Query parameters (future): **snake_case** → `?sort_by=created_at`
- JSON fields in requests/responses: **camelCase** → `{ "createdAt": "..." }` (JavaScript convention — Pydantic `alias_generator` handles the conversion from Python snake_case)
- HTTP headers: standard casing → `Content-Type`, `X-Request-Id`

**Code Naming — Frontend (TypeScript):**
- Components: **PascalCase** files and exports → `TodoItem.tsx` exports `TodoItem`
- Hooks: **camelCase** with `use` prefix → `useTodos.ts` exports `useTodos()`
- Services/utilities: **camelCase** → `api.ts`, `formatDate.ts`
- Types/interfaces: **PascalCase** → `type Todo = {...}`, `type AppState = {...}`
- Constants: **UPPER_SNAKE_CASE** → `const MAX_TODOS = 50`
- Event handlers: **handle{Action}** → `handleSubmit`, `handleToggle`, `handleDelete`
- Boolean variables: **is/has/should** prefix → `isLoading`, `hasError`

**Code Naming — Backend (Python):**
- Modules: **snake_case** → `todo_router.py`, `todo_model.py`, `todo_schema.py`
- Classes: **PascalCase** → `class Todo(Base)`, `class TodoCreate(BaseModel)`
- Functions: **snake_case** → `def get_todos()`, `async def create_todo()`
- Constants: **UPPER_SNAKE_CASE** → `MAX_TODOS = 50`
- Pydantic models: **{Entity}{Action}** → `TodoCreate`, `TodoResponse`, `TodoUpdate`

### Structure Patterns

**Project Organization:**
- Tests: **co-located** — test files live next to the code they test
  - `frontend/src/components/TodoItem.tsx` → `frontend/src/components/TodoItem.test.tsx`
  - `backend/app/routers/todos.py` → `backend/tests/routers/test_todos.py` (Python convention: separate `tests/` directory mirroring `app/` structure)
- E2E tests: `frontend/e2e/` directory (Playwright convention)
- Components: organized **by type** (not by feature — the app has one feature)

**File Structure:**

```
mattodos/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   ├── src/
│   │   ├── main.tsx              # Entry point
│   │   ├── App.tsx               # Root component
│   │   ├── App.test.tsx
│   │   ├── components/
│   │   │   ├── TodoInput.tsx
│   │   │   ├── TodoInput.test.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoItem.test.tsx
│   │   │   ├── TodoCheckbox.tsx
│   │   │   ├── DeleteButton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── InlineError.tsx
│   │   │   └── AppStateDisplay.tsx
│   │   ├── hooks/
│   │   │   ├── useTodos.ts
│   │   │   ├── useTodos.test.ts
│   │   │   └── useAutoFocus.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── api.test.ts
│   │   └── types/
│   │       └── todo.ts
│   └── e2e/
│       ├── todos.spec.ts
│       └── playwright.config.ts
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app factory
│   │   ├── config.py             # pydantic-settings config
│   │   ├── database.py           # Async engine, session factory
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── todo.py           # SQLAlchemy model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── todo.py           # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── todos.py          # CRUD endpoints
│   │   │   └── health.py         # Health check
│   │   └── services/
│   │       ├── __init__.py
│   │       └── todo_service.py   # Business logic layer
│   └── tests/
│       ├── conftest.py           # Fixtures, test DB setup
│       ├── routers/
│       │   ├── test_todos.py
│       │   └── test_health.py
│       └── services/
│           └── test_todo_service.py
└── docs/
```

### Format Patterns

**API Response Formats:**
- **No wrapper.** Responses return data directly — `Todo` or `Todo[]`, not `{ data: Todo[] }`.
- **Error responses** use the standard format: `{ "detail": "message", "code": "ERROR_CODE" }`.
- **Empty list** returns `[]` with 200 — not 404.
- **Created** returns the full entity with 201 (not just the ID).
- **Deleted** returns 204 with no body.

**Data Exchange Formats:**
- JSON field naming: **camelCase** in API responses (converted from Python snake_case by Pydantic)
- Dates: **ISO 8601 strings** → `"2026-03-04T14:30:00Z"` (not Unix timestamps)
- UUIDs: **string format** → `"550e8400-e29b-41d4-a716-446655440000"`
- Booleans: `true`/`false` (JSON native — never `1`/`0` or `"true"`)
- Null: explicit `null` for absent optional fields — never omit the key

### State Management Patterns

**Reducer Action Naming:** `{VERB}_{ENTITY}` and `{VERB}_{ENTITY}_{OUTCOME}`:
- `CREATE_TODO` → optimistic add
- `CREATE_TODO_SUCCESS` → confirm with server data
- `CREATE_TODO_FAILURE` → rollback + set item error
- `TOGGLE_TODO` / `TOGGLE_TODO_SUCCESS` / `TOGGLE_TODO_FAILURE`
- `DELETE_TODO` / `DELETE_TODO_SUCCESS` / `DELETE_TODO_FAILURE`
- `LOAD_TODOS` / `LOAD_TODOS_SUCCESS` / `LOAD_TODOS_FAILURE`
- `CLEAR_ERROR` → dismiss inline error

**Immutable Updates:** Always return new state objects — never mutate. Use spread operator or `Array.filter`/`Array.map`.

### Process Patterns

**Error Handling — Backend:**
- Use FastAPI `HTTPException` for expected errors (validation, not found)
- Use custom exception handlers for unexpected errors (DB connection, etc.)
- Log errors with Python `logging` — never log todo content
- Return structured error response for all error cases

**Error Handling — Frontend:**
- All API calls go through `api.ts` — errors are caught and thrown as typed errors there
- `useTodos()` hook catches errors and dispatches failure actions
- Per-item errors displayed via `InlineError` component (scoped, not global)
- Global error only for initial load failure (displayed via `AppStateDisplay`)
- Errors auto-dismiss after 5 seconds via `setTimeout` in the hook

**Loading States:**
- Single `loading` boolean in app state — only true during initial `GET /api/todos`
- Mutations are optimistic — no loading state for create/toggle/delete
- Loading UI: skeleton placeholders (3 rows) inside the card

**Optimistic Update Pattern (all mutations follow this):**
1. Dispatch optimistic action (update UI immediately)
2. Call API
3. On success: dispatch success action (replace optimistic data with server data)
4. On failure: dispatch failure action (revert UI, set error on affected item)
5. For create failures: restore text to input field

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the file structure exactly — no alternative locations for new files
- Use the naming conventions specified above — no mixing camelCase/snake_case within a layer
- Use the error response format for all API errors — no ad-hoc error shapes
- Implement the optimistic update pattern for all mutations — no "loading spinner" approach
- Co-locate frontend tests with source files; mirror backend `app/` structure in `tests/`
- Use `async`/`await` in both Python (FastAPI) and TypeScript — no callback patterns
- Type everything — no `any` in TypeScript, type hints on all Python function signatures

**Anti-Patterns (Never Do):**
- `any` type in TypeScript — always define proper types
- Direct database queries in router functions — always go through service layer
- Global error toasts — errors are always inline and scoped
- `console.log` for error handling — use proper error state management
- Mutating state directly — always return new objects from reducer
- Putting business logic in components — logic lives in hooks and services

## Project Structure & Boundaries

### Complete Project Directory Structure

```
mattodos/
├── docker-compose.yml              # Orchestrates all services
├── .env.example                    # Template for environment variables
├── .gitignore
├── README.md                       # Setup instructions, how to run
│
├── frontend/
│   ├── Dockerfile                  # Multi-stage: build → nginx
│   ├── nginx.conf                  # Production static file serving + API proxy
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts              # Vite + Tailwind + Vitest config
│   ├── index.html                  # SPA entry point
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── index.css               # Tailwind directives + custom keyframes
│   │   ├── main.tsx                # ReactDOM.createRoot, mounts <App />
│   │   ├── App.tsx                 # Root: layout shell, useTodos() hook, orchestrates children
│   │   ├── App.test.tsx            # Integration: renders app, tests CRUD flows
│   │   ├── components/
│   │   │   ├── TodoInput.tsx       # FR1, FR7, FR8, FR22 — text input, Enter to submit
│   │   │   ├── TodoInput.test.tsx
│   │   │   ├── TodoItem.tsx        # FR2, FR3, FR4, FR10 — single row: checkbox + text + delete
│   │   │   ├── TodoItem.test.tsx
│   │   │   ├── TodoCheckbox.tsx    # FR3, FR4, FR10 — animated toggle
│   │   │   ├── TodoCheckbox.test.tsx
│   │   │   ├── DeleteButton.tsx    # FR5 — progressive disclosure delete trigger
│   │   │   ├── DeleteButton.test.tsx
│   │   │   ├── ConfirmDialog.tsx   # FR16 — modal with focus trap
│   │   │   ├── ConfirmDialog.test.tsx
│   │   │   ├── InlineError.tsx     # FR12 — scoped error, auto-dismiss
│   │   │   ├── InlineError.test.tsx
│   │   │   ├── AppStateDisplay.tsx # FR13, FR14, FR15 — empty/loading/error states
│   │   │   └── AppStateDisplay.test.tsx
│   │   ├── hooks/
│   │   │   ├── useTodos.ts         # FR11, FR12, FR17-19 — state reducer + optimistic logic
│   │   │   ├── useTodos.test.ts
│   │   │   └── useAutoFocus.ts     # UX: maintain input focus across operations
│   │   ├── services/
│   │   │   ├── api.ts              # HTTP client — all fetch calls to /api/*
│   │   │   └── api.test.ts
│   │   └── types/
│   │       └── todo.ts             # Todo, AppState, Action type definitions
│   └── e2e/
│       ├── playwright.config.ts
│       ├── create-todo.spec.ts     # NFR22 — E2E: create flow
│       ├── complete-todo.spec.ts   # NFR22 — E2E: toggle flow
│       ├── delete-todo.spec.ts     # NFR22 — E2E: delete with confirm
│       ├── empty-state.spec.ts     # NFR22 — E2E: empty state
│       └── error-state.spec.ts     # NFR22 — E2E: API failure handling
│
├── backend/
│   ├── Dockerfile                  # Multi-stage: deps → runtime, non-root
│   ├── requirements.txt            # Pinned dependencies
│   ├── alembic.ini                 # Migration configuration
│   ├── alembic/
│   │   ├── env.py                  # Alembic environment (async engine)
│   │   └── versions/               # Migration files (auto-generated)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app factory, CORS, router includes
│   │   ├── config.py               # pydantic-settings: DB URL, CORS origins, etc.
│   │   ├── database.py             # Async engine, async session factory, Base
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── todo.py             # SQLAlchemy Todo model (FR6)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── todo.py             # Pydantic: TodoCreate, TodoUpdate, TodoResponse
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── todos.py            # CRUD endpoints (FR1-FR5, FR7-FR9, FR17-FR19)
│   │   │   └── health.py           # Health check (FR25)
│   │   └── services/
│   │       ├── __init__.py
│   │       └── todo_service.py     # Business logic: CRUD ops, limit check, validation
│   └── tests/
│       ├── conftest.py             # Test DB, async fixtures, test client
│       ├── routers/
│       │   ├── test_todos.py       # Integration: all CRUD endpoints
│       │   └── test_health.py      # Integration: health endpoint
│       └── services/
│           └── test_todo_service.py # Unit: business logic
│
└── docs/
    ├── Product Requirement Document (PRD) for the Todo App.md
    └── Technical Requirements.md
```

### Architectural Boundaries

**API Boundary (the contract between frontend and backend):**

```
Frontend (React)  ──HTTP/JSON──▶  Backend (FastAPI)  ──SQL──▶  PostgreSQL
     │                                   │
  api.ts                          routers/todos.py
  (single point of contact)       (single entry point)
```

- Frontend **never** accesses the database directly
- Backend **never** renders UI or returns HTML
- The API contract (endpoint paths, request/response shapes) is the **only** coupling between frontend and backend
- Both sides can be developed, tested, and deployed independently

**Backend Layer Boundaries:**

```
Router (routers/todos.py)     ← HTTP request/response handling only
    │
    ▼
Service (services/todo_service.py)  ← Business logic, validation, limit enforcement
    │
    ▼
Model (models/todo.py)        ← Data persistence, SQLAlchemy queries
    │
    ▼
Database (PostgreSQL)         ← Storage
```

Rules:
- Routers call services, **never** models directly
- Services call models/database, **never** return HTTP responses
- Models define schema and queries, **never** contain business rules
- Each layer depends only on the layer below it

**Frontend Layer Boundaries:**

```
Components (components/*.tsx)   ← Render UI, handle user events
    │
    ▼
Hooks (hooks/useTodos.ts)     ← State management, optimistic logic, action dispatch
    │
    ▼
Services (services/api.ts)    ← HTTP calls, error transformation
    │
    ▼
Backend API                   ← External boundary
```

Rules:
- Components call hooks for state and actions, **never** `api.ts` directly
- `useTodos()` calls `api.ts` for HTTP, **never** `fetch()` directly
- `api.ts` handles all HTTP details (base URL, headers, error parsing)
- Components receive data and callbacks from hooks — no business logic in components

### Requirements to Structure Mapping

| Requirement | Frontend File(s) | Backend File(s) |
|---|---|---|
| FR1: Create todo | `TodoInput.tsx`, `useTodos.ts` | `routers/todos.py`, `services/todo_service.py` |
| FR2: View all todos | `App.tsx`, `TodoItem.tsx` | `routers/todos.py`, `services/todo_service.py` |
| FR3–FR4: Toggle complete | `TodoCheckbox.tsx`, `useTodos.ts` | `routers/todos.py`, `services/todo_service.py` |
| FR5: Delete todo | `DeleteButton.tsx`, `ConfirmDialog.tsx`, `useTodos.ts` | `routers/todos.py`, `services/todo_service.py` |
| FR6: Todo data model | `types/todo.ts` | `models/todo.py`, `schemas/todo.py` |
| FR7: Empty input validation | `TodoInput.tsx` | — (client-side only) |
| FR8–FR9: 50-item limit | `TodoInput.tsx` (disabled state) | `services/todo_service.py` (server enforcement) |
| FR10: Visual distinction | `TodoItem.tsx`, `TodoCheckbox.tsx` | — |
| FR11–FR12: Optimistic UI | `useTodos.ts`, `InlineError.tsx` | — |
| FR13–FR15: App states | `AppStateDisplay.tsx` | — |
| FR16: Delete confirmation | `ConfirmDialog.tsx` | — |
| FR17–FR19: Data persistence | `services/api.ts` | `database.py`, `models/todo.py` |
| FR20–FR22: Responsive + keyboard | All components (Tailwind classes) | — |
| FR23–FR24: Accessibility | All components (ARIA attributes) | — |
| FR25: Health check | — | `routers/health.py` |

### Data Flow

**Create Todo (happy path):**
```
User types → TodoInput → handleSubmit()
  → useTodos().createTodo(text)
    → dispatch(CREATE_TODO)  [optimistic: add to list]
    → api.createTodo(text)   [POST /api/todos]
      → routers/todos.py → todo_service.create_todo()
        → models/todo.py INSERT → PostgreSQL
      ← TodoResponse (201)
    → dispatch(CREATE_TODO_SUCCESS)  [replace temp with server data]
```

**Create Todo (failure):**
```
    → api.createTodo(text)   [POST /api/todos]
      ← Error (400/500)
    → dispatch(CREATE_TODO_FAILURE)  [remove from list, restore input text]
```

**Toggle / Delete:** Same pattern — optimistic dispatch → API call → success/failure dispatch.

### Integration Points

**Docker Compose Networking:**
- `frontend` container → `backend` container via internal Docker network (service name `backend`, port 8000)
- `backend` container → `db` container via internal Docker network (service name `db`, port 5432)
- Only `frontend:3000` exposed to host in production
- In development: `frontend:3000` and `backend:8000` both exposed for direct API access

**Frontend → Backend Proxy:**
- **Development:** Vite dev server proxy (`vite.config.ts`): `/api/*` → `http://localhost:8000`
- **Production:** nginx reverse proxy (`nginx.conf`): `/api/*` → `http://backend:8000`

**Database Migrations:**
- Backend Dockerfile entrypoint runs `alembic upgrade head` before starting Uvicorn
- Ensures schema is current before accepting requests

### Development Workflow Integration

**Local Development (without Docker):**
```bash
# Terminal 1: Database (Docker only)
docker compose up db

# Terminal 2: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend
cd frontend && npm run dev
```

**Containerized (full stack):**
```bash
docker compose up          # production-like
docker compose up --build  # rebuild after changes
```

**Testing:**
```bash
# Frontend unit/component tests
cd frontend && npm test

# Frontend E2E
cd frontend && npx playwright test

# Backend tests
cd backend && python -m pytest

# All via Docker
docker compose --profile test up
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- React 19 + Vite 7 + Tailwind 4 + Vitest 4 — fully compatible, all current stable versions
- FastAPI 0.124 + SQLAlchemy 2.0 (async) + Pydantic v2 — FastAPI natively integrates Pydantic v2, SQLAlchemy async works with asyncpg
- PostgreSQL 16 + asyncpg — compatible
- Playwright 1.58 works with any frontend framework
- Docker Compose v2 supports all required features (profiles, health checks, named volumes)
- No version conflicts detected

**Pattern Consistency:**
- camelCase in JSON ↔ snake_case in Python: handled by Pydantic `alias_generator`
- PascalCase components + camelCase hooks/services — standard React convention
- snake_case in DB + snake_case in Python — natural alignment
- Reducer action naming (`VERB_ENTITY_OUTCOME`) is consistent across all mutations

**Structure Alignment:**
- Backend layers (router → service → model) match the file structure exactly
- Frontend layers (component → hook → service) match the file structure exactly
- Docker Compose service topology matches the directory structure (frontend/, backend/, db)

### Requirements Coverage Validation ✅

**Functional Requirements — all 25 covered:**
- FR1–FR6 (CRUD): API endpoints + frontend components + state management
- FR7 (empty validation): client-side in TodoInput
- FR8–FR9 (limit): server enforcement in todo_service + client disabled state
- FR10 (visual distinction): TodoItem + TodoCheckbox with UX spec styles
- FR11–FR12 (optimistic UI + rollback): useTodos reducer pattern
- FR13–FR15 (app states): AppStateDisplay component
- FR16 (delete confirmation): ConfirmDialog component
- FR17–FR19 (persistence): PostgreSQL + SQLAlchemy + Alembic
- FR20–FR22 (responsive + keyboard): Tailwind responsive + UX spec
- FR23–FR24 (accessibility): component-level ARIA + semantic HTML
- FR25 (health check): /api/health endpoint

**Non-Functional Requirements — all 30 covered:**
- NFR1–NFR5 (performance): Vite build optimization, optimistic UI <50ms, PostgreSQL p95 <200ms
- NFR6–NFR9 (security): CORS, Pydantic validation, no content logging, least-privilege API
- NFR10–NFR12 (reliability): PostgreSQL persistent volume, reducer rollback logic, graceful error states
- NFR13–NFR16 (accessibility): WCAG AA in component specs, focus management, contrast verified
- NFR17–NFR20 (maintainability): layered architecture, extensible model, independent deployment, testable structure
- NFR21–NFR24 (testing): Vitest, Playwright (5 E2E specs defined), co-located tests, 70% target achievable
- NFR25–NFR28 (Docker): multi-stage builds, non-root users, health checks, compose profiles
- NFR29–NFR30 (docs): README defined in structure, AI integration log space available

### Gap Analysis Results

**No critical gaps found.**

**Minor observations (non-blocking, handled during implementation):**
1. NFR30 (AI integration log) — add `docs/ai-integration-log.md` during first sprint
2. Pydantic camelCase alias configuration — establish `model_config` with `alias_generator = to_camel` in first schema
3. Vite proxy configuration — add `/api` proxy target in `vite.config.ts` during scaffolding

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (Docker, testing frameworks, Tailwind)
- [x] Cross-cutting concerns mapped (optimistic UI, error handling, accessibility, testing, extensibility)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (all 16 technologies versioned)
- [x] Technology stack fully specified (React/TS + FastAPI/Python + PostgreSQL)
- [x] Integration patterns defined (REST API, Docker networking, proxy)
- [x] Performance considerations addressed (optimistic UI, minimal bundle, p95 targets)

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, API, frontend, backend)
- [x] Structure patterns defined (co-located tests, layered architecture)
- [x] Communication patterns specified (reducer actions, API response format, error codes)
- [x] Process patterns documented (error handling, loading states, optimistic updates)

**✅ Project Structure**
- [x] Complete directory structure defined (every file listed)
- [x] Component boundaries established (frontend layers, backend layers)
- [x] Integration points mapped (Docker networking, Vite proxy, nginx proxy)
- [x] Requirements to structure mapping complete (FR → file table)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all requirements covered, no unresolved conflicts, complete file-level mapping.

**Key Strengths:**
- Every functional requirement maps to specific files — no ambiguity for AI agents
- Optimistic UI pattern is the most complex piece and it's thoroughly documented (reducer actions, data flow, failure handling)
- Layered boundaries are strict and simple — router → service → model, component → hook → service
- Technology choices are deliberately boring and well-matched to scope — no overengineering

**Areas for Future Enhancement (post-MVP):**
- Authentication middleware (architecture is prepared)
- API response codegen from OpenAPI (currently manual type sync)
- CI/CD pipeline
- External monitoring/APM
- Rate limiting

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
# 1. Scaffold frontend
npm create vite@latest frontend -- --template react-ts

# 2. Scaffold backend
mkdir -p backend/app/{models,schemas,routers,services}

# 3. Create docker-compose.yml with PostgreSQL
```