# Story 2.4: Todo Limit Enforcement

Status: done

## Story

As a user,
I want to be clearly informed when I've reached the 50-todo limit,
So that I know why I can't add more and what to do about it.

## Acceptance Criteria (BDD)

### AC1: Input enabled under limit
**Given** 49 or fewer todos exist
**When** I view the todo input
**Then** the input is enabled with placeholder "What's on your mind?"

### AC2: Input disabled at limit
**Given** exactly 50 todos exist (active + completed combined)
**When** I view the todo input
**Then** the input is disabled (`opacity-50`, `cursor-not-allowed`)
**And** the placeholder changes to "Todo limit reached"
**And** an informational message appears below the input: "Todo limit reached. Complete or delete some to add more." in `text-sm text-stone-500`

### AC3: Re-enable on delete
**Given** exactly 50 todos exist
**When** I delete a todo (bringing the count to 49)
**Then** the input re-enables immediately
**And** the limit message disappears
**And** the placeholder returns to "What's on your mind?"

### AC4: Footer displays counts
**Given** the footer area of the card
**When** todos exist in the list
**Then** a footer displays with split layout: "X remaining" on the left and "Y total" on the right
**And** the footer updates in real-time as todos are created, completed, or deleted
**And** the footer has `aria-live="polite"` for screen reader updates

### AC5: Dual-layer enforcement
**Given** the limit enforcement
**When** I inspect the implementation
**Then** the 50-item limit is enforced on BOTH the server (Story 1.2) and the client (disabled input + message)
**And** the client limit check uses the local todo count from the reducer state

## Tasks / Subtasks

- [x] Task 1: Add limit state to TodoInput (AC: #1, #2, #3)
  - [x] 1.1 Update `frontend/src/components/TodoInput.tsx`:
    - The `disabled` prop already exists — it controls `opacity-50` and `cursor-not-allowed`
    - Add logic to swap placeholder based on disabled: if `disabled` → "Todo limit reached", else → "What's on your mind?"
  - [x] 1.2 No new props needed — `disabled` already cascades from parent

- [x] Task 2: Add limit message below input (AC: #2, #3)
  - [x] 2.1 Render inline in App.tsx: conditional `<p>` with `px-4 py-2 text-sm text-stone-500 border-b border-stone-100`
  - [x] 2.2 Message: "Todo limit reached. Complete or delete some to add more."

- [x] Task 3: Create TodoFooter component (AC: #4)
  - [x] 3.1 Create `frontend/src/components/TodoFooter.tsx`
  - [x] 3.2 Props: `remaining: number`, `total: number`
  - [x] 3.3 Layout: `flex justify-between px-4 py-3 border-t border-stone-100`
  - [x] 3.4 Left text: `<span className="text-sm text-stone-500">{remaining} remaining</span>`
  - [x] 3.5 Right text: `<span className="text-sm text-stone-400">{total} total</span>`
  - [x] 3.6 Add `aria-live="polite"` to the footer container for screen reader updates
  - [x] 3.7 Only render when `total > 0` (hidden when no todos)

- [x] Task 4: Compute counts in App.tsx (AC: #4, #5)
  - [x] 4.1 Compute from reducer state (no new state needed):
    ```tsx
    const total = state.todos.length;
    const remaining = state.todos.filter(t => !t.completed).length;
    const isAtLimit = total >= 50;
    ```
  - [x] 4.2 Pass `disabled={isAtLimit}` to `TodoInput`
  - [x] 4.3 Render limit message conditionally when `isAtLimit`
  - [x] 4.4 Render `<TodoFooter remaining={remaining} total={total} />` inside the card after the list

- [x] Task 5: Wire in App.tsx (AC: #1, #2, #3, #4)
  - [x] 5.1 Update `frontend/src/App.tsx`:
    - Compute `total`, `remaining`, `isAtLimit` from `state.todos`
    - Pass `disabled={isAtLimit}` to `<TodoInput>`
    - Render limit message between TodoInput and AppStateDisplay when `isAtLimit`
    - Render `<TodoFooter>` inside the card, below the todo list
  - [x] 5.2 Card structure after wiring is correct

- [x] Task 6: Update TodoInput placeholder logic (AC: #1, #2)
  - [x] 6.1 Update `frontend/src/components/TodoInput.tsx`:
    - Changed placeholder to be dynamic: `placeholder={disabled ? "Todo limit reached" : "What's on your mind?"}`
    - The `disabled` prop handling already applies `disabled:opacity-50 disabled:cursor-not-allowed`

- [x] Task 7: Write component tests (AC: #1, #2, #3, #4)
  - [x] 7.1 Update `frontend/src/components/TodoInput.test.tsx`:
    - Added test: Shows "What's on your mind?" placeholder when not disabled (existing)
    - Added test: Shows "Todo limit reached" placeholder when disabled ✓
    - Added test: Input is disabled when `disabled=true` ✓
    - Added test: Applies disabled styles when `disabled=true` ✓
  - [x] 7.2 Create `frontend/src/components/TodoFooter.test.tsx` (5 tests):
    - ✓ Renders remaining count
    - ✓ Renders total count
    - ✓ Has `aria-live="polite"` attribute
    - ✓ Displays correct counts for zero remaining
    - ✓ Displays correct counts at limit (50)
  - [x] 7.3 Update `frontend/src/App.test.tsx` (10 tests total):
    - 4 existing tests (header, loading, empty state, input visible)
    - Added: Input enabled when fewer than 50 todos ✓
    - Added: Input disabled when 50 todos exist ✓
    - Added: Shows limit message when at capacity ✓
    - Added: Hides limit message when under limit ✓
    - Added: Footer displays correct remaining/total counts ✓
    - Added: Footer hidden when no todos ✓

## Dev Notes

### Architecture Compliance

This story completes **Epic 2** by adding client-side limit enforcement and the footer. Server-side limit enforcement (50 todos max) already exists in `todo_service.py`. This story adds the matching client-side UX: disabled input, limit message, and a footer with live counts.

#### Critical Architecture Constraints

1. **Server-side limit already exists**: `backend/app/services/todo_service.py` has `MAX_TODOS = 50` and raises `ValueError` if exceeded. This story adds the CLIENT-SIDE mirror only.

2. **Counts computed from reducer state**: No API call needed for counts. Derive `total`, `remaining`, and `isAtLimit` from `state.todos` in `App.tsx`. The reducer state is the single source of truth for the UI.

3. **TodoInput `disabled` prop already exists**: The component already supports `disabled` with proper styling (`disabled:opacity-50 disabled:cursor-not-allowed`). Just pass `disabled={isAtLimit}` from App.

4. **Footer is inside the card but outside AppStateDisplay**: The footer sits below the todo list within the card div. It renders when `total > 0`. It does NOT render inside AppStateDisplay.

5. **Real-time updates**: Footer counts and limit state update automatically because they're derived from reducer state. When optimistic actions add/remove todos, counts change immediately.

6. **`aria-live="polite"` on footer**: Required for screen reader users to hear count changes without interrupting their current task.

### Existing Code to Build On

**Frontend — files to modify:**
- `frontend/src/components/TodoInput.tsx` — Dynamic placeholder based on `disabled` prop
- `frontend/src/App.tsx` — Compute counts, pass `disabled`, render limit message and footer

**Frontend — files to create:**
- `frontend/src/components/TodoFooter.tsx` — New component
- `frontend/src/components/TodoFooter.test.tsx` — New tests

### Key Implementation Details

#### App.tsx After Full Wiring

```tsx
function App() {
  const { state, loadTodos, createTodo, toggleTodo, deleteTodo, clearError } = useTodos();
  const [restoredText, setRestoredText] = useState<string | null>(null);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  const handleCreateTodo = async (description: string) => {
    setRestoredText(null);
    const failedText = await createTodo(description);
    if (failedText) setRestoredText(failedText);
  };

  const total = state.todos.length;
  const remaining = state.todos.filter(t => !t.completed).length;
  const isAtLimit = total >= 50;

  return (
    <div className="bg-stone-50 min-h-screen">
      <main className="max-w-[560px] mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">mattodos</h1>
          <p className="text-sm text-stone-500">Your tasks, your pace.</p>
        </header>
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden">
          <TodoInput onSubmit={handleCreateTodo} restoredText={restoredText} disabled={isAtLimit} />
          {isAtLimit && (
            <p className="px-4 py-2 text-sm text-stone-500 border-b border-stone-100">
              Todo limit reached. Complete or delete some to add more.
            </p>
          )}
          <AppStateDisplay state={state} onRetry={loadTodos}>
            <ul role="list" className="divide-y divide-stone-100">
              {state.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onClearError={clearError}
                />
              ))}
            </ul>
          </AppStateDisplay>
          {total > 0 && <TodoFooter remaining={remaining} total={total} />}
        </div>
      </main>
    </div>
  );
}
```

#### TodoFooter Component

```tsx
// frontend/src/components/TodoFooter.tsx
type TodoFooterProps = {
  remaining: number;
  total: number;
};

export function TodoFooter({ remaining, total }: TodoFooterProps) {
  return (
    <footer
      aria-live="polite"
      className="flex justify-between px-4 py-3 border-t border-stone-100"
    >
      <span className="text-sm text-stone-500">{remaining} remaining</span>
      <span className="text-sm text-stone-400">{total} total</span>
    </footer>
  );
}
```

### What This Story Does NOT Include

- **No backend changes** — server limit already exists
- **No new reducer actions** — counts derive from existing state
- **No filter/sort functionality** — just display counts
- **No per-item limit indicator** — just disabled input + message + footer
- **No keyboard navigation improvements** — Story 3.2
- **No E2E tests** — Story 3.3

### Anti-Patterns to Avoid

- **Do NOT add API calls for counts** — derive from reducer state
- **Do NOT create new reducer state for counts** — compute in render
- **Do NOT add a separate "limit reached" modal** — inline message only
- **Do NOT change the server-side limit logic** — it already works
- **Do NOT render footer inside AppStateDisplay** — put it after, inside the card

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — 50-item limit, client+server enforcement]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Footer layout, limit message]
- [Source: backend/app/services/todo_service.py — MAX_TODOS = 50, server enforcement]
- [Source: frontend/src/components/TodoInput.tsx — disabled prop already supported]
- [Source: frontend/src/App.tsx — Current card structure to extend]

## Dev Agent Record

### Agent Model Used
Amelia (GitHub Copilot - Claude Haiku 4.5)

### Debug Log References
- Frontend tests: All 77 tests passing (63 + 14 new)
- TodoInput: Dynamic placeholder working (10 tests including 3 new limit tests)
- TodoFooter: Component and tests working (5 new tests)
- App: Limit state computation and wiring verified (10 tests including 6 new limit tests)
- All acceptance criteria verified through test coverage

### Completion Notes List

✅ TodoInput enhanced with dynamic placeholder:
   - Placeholder changes based on disabled state
   - "Todo limit reached" when disabled=true
   - "What's on your mind?" when disabled=false
   - Tests verify both placeholder states and disabled attribute

✅ TodoFooter component created and tested:
   - Props: remaining (number), total (number)
   - Layout: flex justify-between with left/right split
   - aria-live="polite" for screen reader updates
   - 5 tests covering rendering, attribute, and various count states

✅ App.tsx wired with limit enforcement:
   - Counts computed from reducer state (total, remaining, isAtLimit)
   - TodoInput passed disabled={isAtLimit}
   - Conditional limit message rendered below input when at limit
   - TodoFooter rendered below list when total > 0
   - Card structure verified correct

✅ Dynamic limit behavior working:
   - Input disabled at exactly 50 todos
   - Input re-enables when count drops below 50
   - Limit message appears/disappears based on count
   - Footer updates in real-time with optimistic UI

✅ Comprehensive test coverage:
   - TodoInput tests: 10 total (7 original + 3 new limit tests)
   - TodoFooter tests: 5 new tests
   - App tests: 10 total (4 original + 6 new limit tests)
   - All 77 tests passing with 100% success rate

### File List
**Frontend (Created):**
- frontend/src/components/TodoFooter.tsx — New limit footer component
- frontend/src/components/TodoFooter.test.tsx — 5 tests for footer

**Frontend (Modified):**
- frontend/src/components/TodoInput.tsx — Dynamic placeholder logic
- frontend/src/App.tsx — Limit state computation and wiring
- frontend/src/components/TodoInput.test.tsx — 3 new limit tests added
- frontend/src/App.test.tsx — 6 new limit tests added

