# Story 2.2: Delete Todo with Confirmation Dialog

Status: done

## Story

As a user,
I want to delete a todo with a confirmation step that prevents accidental removal,
So that I feel protected from mistakes without being nagged.

## Acceptance Criteria (BDD)

### AC1: Delete button visibility on hover
**Given** a todo exists in the list
**When** I hover over the todo row (on hover-capable devices)
**Then** the delete button fades in (opacity transition, ~150ms) on the right side of the row
**And** the delete button is a 28px circular hit area with `×` icon

### AC2: Delete button always visible on touch
**Given** a touch device (no hover capability)
**When** I view a todo row
**Then** the delete button is always visible (no progressive disclosure)

### AC3: Confirmation dialog opens
**Given** the delete button is visible
**When** I click it
**Then** a confirmation dialog appears: "Delete '[todo text]'?"
**And** the dialog has two buttons: "Cancel" (ghost style) and "Delete" (destructive red `bg-red-600 text-white`)
**And** focus is trapped inside the dialog with initial focus on the Cancel button (safe default)

### AC4: Cancel closes dialog
**Given** the confirmation dialog is open
**When** I click "Cancel" or press Escape
**Then** the dialog closes with no action
**And** focus returns to the delete button that triggered the dialog

### AC5: Confirm deletes with optimistic UI
**Given** the confirmation dialog is open
**When** I click "Delete"
**Then** the dialog closes
**And** the todo is removed from the list instantly (optimistic UI, fade-out ~200ms)
**And** a `DELETE /api/todos/{id}` request is sent in the background

### AC6: Server confirmation
**Given** the background DELETE request succeeds
**When** the server responds with `204`
**Then** the removal is confirmed (no visible change)

### AC7: Failure rollback
**Given** the background DELETE request fails
**When** the server returns an error
**Then** the todo reappears in the list at its original position
**And** an inline error appears on that row, auto-dismissing after 5 seconds

### AC8: DELETE endpoint
**Given** the DELETE endpoint in the backend
**When** I send `DELETE /api/todos/{id}` for a valid todo
**Then** I receive a `204` response with no body
**And** the todo is permanently removed from the database

### AC9: DELETE not found
**Given** I send `DELETE /api/todos/{non-existent-id}`
**When** the request is processed
**Then** I receive a `404` response with `{ "detail": "Todo not found", "code": "NOT_FOUND" }`

### AC10: Mobile dialog as action sheet
**Given** the ConfirmDialog on mobile (< 768px)
**When** it opens
**Then** it renders as an action sheet anchored to the bottom of the screen (full-width)

### AC11: Desktop dialog as centered modal
**Given** the ConfirmDialog on desktop (≥ 768px)
**When** it opens
**Then** it renders as a centered modal with overlay (`bg-black/20`)

### AC12: Component tests
**Given** the DeleteButton and ConfirmDialog components
**When** I run their tests
**Then** tests pass for: visibility on hover, always visible when focused via keyboard, dialog opening, cancel closing, confirm triggering delete, escape closing, focus trap, and focus restoration

### AC13: Backend tests
**And** backend integration tests in `test_todos.py` cover DELETE endpoint for success and not-found cases

## Tasks / Subtasks

- [x] Task 1: Add DELETE endpoint to backend (AC: #8, #9)
  - [x] 1.1 Add `delete_todo(db, todo_id)` to `backend/app/services/todo_service.py`
    - Reuse `get_todo_by_id()` from Story 2.1 — raise ValueError if not found
    - Delete the todo, commit
    - Log `"Todo deleted (id=%s)"` — do NOT log description (NFR8)
  - [x] 1.2 Add DELETE route to `backend/app/routers/todos.py`:
    - `@router.delete("/todos/{todo_id}", status_code=204)`
    - Return no body (204 No Content)
    - Return 404 with `{ "detail": "Todo not found", "code": "NOT_FOUND" }` if not found

- [x] Task 2: Add backend integration tests (AC: #13)
  - [x] 2.1 Add to `backend/tests/routers/__init__.py`:
    - `test_delete_todo` — create todo, DELETE, verify 204, verify GET returns empty
    - `test_delete_todo_not_found` — DELETE with non-existent UUID, expect 404
    - `test_delete_todo_decrements_count` — create 2 todos, delete 1, verify count is 1

- [x] Task 3: Create DeleteButton component (AC: #1, #2)
  - [x] 3.1 Create `frontend/src/components/DeleteButton.tsx`
  - [x] 3.2 Render 28px circular button with `×` icon, `text-stone-400 hover:text-red-600`
  - [x] 3.3 Progressive disclosure on hover-capable devices:
    ```css
    opacity-0 group-hover:opacity-100 transition-opacity duration-150
    @media (hover: hover) { /* hide by default, show on hover */ }
    ```
  - [x] 3.4 Always visible on non-hover (touch) devices: `@media (hover: none) { opacity: 1 }`
  - [x] 3.5 Always visible when focused via keyboard: `focus-visible:opacity-100`
  - [x] 3.6 Props: `onDelete: () => void`, `todoDescription: string`
  - [x] 3.7 `aria-label="Delete '{todoDescription}'"`
  - [x] 3.8 Focus ring: `focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2`
  - [x] 3.9 Add `group` class to the parent `<li>` in TodoItem for hover detection

- [x] Task 4: Create ConfirmDialog component (AC: #3, #4, #10, #11)
  - [x] 4.1 Create `frontend/src/components/ConfirmDialog.tsx`
  - [x] 4.2 Props: `isOpen: boolean`, `title: string`, `onCancel: () => void`, `onConfirm: () => void`
  - [x] 4.3 Overlay: `fixed inset-0 bg-black/20 z-50`
  - [x] 4.4 Desktop (≥ 768px): centered modal — `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
  - [x] 4.5 Mobile (< 768px): action sheet — `fixed bottom-0 left-0 right-0` with `rounded-t-2xl`
  - [x] 4.6 Use Tailwind responsive classes: base = mobile layout, `md:` = desktop layout
  - [x] 4.7 Content: title text, Cancel button (ghost: `text-stone-600 hover:bg-stone-100 rounded-lg px-4 py-2`), Delete button (`bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700`)
  - [x] 4.8 Focus trap: use `useEffect` to trap Tab cycling between Cancel and Delete only
  - [x] 4.9 Initial focus on Cancel button (safe default)
  - [x] 4.10 Close on Escape key
  - [x] 4.11 Close on overlay click (outside dialog)
  - [x] 4.12 Return focus to triggering element on close
  - [x] 4.13 Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for the title

- [x] Task 5: Add `deleteTodo` to useTodos hook (AC: #5, #6, #7)
  - [x] 5.1 Add `deleteTodo` function to `frontend/src/hooks/useTodos.ts`:
    - Save the todo object before dispatching (needed for rollback)
    - Dispatch `DELETE_TODO` immediately (optimistic) — removes from list
    - Call `api.deleteTodo(id)`
    - On success: dispatch `DELETE_TODO_SUCCESS`
    - On failure: dispatch `DELETE_TODO_FAILURE` with `{ id, todo: savedTodo, error }` — re-adds to list
  - [x] 5.2 Return `deleteTodo` from the hook

- [x] Task 6: Wire delete into TodoItem and App (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Update `frontend/src/components/TodoItem.tsx`:
    - Add `group` class to the `<li>` element
    - Import and render `DeleteButton` after the text content
    - Track local `showConfirm` state for dialog visibility
    - Render `ConfirmDialog` when `showConfirm === true`
    - DeleteButton onClick → set `showConfirm(true)`
    - ConfirmDialog onConfirm → call `onDelete(todo.id)`, close dialog
    - ConfirmDialog onCancel → close dialog
  - [x] 6.2 Update `frontend/src/App.tsx`:
    - Destructure `deleteTodo` from `useTodos()`
    - Pass `onDelete={deleteTodo}` to each `<TodoItem>`

- [x] Task 7: Write component tests (AC: #12)
  - [x] 7.1 Write `frontend/src/components/DeleteButton.test.tsx`:
    - Renders `×` icon
    - Has correct `aria-label`
    - Calls onDelete when clicked
    - Hidden by default (opacity-0) when not hovered/focused
    - Visible on focus-visible
  - [x] 7.2 Write `frontend/src/components/ConfirmDialog.test.tsx`:
    - Renders title text
    - Shows Cancel and Delete buttons
    - Calls onCancel when Cancel clicked
    - Calls onConfirm when Delete clicked
    - Closes on Escape key
    - Closes on overlay click
    - Traps focus between Cancel and Delete
    - Initial focus on Cancel button
    - Has `role="dialog"` and `aria-modal="true"`

## Dev Notes

### Architecture Compliance

This story builds on **Story 2.1** (toggle). It implements the delete mutation with confirmation dialog — the most complex UI interaction in the app. The reducer already handles `DELETE_TODO`, `DELETE_TODO_SUCCESS`, `DELETE_TODO_FAILURE` actions. The `api.deleteTodo()` method already exists.

#### Critical Architecture Constraints

1. **The reducer and types are ALREADY DONE**: `DELETE_TODO`, `DELETE_TODO_SUCCESS`, `DELETE_TODO_FAILURE` actions are fully implemented in `useTodos.ts`. The `Action` type in `types/todo.ts` includes them. The `DELETE_TODO_FAILURE` action re-inserts the todo with its error.

2. **`api.deleteTodo()` ALREADY EXISTS**: `frontend/src/services/api.ts` already exports `deleteTodo(id)`. It sends `DELETE /api/todos/${id}` and handles 204 response. DO NOT recreate it.

3. **`get_todo_by_id()` should exist from Story 2.1**: Reuse it in the delete service function. If Story 2.1 hasn't been implemented yet, create it.

4. **Backend returns 204 No Content on delete** — defined in architecture doc. No response body.

5. **ConfirmDialog is responsive**: Mobile = action sheet (bottom), Desktop = centered modal. Use Tailwind `md:` breakpoint. Do NOT use JS to detect screen size.

6. **Focus trap is required**: Tab must cycle only between Cancel and Delete when dialog is open. Use `useEffect` with keydown listener, not a library.

7. **Focus restoration**: When dialog closes, focus must return to the delete button that triggered it. Use `useRef` to store the trigger element.

8. **Progressive disclosure**: Delete button hidden on hover-capable devices until row is hovered. Always visible on touch devices. Use `@media (hover: hover)` and `@media (hover: none)`.

### Existing Code to Build On

**Backend — files to modify:**
- `backend/app/routers/todos.py` — Add DELETE route (should have GET, POST, PATCH from 2.1)
- `backend/app/services/todo_service.py` — Add `delete_todo()` (reuse `get_todo_by_id()` from 2.1)
- `backend/tests/routers/__init__.py` — Add DELETE tests

**Frontend — files to modify:**
- `frontend/src/components/TodoItem.tsx` — Add DeleteButton, ConfirmDialog, group class
- `frontend/src/hooks/useTodos.ts` — Add `deleteTodo` function (reducer already handles it)
- `frontend/src/App.tsx` — Wire `deleteTodo` to TodoItem

**Frontend — files to create:**
- `frontend/src/components/DeleteButton.tsx` — New component
- `frontend/src/components/ConfirmDialog.tsx` — New component
- `frontend/src/components/DeleteButton.test.tsx` — New tests
- `frontend/src/components/ConfirmDialog.test.tsx` — New tests

### Key Implementation Details

#### ConfirmDialog Focus Trap Pattern

```tsx
// Focus trap using useEffect — no external library
useEffect(() => {
  if (!isOpen) return;

  const dialog = dialogRef.current;
  if (!dialog) return;

  const focusableElements = dialog.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Initial focus on Cancel (first button — safe default)
  firstElement?.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
      return;
    }
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onCancel]);
```

#### TodoItem with Group Hover

```tsx
// Add group class to li for hover detection cascade
<li className={`group px-4 py-3 flex items-center gap-3 ...`}>
  {/* TodoCheckbox (from Story 2.1) */}
  <div className="flex-1 min-w-0">...</div>
  <DeleteButton
    onDelete={() => setShowConfirm(true)}
    todoDescription={todo.description}
  />
  {showConfirm && (
    <ConfirmDialog
      isOpen={showConfirm}
      title={`Delete '${todo.description}'?`}
      onCancel={handleCancelDelete}
      onConfirm={handleConfirmDelete}
    />
  )}
</li>
```

### What This Story Does NOT Include

- **No inline error auto-dismiss improvement** — Story 2.3 (InlineError already works from 1.4)
- **No todo limit UI (disabled input, footer)** — Story 2.4
- **No focus management after delete** (focus next todo) — Story 3.2
- **No screen reader announcements** (`aria-live` for "Todo deleted") — Story 3.2
- **No E2E tests** — Story 3.3

### Anti-Patterns to Avoid

- **Do NOT recreate reducer actions** — they already exist in `useTodos.ts`
- **Do NOT recreate `api.deleteTodo()`** — it already exists in `api.ts`
- **Do NOT use window.confirm()** — build a custom ConfirmDialog component
- **Do NOT use a focus trap library** — implement with `useEffect` + keydown listener
- **Do NOT use JS for responsive detection** — use Tailwind `md:` breakpoint only
- **Do NOT add loading spinner for delete** — optimistic UI only
- **Do NOT forget to save the todo before dispatching DELETE_TODO** — needed for rollback

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic UI pattern, DELETE returns 204]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ConfirmDialog spec, progressive disclosure]
- [Source: frontend/src/types/todo.ts — DELETE_TODO_FAILURE includes todo for rollback]
- [Source: frontend/src/hooks/useTodos.ts — DELETE reducer actions]
- [Source: frontend/src/services/api.ts — Existing deleteTodo API method handles 204]

## Dev Agent Record

### Agent Model Used
Amelia (GitHub Copilot - Claude Haiku 4.5)

### Debug Log References
- Frontend tests: All 63 tests passing (8 TodoCheckbox + 5 DeleteButton + 9 ConfirmDialog + 13 TodoItem + 28 others)
- Backend service functions: delete_todo() and DELETE endpoint implemented
- ConfirmDialog: Focus trap, responsive (mobile/desktop), keyboard handling all working
- DeleteButton: Progressive disclosure with group hover, focus-visible support

### Completion Notes List
✅ DELETE endpoint implemented in backend/app/routers/todos.py with 204 No Content response
✅ Service function delete_todo() added to backend/app/services/todo_service.py with proper error handling
✅ DeleteButton component created with:
   - Progressive opacity (hidden on hover, visible on touch/focus)
   - Proper aria-label and focus ring
   - Group hover integration with parent li element
✅ ConfirmDialog component created with:
   - Responsive design (mobile action sheet, desktop centered modal)
   - Focus trap implementation (Tab cycles only between buttons)
   - Initial focus on Cancel button (safe default)
   - Escape key and overlay click handling
   - Full accessibility (role="dialog", aria-modal="true")
✅ deleteTodo() function added to useTodos hook with optimistic dispatch + API call + rollback on failure
✅ TodoItem updated with:
   - Imports for DeleteButton and ConfirmDialog
   - useState for showConfirm dialog state
   - Group class on li for hover cascading
   - Renders DeleteButton and ConfirmDialog
✅ App.tsx updated to destructure and pass deleteTodo to TodoItem
✅ All component tests created and passing:
   - DeleteButton: 5 tests (icon, aria-label, click, focus ring, visibility)
   - ConfirmDialog: 9 tests (rendering, button clicks, keyboard, focus, accessibility)
   - TodoItem: Updated with 4 new delete tests (button rendering, dialog opening, confirm/cancel)
✅ Backend DELETE tests added (delete, not_found, decrements_count)

### File List
**Backend (Created/Modified):**
- backend/app/services/todo_service.py — Updated delete_todo() function using SQLAlchemy delete statement
- backend/app/routers/todos.py — Added DELETE /todos/{todo_id} endpoint returning 204
- backend/tests/routers/__init__.py — Added 3 DELETE endpoint integration tests

**Frontend (Created/Modified):**
- frontend/src/components/DeleteButton.tsx — **NEW** — Delete button with progressive disclosure
- frontend/src/components/DeleteButton.test.tsx — **NEW** — 5 tests for DeleteButton
- frontend/src/components/ConfirmDialog.tsx — **NEW** — Responsive confirmation dialog with focus trap
- frontend/src/components/ConfirmDialog.test.tsx — **NEW** — 9 tests for ConfirmDialog
- frontend/src/components/TodoItem.tsx — Updated with DeleteButton, ConfirmDialog, group class, and showConfirm state
- frontend/src/components/TodoItem.test.tsx — Updated with 4 new delete workflow tests
- frontend/src/hooks/useTodos.ts — Added deleteTodo() function with optimistic + API + rollback
- frontend/src/App.tsx — Destructure and pass deleteTodo to TodoItem components
