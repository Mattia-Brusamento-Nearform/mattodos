# Story 1.4: Todo Creation with Optimistic UI

Status: done

## Story

As a user,
I want to type a todo and press Enter to add it instantly to my list,
So that creating todos feels as fast as writing on a notepad.

## Acceptance Criteria (BDD)

### AC1: Input field behavior
**Given** the app is loaded with the todo list visible
**When** I focus on the input field
**Then** the input has placeholder text "What's on your mind?" and shows a focus ring (`border-slate-600`, `ring-4 ring-slate-600/8`)
**And** the input field is auto-focused on page load

### AC2: Optimistic todo creation
**Given** I have typed "Review PR" in the input field
**When** I press Enter
**Then** the input clears immediately and retains focus
**And** a new todo "Review PR" appears in the list instantly (optimistic UI, before server response)
**And** the todo has a subtle entrance animation (fade-in + slight slide, ~200ms)
**And** a `POST /api/todos` request is sent in the background

### AC3: Server confirmation
**Given** the background POST request succeeds
**When** the server responds with the created todo
**Then** the optimistic todo is updated with the server-assigned UUID and timestamps (no visible change to the user)

### AC4: Failure rollback with text restoration
**Given** the background POST request fails
**When** the server returns an error
**Then** the optimistic todo is removed from the list (reverse animation)
**And** an inline error message appears: "Couldn't save that — try again"
**And** the original text ("Review PR") is restored to the input field so I can retry with Enter

### AC5: Empty input rejection
**Given** the input field is focused
**When** I press Enter with an empty or whitespace-only input
**Then** nothing happens — no error, no submission, the input stays focused

### AC6: Todo list display
**Given** the app has todos
**When** I view the todo list
**Then** each todo displays its description text and a creation timestamp

### AC7: TodoInput tests
**Given** the TodoInput component
**When** I run its tests (`TodoInput.test.tsx`)
**Then** tests pass for: submitting on Enter, clearing input, ignoring empty input, and displaying placeholder

## Tasks / Subtasks

- [ ] Task 1: Implement TodoInput component (AC: #1, #2, #5)
  - [ ] 1.1 Create `src/components/TodoInput.tsx` with controlled input
  - [ ] 1.2 Style input: full-width, `p-4`, placeholder "What's on your mind?", `text-stone-900`, `placeholder:text-stone-400`
  - [ ] 1.3 Add focus ring styling: `focus:border-slate-600 focus:ring-4 focus:ring-slate-600/8 focus:outline-none`
  - [ ] 1.4 Handle Enter key: if input is non-empty after trim, call `onSubmit(text)`, clear input
  - [ ] 1.5 Handle empty/whitespace input: silently ignore, no error, no submission
  - [ ] 1.6 Accept `onSubmit: (text: string) => void` and `restoredText?: string` props
  - [ ] 1.7 When `restoredText` changes to a non-null value, populate the input with it (for failure recovery)

- [ ] Task 2: Implement useAutoFocus hook (AC: #1)
  - [ ] 2.1 Create or update `src/hooks/useAutoFocus.ts`
  - [ ] 2.2 Auto-focus input on mount
  - [ ] 2.3 Re-focus input after todo creation (focus stays on input after clearing)

- [ ] Task 3: Implement TodoItem component (AC: #6)
  - [ ] 3.1 Create `src/components/TodoItem.tsx` — displays todo description and creation timestamp
  - [ ] 3.2 Style with `px-4 py-3`, `text-stone-900` for description, `text-xs text-stone-400` for timestamp
  - [ ] 3.3 Add entrance animation: `animate-fade-in` (fade-in + slight slide-down, ~200ms)
  - [ ] 3.4 Add `optimistic` visual indicator: subtle opacity reduction while awaiting confirmation
  - [ ] 3.5 Display per-item error via InlineError when `todo.error` is set
  - [ ] 3.6 Accept props: `todo: Todo`, `onToggle`, `onDelete` (toggle and delete are wired but non-functional until Epic 2)

- [ ] Task 4: Create InlineError placeholder component (AC: #4)
  - [ ] 4.1 Create `src/components/InlineError.tsx` — renders error message with `bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2`
  - [ ] 4.2 Add `role="alert"` and `aria-live="polite"` for screen reader announcement
  - [ ] 4.3 Implement auto-dismiss after 5 seconds with `CLEAR_ERROR` dispatch
  - [ ] 4.4 Fade-out animation on dismiss (~200ms)

- [ ] Task 5: Define CSS animations (AC: #2, #4)
  - [ ] 5.1 Add custom keyframes to `src/index.css` for `fade-in` (opacity 0→1, translateY -8px→0)
  - [ ] 5.2 Add custom keyframes for `fade-out` (opacity 1→0)
  - [ ] 5.3 Respect `prefers-reduced-motion: reduce` — disable all animations

- [ ] Task 6: Wire components in App (AC: #2, #3, #4, #6)
  - [ ] 6.1 Import and render `TodoInput` in card, passing `createTodo` from `useTodos`
  - [ ] 6.2 Render todo list: map `state.todos` to `TodoItem` components
  - [ ] 6.3 Handle `createTodo` return value: if string returned (failure), set as `restoredText` for TodoInput
  - [ ] 6.4 Add `<ul role="list">` wrapper for semantic HTML

- [ ] Task 7: Write component tests (AC: #7)
  - [ ] 7.1 Write `src/components/TodoInput.test.tsx`:
    - Renders with placeholder "What's on your mind?"
    - Submits on Enter with non-empty input
    - Clears input after submit
    - Ignores Enter on empty input
    - Restores text when restoredText prop changes
    - Auto-focuses on mount
  - [ ] 7.2 Write `src/components/TodoItem.test.tsx`:
    - Renders todo description
    - Renders creation timestamp
    - Shows optimistic styling when `optimistic: true`
    - Shows InlineError when `error` is set
  - [ ] 7.3 Write `src/components/InlineError.test.tsx`:
    - Renders error message
    - Has role="alert"
    - Auto-dismisses after 5 seconds
    - Calls onDismiss callback

## Dev Notes

### Architecture Compliance

This story builds on **Story 1.3** (frontend shell). It implements the complete todo creation flow with optimistic UI — the core user interaction pattern. The optimistic update pattern established here must be followed for all subsequent mutations (toggle, delete).

#### Critical Architecture Constraints

1. **Optimistic UI pattern is mandatory**: Dispatch immediately → API call → success confirms / failure reverts. No loading spinners for mutations.

2. **Text restoration on failure**: When `createTodo` fails, the original text must be returned to the input field. The `useTodos.createTodo()` returns the original text on failure (or null on success).

3. **Components call hooks, not api.ts**: `TodoInput` calls a callback prop, which maps to `useTodos().createTodo()` in `App`. TodoInput does NOT import or call `api.ts`.

4. **Per-item errors, not global**: Create failures show inline near the input. Each todo can have its own `error` field.

5. **Animations respect reduced motion**: All animations must be wrapped in `prefers-reduced-motion` checks.

### Key Implementation Details

#### TodoInput Component

```tsx
// src/components/TodoInput.tsx
import { useState, useRef, useEffect } from 'react';

type TodoInputProps = {
  onSubmit: (text: string) => void;
  restoredText?: string | null;
  disabled?: boolean;
};

export function TodoInput({ onSubmit, restoredText, disabled }: TodoInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Restore text on failure
  useEffect(() => {
    if (restoredText) {
      setText(restoredText);
      inputRef.current?.focus();
    }
  }, [restoredText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = text.trim();
      if (!trimmed) return;
      onSubmit(trimmed);
      setText('');
      // focus is retained since we don't blur
    }
  };

  return (
    <div className="border-b border-stone-100">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind?"
        disabled={disabled}
        className="w-full p-4 text-stone-900 placeholder:text-stone-400 bg-transparent
                   focus:border-slate-600 focus:ring-4 focus:ring-slate-600/8 focus:outline-none
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
```

#### TodoItem Component

```tsx
// src/components/TodoItem.tsx
import type { Todo } from '../types/todo';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const formattedDate = new Date(todo.createdAt).toLocaleDateString();

  return (
    <li
      className={`px-4 py-3 flex items-center gap-3 motion-safe:animate-fade-in
                  ${todo.optimistic ? 'opacity-70' : ''}`}
    >
      {/* Checkbox placeholder — wired in Story 2.1 */}
      <div className="flex-1 min-w-0">
        <p className="text-stone-900 truncate">{todo.description}</p>
        <time className="text-xs text-stone-400" dateTime={todo.createdAt}>
          {formattedDate}
        </time>
      </div>
      {/* Delete button placeholder — wired in Story 2.2 */}
    </li>
  );
}
```

#### CSS Animation Keyframes

```css
/* src/index.css — add after @import "tailwindcss" */
@theme {
  --animate-fade-in: fade-in 200ms ease-out;
  --animate-fade-out: fade-out 200ms ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### InlineError Component

```tsx
// src/components/InlineError.tsx
import { useEffect } from 'react';

type InlineErrorProps = {
  message: string;
  onDismiss: () => void;
};

export function InlineError({ message, onDismiss }: InlineErrorProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mt-1 motion-safe:animate-fade-in"
    >
      {message}
    </div>
  );
}
```

### What This Story Does NOT Include

- **No toggle completion (checkbox animation)** — Story 2.1
- **No delete with confirmation dialog** — Story 2.2
- **No todo limit enforcement UI** (disabled input, limit message) — Story 2.4
- **No loading skeleton, empty state, or error state** — Story 1.5
- **No footer with "X remaining" / "Y total"** — Story 2.4
- **No responsive layout adjustments** — Story 3.1
- **No screen reader announcements** (`aria-live` for "Todo added") — Story 3.2
- **No E2E tests** — Story 3.3

### Anti-Patterns to Avoid

- **Do NOT show a loading spinner for create** — use optimistic UI only
- **Do NOT use global error toasts** — errors are inline and scoped
- **Do NOT call api.ts from TodoInput** — TodoInput calls a callback prop
- **Do NOT use `any` type** — all event handlers and props must be typed
- **Do NOT use `console.log` for error handling** — use state management
- **Do NOT mutate state in the reducer** — always return new objects

### References

- [Source: architecture.md — Frontend Architecture (State Management)](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Optimistic Update Pattern](../_bmad-output/planning-artifacts/architecture.md)
- [Source: ux-design-specification.md — Input Field & Micro-interactions](../_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: epics.md — Story 1.4 Acceptance Criteria](../_bmad-output/planning-artifacts/epics.md)

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
