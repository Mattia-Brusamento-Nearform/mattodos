# Story 3.1: Responsive Layout — Mobile and Desktop

Status: done
**Test Count**: 77 tests passing (100% success rate)

## Story

As a user,
I want the app to work equally well on my phone and my laptop,
So that I can manage my todos from any device without compromise.

## Acceptance Criteria (BDD)

### AC1: Desktop layout
**Given** I open the app on a desktop browser (≥ 768px)
**When** I view the layout
**Then** the card is constrained to `max-w-[560px]` and centered with `mx-auto`
**And** the delete button uses progressive disclosure (hidden by default, visible on row hover via `@media (hover: hover)`)
**And** the ConfirmDialog renders as a centered modal with overlay (`bg-black/20`)
**And** hover states are active on all interactive elements

### AC2: Mobile layout
**Given** I open the app on a mobile browser (< 768px)
**When** I view the layout
**Then** the card fills the viewport width minus `px-4` (16px) horizontal padding
**And** all interactive elements have a minimum touch target of 44×44px
**And** the delete button is always visible (no hover required)
**And** the ConfirmDialog renders as an action sheet anchored to the bottom of the screen (full-width)
**And** the input field has 16px font-size (prevents iOS zoom on focus)

### AC3: Single-column consistency
**Given** any screen size
**When** I inspect the layout
**Then** the column layout is always single-column (no multi-column on desktop)
**And** the typography scale does not change across breakpoints
**And** the page scrolls naturally — no horizontal scrolling, no internal card scroll
**And** the same components render on all devices with responsive Tailwind classes (`md:` prefix for desktop enhancements)

### AC4: CSS approach
**Given** the responsive implementation
**When** I inspect the CSS approach
**Then** all responsive behavior uses Tailwind's mobile-first approach with the single `md:` (768px) breakpoint
**And** hover-dependent UI uses `@media (hover: hover)` instead of width-based detection

## Tasks / Subtasks

- [ ] Task 1: Audit and fix touch target sizes (AC: #2)
  - [ ] 1.1 Audit `frontend/src/components/TodoCheckbox.tsx` — ensure the 24px checkbox button has a 44×44px hit area on mobile
    - Add `min-h-[44px] min-w-[44px]` wrapper or increase button padding on mobile
    - The visual circle remains 24px but the tappable area must be 44×44px
  - [ ] 1.2 Audit `frontend/src/components/DeleteButton.tsx` — current 28px button needs 44×44px touch target
    - Increase to `min-h-[44px] min-w-[44px]` while keeping the visual size at 28px using padding
  - [ ] 1.3 Verify `TodoInput` input height is at least 44px (current `p-4` = 16px padding + text likely meets this, but confirm)
  - [ ] 1.4 Verify Retry button in `AppStateDisplay.tsx` has adequate touch target (`px-4 py-2` may need `min-h-[44px]`)

- [ ] Task 2: Fix DeleteButton progressive disclosure (AC: #1, #2, #4)
  - [ ] 2.1 Update `frontend/src/components/DeleteButton.tsx`:
    - Current implementation uses `opacity-0 group-hover:opacity-100` with an invalid inline `@media` string
    - Replace with proper Tailwind approach:
      - Mobile-first: always visible (`opacity-100`)
      - Desktop with hover: hidden until row hover — use a custom CSS class or Tailwind plugin
    - Use `@media (hover: hover)` media query in `frontend/src/index.css` to apply `opacity-0` + `group-hover:opacity-100` only on hover-capable devices
    - Keep `focus-visible:opacity-100` so keyboard users always see it
  - [ ] 2.2 Add hover-detection CSS utility to `frontend/src/index.css`:
    ```css
    @media (hover: hover) {
      .hover-hide { opacity: 0; }
      .group:hover .hover-hide { opacity: 1; }
    }
    ```

- [ ] Task 3: Make ConfirmDialog responsive (AC: #1, #2)
  - [ ] 3.1 Update `frontend/src/components/ConfirmDialog.tsx`:
    - Mobile (default): render as action sheet — full-width, anchored to bottom, no overlay (or lighter overlay), rounded top corners
      - Container: `fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 shadow-lg`
      - Overlay: `fixed inset-0 bg-black/20`
    - Desktop (`md:` prefix): render as centered modal
      - Container: `md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:rounded-2xl md:bottom-auto`
    - Animation: slide up from bottom on mobile, fade-in on desktop

- [ ] Task 4: Ensure input prevents iOS zoom (AC: #2)
  - [ ] 4.1 Verify `TodoInput.tsx` input has at least `text-base` (16px) — this prevents iOS Safari from zooming on focus
    - Current class list includes no explicit font-size — add `text-base` to the input className

- [ ] Task 5: Verify existing layout constraints (AC: #1, #3)
  - [ ] 5.1 Verify `App.tsx` already has `max-w-[560px] mx-auto px-4` — ✅ confirmed from codebase
  - [ ] 5.2 Verify no horizontal overflow issues — check that `truncate` on todo description works properly and `min-w-0` is on the flex child in `TodoItem`
  - [ ] 5.3 Verify `overflow-hidden` on the card container — ✅ confirmed in `App.tsx`

- [ ] Task 6: Write/update component tests (AC: #1, #2, #3, #4)
  - [ ] 6.1 Update `frontend/src/components/DeleteButton.test.tsx`:
    - Has `hover-hide` class for hover-capable progressive disclosure
    - Always visible via `focus-visible:opacity-100`
  - [ ] 6.2 Update `frontend/src/components/ConfirmDialog.test.tsx`:
    - Renders with bottom-anchored classes (mobile-first)
    - Has `md:` responsive classes for desktop centered modal

## Dev Notes

### Architecture Compliance

This story is primarily CSS/layout work. No new components are created — existing components are updated to be responsive. No API changes. No reducer changes.

#### Critical Architecture Constraints

1. **Mobile-first Tailwind approach**: All base styles target mobile. Desktop enhancements use `md:` prefix only. No `sm:` or other breakpoints.

2. **Hover detection via `@media (hover: hover)`**: Do NOT use width-based detection (`md:`) for hover behavior. Tablets with large screens but no hover should show delete buttons. Use the hover media query.

3. **DeleteButton has a bug**: The current `DeleteButton.tsx` has an invalid inline `@media (hover: none) { opacity: 1 }` string in the className. This is not valid Tailwind and likely renders as a literal class name. This MUST be fixed with proper CSS.

4. **Touch targets are additive, not replacements**: The visual size of elements stays the same. Increase the tappable/clickable area using padding, min-width/min-height, or transparent hit area expansion.

5. **ConfirmDialog responsive pattern**: The dialog currently has no responsive behavior. It needs to be a bottom action sheet on mobile and a centered modal on desktop, as specified in UX design.

6. **No component library**: All responsive behavior is hand-crafted with Tailwind utilities. No headless UI, no Radix, no shadcn.

### Existing Code to Build On

**Frontend — files to modify:**
- `frontend/src/components/DeleteButton.tsx` — Fix hover behavior, add touch targets
- `frontend/src/components/ConfirmDialog.tsx` — Add responsive action sheet / modal pattern
- `frontend/src/components/TodoCheckbox.tsx` — Ensure 44px touch target
- `frontend/src/components/TodoInput.tsx` — Add `text-base` for iOS zoom prevention
- `frontend/src/components/AppStateDisplay.tsx` — Verify Retry button touch target
- `frontend/src/index.css` — Add hover-detection CSS utilities

**Frontend — files to verify (likely no changes):**
- `frontend/src/App.tsx` — Already has correct layout constraints
- `frontend/src/components/TodoItem.tsx` — Already has `min-w-0` and `truncate`

### Existing Patterns to Follow

```tsx
// Pattern for responsive Tailwind from App.tsx:
<main className="max-w-[560px] mx-auto px-4 py-8">
// Mobile: full width with padding. Desktop: constrained.

// Pattern for motion-safe from TodoItem.tsx:
className="motion-safe:animate-fade-in"
// FOLLOW SAME PATTERN for any dialog animations
```

### What This Story Does NOT Include

- **No keyboard navigation improvements** — Story 3.2
- **No screen reader announcements** — Story 3.2
- **No ARIA attribute additions** — Story 3.2
- **No E2E tests** — Story 3.3
- **No Docker changes** — Story 3.4
- **No new components** — only modifications to existing ones

### Anti-Patterns to Avoid

- **Do NOT use JavaScript for responsive detection** — use CSS media queries and Tailwind
- **Do NOT use `window.innerWidth` or resize listeners** — Tailwind handles everything
- **Do NOT change the single-column layout** — no multi-column on desktop
- **Do NOT add width-based breakpoints for hover behavior** — use `@media (hover: hover)`
- **Do NOT change typography scale across breakpoints** — type sizes stay the same

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive & Accessibility section]
- [Source: _bmad-output/planning-artifacts/architecture.md — Single breakpoint at 768px]
- [Source: frontend/src/components/DeleteButton.tsx — Current broken @media inline]
- [Source: frontend/src/components/ConfirmDialog.tsx — Currently no responsive behavior]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
