# Story 1.5: App States — Loading, Empty, and Error

Status: done

## Story

As a user,
I want to see clear, helpful feedback when the app is loading, when my list is empty, or when something goes wrong,
So that I always know what's happening and what I can do about it.

## Acceptance Criteria (BDD)

### AC1: Loading state with skeleton
**Given** the app is loading todos from the API
**When** the GET request is in progress
**Then** the card displays a loading skeleton: 3 placeholder rows with a pulse animation
**And** `aria-busy="true"` is set on the list container

### AC2: Empty state
**Given** the GET request returns an empty array
**When** the loading completes
**Then** the card displays the empty state: "No todos yet" centered in `text-stone-400`
**And** the input field remains focused and ready for the first todo

### AC3: Populated state transition
**Given** the GET request returns todos
**When** the loading completes
**Then** the skeleton is replaced with the actual todo list
**And** `aria-busy` is removed from the list container

### AC4: Error state with retry
**Given** the API is unreachable (network error or 5xx)
**When** the initial GET request fails
**Then** the card displays: "Unable to load your todos" with a Retry button
**And** the error state has `role="alert"` for screen reader announcement

### AC5: Retry behavior
**Given** the error state is displayed
**When** I click the Retry button
**Then** the loading skeleton reappears and a new GET request is made
**And** if the retry succeeds, the todo list loads normally

### AC6: AppStateDisplay tests
**Given** the AppStateDisplay component
**When** I run its tests (`AppStateDisplay.test.tsx`)
**Then** tests pass for: loading skeleton display, empty state message, error state with retry button, and successful retry transition

## Tasks / Subtasks

- [ ] Task 1: Implement loading skeleton (AC: #1, #3)
  - [ ] 1.1 Create loading skeleton in `src/components/AppStateDisplay.tsx`
  - [ ] 1.2 Render 3 placeholder rows with Tailwind `animate-pulse`
  - [ ] 1.3 Each skeleton row: `h-12` height, `bg-stone-100 rounded-lg` with `mx-4 my-3` spacing
  - [ ] 1.4 Set `aria-busy="true"` on the container when loading

- [ ] Task 2: Implement empty state (AC: #2)
  - [ ] 2.1 Render empty state when `loading === false` and `todos.length === 0` and `error === null`
  - [ ] 2.2 Display "No todos yet" centered, `text-stone-400 text-sm py-12`
  - [ ] 2.3 Ensure input field remains focused (handled by useAutoFocus, no extra work needed)

- [ ] Task 3: Implement error state with retry (AC: #4, #5)
  - [ ] 3.1 Render error state when `error !== null`
  - [ ] 3.2 Display "Unable to load your todos" centered, `text-stone-500 text-sm`
  - [ ] 3.3 Display "Retry" button below error text: `px-4 py-2 bg-stone-900 text-white rounded-lg text-sm hover:bg-stone-800 transition-colors`
  - [ ] 3.4 Add `role="alert"` to the error container for screen reader announcement
  - [ ] 3.5 On click, call `onRetry()` callback — which triggers `loadTodos()` again
  - [ ] 3.6 When retry is triggered, the loading skeleton reappears (LOAD_TODOS action resets state)

- [ ] Task 4: Build AppStateDisplay component (AC: #1, #2, #3, #4, #5)
  - [ ] 4.1 Create `src/components/AppStateDisplay.tsx` that accepts `state: AppState`, `onRetry: () => void`, and `children: ReactNode` (the todo list)
  - [ ] 4.2 Logic flow:
    - If `state.loading` → show skeleton, `aria-busy="true"`
    - If `state.error` → show error state with retry
    - If `state.todos.length === 0` → show empty state
    - Otherwise → render `children` (the todo list), `aria-busy="false"`
  - [ ] 4.3 Wrap in a `<div>` with proper ARIA attributes

- [ ] Task 5: Wire AppStateDisplay in App (AC: #1, #2, #3, #4, #5)
  - [ ] 5.1 Import `AppStateDisplay` in `App.tsx`
  - [ ] 5.2 Render inside the card, below TodoInput
  - [ ] 5.3 Pass `state`, `onRetry={loadTodos}`, and the todo list `<ul>` as children
  - [ ] 5.4 Ensure TodoInput is always visible (above AppStateDisplay), even during loading/error

- [ ] Task 6: Write component tests (AC: #6)
  - [ ] 6.1 Write `src/components/AppStateDisplay.test.tsx`:
    - Renders loading skeleton when `loading: true`
    - Shows 3 skeleton rows with pulse animation
    - Sets `aria-busy="true"` during loading
    - Renders empty state when `todos: []` and no error
    - Displays "No todos yet" text
    - Renders error state when `error` is set
    - Displays "Unable to load your todos" text
    - Shows Retry button in error state
    - Has `role="alert"` on error container
    - Calls `onRetry` when Retry is clicked
    - Renders children (todo list) when todos exist
    - Removes `aria-busy` when not loading
  - [ ] 6.2 Update `src/App.test.tsx` to test:
    - Loading state shown on mount
    - Empty state shown after empty API response
    - Error state shown after API failure
    - Retry triggers new load

## Dev Notes

### Architecture Compliance

This story completes **Epic 1** by implementing the three non-data app states: loading, empty, and error. It builds on Stories 1.3 (shell/hook) and 1.4 (todo creation). After this story, a user can open the app, see their todos (or meaningful feedback), and create new ones.

#### Critical Architecture Constraints

1. **AppStateDisplay is a presentational component**: It receives state and renders the appropriate view. No API calls or business logic inside — it calls `onRetry` which the parent maps to `loadTodos()`.

2. **Loading is only for initial fetch**: Mutations (create/toggle/delete) use optimistic UI, not loading spinners. The `loading` boolean in state is true only during `GET /api/todos`.

3. **Error state is global, not per-item**: The `error` field in `AppState` is for initial load failure only. Per-item errors (mutation failures) use the `error` field on individual `Todo` objects and `InlineError`.

4. **Skeleton, not spinner**: The loading state shows 3 skeleton rows with pulse animation — not a spinning loader. This feels like content is arriving, not like the app is blocked.

5. **ARIA attributes are required**: `aria-busy="true"` during loading, `role="alert"` for error state. These are not optional.

### Key Implementation Details

#### AppStateDisplay Component

```tsx
// src/components/AppStateDisplay.tsx
import type { ReactNode } from 'react';
import type { AppState } from '../types/todo';

type AppStateDisplayProps = {
  state: AppState;
  onRetry: () => void;
  children: ReactNode; // the todo list
};

function LoadingSkeleton() {
  return (
    <div aria-busy="true" className="py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mx-4 my-3 h-12 bg-stone-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-stone-400 text-sm">No todos yet</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="py-12 text-center">
      <p className="text-stone-500 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm
                   hover:bg-stone-800 transition-colors focus:outline-none
                   focus:ring-2 focus:ring-stone-600 focus:ring-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

export function AppStateDisplay({ state, onRetry, children }: AppStateDisplayProps) {
  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={onRetry} />;
  }

  if (state.todos.length === 0) {
    return <EmptyState />;
  }

  return <div aria-busy="false">{children}</div>;
}
```

#### App Integration

```tsx
// In App.tsx — inside the card div:
<div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden">
  <TodoInput onSubmit={handleCreateTodo} restoredText={restoredText} />
  <AppStateDisplay state={state} onRetry={loadTodos}>
    <ul role="list" className="divide-y divide-stone-100">
      {state.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  </AppStateDisplay>
</div>
```

#### Loading Skeleton Design

The skeleton mimics the real todo list layout:
- 3 rows (reasonable estimate for "content is loading")
- Same height as actual todo items (~48px / `h-12`)
- `bg-stone-100` matches the warm color palette
- `animate-pulse` provides the standard loading indication
- `rounded-lg` matches the card's rounded aesthetic

#### State Flow Diagram

```
App mounts
  → loadTodos() called
  → dispatch(LOAD_TODOS)
  → state.loading = true
  → AppStateDisplay shows <LoadingSkeleton />
  
API responds:
  Success (empty):
    → dispatch(LOAD_TODOS_SUCCESS, [])
    → state.loading = false, state.todos = []
    → AppStateDisplay shows <EmptyState />
  
  Success (with data):
    → dispatch(LOAD_TODOS_SUCCESS, todos)
    → state.loading = false, state.todos = [...]
    → AppStateDisplay shows children (todo list)
  
  Failure:
    → dispatch(LOAD_TODOS_FAILURE, "Unable to load your todos")
    → state.loading = false, state.error = "..."
    → AppStateDisplay shows <ErrorState />
    
  User clicks Retry:
    → loadTodos() called again
    → dispatch(LOAD_TODOS)
    → state.loading = true, state.error = null
    → cycle repeats
```

### What This Story Does NOT Include

- **No toggle completion visual states** — Story 2.1
- **No delete with confirmation** — Story 2.2
- **No inline errors for mutation failures** (fully functional) — partially from Story 1.4, completed in Story 2.3
- **No todo limit UI** (disabled input, limit message) — Story 2.4
- **No footer** ("X remaining" / "Y total") — Story 2.4
- **No full screen reader announcements** (`aria-live` for todo added/deleted) — Story 3.2
- **No responsive layout** — Story 3.1
- **No E2E tests** — Story 3.3

### Anti-Patterns to Avoid

- **Do NOT use a loading spinner** — use skeleton placeholders with pulse animation
- **Do NOT show loading state for mutations** — only initial fetch shows loading
- **Do NOT use global error toasts** — the error state is rendered inside the card
- **Do NOT skip ARIA attributes** — `aria-busy` and `role="alert"` are required
- **Do NOT make AppStateDisplay call the API** — it receives state and calls `onRetry` callback
- **Do NOT hide the input during loading/error** — TodoInput is always visible above AppStateDisplay

### References

- [Source: architecture.md — Frontend Architecture (Loading States)](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — State Management Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: ux-design-specification.md — Loading, Empty, Error States](../_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: epics.md — Story 1.5 Acceptance Criteria](../_bmad-output/planning-artifacts/epics.md)

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
| 2026-03-10 | Story created by create-story (yolo mode) | SM (Bob) |

### File List

<!-- To be filled by dev agent with all files created/modified -->
