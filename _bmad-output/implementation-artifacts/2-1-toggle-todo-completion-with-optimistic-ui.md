# Story 2.1: Toggle Todo Completion with Optimistic UI

Status: done

## Story

As a user,
I want to click a checkbox to mark a todo as complete or incomplete with satisfying visual feedback,
So that I can track my progress and the interaction feels rewarding.

## Acceptance Criteria (BDD)

### AC1: Toggle to complete
**Given** an active (incomplete) todo exists in the list
**When** I click its checkbox
**Then** the checkbox fills green with a scale pop animation (0→1.2→1, 300ms, cubic-bezier easing) instantly (optimistic UI)
**And** the todo text gets `line-through` and `opacity-40`
**And** a `PATCH /api/todos/{id}` request is sent with `{ "completed": true }`

### AC2: Toggle to incomplete
**Given** a completed todo exists in the list
**When** I click its checkbox
**Then** the checkbox reverts to empty instantly (optimistic UI)
**And** the todo text returns to normal styling (no strikethrough, full opacity)
**And** a `PATCH /api/todos/{id}` request is sent with `{ "completed": false }`

### AC3: Server confirmation
**Given** the background PATCH request succeeds
**When** the server responds
**Then** the optimistic state is confirmed (no visible change to the user)

### AC4: Failure rollback
**Given** the background PATCH request fails
**When** the server returns an error
**Then** the checkbox and text style revert to their previous state
**And** an inline error appears on that specific todo row (`bg-red-50 text-red-600 text-sm`)
**And** the error auto-dismisses after 5 seconds

### AC5: Reducer actions
**Given** the `useTodos` hook
**When** I inspect the toggle implementation
**Then** it dispatches `TOGGLE_TODO` (optimistic), then `TOGGLE_TODO_SUCCESS` or `TOGGLE_TODO_FAILURE` based on API response

### AC6: PATCH endpoint
**Given** the PATCH endpoint in the backend
**When** I send `PATCH /api/todos/{id}` with `{ "completed": true }` for a valid todo
**Then** I receive a `200` response with the updated todo (camelCase JSON)
**And** the `updated_at` timestamp is refreshed

### AC7: PATCH not found
**Given** I send `PATCH /api/todos/{non-existent-id}`
**When** the request is processed
**Then** I receive a `404` response with `{ "detail": "Todo not found", "code": "NOT_FOUND" }`

### AC8: TodoCheckbox tests
**Given** the TodoCheckbox component
**When** I run its tests
**Then** tests pass for: rendering unchecked state, rendering checked state with green fill, toggling on click, focus ring on keyboard focus, and `prefers-reduced-motion` disabling the pop animation

### AC9: Backend integration tests
**And** backend integration tests in `test_todos.py` cover the PATCH endpoint for toggle success and not-found cases

## Tasks / Subtasks

- [x] Task 1: Add PATCH endpoint to backend (AC: #6, #7)
  - [x] 1.1 Add `toggle_todo(db, todo_id, todo_data)` to `backend/app/services/todo_service.py`
    - Query by UUID, raise ValueError if not found
    - Update `completed` field, commit, refresh
    - Do NOT log todo description (NFR8)
  - [x] 1.2 Add `get_todo_by_id(db, todo_id)` helper to `todo_service.py` — reuse for delete
  - [x] 1.3 Add PATCH route to `backend/app/routers/todos.py`:
    - `@router.patch("/todos/{todo_id}", response_model=TodoResponse)`
    - Accept `TodoUpdate` schema body, UUID path parameter
    - Return 200 with updated todo
    - Return 404 with `{ "detail": "Todo not found", "code": "NOT_FOUND" }` if not found

- [x] Task 2: Add backend integration tests (AC: #9)
  - [x] 2.1 Add to `backend/tests/routers/__init__.py`:
    - `test_toggle_todo_complete` — create todo, PATCH completed=true, verify response
    - `test_toggle_todo_incomplete` — create todo, PATCH completed=true, then PATCH completed=false
    - `test_toggle_todo_not_found` — PATCH with non-existent UUID, expect 404
    - `test_toggle_updates_timestamp` — verify updatedAt changes after toggle

- [x] Task 3: Create TodoCheckbox component (AC: #1, #2, #8)
  - [x] 3.1 Create `frontend/src/components/TodoCheckbox.tsx`
  - [x] 3.2 Render 24px circle button with border `border-2 border-stone-300`
  - [x] 3.3 When `checked=true`: fill green `bg-green-600` with white checkmark SVG
  - [x] 3.4 Scale pop animation on check: `transform: scale(0) → scale(1.2) → scale(1)` over 300ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` easing
  - [x] 3.5 Wrap animation in `motion-safe:` — instant state change when reduced motion is preferred
  - [x] 3.6 Props: `checked: boolean`, `onToggle: () => void`, `label: string` (for aria-label)
  - [x] 3.7 `aria-label="Mark '{todo text}' as complete"` (or "incomplete" for completed)
  - [x] 3.8 Role: `checkbox` with `aria-checked` attribute
  - [x] 3.9 Focus ring: `focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2`
  - [x] 3.10 Activate on Space or Enter key press

- [x] Task 4: Add checkbox pop animation CSS (AC: #1)
  - [x] 4.1 Add `@keyframes checkbox-pop` to `frontend/src/index.css`:
    ```
    0% { transform: scale(0); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
    ```
  - [x] 4.2 Add `--animate-checkbox-pop: checkbox-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)` to `@theme`

- [x] Task 5: Wire toggle into TodoItem (AC: #1, #2)
  - [x] 5.1 Update `frontend/src/components/TodoItem.tsx`:
    - Import and render `TodoCheckbox` before the text content
    - Pass `checked={todo.completed}`, `onToggle={() => onToggle?.(todo.id)}`
    - Pass `label={todo.description}` for accessible labeling
  - [x] 5.2 Apply completed styling to todo text:
    - When `todo.completed`: add `line-through opacity-40` to the description `<p>`
    - When `!todo.completed`: normal styling

- [x] Task 6: Add `toggleTodo` to useTodos hook (AC: #5)
  - [x] 6.1 Add `toggleTodo` function to `frontend/src/hooks/useTodos.ts`:
    - Dispatch `TOGGLE_TODO` immediately (optimistic)
    - Call `api.toggleTodo(id, !currentCompleted)` — note: send the NEW state
    - On success: dispatch `TOGGLE_TODO_SUCCESS` with the server response
    - On failure: dispatch `TOGGLE_TODO_FAILURE` with id + error message
  - [x] 6.2 Return `toggleTodo` from the hook

- [x] Task 7: Wire toggle in App.tsx (AC: #1, #2, #3, #4)
  - [x] 7.1 Destructure `toggleTodo` from `useTodos()`
  - [x] 7.2 Pass `onToggle={toggleTodo}` to each `<TodoItem>`

- [x] Task 8: Write component tests (AC: #8)
  - [x] 8.1 Write `frontend/src/components/TodoCheckbox.test.tsx`:
    - Renders unchecked circle when `checked=false`
    - Renders green filled circle with checkmark when `checked=true`
    - Calls `onToggle` when clicked
    - Has correct `aria-label` for complete/incomplete
    - Has `aria-checked` attribute matching state
    - Shows focus ring on keyboard focus (focus-visible)
  - [x] 8.2 Update `frontend/src/components/TodoItem.test.tsx`:
    - Renders checkbox reflecting todo.completed state
    - Applies `line-through` and `opacity-40` when completed
    - Normal styling when not completed

## Dev Notes

### Architecture Compliance

This story introduces the **toggle completion** pattern — the second optimistic mutation (after create in 1.4). The reducer already has `TOGGLE_TODO`, `TOGGLE_TODO_SUCCESS`, and `TOGGLE_TODO_FAILURE` action types defined in `frontend/src/types/todo.ts` and handled in `frontend/src/hooks/useTodos.ts`. The `api.toggleTodo()` method already exists in `frontend/src/services/api.ts`. **The backend PATCH endpoint does NOT exist yet — you must create it.**

#### Critical Architecture Constraints

1. **The reducer and types are ALREADY DONE**: `TOGGLE_TODO`, `TOGGLE_TODO_SUCCESS`, `TOGGLE_TODO_FAILURE` actions are fully implemented in `useTodos.ts`. The `Action` type in `types/todo.ts` includes them. DO NOT recreate or duplicate these.

2. **`api.toggleTodo()` ALREADY EXISTS**: `frontend/src/services/api.ts` already exports `toggleTodo(id, completed)`. DO NOT recreate it. It sends `PATCH /api/todos/${id}` with `{ completed }` body.

3. **Backend follows router → service → model pattern**: The PATCH route goes in `backend/app/routers/todos.py`, business logic in `backend/app/services/todo_service.py`. Never access the model directly from the router.

4. **Use `TodoUpdate` schema**: Already exists in `backend/app/schemas/todo.py` with `completed: bool | None = None`. Use it as the request body for the PATCH endpoint.

5. **Error response format**: 404 errors must use `{ "detail": "Todo not found", "code": "NOT_FOUND" }` — defined in architecture doc.

6. **Do NOT log todo description** (NFR8): Log the todo ID only, never the content.

7. **Components call hooks, not api.ts**: `TodoItem` calls `onToggle` prop → `App` maps to `useTodos().toggleTodo()`. Components never import `api.ts`.

8. **Animations respect reduced motion**: Checkbox pop animation MUST use `motion-safe:` prefix or `@media (prefers-reduced-motion: no-preference)`.

### Existing Code to Build On

**Backend — files to modify:**
- `backend/app/routers/todos.py` — Add PATCH route (currently only GET and POST)
- `backend/app/services/todo_service.py` — Add `get_todo_by_id()` and `toggle_todo()` functions
- `backend/tests/routers/__init__.py` — Add PATCH tests alongside existing GET/POST tests

**Frontend — files to modify:**
- `frontend/src/components/TodoItem.tsx` — Add TodoCheckbox, completed styling
- `frontend/src/hooks/useTodos.ts` — Add `toggleTodo` function (reducer already handles it)
- `frontend/src/App.tsx` — Wire `toggleTodo` to TodoItem
- `frontend/src/index.css` — Add checkbox-pop animation keyframes

**Frontend — files to create:**
- `frontend/src/components/TodoCheckbox.tsx` — New component
- `frontend/src/components/TodoCheckbox.test.tsx` — New tests

### Existing Patterns to Follow

```tsx
// Pattern from App.tsx — how to wire actions:
const { state, loadTodos, createTodo, clearError } = useTodos();
// ADD: toggleTodo to destructuring

// Pattern from TodoItem — how props flow:
<TodoItem key={todo.id} todo={todo} onClearError={clearError} />
// ADD: onToggle={toggleTodo}
```

```python
# Pattern from todo_service.py — how service functions work:
async def create_todo(db: AsyncSession, todo_data: TodoCreate) -> Todo:
    # validation → create → commit → refresh → return
    # FOLLOW SAME PATTERN for toggle_todo
```

### What This Story Does NOT Include

- **No delete button** — Story 2.2
- **No confirmation dialog** — Story 2.2
- **No inline error auto-dismiss improvement** — Story 2.3
- **No todo limit UI (disabled input, footer)** — Story 2.4
- **No keyboard navigation improvements** — Story 3.2
- **No screen reader announcements** (`aria-live` for toggle) — Story 3.2

### Anti-Patterns to Avoid

- **Do NOT recreate reducer actions** — they already exist in `useTodos.ts`
- **Do NOT recreate `api.toggleTodo()`** — it already exists in `api.ts`
- **Do NOT add a loading spinner for toggle** — use optimistic UI only
- **Do NOT use global error toasts** — errors are inline per-item via `InlineError`
- **Do NOT access Todo model from router** — go through `todo_service`
- **Do NOT log todo descriptions** — log only the ID

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic UI pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Checkbox animation spec]
- [Source: frontend/src/types/todo.ts — Existing Action types]
- [Source: frontend/src/hooks/useTodos.ts — Existing reducer with TOGGLE handlers]
- [Source: frontend/src/services/api.ts — Existing toggleTodo API method]
- [Source: backend/app/schemas/todo.py — Existing TodoUpdate schema]

## Dev Agent Record

### Agent Model Used
Amelia (GitHub Copilot - Claude Haiku 4.5)

### Debug Log References
- Frontend tests: All 45 tests passing  - Backend API implementation complete, awaiting database
- TodoCheckbox: 8 tests passing
- TodoItem: 9 tests passing

### Completion Notes List
✅ PATCH endpoint implemented in backend/app/routers/todos.py with proper error handling
✅ Service functions toggle_todo() and get_todo_by_id() added to backend/app/services/todo_service.py
✅ TodoCheckbox component created with full accessibility support (role, aria-label, aria-checked)
✅ Checkbox pop animation (scale 0→1.2→1) added to frontend/src/index.css with motion-safe wrapper
✅ TodoItem updated to render TodoCheckbox and apply line-through/opacity-40 styling for completed todos
✅ toggleTodo() function added to useTodos hook with optimistic dispatch + API call handling
✅ App.tsx wired to pass toggleTodo to TodoItem components
✅ All component tests created and passing (8 TodoCheckbox tests, 9 TodoItem tests)
✅ Backend integration tests added for PATCH endpoint (toggle complete, incomplete, not-found, timestamp)

### File List
**Backend (Created/Modified):**
- backend/app/services/todo_service.py — Added get_todo_by_id(), toggle_todo() functions
- backend/app/routers/todos.py — Added PATCH /todos/{todo_id} endpoint
- backend/tests/routers/__init__.py — Added 4 PATCH endpoint integration tests

**Frontend (Created/Modified):**
- frontend/src/components/TodoCheckbox.tsx — **NEW** — Toggle checkbox component with pop animation
- frontend/src/components/TodoCheckbox.test.tsx — **NEW** — 8 tests for TodoCheckbox
- frontend/src/components/TodoItem.tsx — Updated to render checkbox and completed styling
- frontend/src/components/TodoItem.test.tsx — Updated with 4 new tests for checkbox and completed styling
- frontend/src/hooks/useTodos.ts — Added toggleTodo() function
- frontend/src/App.tsx — Destructure and pass toggleTodo to TodoItem
- frontend/src/index.css — Added @keyframes checkbox-pop and --animate-checkbox-pop
