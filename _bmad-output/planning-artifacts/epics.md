---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: complete
completedAt: '2026-03-06'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# mattodos - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mattodos, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can create a new todo by entering a text description
- FR2: User can view all existing todos in a single list upon opening the app
- FR3: User can mark a todo as complete
- FR4: User can mark a completed todo as incomplete (toggle)
- FR5: User can delete a todo after confirming the action
- FR6: Each todo stores a text description, completion status, and creation timestamp
- FR7: System prevents creation of a todo with an empty or whitespace-only description
- FR8: System enforces a maximum of 50 total todos (active + completed)
- FR9: System displays a clear message when the todo limit is reached
- FR10: System visually distinguishes completed todos from active todos
- FR11: System provides immediate visual feedback when a todo is created, completed, or deleted (optimistic UI)
- FR12: System reverts the UI and displays an error if a background sync operation fails
- FR13: System displays an empty state when no todos exist
- FR14: System displays a loading state while initially fetching todos
- FR15: System displays an error state with a retry option when the API is unreachable
- FR16: System displays a confirmation prompt before deleting a todo
- FR17: System persists all todos via a backend API
- FR18: System loads the user's complete todo list from the backend on each app open
- FR19: All todo changes (create, complete, delete) are synchronized to the backend
- FR20: System provides a usable interface on desktop screen sizes
- FR21: System provides a usable interface on mobile screen sizes with touch-friendly targets
- FR22: System supports keyboard-driven todo creation (type and Enter to submit)
- FR23: System supports keyboard navigation for all interactive elements
- FR24: System provides screen reader-compatible markup for todos and their states
- FR25: Backend exposes a health check endpoint reporting service status

### NonFunctional Requirements

- NFR1: First contentful paint in < 2 seconds on a standard broadband connection
- NFR2: Optimistic UI updates render in < 50ms after user action
- NFR3: API response times (all CRUD endpoints) < 200ms at p95
- NFR4: Frontend bundle size remains minimal — no unnecessary dependencies
- NFR5: Page remains responsive (no jank) with 50 todos rendered
- NFR6: All client-server communication over HTTPS
- NFR7: API inputs validated and sanitized server-side to prevent injection attacks
- NFR8: Todo text treated as private — no logging of user content
- NFR9: API follows least-privilege principles — endpoints expose only necessary operations
- NFR10: Data persists durably — todos survive server restarts
- NFR11: Optimistic UI rollback correctly reverts state on sync failure 100% of the time
- NFR12: Application handles API unavailability gracefully without data corruption
- NFR13: WCAG 2.1 Level AA compliance for all interactive elements
- NFR14: All functionality reachable via keyboard alone
- NFR15: Color contrast ratios meet AA minimums (4.5:1 normal text, 3:1 large text)
- NFR16: Screen readers can identify todo items, their states, and all controls
- NFR17: Codebase follows consistent patterns — a new developer can understand the architecture without guidance
- NFR18: Adding a new todo field (e.g., due date) requires changes only in predictable locations — no shotgun surgery
- NFR19: Frontend and backend are independently deployable
- NFR20: Code structured to support automated testing at unit and integration levels
- NFR21: Unit and integration tests use Jest or Vitest; test commands configured in package.json
- NFR22: E2E tests use Playwright — minimum 5 passing tests covering create, complete, delete, empty state, and error handling
- NFR23: Backend integration tests written alongside each API endpoint; frontend component tests written alongside each component
- NFR24: Minimum 70% meaningful code coverage across the project
- NFR25: Application runs successfully via docker-compose up
- NFR26: Dockerfiles use multi-stage builds, non-root users, and health check instructions
- NFR27: Docker Compose orchestrates all containers with proper networking, volumes, and environment configuration
- NFR28: Dev and test environments supported via environment variables and compose profiles
- NFR29: README with setup instructions and how to run the application
- NFR30: AI integration log documenting agent usage, limitations, and learnings throughout development

### Additional Requirements

**From Architecture:**

- Starter template: Vite + React + TypeScript (`npm create vite@latest frontend -- --template react-ts`) for frontend; manual FastAPI setup for backend; Docker Compose for infrastructure — this impacts Epic 1 Story 1
- Database: PostgreSQL 16 (containerized), single `todos` table with UUID primary keys (`gen_random_uuid()`), columns: `id`, `description` (TEXT), `completed` (BOOLEAN), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
- ORM: SQLAlchemy 2.0 (async) with Alembic migrations; migrations must run before backend starts (entrypoint script)
- API: REST with `/api/` prefix; PATCH for partial updates; 204 No Content on delete; camelCase JSON responses via Pydantic `alias_generator`
- API error response format: `{ "detail": "message", "code": "MACHINE_READABLE_CODE" }` with defined error codes (VALIDATION_ERROR, NOT_FOUND, UNPROCESSABLE, INTERNAL_ERROR, SERVICE_UNAVAILABLE)
- Frontend state: `useReducer` with defined action types (CREATE_TODO, CREATE_TODO_SUCCESS, CREATE_TODO_FAILURE, etc.); no external state library
- Frontend API client: single `api.ts` module isolating all HTTP calls
- Custom hooks: `useTodos()` (state + optimistic logic), `useAutoFocus()` (input focus management)
- Backend layers: router → service → model (routers never access models directly)
- Frontend layers: component → hook → service (components never call api.ts directly)
- Development proxy: Vite dev server proxy for `/api/*` → `http://localhost:8000`; nginx reverse proxy in production
- CORS: configured to allow only the frontend origin
- Pydantic-settings for backend configuration (type-safe, validates on startup)
- Co-located frontend tests; mirrored `tests/` directory for backend
- E2E test files defined: `create-todo.spec.ts`, `complete-todo.spec.ts`, `delete-todo.spec.ts`, `empty-state.spec.ts`, `error-state.spec.ts`
- `.env.example` committed with placeholder values; `.env` gitignored
- AI integration log: `docs/ai-integration-log.md` to be created during first sprint

**From UX Design:**

- Design direction: "Warm & Personal" (Direction 4) — generous border-radius (`rounded-2xl`/20px), animated checkbox, conversational microcopy
- Color system: Stone/warm gray palette — `bg-stone-50` page background, `bg-white` card surface, `text-stone-900` primary text, `text-stone-500` secondary, `text-green-600` success/checkmark, `text-red-600` error
- Typography: system font stack, flat type scale (24px title, 16px body, 14px helper, 12px small)
- Layout: single centered column, max-width 560px, 4px spacing grid
- Card container: `rounded-2xl`, warm shadow `0 2px 12px rgba(28,25,23,0.06)`, `overflow-hidden`
- Input placeholder: "What's on your mind?" (conversational tone)
- Subtitle: "Your tasks, your pace." beneath the h1 title
- Footer: split layout — "X remaining" left, "Y total" right
- TodoCheckbox: 24px circle, green fill with scale pop animation (0→1.2→1, 300ms, cubic-bezier easing)
- Completed todos: `line-through` + `opacity-40`
- Delete button: progressive disclosure — hidden by default, visible on hover; always visible on touch devices via `@media (hover: hover)`
- ConfirmDialog: action sheet pattern on mobile (full-width bottom), centered modal on desktop
- Loading skeleton: 3 placeholder rows with pulse animation inside card
- Empty state: "No todos yet" centered in card
- Inline errors: `bg-red-50 text-red-600`, auto-dismiss after 5s
- Animations: all honor `prefers-reduced-motion: reduce`; micro-interactions 150ms, state changes 200ms, feedback 300ms
- Touch targets: minimum 44×44px on mobile
- Responsive: mobile-first, single breakpoint at 768px (`md:` in Tailwind)
- Focus management: auto-focus input on load, re-focus after create, focus next todo after delete, focus trap in dialog
- Screen reader: `aria-live="polite"` regions for todo added/deleted announcements, `role="alert"` for errors, `aria-busy="true"` during loading
- Keyboard: Tab navigation through all interactive elements, Enter to submit/activate, Space for checkbox toggle, Escape to close dialog

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create a todo by entering text |
| FR2 | Epic 1 | View all existing todos in a list |
| FR3 | Epic 2 | Mark a todo as complete |
| FR4 | Epic 2 | Toggle completed todo back to incomplete |
| FR5 | Epic 2 | Delete a todo after confirmation |
| FR6 | Epic 1 | Todo stores description, completion, timestamp |
| FR7 | Epic 1 | Prevent empty/whitespace creation |
| FR8 | Epic 2 | Enforce max 50 todos |
| FR9 | Epic 2 | Display limit-reached message |
| FR10 | Epic 2 | Visually distinguish completed from active |
| FR11 | Epic 2 | Optimistic UI for create, complete, delete |
| FR12 | Epic 2 | Revert UI on sync failure |
| FR13 | Epic 1 | Empty state when no todos |
| FR14 | Epic 1 | Loading state while fetching |
| FR15 | Epic 1 | Error state with retry |
| FR16 | Epic 2 | Confirmation prompt before delete |
| FR17 | Epic 1 | Persist via backend API |
| FR18 | Epic 1 | Load todo list on app open |
| FR19 | Epic 2 | All changes synced to backend |
| FR20 | Epic 3 | Desktop interface |
| FR21 | Epic 3 | Mobile interface with touch targets |
| FR22 | Epic 1 | Keyboard creation (type + Enter) |
| FR23 | Epic 3 | Keyboard navigation for all elements |
| FR24 | Epic 3 | Screen reader-compatible markup |
| FR25 | Epic 3 | Health check endpoint |

## Epic List

### Epic 1: Create and View Todos
A user can open the app, see their todo list (or a welcoming empty state), create new todos by typing and pressing Enter, and find their list persisted across sessions. If the API is unreachable, a clear error with retry is shown.
**FRs covered:** FR1, FR2, FR6, FR7, FR13, FR14, FR15, FR17, FR18, FR22

### Epic 2: Complete, Delete, and Manage Todos
A user can toggle todos between complete and incomplete with satisfying visual feedback, delete todos with a safety confirmation prompt, and manage their list within the 50-item limit. All mutations use optimistic UI with graceful error recovery when sync fails.
**FRs covered:** FR3, FR4, FR5, FR8, FR9, FR10, FR11, FR12, FR16, FR19

### Epic 3: Accessibility, Responsive Design, and Production Readiness
The app is fully accessible to keyboard and screen reader users (WCAG 2.1 AA), works seamlessly across desktop and mobile, and is production-ready with health monitoring, E2E test coverage, Docker multi-stage deployment, and documentation.
**FRs covered:** FR20, FR21, FR23, FR24, FR25

---

## Epic 1: Create and View Todos

A user can open the app, see their todo list (or a welcoming empty state), create new todos by typing and pressing Enter, and find their list persisted across sessions. If the API is unreachable, a clear error with retry is shown.

### Story 1.1: Project Scaffolding and Infrastructure

As a developer,
I want the full-stack project structure initialized with Docker Compose orchestration,
So that I have a working development environment with frontend, backend, and database containers ready for feature development.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run `docker compose up`
**Then** three services start: PostgreSQL 16 (db), FastAPI backend (backend on port 8000), and Vite React frontend (frontend on port 3000)
**And** the frontend serves the default Vite React page at `http://localhost:3000`
**And** the backend returns `{"status": "ok"}` at `http://localhost:8000/api/health`
**And** PostgreSQL is running with a persistent named volume for data

**Given** the project repository
**When** I inspect the file structure
**Then** it matches the architecture document's directory layout (frontend/, backend/, docker-compose.yml, .env.example)
**And** `.env.example` contains placeholder values for all required environment variables
**And** `.gitignore` excludes `.env`, `node_modules`, `__pycache__`, `venv`, and build artifacts

**Given** the frontend project
**When** I inspect the configuration
**Then** Vite is configured with React, TypeScript (strict mode), Tailwind CSS, and Vitest
**And** the Vite dev server proxies `/api/*` requests to `http://localhost:8000`
**And** ESLint is configured with the TypeScript plugin

**Given** the backend project
**When** I inspect the configuration
**Then** FastAPI is configured with CORS (allowing the frontend origin), pydantic-settings for config
**And** SQLAlchemy 2.0 async engine is configured with asyncpg driver
**And** Alembic is initialized and configured for async migrations
**And** the app structure follows: `app/main.py`, `app/config.py`, `app/database.py`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`

### Story 1.2: Todo Data Model and API Endpoints

As a user,
I want to create todos and retrieve my full list via a backend API,
So that my todos are stored durably and survive page refreshes and server restarts.

**Acceptance Criteria:**

**Given** the database is running
**When** the backend starts
**Then** Alembic migrations run automatically (entrypoint script) creating the `todos` table with columns: `id` (UUID, PK, default `gen_random_uuid()`), `description` (TEXT, NOT NULL), `completed` (BOOLEAN, NOT NULL, default false), `created_at` (TIMESTAMPTZ, NOT NULL, default now()), `updated_at` (TIMESTAMPTZ, NOT NULL, default now())

**Given** no todos exist
**When** I send `GET /api/todos`
**Then** I receive a `200` response with an empty JSON array `[]`

**Given** I send `POST /api/todos` with body `{ "description": "Buy milk" }`
**When** the request is processed
**Then** I receive a `201` response with the full todo object: `{ "id": "<uuid>", "description": "Buy milk", "completed": false, "createdAt": "<iso8601>", "updatedAt": "<iso8601>" }`
**And** the response uses camelCase field names (Pydantic alias_generator)
**And** the todo is persisted in the database

**Given** a todo with description "Buy milk" exists
**When** I send `GET /api/todos`
**Then** I receive a `200` response containing the todo in the array

**Given** I send `POST /api/todos` with an empty body or `{ "description": "" }` or `{ "description": "   " }`
**When** the request is processed
**Then** I receive a `400` response with `{ "detail": "Description cannot be empty", "code": "VALIDATION_ERROR" }`

**Given** 50 todos exist in the database
**When** I send `POST /api/todos` with `{ "description": "One more" }`
**Then** I receive a `400` response with `{ "detail": "Todo limit reached. Delete or complete some items to add more.", "code": "VALIDATION_ERROR" }`

**Given** the backend service layer
**When** I inspect the code structure
**Then** CRUD operations flow through `routers/todos.py` → `services/todo_service.py` → `models/todo.py` (never router → model directly)
**And** todo description text is never logged (NFR8)
**And** backend integration tests exist in `tests/routers/test_todos.py` and `tests/services/test_todo_service.py` covering all endpoints and the limit check

### Story 1.3: Frontend Shell and Design System

As a user,
I want to see the mattodos interface with the "Warm & Personal" design when I open the app,
So that the app feels intentional, polished, and ready to use.

**Acceptance Criteria:**

**Given** the app loads at `http://localhost:3000`
**When** I view the page
**Then** I see the page title "mattodos" (`text-2xl font-semibold`) and subtitle "Your tasks, your pace." (`text-sm text-stone-500`)
**And** the page has a warm stone background (`bg-stone-50`) with a centered white card (`bg-white`, `rounded-2xl`, warm shadow, `max-w-[560px]`)
**And** the card contains an input area at the top and a list area below

**Given** the type definitions
**When** I inspect `src/types/todo.ts`
**Then** the `Todo` type includes `id`, `description`, `completed`, `createdAt`, `updatedAt`, `optimistic?`, and `error?` fields
**And** the `AppState` type includes `todos: Todo[]`, `loading: boolean`, and `error: string | null`

**Given** the API client
**When** I inspect `src/services/api.ts`
**Then** it exports functions: `getTodos()`, `createTodo(description)`, `toggleTodo(id, completed)`, `deleteTodo(id)`
**And** all HTTP calls go through this single module
**And** errors are caught and thrown as typed errors

**Given** the `useTodos` hook in `src/hooks/useTodos.ts`
**When** I inspect its implementation
**Then** it uses `useReducer` with action types: `LOAD_TODOS`, `LOAD_TODOS_SUCCESS`, `LOAD_TODOS_FAILURE`, `CREATE_TODO`, `CREATE_TODO_SUCCESS`, `CREATE_TODO_FAILURE`, and `CLEAR_ERROR`
**And** it exposes `state` (AppState) and action functions (`createTodo`, `loadTodos`)

**Given** the App component
**When** it mounts
**Then** it calls `loadTodos()` from the `useTodos` hook

### Story 1.4: Todo Creation with Optimistic UI

As a user,
I want to type a todo and press Enter to add it instantly to my list,
So that creating todos feels as fast as writing on a notepad.

**Acceptance Criteria:**

**Given** the app is loaded with the todo list visible
**When** I focus on the input field
**Then** the input has placeholder text "What's on your mind?" and shows a focus ring (`border-slate-600`, `ring-4 ring-slate-600/8`)
**And** the input field is auto-focused on page load

**Given** I have typed "Review PR" in the input field
**When** I press Enter
**Then** the input clears immediately and retains focus
**And** a new todo "Review PR" appears in the list instantly (optimistic UI, before server response)
**And** the todo has a subtle entrance animation (fade-in + slight slide, ~200ms)
**And** a `POST /api/todos` request is sent in the background

**Given** the background POST request succeeds
**When** the server responds with the created todo
**Then** the optimistic todo is updated with the server-assigned UUID and timestamps (no visible change to the user)

**Given** the background POST request fails
**When** the server returns an error
**Then** the optimistic todo is removed from the list (reverse animation)
**And** an inline error message appears: "Couldn't save that — try again"
**And** the original text ("Review PR") is restored to the input field so I can retry with Enter

**Given** the input field is focused
**When** I press Enter with an empty or whitespace-only input
**Then** nothing happens — no error, no submission, the input stays focused

**Given** the app has todos
**When** I view the todo list
**Then** each todo displays its description text and a creation timestamp

**Given** the TodoInput component
**When** I run its tests (`TodoInput.test.tsx`)
**Then** tests pass for: submitting on Enter, clearing input, ignoring empty input, and displaying placeholder

### Story 1.5: App States — Loading, Empty, and Error

As a user,
I want to see clear, helpful feedback when the app is loading, when my list is empty, or when something goes wrong,
So that I always know what's happening and what I can do about it.

**Acceptance Criteria:**

**Given** the app is loading todos from the API
**When** the GET request is in progress
**Then** the card displays a loading skeleton: 3 placeholder rows with a pulse animation
**And** `aria-busy="true"` is set on the list container

**Given** the GET request returns an empty array
**When** the loading completes
**Then** the card displays the empty state: "No todos yet" centered in `text-stone-400`
**And** the input field remains focused and ready for the first todo

**Given** the GET request returns todos
**When** the loading completes
**Then** the skeleton is replaced with the actual todo list
**And** `aria-busy` is removed from the list container

**Given** the API is unreachable (network error or 5xx)
**When** the initial GET request fails
**Then** the card displays: "Unable to load your todos" with a Retry button
**And** the error state has `role="alert"` for screen reader announcement

**Given** the error state is displayed
**When** I click the Retry button
**Then** the loading skeleton reappears and a new GET request is made
**And** if the retry succeeds, the todo list loads normally

**Given** the AppStateDisplay component
**When** I run its tests (`AppStateDisplay.test.tsx`)
**Then** tests pass for: loading skeleton display, empty state message, error state with retry button, and successful retry transition

---

## Epic 2: Complete, Delete, and Manage Todos

A user can toggle todos between complete and incomplete with satisfying visual feedback, delete todos with a safety confirmation prompt, and manage their list within the 50-item limit. All mutations use optimistic UI with graceful error recovery when sync fails.

### Story 2.1: Toggle Todo Completion with Optimistic UI

As a user,
I want to click a checkbox to mark a todo as complete or incomplete with satisfying visual feedback,
So that I can track my progress and the interaction feels rewarding.

**Acceptance Criteria:**

**Given** an active (incomplete) todo exists in the list
**When** I click its checkbox
**Then** the checkbox fills green with a scale pop animation (0→1.2→1, 300ms, cubic-bezier easing) instantly (optimistic UI)
**And** the todo text gets `line-through` and `opacity-40`
**And** a `PATCH /api/todos/{id}` request is sent with `{ "completed": true }`

**Given** a completed todo exists in the list
**When** I click its checkbox
**Then** the checkbox reverts to empty instantly (optimistic UI)
**And** the todo text returns to normal styling (no strikethrough, full opacity)
**And** a `PATCH /api/todos/{id}` request is sent with `{ "completed": false }`

**Given** the background PATCH request succeeds
**When** the server responds
**Then** the optimistic state is confirmed (no visible change to the user)

**Given** the background PATCH request fails
**When** the server returns an error
**Then** the checkbox and text style revert to their previous state
**And** an inline error appears on that specific todo row (`bg-red-50 text-red-600 text-sm`)
**And** the error auto-dismisses after 5 seconds

**Given** the `useTodos` hook
**When** I inspect the toggle implementation
**Then** it dispatches `TOGGLE_TODO` (optimistic), then `TOGGLE_TODO_SUCCESS` or `TOGGLE_TODO_FAILURE` based on API response

**Given** the PATCH endpoint in the backend
**When** I send `PATCH /api/todos/{id}` with `{ "completed": true }` for a valid todo
**Then** I receive a `200` response with the updated todo (camelCase JSON)
**And** the `updated_at` timestamp is refreshed

**Given** I send `PATCH /api/todos/{non-existent-id}`
**When** the request is processed
**Then** I receive a `404` response with `{ "detail": "Todo not found", "code": "NOT_FOUND" }`

**Given** the TodoCheckbox component
**When** I run its tests
**Then** tests pass for: rendering unchecked state, rendering checked state with green fill, toggling on click, focus ring on keyboard focus, and `prefers-reduced-motion` disabling the pop animation

**And** backend integration tests in `test_todos.py` cover the PATCH endpoint for toggle success and not-found cases

### Story 2.2: Delete Todo with Confirmation Dialog

As a user,
I want to delete a todo with a confirmation step that prevents accidental removal,
So that I feel protected from mistakes without being nagged.

**Acceptance Criteria:**

**Given** a todo exists in the list
**When** I hover over the todo row (on hover-capable devices)
**Then** the delete button fades in (opacity transition, ~150ms) on the right side of the row
**And** the delete button is a 28px circular hit area with `×` icon

**Given** a touch device (no hover capability)
**When** I view a todo row
**Then** the delete button is always visible (no progressive disclosure)

**Given** the delete button is visible
**When** I click it
**Then** a confirmation dialog appears: "Delete '[todo text]'?"
**And** the dialog has two buttons: "Cancel" (ghost style) and "Delete" (destructive red `bg-red-600 text-white`)
**And** focus is trapped inside the dialog with initial focus on the Cancel button (safe default)

**Given** the confirmation dialog is open
**When** I click "Cancel" or press Escape
**Then** the dialog closes with no action
**And** focus returns to the delete button that triggered the dialog

**Given** the confirmation dialog is open
**When** I click "Delete"
**Then** the dialog closes
**And** the todo is removed from the list instantly (optimistic UI, fade-out ~200ms)
**And** a `DELETE /api/todos/{id}` request is sent in the background

**Given** the background DELETE request succeeds
**When** the server responds with `204`
**Then** the removal is confirmed (no visible change)

**Given** the background DELETE request fails
**When** the server returns an error
**Then** the todo reappears in the list at its original position
**And** an inline error appears on that row, auto-dismissing after 5 seconds

**Given** the `useTodos` hook
**When** I inspect the delete implementation
**Then** it dispatches `DELETE_TODO` (optimistic), then `DELETE_TODO_SUCCESS` or `DELETE_TODO_FAILURE` based on API response

**Given** the DELETE endpoint in the backend
**When** I send `DELETE /api/todos/{id}` for a valid todo
**Then** I receive a `204` response with no body
**And** the todo is permanently removed from the database

**Given** I send `DELETE /api/todos/{non-existent-id}`
**When** the request is processed
**Then** I receive a `404` response with `{ "detail": "Todo not found", "code": "NOT_FOUND" }`

**Given** the ConfirmDialog on mobile (< 768px)
**When** it opens
**Then** it renders as an action sheet anchored to the bottom of the screen (full-width)

**Given** the ConfirmDialog on desktop (≥ 768px)
**When** it opens
**Then** it renders as a centered modal with overlay (`bg-black/20`)

**Given** the DeleteButton and ConfirmDialog components
**When** I run their tests
**Then** tests pass for: visibility on hover, always visible when focused via keyboard, dialog opening, cancel closing, confirm triggering delete, escape closing, focus trap, and focus restoration

**And** backend integration tests in `test_todos.py` cover DELETE endpoint for success and not-found cases

### Story 2.3: Inline Error Display and Auto-Dismiss

As a user,
I want to see clear, scoped error messages when something goes wrong with a specific action,
So that I understand what failed without being blocked from using the rest of the app.

**Acceptance Criteria:**

**Given** a mutation (create, toggle, or delete) fails due to an API error
**When** the failure is processed
**Then** an InlineError component appears near the affected area (below the todo row, or near the input for create failures)
**And** the error has `bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2` styling
**And** the error has `role="alert"` and `aria-live="polite"` for screen reader announcement

**Given** an inline error is displayed
**When** 5 seconds have elapsed
**Then** the error auto-dismisses with a fade-out animation (~200ms)
**And** the `CLEAR_ERROR` action is dispatched for that specific item

**Given** an inline error is displayed on one todo row
**When** I interact with a different todo (toggle or delete)
**Then** the error on the first row remains visible — errors are scoped per-item and independent

**Given** a create failure has occurred
**When** the inline error displays near the input
**Then** the error message is "Couldn't save that — try again"
**And** the original text is restored to the input field

**Given** the InlineError component
**When** I run its tests (`InlineError.test.tsx`)
**Then** tests pass for: rendering error message, auto-dismiss after 5 seconds, fade-out animation, `role="alert"` attribute, and independent error scoping

### Story 2.4: Todo Limit Enforcement

As a user,
I want to be clearly informed when I've reached the 50-todo limit,
So that I know why I can't add more and what to do about it.

**Acceptance Criteria:**

**Given** 49 or fewer todos exist
**When** I view the todo input
**Then** the input is enabled with placeholder "What's on your mind?"

**Given** exactly 50 todos exist (active + completed combined)
**When** I view the todo input
**Then** the input is disabled (`opacity-50`, `cursor-not-allowed`)
**And** the placeholder changes to "Todo limit reached"
**And** an informational message appears below the input: "Todo limit reached. Complete or delete some to add more." in `text-sm text-stone-500`

**Given** exactly 50 todos exist
**When** I delete a todo (bringing the count to 49)
**Then** the input re-enables immediately
**And** the limit message disappears
**And** the placeholder returns to "What's on your mind?"

**Given** the footer area of the card
**When** todos exist in the list
**Then** a footer displays with split layout: "X remaining" on the left and "Y total" on the right
**And** the footer updates in real-time as todos are created, completed, or deleted
**And** the footer has `aria-live="polite"` for screen reader updates

**Given** the limit enforcement
**When** I inspect the implementation
**Then** the 50-item limit is enforced on BOTH the server (Story 1.2) and the client (disabled input + message)
**And** the client limit check uses the local todo count from the reducer state

---

## Epic 3: Accessibility, Responsive Design, and Production Readiness

The app is fully accessible to keyboard and screen reader users (WCAG 2.1 AA), works seamlessly across desktop and mobile, and is production-ready with health monitoring, E2E test coverage, Docker multi-stage deployment, and documentation.

### Story 3.1: Responsive Layout — Mobile and Desktop

As a user,
I want the app to work equally well on my phone and my laptop,
So that I can manage my todos from any device without compromise.

**Acceptance Criteria:**

**Given** I open the app on a desktop browser (≥ 768px)
**When** I view the layout
**Then** the card is constrained to `max-w-[560px]` and centered with `mx-auto`
**And** the delete button uses progressive disclosure (hidden by default, visible on row hover via `@media (hover: hover)`)
**And** the ConfirmDialog renders as a centered modal with overlay (`bg-black/20`)
**And** hover states are active on all interactive elements

**Given** I open the app on a mobile browser (< 768px)
**When** I view the layout
**Then** the card fills the viewport width minus `px-4` (16px) horizontal padding
**And** all interactive elements have a minimum touch target of 44×44px
**And** the delete button is always visible (no hover required)
**And** the ConfirmDialog renders as an action sheet anchored to the bottom of the screen (full-width)
**And** the input field has 16px font-size (prevents iOS zoom on focus)

**Given** any screen size
**When** I inspect the layout
**Then** the column layout is always single-column (no multi-column on desktop)
**And** the typography scale does not change across breakpoints
**And** the page scrolls naturally — no horizontal scrolling, no internal card scroll
**And** the same components render on all devices with responsive Tailwind classes (`md:` prefix for desktop enhancements)

**Given** the responsive implementation
**When** I inspect the CSS approach
**Then** all responsive behavior uses Tailwind's mobile-first approach with the single `md:` (768px) breakpoint
**And** hover-dependent UI uses `@media (hover: hover)` instead of width-based detection

### Story 3.2: Full Keyboard and Screen Reader Accessibility

As a user who relies on keyboard or screen reader,
I want every feature of the app to be fully accessible,
So that I can manage my todos with the same efficiency as any other user.

**Acceptance Criteria:**

**Given** the app loads
**When** I use only the keyboard (no mouse)
**Then** I can Tab through all interactive elements in logical order: Input → first todo's checkbox → first todo's delete → second todo's checkbox → second todo's delete → ... → footer
**And** every focused element has a visible focus ring (`ring-2 ring-slate-600 ring-offset-2`)
**And** focus rings only appear on keyboard navigation (using `focus-visible:`)

**Given** the input field
**When** the page loads
**Then** it receives auto-focus
**And** after creating a todo, focus returns to the input
**And** after deleting a todo, focus moves to the next todo in the list (or the input if the list is empty)

**Given** a todo checkbox
**When** I press Space or Enter while it's focused
**Then** the completion status toggles (same as clicking)

**Given** a delete button
**When** it's focused via Tab
**Then** it becomes visible even without hover
**And** I can activate it with Enter or Space

**Given** the ConfirmDialog is open
**When** I use the keyboard
**Then** focus is trapped inside the dialog (Tab cycles between Cancel and Delete buttons only)
**And** Escape closes the dialog
**And** on close, focus returns to the element that triggered it

**Given** a screen reader is active (e.g., VoiceOver)
**When** the app loads todos
**Then** the list uses semantic HTML: `<main>`, `<h1>`, `<form>`, `<ul role="list">`, `<li>`, `<input type="checkbox">`, `<button>`, `<time>`
**And** each checkbox has `aria-label="Mark '[todo text]' as complete"` (or "incomplete" for completed todos)
**And** each delete button has `aria-label="Delete '[todo text]'"`

**Given** a screen reader is active
**When** I create a todo
**Then** an `aria-live="polite"` region announces "Todo added: [text]"
**When** I delete a todo
**Then** an `aria-live="polite"` region announces "Todo deleted: [text]"
**When** a mutation error occurs
**Then** `role="alert"` ensures immediate announcement without interrupting

**Given** the color palette
**When** I check contrast ratios
**Then** Stone-900 on Stone-50 ≥ 15:1 (AAA), Stone-500 on white ≥ 4.5:1 (AA), Green-600 on white ≥ 4.5:1 (AA), Red-600 on Red-50 ≥ 5.5:1 (AA), White on Slate-600 ≥ 5.5:1 (AA)
**And** color is never the sole indicator of state — completed todos use strikethrough + opacity, not just color change

**Given** the user has `prefers-reduced-motion: reduce` enabled
**When** animations would normally play (checkbox pop, entrance/exit, fade)
**Then** all animations are disabled — state changes happen instantly with no motion
**And** this is implemented via Tailwind's `motion-safe:` utility or `@media (prefers-reduced-motion: no-preference)`

### Story 3.3: E2E Tests and Test Coverage

As a developer,
I want comprehensive E2E tests covering all user journeys and sufficient unit/integration test coverage,
So that I can confidently ship changes and catch regressions.

**Acceptance Criteria:**

**Given** the E2E test suite in `frontend/e2e/`
**When** I run `npx playwright test`
**Then** at least 5 Playwright test files pass:

1. `create-todo.spec.ts` — tests: type and Enter creates a todo, todo appears in list, input clears and re-focuses, empty input does nothing
2. `complete-todo.spec.ts` — tests: clicking checkbox marks todo complete (visual change), clicking again toggles back to active
3. `delete-todo.spec.ts` — tests: clicking delete opens dialog, cancel closes without deletion, confirm removes the todo
4. `empty-state.spec.ts` — tests: empty state message appears when no todos, disappears when first todo created
5. `error-state.spec.ts` — tests: error state with retry when API unreachable, successful retry loads todos

**Given** the frontend test suite
**When** I run `npm test` in the frontend directory
**Then** component tests pass for: TodoInput, TodoItem, TodoCheckbox, DeleteButton, ConfirmDialog, InlineError, AppStateDisplay
**And** hook tests pass for: useTodos (all reducer actions, optimistic patterns, rollback)
**And** service tests pass for: api.ts (all endpoints, error handling)

**Given** the backend test suite
**When** I run `python -m pytest` in the backend directory
**Then** router tests pass for: all CRUD endpoints (success + error cases), health check
**And** service tests pass for: todo_service (create, list, toggle, delete, limit check)
**And** test configuration uses an isolated test database (not the development database)

**Given** the overall test coverage
**When** I check coverage reports
**Then** the project achieves ≥ 70% meaningful code coverage across frontend and backend
**And** tests are co-located: frontend tests next to source files, backend tests in mirrored `tests/` directory

### Story 3.4: Production Docker Build, Health Check, and Documentation

As a developer,
I want the app to be production-ready with optimized Docker images, health monitoring, and clear documentation,
So that the project is deployable, maintainable, and serves as a portfolio piece.

**Acceptance Criteria:**

**Given** the backend health check endpoint
**When** I send `GET /api/health`
**Then** I receive `200` with `{ "status": "healthy", "db": "connected" }` when PostgreSQL is reachable
**And** I receive `503` with `{ "status": "unhealthy", "db": "disconnected" }` when PostgreSQL is unreachable
**And** the backend has an integration test for the health endpoint

**Given** the frontend Dockerfile
**When** I build the image
**Then** it uses a multi-stage build: Node stage for `npm run build` → nginx stage for serving static files
**And** the final image runs as a non-root user
**And** nginx is configured to serve the SPA (all routes → `index.html`) and proxy `/api/*` to the backend

**Given** the backend Dockerfile
**When** I build the image
**Then** it uses a multi-stage build: deps stage → runtime stage
**And** the final image runs as a non-root user
**And** the entrypoint runs Alembic migrations before starting Uvicorn
**And** a Docker HEALTHCHECK instruction pings `/api/health`

**Given** the `docker-compose.yml`
**When** I run `docker compose up`
**Then** all three services start in the correct order: db → backend (depends on db healthy) → frontend
**And** PostgreSQL uses a persistent named volume
**And** internal Docker networking connects frontend → backend → db
**And** only frontend (port 3000) and backend (port 8000) are exposed to the host

**Given** the Docker Compose profiles
**When** I run `docker compose --profile test up`
**Then** test runners execute in containers

**Given** the `.env.example` file
**When** I inspect it
**Then** it contains placeholder values for: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `CORS_ORIGINS`

**Given** the README.md at the repository root
**When** I read it
**Then** it includes: project description, tech stack overview, prerequisites (Docker, Node, Python), setup instructions (`docker compose up`), local development instructions, how to run tests, and project structure overview

**Given** the `docs/ai-integration-log.md`
**When** I read it
**Then** it documents AI agent usage throughout the project, including: tools used, limitations encountered, and learnings
