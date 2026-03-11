# Story 1.3: Frontend Shell and Design System

Status: done

## Story

As a user,
I want to see the mattodos interface with the "Warm & Personal" design when I open the app,
So that the app feels intentional, polished, and ready to use.

## Acceptance Criteria (BDD)

### AC1: Page layout and design system
**Given** the app loads at `http://localhost:3000`
**When** I view the page
**Then** I see the page title "mattodos" (`text-2xl font-semibold`) and subtitle "Your tasks, your pace." (`text-sm text-stone-500`)
**And** the page has a warm stone background (`bg-stone-50`) with a centered white card (`bg-white`, `rounded-2xl`, warm shadow, `max-w-[560px]`)
**And** the card contains an input area at the top and a list area below

### AC2: TypeScript type definitions
**Given** the type definitions
**When** I inspect `src/types/todo.ts`
**Then** the `Todo` type includes `id`, `description`, `completed`, `createdAt`, `updatedAt`, `optimistic?`, and `error?` fields
**And** the `AppState` type includes `todos: Todo[]`, `loading: boolean`, and `error: string | null`

### AC3: API client module
**Given** the API client
**When** I inspect `src/services/api.ts`
**Then** it exports functions: `getTodos()`, `createTodo(description)`, `toggleTodo(id, completed)`, `deleteTodo(id)`
**And** all HTTP calls go through this single module
**And** errors are caught and thrown as typed errors

### AC4: useTodos hook with initial actions
**Given** the `useTodos` hook in `src/hooks/useTodos.ts`
**When** I inspect its implementation
**Then** it uses `useReducer` with action types: `LOAD_TODOS`, `LOAD_TODOS_SUCCESS`, `LOAD_TODOS_FAILURE`, `CREATE_TODO`, `CREATE_TODO_SUCCESS`, `CREATE_TODO_FAILURE`, and `CLEAR_ERROR`
**And** it exposes `state` (AppState) and action functions (`createTodo`, `loadTodos`)

### AC5: App mounts and loads todos
**Given** the App component
**When** it mounts
**Then** it calls `loadTodos()` from the `useTodos` hook

## Tasks / Subtasks

- [ ] Task 1: Define TypeScript types (AC: #2)
  - [ ] 1.1 Create `src/types/todo.ts` with `Todo` type: `id: string`, `description: string`, `completed: boolean`, `createdAt: string`, `updatedAt: string`, `optimistic?: boolean`, `error?: string`
  - [ ] 1.2 Define `AppState` type: `todos: Todo[]`, `loading: boolean`, `error: string | null`
  - [ ] 1.3 Define all reducer action types: `LOAD_TODOS`, `LOAD_TODOS_SUCCESS`, `LOAD_TODOS_FAILURE`, `CREATE_TODO`, `CREATE_TODO_SUCCESS`, `CREATE_TODO_FAILURE`, `TOGGLE_TODO`, `TOGGLE_TODO_SUCCESS`, `TOGGLE_TODO_FAILURE`, `DELETE_TODO`, `DELETE_TODO_SUCCESS`, `DELETE_TODO_FAILURE`, `CLEAR_ERROR`
  - [ ] 1.4 Define discriminated union `Action` type for all actions

- [ ] Task 2: Implement API client (AC: #3)
  - [ ] 2.1 Create `src/services/api.ts` with base URL configuration
  - [ ] 2.2 Implement `getTodos(): Promise<Todo[]>` — `GET /api/todos`
  - [ ] 2.3 Implement `createTodo(description: string): Promise<Todo>` — `POST /api/todos`
  - [ ] 2.4 Implement `toggleTodo(id: string, completed: boolean): Promise<Todo>` — `PATCH /api/todos/{id}`
  - [ ] 2.5 Implement `deleteTodo(id: string): Promise<void>` — `DELETE /api/todos/{id}`
  - [ ] 2.6 Implement error handling: parse error response `{ detail, code }`, throw typed errors
  - [ ] 2.7 Write `src/services/api.test.ts` — tests for all endpoints and error handling (mocked fetch)

- [ ] Task 3: Implement useTodos hook (AC: #4)
  - [ ] 3.1 Create `src/hooks/useTodos.ts` with `useReducer`
  - [ ] 3.2 Implement reducer with initial action types: `LOAD_TODOS`, `LOAD_TODOS_SUCCESS`, `LOAD_TODOS_FAILURE`, `CREATE_TODO`, `CREATE_TODO_SUCCESS`, `CREATE_TODO_FAILURE`, `CLEAR_ERROR`
  - [ ] 3.3 Implement `loadTodos()` — dispatches LOAD_TODOS, calls `api.getTodos()`, dispatches success/failure
  - [ ] 3.4 Implement `createTodo(description)` — dispatches CREATE_TODO (optimistic), calls `api.createTodo()`, dispatches success/failure
  - [ ] 3.5 Define initial state: `{ todos: [], loading: true, error: null }`
  - [ ] 3.6 Return `{ state, createTodo, loadTodos }` from hook
  - [ ] 3.7 Write `src/hooks/useTodos.test.ts` — tests for all reducer actions and async flows

- [ ] Task 4: Implement useAutoFocus hook (AC: #5)
  - [ ] 4.1 Create `src/hooks/useAutoFocus.ts` — accepts a ref, calls `.focus()` on mount
  - [ ] 4.2 Handle focus restoration after create operations

- [ ] Task 5: Build page layout and App component (AC: #1, #5)
  - [ ] 5.1 Update `src/App.tsx`:
    - Warm stone background (`bg-stone-50 min-h-screen`)
    - Centered container (`max-w-[560px] mx-auto px-4 py-8`)
    - Title "mattodos" (`text-2xl font-semibold text-stone-900`)
    - Subtitle "Your tasks, your pace." (`text-sm text-stone-500`)
    - White card container (`bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden`)
    - Input area placeholder at top of card
    - List area placeholder below input
  - [ ] 5.2 Call `useTodos()` in App, call `loadTodos()` on mount via `useEffect`
  - [ ] 5.3 Remove default Vite boilerplate (App.css, logo, counter)
  - [ ] 5.4 Update `src/index.css` — keep `@import "tailwindcss"`, remove Vite default styles
  - [ ] 5.5 Write `src/App.test.tsx` — tests for layout rendering and loadTodos call on mount

- [ ] Task 6: Create placeholder components (AC: #1)
  - [ ] 6.1 Create `src/components/TodoInput.tsx` — placeholder with styled input field
  - [ ] 6.2 Create `src/components/AppStateDisplay.tsx` — placeholder for loading/empty/error states
  - [ ] 6.3 Ensure components are wired into App but with minimal implementation (detailed in Stories 1.4 and 1.5)

- [ ] Task 7: Configure test setup (AC: #2, #3, #4)
  - [ ] 7.1 Create `src/test-setup.ts` with `@testing-library/jest-dom` imports
  - [ ] 7.2 Verify `npm test` runs and passes all tests

## Dev Notes

### Architecture Compliance

This story builds on **Story 1.1** (scaffolding) and establishes the frontend architecture. It creates the foundational layers: types, API client, state management hook, and the visual shell. Stories 1.4 and 1.5 build on this foundation.

#### Critical Architecture Constraints

1. **Frontend layers must be respected**: Component → Hook → Service. Components NEVER call `api.ts` directly.

2. **Single API client**: All HTTP calls go through `src/services/api.ts`. No `fetch()` calls anywhere else.

3. **useReducer, not useState or external libs**: State management uses React's `useReducer` with typed actions. No Redux, Zustand, Jotai, or any external state library.

4. **Immutable state updates**: The reducer must always return new state objects. Never mutate existing state. Use spread operator or `Array.filter`/`Array.map`.

5. **No business logic in components**: Components receive data and callbacks from hooks. Optimistic update logic lives in `useTodos`.

6. **Co-located tests**: Test files live next to the code they test (`TodoInput.test.tsx` next to `TodoInput.tsx`).

### Key Implementation Details

#### Type Definitions

```typescript
// src/types/todo.ts
export type Todo = {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  optimistic?: boolean;  // true while awaiting server confirmation
  error?: string;        // per-item error message
};

export type AppState = {
  todos: Todo[];
  loading: boolean;
  error: string | null;  // global error (initial load failure)
};

export type Action =
  | { type: 'LOAD_TODOS' }
  | { type: 'LOAD_TODOS_SUCCESS'; payload: Todo[] }
  | { type: 'LOAD_TODOS_FAILURE'; payload: string }
  | { type: 'CREATE_TODO'; payload: { tempId: string; description: string } }
  | { type: 'CREATE_TODO_SUCCESS'; payload: { tempId: string; todo: Todo } }
  | { type: 'CREATE_TODO_FAILURE'; payload: { tempId: string; error: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO_SUCCESS'; payload: Todo }
  | { type: 'TOGGLE_TODO_FAILURE'; payload: { id: string; error: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO_SUCCESS'; payload: { id: string } }
  | { type: 'DELETE_TODO_FAILURE'; payload: { id: string; todo: Todo; error: string } }
  | { type: 'CLEAR_ERROR'; payload?: { id: string } };
```

#### API Client

```typescript
// src/services/api.ts
const BASE_URL = '/api';

export type ApiError = {
  detail: string;
  code: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    }));
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${BASE_URL}/todos`);
    return handleResponse<Todo[]>(response);
  },

  async createTodo(description: string): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    return handleResponse<Todo>(response);
  },

  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return handleResponse<Todo>(response);
  },

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
```

#### useTodos Hook (initial — create + load only in this story)

```typescript
// src/hooks/useTodos.ts
import { useReducer, useCallback } from 'react';
import { api } from '../services/api';
import type { AppState, Action, Todo } from '../types/todo';

const initialState: AppState = {
  todos: [],
  loading: true,
  error: null,
};

function todoReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_TODOS':
      return { ...state, loading: true, error: null };
    case 'LOAD_TODOS_SUCCESS':
      return { ...state, loading: false, todos: action.payload };
    case 'LOAD_TODOS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_TODO':
      return {
        ...state,
        todos: [
          {
            id: action.payload.tempId,
            description: action.payload.description,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            optimistic: true,
          },
          ...state.todos,
        ],
      };
    case 'CREATE_TODO_SUCCESS':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.tempId ? action.payload.todo : t
        ),
      };
    case 'CREATE_TODO_FAILURE':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.tempId),
      };
    case 'CLEAR_ERROR':
      if (action.payload?.id) {
        return {
          ...state,
          todos: state.todos.map((t) =>
            t.id === action.payload!.id ? { ...t, error: undefined } : t
          ),
        };
      }
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useTodos() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const loadTodos = useCallback(async () => {
    dispatch({ type: 'LOAD_TODOS' });
    try {
      const todos = await api.getTodos();
      dispatch({ type: 'LOAD_TODOS_SUCCESS', payload: todos });
    } catch {
      dispatch({ type: 'LOAD_TODOS_FAILURE', payload: 'Unable to load your todos' });
    }
  }, []);

  const createTodo = useCallback(async (description: string): Promise<string | null> => {
    const tempId = crypto.randomUUID();
    dispatch({ type: 'CREATE_TODO', payload: { tempId, description } });
    try {
      const todo = await api.createTodo(description);
      dispatch({ type: 'CREATE_TODO_SUCCESS', payload: { tempId, todo } });
      return null;
    } catch {
      dispatch({ type: 'CREATE_TODO_FAILURE', payload: { tempId, error: "Couldn't save that — try again" } });
      return description; // return original text for input restoration
    }
  }, []);

  return { state, loadTodos, createTodo };
}
```

#### App Component Layout

```tsx
// src/App.tsx
import { useEffect } from 'react';
import { useTodos } from './hooks/useTodos';

function App() {
  const { state, loadTodos, createTodo } = useTodos();

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return (
    <div className="bg-stone-50 min-h-screen">
      <main className="max-w-[560px] mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">mattodos</h1>
          <p className="text-sm text-stone-500">Your tasks, your pace.</p>
        </header>
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(28,25,23,0.06)] overflow-hidden">
          {/* TodoInput will go here — Story 1.4 */}
          {/* AppStateDisplay / TodoList will go here — Story 1.5 */}
        </div>
      </main>
    </div>
  );
}

export default App;
```

#### Design System — Warm & Personal (Direction 4)

| Token | Tailwind Class | Value |
|---|---|---|
| Page background | `bg-stone-50` | Warm off-white |
| Card surface | `bg-white` | Pure white |
| Card radius | `rounded-2xl` | 20px border radius |
| Card shadow | `shadow-[0_2px_12px_rgba(28,25,23,0.06)]` | Warm subtle shadow |
| Primary text | `text-stone-900` | Near-black warm |
| Secondary text | `text-stone-500` | Muted warm gray |
| Success/check | `text-green-600` | Checkmark color |
| Error | `text-red-600` | Error text |
| Error background | `bg-red-50` | Light red surface |
| Max width | `max-w-[560px]` | Card container width |
| Spacing grid | 4px increments | Tailwind default |

### What This Story Does NOT Include

- **No TodoInput submit behavior** — Story 1.4 adds Enter-to-submit, optimistic UI, and animations
- **No TodoItem, TodoCheckbox, DeleteButton, ConfirmDialog** — Epic 2 stories
- **No loading skeleton, empty state, or error state rendering** — Story 1.5
- **No TOGGLE or DELETE reducer actions implementation** — Epic 2 stories
- **No responsive layout** — Story 3.1
- **No accessibility attributes** — Story 3.2

### Anti-Patterns to Avoid

- **Do NOT use any external state management library** — `useReducer` only
- **Do NOT use `any` type in TypeScript** — always define proper types
- **Do NOT call `fetch()` from components** — always go through `api.ts` → `useTodos`
- **Do NOT use CSS modules or styled-components** — Tailwind CSS only
- **Do NOT add `tailwind.config.js`** — Tailwind v4 uses the Vite plugin
- **Do NOT install a component library** (MUI, Chakra, etc.)
- **Do NOT put business logic in components** — logic lives in hooks and services

### References

- [Source: architecture.md — Frontend Architecture](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — State Management Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Implementation Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: ux-design-specification.md — Design System](../_bmad-output/planning-artifacts/ux-design-specification.md)
- [Source: epics.md — Story 1.3 Acceptance Criteria](../_bmad-output/planning-artifacts/epics.md)

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
