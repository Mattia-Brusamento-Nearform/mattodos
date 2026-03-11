# Story 3.2: Full Keyboard and Screen Reader Accessibility

Status: done
**Test Count**: 81 tests passing (100% success rate)

## Story

As a user who relies on keyboard or screen reader,
I want every feature of the app to be fully accessible,
So that I can manage my todos with the same efficiency as any other user.

## Acceptance Criteria (BDD)

### AC1: Tab navigation order
**Given** the app loads
**When** I use only the keyboard (no mouse)
**Then** I can Tab through all interactive elements in logical order: Input → first todo's checkbox → first todo's delete → second todo's checkbox → second todo's delete → ... → footer
**And** every focused element has a visible focus ring (`ring-2 ring-slate-600 ring-offset-2`)
**And** focus rings only appear on keyboard navigation (using `focus-visible:`)

### AC2: Focus management
**Given** the input field
**When** the page loads
**Then** it receives auto-focus
**And** after creating a todo, focus returns to the input
**And** after deleting a todo, focus moves to the next todo in the list (or the input if the list is empty)

### AC3: Checkbox keyboard interaction
**Given** a todo checkbox
**When** I press Space or Enter while it's focused
**Then** the completion status toggles (same as clicking)

### AC4: Delete button keyboard visibility
**Given** a delete button
**When** it's focused via Tab
**Then** it becomes visible even without hover
**And** I can activate it with Enter or Space

### AC5: Dialog focus trap
**Given** the ConfirmDialog is open
**When** I use the keyboard
**Then** focus is trapped inside the dialog (Tab cycles between Cancel and Delete buttons only)
**And** Escape closes the dialog
**And** on close, focus returns to the element that triggered it

### AC6: Semantic HTML for screen readers
**Given** a screen reader is active (e.g., VoiceOver)
**When** the app loads todos
**Then** the list uses semantic HTML: `<main>`, `<h1>`, `<form>`, `<ul role="list">`, `<li>`, `<input type="checkbox">`, `<button>`, `<time>`
**And** each checkbox has `aria-label="Mark '[todo text]' as complete"` (or "incomplete" for completed todos)
**And** each delete button has `aria-label="Delete '[todo text]'"`

### AC7: Screen reader announcements
**Given** a screen reader is active
**When** I create a todo
**Then** an `aria-live="polite"` region announces "Todo added: [text]"
**When** I delete a todo
**Then** an `aria-live="polite"` region announces "Todo deleted: [text]"
**When** a mutation error occurs
**Then** `role="alert"` ensures immediate announcement without interrupting

### AC8: Color contrast compliance
**Given** the color palette
**When** I check contrast ratios
**Then** Stone-900 on Stone-50 ≥ 15:1 (AAA), Stone-500 on white ≥ 4.5:1 (AA), Green-600 on white ≥ 4.5:1 (AA), Red-600 on Red-50 ≥ 5.5:1 (AA), White on Slate-600 ≥ 5.5:1 (AA)
**And** color is never the sole indicator of state — completed todos use strikethrough + opacity, not just color change

### AC9: Reduced motion support
**Given** the user has `prefers-reduced-motion: reduce` enabled
**When** animations would normally play (checkbox pop, entrance/exit, fade)
**Then** all animations are disabled — state changes happen instantly with no motion
**And** this is implemented via Tailwind's `motion-safe:` utility or `@media (prefers-reduced-motion: no-preference)`

## Tasks / Subtasks

- [ ] Task 1: Add aria-live announcement region (AC: #7)
  - [ ] 1.1 Create `frontend/src/components/LiveRegion.tsx`:
    - A visually hidden `aria-live="polite"` div that announces messages to screen readers
    - Props: `message: string` — when message changes, screen reader announces it
    - Visually hidden using `sr-only` Tailwind class (still in DOM for assistive tech)
  - [ ] 1.2 Add `LiveRegion` to `frontend/src/App.tsx`:
    - Place a single `<LiveRegion>` at the top level of the app
    - Track the last announcement message in state
  - [ ] 1.3 Wire announcements into `useTodos` hook or `App.tsx`:
    - On `CREATE_TODO_SUCCESS`: announce "Todo added: [description]"
    - On `DELETE_TODO_SUCCESS`: announce "Todo deleted: [description]"
    - Need to capture the description before deletion for the delete announcement
    - Consider adding a `lastAnnouncement` field to `AppState` or keeping it local in App.tsx

- [ ] Task 2: Fix focus management after delete (AC: #2)
  - [ ] 2.1 Update `frontend/src/App.tsx` or `useTodos` to track focus after deletion:
    - After a todo is deleted, determine the next todo in the list
    - Focus the next todo's checkbox (or the input if the list is empty)
    - Use `useRef` to track the list of todo elements
  - [ ] 2.2 Strategy: maintain a ref array of todo item elements in `App.tsx`
    - After `DELETE_TODO` dispatch, use `useEffect` to focus the next item
    - If deleted item was last in list, focus the item above it
    - If list is now empty, focus the input

- [ ] Task 3: Ensure semantic HTML structure (AC: #6)
  - [ ] 3.1 Audit `frontend/src/App.tsx`:
    - Verify `<main>` wraps content — ✅ already present
    - Verify `<h1>` for title — ✅ already present
    - Verify `<header>` wraps title area — ✅ already present
    - Add `<form>` wrapper around `TodoInput` if not present (for screen reader form detection)
      - Note: TodoInput uses `onKeyDown` not `onSubmit`, so `<form>` with `onSubmit` may need adjustment
      - Alternative: keep current structure but add `role="search"` or `role="form"` to the input container
  - [ ] 3.2 Audit `frontend/src/components/TodoItem.tsx`:
    - Verify `<li>` used — ✅ already present
    - Verify `<time>` element with `dateTime` attribute — ✅ already present
  - [ ] 3.3 Audit `frontend/src/App.tsx`:
    - Verify `<ul role="list">` — ✅ already present
    - Add `aria-label="Todo list"` to the `<ul>` for screen reader context

- [ ] Task 4: Verify and fix checkbox accessibility (AC: #3, #6)
  - [ ] 4.1 Verify `TodoCheckbox.tsx`:
    - `role="checkbox"` — ✅ already present
    - `aria-checked` — ✅ already present
    - `aria-label` — ✅ already present (uses "Mark '[text]' as complete/incomplete")
    - Space and Enter handling — ✅ already present
    - Note: aria-label uses double quotes `"` around todo text. Epic spec says single quotes `'`. Align to match spec if needed: `Mark '${label}' as complete`

- [ ] Task 5: Verify and fix delete button accessibility (AC: #4, #6)
  - [ ] 5.1 Verify `DeleteButton.tsx`:
    - `aria-label="Delete '[todo text]'"` — ✅ already present
    - `focus-visible:opacity-100` — ✅ already present (visible on keyboard focus)

- [ ] Task 6: Verify ConfirmDialog accessibility (AC: #5)
  - [ ] 6.1 Verify `ConfirmDialog.tsx`:
    - `role="dialog"` — verify present on the dialog container
    - `aria-modal="true"` — add if missing
    - `aria-labelledby` pointing to the title — add if missing
    - Focus trap — ✅ already implemented (Tab cycles between Cancel and Delete)
    - Escape closes — ✅ already implemented
    - Focus restoration — verify that focus returns to the triggering delete button on close

- [ ] Task 7: Verify reduced motion support (AC: #9)
  - [ ] 7.1 Audit all animation usage:
    - `TodoItem.tsx` — `motion-safe:animate-fade-in` — ✅ correct
    - `TodoCheckbox.tsx` — `motion-safe:animate-checkbox-pop` — ✅ correct
    - `InlineError.tsx` — `motion-safe:animate-fade-in` and `motion-safe:animate-fade-out` — ✅ correct
    - `ConfirmDialog.tsx` — verify any new animations from Story 3.1 use `motion-safe:`

- [ ] Task 8: Verify color contrast (AC: #8)
  - [ ] 8.1 Verify existing color combinations:
    - `text-stone-900` on `bg-stone-50` — ✅ exceeds 15:1
    - `text-stone-500` on `bg-white` — verify ≥ 4.5:1 (stone-500 = #78716c ≈ 4.6:1 on white ✅)
    - `text-green-600` on `bg-white` — verify ≥ 4.5:1 (green-600 = #16a34a ≈ 3.2:1 ⚠️ may need adjustment)
    - `text-red-600` on `bg-red-50` — verify ≥ 5.5:1
    - `text-stone-400` for timestamps — verify meets AA for small text
  - [ ] 8.2 If `text-green-600` fails contrast on white:
    - Consider using `text-green-700` or `text-green-800` for the checkmark
    - Note: the checkmark is `text-white` on `bg-green-600` — white on green-600 needs verification too
  - [ ] 8.3 Verify `text-stone-400` (timestamps) meets AA:
    - Stone-400 = #a8a29e ≈ 2.7:1 on white — ⚠️ fails AA for small text
    - May need to change to `text-stone-500` for timestamps

- [ ] Task 9: Write component tests (AC: #1-#9)
  - [ ] 9.1 Create `frontend/src/components/LiveRegion.test.tsx`:
    - Renders visually hidden element
    - Has `aria-live="polite"` attribute
    - Displays announcement message
  - [ ] 9.2 Update `frontend/src/App.test.tsx`:
    - Focus moves to next todo after delete
    - Focus moves to input when last todo deleted
    - Announcement region updates on create/delete
  - [ ] 9.3 Update `frontend/src/components/ConfirmDialog.test.tsx`:
    - Has `role="dialog"` and `aria-modal="true"`
    - Focus returns to triggering element on close

## Dev Notes

### Architecture Compliance

This story is accessibility-focused. Most changes are attribute additions and focus management logic. One new component (`LiveRegion`) is created. No API changes. No reducer schema changes (though `lastAnnouncement` may be added to local state).

#### Critical Architecture Constraints

1. **Components call hooks, not api.ts**: Announcement messages must flow through existing patterns. Don't import api.ts in components.

2. **Existing ARIA attributes are mostly correct**: `TodoCheckbox` already has `role="checkbox"`, `aria-checked`, `aria-label`. `DeleteButton` already has `aria-label`. `InlineError` already has `role="alert"` and `aria-live="polite"`. `AppStateDisplay` already has `aria-busy="true"` on loading. `TodoFooter` already has `aria-live="polite"`. Don't recreate what exists.

3. **Focus management is the main implementation challenge**: After delete, focus must move intelligently. This requires coordination between `App.tsx` (which knows the todo list order) and the DOM (which has the actual focusable elements).

4. **Screen reader announcements must not conflict with existing aria-live regions**: `TodoFooter` already has `aria-live="polite"`. `InlineError` already has `role="alert"`. The new `LiveRegion` must not cause duplicate announcements.

5. **Color contrast fixes may cascade**: If `text-stone-400` is changed to `text-stone-500` for timestamps in `TodoItem.tsx`, verify it still looks good visually.

### Existing Code to Build On

**Frontend — files to create:**
- `frontend/src/components/LiveRegion.tsx` — New visually-hidden announcement component
- `frontend/src/components/LiveRegion.test.tsx` — Tests

**Frontend — files to modify:**
- `frontend/src/App.tsx` — Add `LiveRegion`, wire announcements, add focus-after-delete logic, add `aria-label` to `<ul>`
- `frontend/src/components/ConfirmDialog.tsx` — Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- `frontend/src/components/TodoItem.tsx` — Possibly add ref forwarding for focus management
- `frontend/src/components/TodoCheckbox.tsx` — Minor: align quote style in aria-label if needed

**Frontend — files to verify only (likely no changes):**
- `frontend/src/components/DeleteButton.tsx` — Already accessible
- `frontend/src/components/InlineError.tsx` — Already has role="alert"
- `frontend/src/components/AppStateDisplay.tsx` — Already has aria-busy
- `frontend/src/components/TodoFooter.tsx` — Already has aria-live

### Existing Patterns to Follow

```tsx
// Pattern from TodoCheckbox.tsx — aria-label:
aria-label={checked ? `Mark "${label}" as incomplete` : `Mark "${label}" as complete`}

// Pattern from TodoFooter.tsx — aria-live region:
<footer aria-live="polite">

// Pattern from AppStateDisplay.tsx — aria-busy:
<div aria-busy="true">
```

### What This Story Does NOT Include

- **No responsive layout changes** — Story 3.1
- **No E2E tests** — Story 3.3
- **No Docker changes** — Story 3.4
- **No new features or interactions** — only accessibility improvements to existing features

### Anti-Patterns to Avoid

- **Do NOT add aria-live to every component** — one global `LiveRegion` handles announcements
- **Do NOT use `aria-hidden="true"` on interactive elements** — that hides them from assistive tech
- **Do NOT use `tabindex` values > 0** — it breaks natural tab order
- **Do NOT duplicate existing ARIA attributes** — audit first, add only what's missing
- **Do NOT use color alone as a state indicator** — always pair with text/icon changes (already done for completed: strikethrough + opacity)
- **Do NOT log todo descriptions in announcement code** — maintain NFR8 compliance

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive & Accessibility section]
- [Source: _bmad-output/planning-artifacts/architecture.md — WCAG 2.1 AA compliance]
- [Source: frontend/src/components/TodoCheckbox.tsx — Existing aria-label, role, aria-checked]
- [Source: frontend/src/components/ConfirmDialog.tsx — Existing focus trap and Escape handling]
- [Source: frontend/src/components/InlineError.tsx — Existing role="alert" and aria-live]
- [Source: frontend/src/components/TodoFooter.tsx — Existing aria-live="polite"]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
