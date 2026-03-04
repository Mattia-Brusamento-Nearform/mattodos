---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - docs/Product Requirement Document (PRD) for the Todo App.md
  - docs/Technical Requirements.md
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document — mattodos

**Author:** Mattia
**Date:** 2026-03-04

## Executive Summary

mattodos is a full-stack todo application built as a learning project to practice end-to-end software development using the BMAD Method. Users can create, view, complete, and delete personal tasks through a minimal, zero-friction interface that requires no onboarding or explanation.

The scope is deliberately constrained to core CRUD operations on todo items (description, completion status, creation timestamp). This intentional minimalism keeps the focus on engineering quality: clean architecture, solid patterns, and an extensible foundation rather than feature breadth. Authentication, collaboration, prioritization, deadlines, and notifications are explicitly excluded from v1.

### What Makes This Special

This isn't about building a better todo app — it's about building a todo app *right*. The product's simplicity is the point: by keeping scope dead simple, the project becomes a proving ground for disciplined full-stack engineering practices and the complete BMAD workflow. The architecture should be clean enough that adding auth, multi-user support, or advanced features later requires addition, not refactoring.

## Project Classification

- **Project Type:** Web App (full-stack SPA)
- **Domain:** General / Productivity (task management)
- **Complexity:** Low
- **Project Context:** Greenfield — no existing codebase

## Success Criteria

### User Success

- A first-time user can add, view, complete, and delete a todo within 30 seconds — no onboarding needed.
- Completed tasks are instantly distinguishable from active tasks at a glance.
- Actions reflect immediately in the UI without waiting for server confirmation.
- The interface works equally well on desktop and mobile.
- Empty, loading, and error states are handled gracefully — the user never sees a broken screen.

### Business Success

- The BMAD Method is followed end-to-end: PRD → Architecture → Epics/Stories → Sprint Planning → Implementation → Review.
- The codebase is clean enough to serve as a portfolio piece — well-structured, readable, following established patterns.
- The architecture is genuinely extensible: adding auth, multi-user, or new features (e.g., due dates) requires addition, not refactoring.
- The project demonstrates disciplined engineering on a simple problem.

### Technical Success

- API response times under 200ms for all CRUD operations under normal conditions.
- Data persists reliably across page refreshes, browser restarts, and sessions.
- A developer unfamiliar with the codebase can read the architecture and add a feature (e.g., due dates) without restructuring existing code.
- Failures are caught and communicated on both client and server — never swallowed silently.

### Measurable Outcomes

| Metric | Target |
|---|---|
| Time to first completed action (new user) | < 30 seconds |
| API response time (p95) | < 200ms |
| Data persistence across sessions | 100% reliability |
| Mobile usability | Full feature parity with desktop |
| New feature addition (by unfamiliar dev) | No refactoring required |
| Test coverage | ≥ 70% meaningful coverage |
| E2E tests | ≥ 5 passing Playwright tests |
| Docker deployment | Runs via `docker-compose up` |
| Accessibility | Zero critical WCAG violations |

## Product Scope & Phased Development

### MVP Strategy

**Approach:** Problem-solving MVP — deliver the smallest product that proves the core concept works end-to-end: a user can manage personal todos with zero friction, full persistence, and instant feedback.

**Resource:** Solo developer (Mattia). BMAD Method provides the structure and discipline typically supplied by a team.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Morning planning session (add todos, review existing)
- End-of-day review (complete todos, clean up list)
- Edge case handling (validation, limits, errors)

**Must-Have Capabilities:**
- Create a todo with text description → instant UI feedback, background sync
- View all todos on load → persisted state from previous session
- Toggle completion status → optimistic update with visual distinction
- Delete a todo with confirmation prompt → hard delete, no undo
- Input validation: reject empty todos silently
- Max todo limit (50) with clear messaging
- API error state with retry option
- Empty state, loading state, error state
- Responsive layout (desktop + mobile)
- WCAG 2.1 AA baseline accessibility

### Phase 2 — Growth

- User authentication and accounts
- Due dates and reminders
- Task prioritization / ordering
- Filtering and search
- Multiple lists or categories

### Phase 3 — Vision

- Multi-user collaboration and shared lists
- Notifications (push, email)
- Recurring tasks
- Integrations (calendar, Slack, etc.)
- Offline-first with sync

### Risk Mitigation

**Technical:** Optimistic UI with rollback is the most complex piece — potential for subtle bugs when sync fails. **Mitigation:** Implement a clear, testable pattern early. Write explicit tests for sync failure → rollback → error display. Keep rollback logic isolated and well-documented.

**Market:** None — learning project, not a market play. Success is measured by engineering quality and process discipline.

**Resource:** Solo developer means no parallelization. **Mitigation:** BMAD sprint planning keeps work sequenced. The firm scope line means nothing gets added — the MVP ships as defined or not at all.

## User Journeys

### Journey 1: Marco's Morning Planning Session

**Marco** is a developer who keeps a simple list of what he needs to get done. Every morning with his coffee, he opens mattodos on his laptop.

**Opening Scene:** Marco opens the app and immediately sees yesterday's remaining todos — two incomplete items and three finished ones (visually faded). No login, no splash screen, no loading spinner that lasts more than a blink.

**Rising Action:** He triages. One completed todo is clutter — he deletes it. He types a new one: "Review PR for auth module." Enter. It appears instantly. He adds two more: "Update API docs" and "Fix flaky test in CI." Type, enter, done.

**Climax:** In under 60 seconds, Marco has a clean, current list for the day. No friction, no decisions about priority or categories. Just a list of things to do.

**Resolution:** Marco minimizes the tab and starts working. His list is ready when he needs it.

**Requirements revealed:** Instant load with persisted state, fast keyboard-driven creation, immediate UI feedback, visual distinction between active/completed, delete capability.

---

### Journey 2: Marco's End-of-Day Review

**Opening Scene:** 6 PM. Marco switches back to his mattodos tab. His list shows 5 items — 2 from yesterday plus 3 from this morning.

**Rising Action:** He completed the PR review and docs update. He clicks each to mark complete — they shift to "done" state instantly. The flaky test fix stays active. He deletes a stale item from yesterday. A confirmation asks "Delete this todo?" — he confirms.

**Climax:** His list shows a clean picture: 3 completed today, 1 remaining for tomorrow. At a glance — what he accomplished and what carried over.

**Resolution:** Marco closes his laptop. Tomorrow morning, this exact state will be waiting.

**Requirements revealed:** Toggle completion status, visual completed state, delete with confirmation, data persistence across sessions, status-at-a-glance.

---

### Journey 3: Marco Hits the Edge Cases

**Scenario A — Empty todo:** Marco hits Enter with an empty field. Nothing happens — no error, no modal. The input stays focused.

**Scenario B — Max todos reached:** At 50 todos, a clear message appears: "Todo limit reached. Delete or complete some items to add more."

**Scenario C — API is down:** The app shows: "Unable to load your todos. Please try again." with a retry option. Retry works when the API recovers.

**Scenario D — Accidental delete:** A confirmation prompt catches the fat-finger: "Delete 'Deploy to production'?" Cancel saves it. Confirm deletes it — no undo.

**Requirements revealed:** Input validation, max todo limit with messaging, error state with retry, delete confirmation, graceful degradation.

---

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Instant load with persisted data | Journey 1, 2, 3C |
| Fast keyboard-driven todo creation | Journey 1 |
| Toggle completion status | Journey 2 |
| Visual distinction: active vs completed | Journey 1, 2 |
| Delete with confirmation prompt | Journey 2, 3D |
| Input validation (no empty todos) | Journey 3A |
| Max todo limit with messaging | Journey 3B |
| API error state with retry | Journey 3C |
| Data persistence across sessions | Journey 1, 2 |
| Responsive (desktop + mobile) | All journeys |

## Web App Technical Requirements

mattodos is a Single Page Application (SPA) with a RESTful backend API. The frontend handles all state client-side, communicating with the backend exclusively through API calls. The architecture prioritizes instant feedback through optimistic UI updates with background server synchronization.

### Architecture Decisions

- **Application Type:** SPA — single HTML entry point, client-side routing, no server-side rendering
- **Browser Support:** Modern evergreen browsers only — Chrome, Firefox, Safari, Edge (latest 2 versions)
- **SEO:** Not required — no public-facing content
- **Real-time Strategy:** Optimistic UI updates — reflect changes immediately, sync asynchronously. On sync failure, revert UI and display error.
- **Accessibility:** WCAG 2.1 Level AA baseline — keyboard navigation, screen reader support, color contrast, focus management.

### Responsive Design

- **Desktop:** Primary experience — comfortable list view, keyboard-driven interaction
- **Mobile:** Full feature parity — touch-friendly targets, responsive layout, no horizontal scrolling
- **Breakpoints:** Mobile-first with a single breakpoint (~768px) — two layouts sufficient

### Implementation Constraints

- **State Management:** Simple client-side state — the todo list is the entire app state. No complex state trees needed.
- **Error Handling:** Optimistic updates require rollback logic — if server rejects a change, revert UI and notify user.
- **Offline Behavior:** Not required. If API is unreachable, show error state with retry. No service worker needed.
- **Build & Deploy:** Standard SPA build pipeline — bundled static assets served independently from the API.

## Functional Requirements

### Todo Management

- **FR1:** User can create a new todo by entering a text description
- **FR2:** User can view all existing todos in a single list upon opening the app
- **FR3:** User can mark a todo as complete
- **FR4:** User can mark a completed todo as incomplete (toggle)
- **FR5:** User can delete a todo after confirming the action
- **FR6:** Each todo stores a text description, completion status, and creation timestamp

### Input Validation & Limits

- **FR7:** System prevents creation of a todo with an empty or whitespace-only description
- **FR8:** System enforces a maximum of 50 total todos (active + completed)
- **FR9:** System displays a clear message when the todo limit is reached

### Visual Status & Feedback

- **FR10:** System visually distinguishes completed todos from active todos
- **FR11:** System provides immediate visual feedback when a todo is created, completed, or deleted (optimistic UI)
- **FR12:** System reverts the UI and displays an error if a background sync operation fails

### Application States

- **FR13:** System displays an empty state when no todos exist
- **FR14:** System displays a loading state while initially fetching todos
- **FR15:** System displays an error state with a retry option when the API is unreachable
- **FR16:** System displays a confirmation prompt before deleting a todo

### Data Persistence

- **FR17:** System persists all todos via a backend API
- **FR18:** System loads the user's complete todo list from the backend on each app open
- **FR19:** All todo changes (create, complete, delete) are synchronized to the backend

### Operational

- **FR25:** Backend exposes a health check endpoint reporting service status

### Responsive Experience

- **FR20:** System provides a usable interface on desktop screen sizes
- **FR21:** System provides a usable interface on mobile screen sizes with touch-friendly targets
- **FR22:** System supports keyboard-driven todo creation (type and Enter to submit)

### Accessibility

- **FR23:** System supports keyboard navigation for all interactive elements
- **FR24:** System provides screen reader-compatible markup for todos and their states

## Non-Functional Requirements

### Performance

- **NFR1:** First contentful paint in < 2 seconds on a standard broadband connection
- **NFR2:** Optimistic UI updates render in < 50ms after user action
- **NFR3:** API response times (all CRUD endpoints) < 200ms at p95
- **NFR4:** Frontend bundle size remains minimal — no unnecessary dependencies
- **NFR5:** Page remains responsive (no jank) with 50 todos rendered

### Security

- **NFR6:** All client-server communication over HTTPS
- **NFR7:** API inputs validated and sanitized server-side to prevent injection attacks
- **NFR8:** Todo text treated as private — no logging of user content
- **NFR9:** API follows least-privilege principles — endpoints expose only necessary operations

### Reliability

- **NFR10:** Data persists durably — todos survive server restarts
- **NFR11:** Optimistic UI rollback correctly reverts state on sync failure 100% of the time
- **NFR12:** Application handles API unavailability gracefully without data corruption

### Accessibility

- **NFR13:** WCAG 2.1 Level AA compliance for all interactive elements
- **NFR14:** All functionality reachable via keyboard alone
- **NFR15:** Color contrast ratios meet AA minimums (4.5:1 normal text, 3:1 large text)
- **NFR16:** Screen readers can identify todo items, their states, and all controls

### Maintainability

- **NFR17:** Codebase follows consistent patterns — a new developer can understand the architecture without guidance
- **NFR18:** Adding a new todo field (e.g., due date) requires changes only in predictable locations — no shotgun surgery
- **NFR19:** Frontend and backend are independently deployable
- **NFR20:** Code structured to support automated testing at unit and integration levels

### Testing

- **NFR21:** Unit and integration tests use Jest or Vitest; test commands configured in `package.json`
- **NFR22:** E2E tests use Playwright — minimum 5 passing tests covering create, complete, delete, empty state, and error handling
- **NFR23:** Backend integration tests written alongside each API endpoint; frontend component tests written alongside each component
- **NFR24:** Minimum 70% meaningful code coverage across the project

### Containerization & Deployment

- **NFR25:** Application runs successfully via `docker-compose up`
- **NFR26:** Dockerfiles use multi-stage builds, non-root users, and health check instructions
- **NFR27:** Docker Compose orchestrates all containers with proper networking, volumes, and environment configuration
- **NFR28:** Dev and test environments supported via environment variables and compose profiles

### Documentation

- **NFR29:** README with setup instructions and how to run the application
- **NFR30:** AI integration log documenting agent usage, limitations, and learnings throughout development
