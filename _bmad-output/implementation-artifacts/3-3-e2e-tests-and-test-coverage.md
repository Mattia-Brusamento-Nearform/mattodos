# Story 3.3: E2E Tests and Test Coverage

Status: done
**Test Count**: 13/13 E2E tests passing (100% success rate, 17.0s execution time)

## Story

As a developer,
I want comprehensive E2E tests covering all user journeys and sufficient unit/integration test coverage,
So that I can confidently ship changes and catch regressions.

## Acceptance Criteria (BDD)

### AC1: Playwright E2E test suite
**Given** the E2E test suite in `frontend/e2e/`
**When** I run `npx playwright test`
**Then** at least 5 Playwright test files pass:
1. `create-todo.spec.ts` — tests: type and Enter creates a todo, todo appears in list, input clears and re-focuses, empty input does nothing
2. `complete-todo.spec.ts` — tests: clicking checkbox marks todo complete (visual change), clicking again toggles back to active
3. `delete-todo.spec.ts` — tests: clicking delete opens dialog, cancel closes without deletion, confirm removes the todo
4. `empty-state.spec.ts` — tests: empty state message appears when no todos, disappears when first todo created
5. `error-state.spec.ts` — tests: error state with retry when API unreachable, successful retry loads todos

### AC2: Frontend unit/component tests
**Given** the frontend test suite
**When** I run `npm test` in the frontend directory
**Then** component tests pass for: TodoInput, TodoItem, TodoCheckbox, DeleteButton, ConfirmDialog, InlineError, AppStateDisplay
**And** hook tests pass for: useTodos (all reducer actions, optimistic patterns, rollback)
**And** service tests pass for: api.ts (all endpoints, error handling)

### AC3: Backend integration tests
**Given** the backend test suite
**When** I run `python -m pytest` in the backend directory
**Then** router tests pass for: all CRUD endpoints (success + error cases), health check
**And** service tests pass for: todo_service (create, list, toggle, delete, limit check)
**And** test configuration uses an isolated test database (not the development database)

### AC4: Code coverage
**Given** the overall test coverage
**When** I check coverage reports
**Then** the project achieves ≥ 70% meaningful code coverage across frontend and backend
**And** tests are co-located: frontend tests next to source files, backend tests in mirrored `tests/` directory

## Tasks / Subtasks

- [ ] Task 1: Set up Playwright for E2E testing (AC: #1)
  - [ ] 1.1 Verify Playwright is installed in `frontend/package.json` devDependencies
    - If not: `npm install -D @playwright/test`
    - Run `npx playwright install` to install browser binaries
  - [ ] 1.2 Create `frontend/playwright.config.ts`:
    - Base URL: `http://localhost:3000` (or configurable via env)
    - Test directory: `e2e/`
    - Browser: chromium (minimum), optionally firefox + webkit
    - Retries: 1 in CI, 0 locally
    - Web server: configure to start the full stack before tests if not already running
    - Screenshots: on failure only
    - Timeout: 30s per test
  - [ ] 1.3 Create `frontend/e2e/` directory

- [ ] Task 2: Write create-todo E2E test (AC: #1)
  - [ ] 2.1 Create `frontend/e2e/create-todo.spec.ts`:
    - Navigate to app, verify input is visible and focused
    - Type "Buy milk" and press Enter
    - Verify "Buy milk" appears in the todo list
    - Verify input is cleared after submission
    - Verify input retains focus after submission
    - Type only spaces and press Enter — verify no todo created
    - Press Enter on empty input — verify no todo created

- [ ] Task 3: Write complete-todo E2E test (AC: #1)
  - [ ] 3.1 Create `frontend/e2e/complete-todo.spec.ts`:
    - Create a todo first (type + Enter)
    - Click the checkbox on the created todo
    - Verify the todo appears completed (strikethrough, opacity change)
    - Click the checkbox again
    - Verify the todo returns to active state

- [ ] Task 4: Write delete-todo E2E test (AC: #1)
  - [ ] 4.1 Create `frontend/e2e/delete-todo.spec.ts`:
    - Create a todo first
    - Click the delete button (may need hover first on desktop, or force-click)
    - Verify confirmation dialog appears with todo text
    - Click "Cancel" — verify dialog closes, todo still exists
    - Click delete button again, then click "Delete" in dialog
    - Verify todo is removed from the list

- [ ] Task 5: Write empty-state E2E test (AC: #1)
  - [ ] 5.1 Create `frontend/e2e/empty-state.spec.ts`:
    - Navigate to app with clean database
    - Verify "No todos yet" message is displayed
    - Create a todo
    - Verify "No todos yet" message disappears
    - Delete the todo (so list is empty again)
    - Verify "No todos yet" message reappears

- [ ] Task 6: Write error-state E2E test (AC: #1)
  - [ ] 6.1 Create `frontend/e2e/error-state.spec.ts`:
    - Strategy: intercept API calls using Playwright's route interception to simulate failure
    - `page.route('**/api/todos', route => route.abort())` to simulate unreachable API
    - Verify error message "Unable to load your todos" appears
    - Verify Retry button is visible
    - Unblock the API route
    - Click Retry
    - Verify the app loads normally (either shows todos or empty state)

- [ ] Task 7: Fill gaps in frontend unit tests (AC: #2, #4)
  - [ ] 7.1 Expand `frontend/src/services/api.test.ts`:
    - Current tests only check function existence — add actual HTTP tests using `vi.fn()` or `msw`
    - Test `getTodos()` returns parsed response
    - Test `createTodo()` sends POST with description
    - Test `toggleTodo()` sends PATCH with completed
    - Test `deleteTodo()` sends DELETE and handles 204
    - Test error handling: non-ok response throws ApiError
  - [ ] 7.2 Expand `frontend/src/hooks/useTodos.test.ts`:
    - Add tests for `toggleTodo` (optimistic update, success, failure rollback)
    - Add tests for `deleteTodo` (optimistic removal, success, failure restoration)
    - Add tests for `clearError` with specific todo ID
  - [ ] 7.3 Review and fill any gaps in component tests:
    - `TodoFooter.test.tsx` — ✅ adequate
    - `AppStateDisplay.test.tsx` — ✅ adequate
    - `InlineError.test.tsx` — ✅ adequate
    - `ConfirmDialog.test.tsx` — ✅ adequate
    - `DeleteButton.test.tsx` — ✅ adequate
    - `TodoCheckbox.test.tsx` — ✅ adequate
    - `TodoInput.test.tsx` — ✅ adequate
    - `App.test.tsx` — may need expansion for delete/toggle flows

- [ ] Task 8: Fill gaps in backend tests (AC: #3, #4)
  - [ ] 8.1 Add health check test to `backend/tests/routers/`:
    - Create `backend/tests/routers/test_health.py` (or add to existing)
    - Test `GET /api/health` returns 200 with `{"status": "ok"}`
    - (Enhanced health check with DB status is Story 3.4 — test basic version here)
  - [ ] 8.2 Verify PATCH and DELETE tests exist in `backend/tests/routers/test_todos.py`:
    - Toggle complete/incomplete — need to verify these are present
    - Toggle not-found 404
    - Delete success 204
    - Delete not-found 404
  - [ ] 8.3 Expand `backend/tests/services/test_todo_service.py`:
    - Add `test_toggle_todo` — create, toggle, verify completed=true
    - Add `test_toggle_todo_not_found` — toggle non-existent ID raises ValueError
    - Add `test_delete_todo` — create, delete, verify count is 0
    - Add `test_delete_todo_not_found` — delete non-existent ID raises ValueError

- [ ] Task 9: Configure coverage reporting (AC: #4)
  - [ ] 9.1 Frontend: Add coverage config to `frontend/vite.config.ts` or `vitest` config:
    - Add `coverage` config with `provider: 'v8'` or `'istanbul'`
    - Set threshold: `{ lines: 70, branches: 70, functions: 70, statements: 70 }`
    - Exclude: `test-setup.ts`, `*.test.*`, `e2e/`, `vite-env.d.ts`, `main.tsx`
    - Add `"test:coverage": "vitest run --coverage"` script to `package.json`
  - [ ] 9.2 Backend: Add coverage config:
    - Install `pytest-cov` if not in requirements
    - Add `"pytest --cov=app --cov-report=html --cov-fail-under=70"` to test scripts
    - Exclude: `alembic/`, `__pycache__/`

## Dev Notes

### Architecture Compliance

This story adds test infrastructure and fills test coverage gaps. The E2E tests run against the full stack (frontend + backend + database) orchestrated by Docker Compose or local dev servers. Unit/integration tests run in isolation.

#### Critical Architecture Constraints

1. **E2E tests in `frontend/e2e/`**: Playwright test files go in this directory, NOT in `src/`. They test the full user journey through the browser against a real running app.

2. **E2E test files are defined by the architecture**: The 5 spec files are explicitly named in the epics and architecture documents. Use EXACTLY these names:
   - `create-todo.spec.ts`
   - `complete-todo.spec.ts`
   - `delete-todo.spec.ts`
   - `empty-state.spec.ts`
   - `error-state.spec.ts`

3. **Backend tests use isolated test database**: The existing `conftest.py` creates and drops tables per test. This is correct — don't change this pattern.

4. **Frontend tests are co-located**: Component tests sit next to their source files (e.g., `TodoInput.test.tsx` next to `TodoInput.tsx`). This is already the convention — don't move them.

5. **No test framework changes**: Vitest for frontend, pytest for backend. Both are already configured.

6. **E2E tests need a clean database state**: Each E2E test should start with a known state. Options:
   - API call to clear todos before each test
   - Docker compose restart between test runs
   - Recommended: add a test helper that calls `DELETE /api/todos/{id}` for all existing todos, or use a test-specific API endpoint

7. **Do NOT log todo descriptions in test output** — maintain NFR8 compliance in test helpers too.

### Existing Code to Build On

**Frontend — files to create:**
- `frontend/playwright.config.ts` — Playwright configuration
- `frontend/e2e/create-todo.spec.ts` — E2E test
- `frontend/e2e/complete-todo.spec.ts` — E2E test
- `frontend/e2e/delete-todo.spec.ts` — E2E test
- `frontend/e2e/empty-state.spec.ts` — E2E test
- `frontend/e2e/error-state.spec.ts` — E2E test

**Frontend — files to modify:**
- `frontend/src/services/api.test.ts` — Expand from function-existence checks to actual HTTP tests
- `frontend/src/hooks/useTodos.test.ts` — Add toggle/delete/clearError tests
- `frontend/package.json` — Add `test:coverage` and `test:e2e` scripts
- `frontend/vite.config.ts` — Add coverage config

**Backend — files to create:**
- `backend/tests/routers/test_health.py` — Health endpoint test

**Backend — files to modify:**
- `backend/tests/routers/test_todos.py` — Add PATCH/DELETE tests if missing
- `backend/tests/services/test_todo_service.py` — Add toggle/delete service tests
- `backend/requirements.txt` — Add `pytest-cov` if not present

### Existing Patterns to Follow

```typescript
// Pattern from existing component tests — vitest + testing-library:
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Pattern from existing backend tests — pytest + httpx:
@pytest.mark.asyncio
async def test_create_todo(client: AsyncClient):
    response = await client.post("/api/todos", json={"description": "Buy milk"})
    assert response.status_code == 201

// E2E pattern — Playwright:
import { test, expect } from '@playwright/test';
test('creates a todo', async ({ page }) => {
  await page.goto('/');
  await page.fill('[aria-label="New todo"]', 'Buy milk');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Buy milk')).toBeVisible();
});
```

### What This Story Does NOT Include

- **No responsive layout changes** — Story 3.1
- **No accessibility improvements** — Story 3.2
- **No Docker changes** — Story 3.4
- **No new application features** — only tests
- **No performance optimization** — just test infrastructure

### Anti-Patterns to Avoid

- **Do NOT use hard-coded waits (`page.waitForTimeout`)** — use Playwright's auto-waiting (`expect(locator).toBeVisible()`)
- **Do NOT test implementation details in E2E** — test user-visible behavior only
- **Do NOT mock in E2E tests** except for the error-state test where API interception is necessary
- **Do NOT run E2E tests in watch mode during development** — they're slow, run explicitly
- **Do NOT share state between E2E tests** — each test should be independent
- **Do NOT skip any of the 5 required spec files** — all are mandatory per architecture spec

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing section, E2E file names]
- [Source: frontend/src/services/api.test.ts — Existing minimal API tests]
- [Source: frontend/src/hooks/useTodos.test.ts — Existing hook tests (missing toggle/delete)]
- [Source: backend/tests/conftest.py — Existing test database configuration]
- [Source: backend/tests/routers/test_todos.py — Existing router tests (may be missing PATCH/DELETE)]
- [Source: backend/tests/services/test_todo_service.py — Existing service tests (missing toggle/delete)]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
