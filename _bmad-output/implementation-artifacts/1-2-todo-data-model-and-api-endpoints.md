# Story 1.2: Todo Data Model and API Endpoints

Status: ready-for-dev

## Story

As a user,
I want to create todos and retrieve my full list via a backend API,
So that my todos are stored durably and survive page refreshes and server restarts.

## Acceptance Criteria (BDD)

### AC1: Database migration creates the todos table
**Given** the database is running
**When** the backend starts
**Then** Alembic migrations run automatically (entrypoint script) creating the `todos` table with columns: `id` (UUID, PK, default `gen_random_uuid()`), `description` (TEXT, NOT NULL), `completed` (BOOLEAN, NOT NULL, default false), `created_at` (TIMESTAMPTZ, NOT NULL, default now()), `updated_at` (TIMESTAMPTZ, NOT NULL, default now())

### AC2: GET /api/todos returns all todos
**Given** no todos exist
**When** I send `GET /api/todos`
**Then** I receive a `200` response with an empty JSON array `[]`

**Given** a todo with description "Buy milk" exists
**When** I send `GET /api/todos`
**Then** I receive a `200` response containing the todo in the array

### AC3: POST /api/todos creates a todo
**Given** I send `POST /api/todos` with body `{ "description": "Buy milk" }`
**When** the request is processed
**Then** I receive a `201` response with the full todo object: `{ "id": "<uuid>", "description": "Buy milk", "completed": false, "createdAt": "<iso8601>", "updatedAt": "<iso8601>" }`
**And** the response uses camelCase field names (Pydantic alias_generator)
**And** the todo is persisted in the database

### AC4: POST /api/todos validates input
**Given** I send `POST /api/todos` with an empty body or `{ "description": "" }` or `{ "description": "   " }`
**When** the request is processed
**Then** I receive a `400` response with `{ "detail": "Description cannot be empty", "code": "VALIDATION_ERROR" }`

### AC5: POST /api/todos enforces 50-item limit
**Given** 50 todos exist in the database
**When** I send `POST /api/todos` with `{ "description": "One more" }`
**Then** I receive a `400` response with `{ "detail": "Todo limit reached. Delete or complete some items to add more.", "code": "VALIDATION_ERROR" }`

### AC6: Backend follows layered architecture
**Given** the backend service layer
**When** I inspect the code structure
**Then** CRUD operations flow through `routers/todos.py` → `services/todo_service.py` → `models/todo.py` (never router → model directly)
**And** todo description text is never logged (NFR8)
**And** backend integration tests exist in `tests/routers/test_todos.py` and `tests/services/test_todo_service.py` covering all endpoints and the limit check

## Tasks / Subtasks

- [ ] Task 1: Create Todo SQLAlchemy model (AC: #1)
  - [ ] 1.1 Implement `app/models/todo.py` with SQLAlchemy 2.0 declarative model
  - [ ] 1.2 Define columns: `id` (UUID, PK, server_default=`gen_random_uuid()`), `description` (Text, NOT NULL), `completed` (Boolean, NOT NULL, default False), `created_at` (TIMESTAMPTZ, NOT NULL, server_default=now()), `updated_at` (TIMESTAMPTZ, NOT NULL, server_default=now(), onupdate=now())
  - [ ] 1.3 Import `Todo` model in `app/models/__init__.py`
  - [ ] 1.4 Import `Base` from `app.database` in `alembic/env.py` so Alembic sees the model metadata

- [ ] Task 2: Generate and apply Alembic migration (AC: #1)
  - [ ] 2.1 Run `alembic revision --autogenerate -m "create_todos_table"` to generate migration
  - [ ] 2.2 Verify migration file creates the `todos` table with all columns and correct types
  - [ ] 2.3 Run `alembic upgrade head` to apply migration
  - [ ] 2.4 Verify table exists in PostgreSQL with correct schema

- [ ] Task 3: Create Pydantic schemas (AC: #3, #4)
  - [ ] 3.1 Implement `app/schemas/todo.py` with `TodoCreate`, `TodoResponse`, and `TodoUpdate` schemas
  - [ ] 3.2 Configure `TodoResponse` with `alias_generator = to_camel` for camelCase JSON output
  - [ ] 3.3 Configure `model_config` with `populate_by_name = True` and `from_attributes = True`
  - [ ] 3.4 Add description validation: strip whitespace, reject empty strings
  - [ ] 3.5 Export schemas in `app/schemas/__init__.py`

- [ ] Task 4: Implement todo service layer (AC: #2, #3, #4, #5, #6)
  - [ ] 4.1 Create `app/services/todo_service.py` with async functions
  - [ ] 4.2 Implement `get_todos(db)` — returns all todos ordered by `created_at` desc
  - [ ] 4.3 Implement `create_todo(db, todo_create)` — validates limit, creates, returns todo
  - [ ] 4.4 Implement `get_todo_count(db)` — helper for limit check
  - [ ] 4.5 Add `MAX_TODOS = 50` constant
  - [ ] 4.6 Ensure todo description text is never logged

- [ ] Task 5: Implement todos router (AC: #2, #3, #4, #5, #6)
  - [ ] 5.1 Create `app/routers/todos.py` with FastAPI APIRouter
  - [ ] 5.2 Implement `GET /api/todos` — calls service, returns `list[TodoResponse]`
  - [ ] 5.3 Implement `POST /api/todos` — calls service, returns `TodoResponse` with 201 status
  - [ ] 5.4 Return structured error responses: `{ "detail": "message", "code": "VALIDATION_ERROR" }`
  - [ ] 5.5 Register todos router in `app/main.py` with `/api` prefix

- [ ] Task 6: Write backend integration tests (AC: #6)
  - [ ] 6.1 Set up test database configuration in `tests/conftest.py` (isolated test DB or in-memory)
  - [ ] 6.2 Create async test client fixture using `httpx.AsyncClient`
  - [ ] 6.3 Write `tests/routers/test_todos.py`:
    - GET /api/todos returns empty array
    - GET /api/todos returns existing todos
    - POST /api/todos creates todo with valid description
    - POST /api/todos rejects empty description
    - POST /api/todos rejects whitespace-only description
    - POST /api/todos enforces 50-item limit
    - Response uses camelCase field names
  - [ ] 6.4 Write `tests/services/test_todo_service.py`:
    - get_todos returns all todos
    - create_todo creates and returns todo
    - create_todo rejects empty description
    - create_todo enforces limit
    - get_todo_count returns correct count

- [ ] Task 7: Verify end-to-end (AC: #1, #2, #3, #4, #5)
  - [ ] 7.1 Start services with `docker compose up`
  - [ ] 7.2 Verify migration runs automatically on backend start
  - [ ] 7.3 Test full CRUD flow via curl or httpie

## Dev Notes

### Architecture Compliance

This story builds on **Story 1.1** (project scaffolding). It creates the data layer and the first two API endpoints. The backend layered architecture (`router → service → model`) is established here and must be followed exactly for all subsequent stories.

#### Critical Architecture Constraints

1. **Layered architecture is mandatory**: `routers/todos.py` calls `services/todo_service.py`, which calls `models/todo.py`. Routers NEVER import models directly.

2. **Pydantic camelCase output**: Use `alias_generator = to_camel` from `pydantic.alias_generators` on response schemas. Python code stays snake_case; JSON output is camelCase.

3. **Error response format**: All errors must return `{ "detail": "message", "code": "ERROR_CODE" }`. Use a custom exception or FastAPI `HTTPException` with a dict body.

4. **UUID primary keys**: Use `gen_random_uuid()` as server default (PostgreSQL function). Do NOT generate UUIDs in Python.

5. **No content logging**: Never log todo description text (NFR8). Log operations and errors but redact content.

### Key Implementation Details

#### SQLAlchemy Todo Model

```python
# app/models/todo.py
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Text, text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=datetime.utcnow
    )
```

#### Pydantic Schemas

```python
# app/schemas/todo.py
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator
from pydantic.alias_generators import to_camel

class TodoCreate(BaseModel):
    description: str

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()

class TodoUpdate(BaseModel):
    completed: bool | None = None

class TodoResponse(BaseModel):
    id: UUID
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "alias_generator": to_camel,
        "populate_by_name": True,
    }
```

#### Todo Service

```python
# app/services/todo_service.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.todo import Todo
from app.schemas.todo import TodoCreate

MAX_TODOS = 50

async def get_todos(db: AsyncSession) -> list[Todo]:
    result = await db.execute(
        select(Todo).order_by(Todo.created_at.desc())
    )
    return list(result.scalars().all())

async def create_todo(db: AsyncSession, todo_data: TodoCreate) -> Todo:
    count = await get_todo_count(db)
    if count >= MAX_TODOS:
        raise ValueError("Todo limit reached. Delete or complete some items to add more.")

    todo = Todo(description=todo_data.description)
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    return todo

async def get_todo_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Todo.id)))
    return result.scalar_one()
```

#### Todos Router

```python
# app/routers/todos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.todo import TodoCreate, TodoResponse
from app.services import todo_service

router = APIRouter()

@router.get("/todos", response_model=list[TodoResponse])
async def list_todos(db: AsyncSession = Depends(get_db)):
    return await todo_service.get_todos(db)

@router.post("/todos", response_model=TodoResponse, status_code=201)
async def create_todo(todo_data: TodoCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await todo_service.create_todo(db, todo_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={
            "detail": str(e),
            "code": "VALIDATION_ERROR"
        })
```

#### Error Response Handling

For Pydantic validation errors (empty description), override FastAPI's default validation error handler to return the standard format:

```python
# In app/main.py
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": "Description cannot be empty", "code": "VALIDATION_ERROR"}
    )
```

### What This Story Does NOT Include

- **No PATCH endpoint** (toggle completion) — that's Story 2.1
- **No DELETE endpoint** — that's Story 2.2
- **No frontend code** — Stories 1.3, 1.4, 1.5 handle the frontend
- **No Playwright or E2E tests** — Story 3.3
- **No enhanced health check with DB status** — Story 3.4

### Anti-Patterns to Avoid

- **Do NOT create tables directly with SQL** — always use Alembic migrations
- **Do NOT use synchronous SQLAlchemy** — must be fully async
- **Do NOT put business logic in routers** — service layer handles validation and limit checks
- **Do NOT return snake_case JSON** — Pydantic alias_generator must convert to camelCase
- **Do NOT use `psycopg2`** — use `asyncpg` driver
- **Do NOT log todo descriptions** — redact user content from all logs
- **Do NOT use wrapper objects in responses** — return `Todo` or `Todo[]` directly

### References

- [Source: architecture.md — Data Architecture](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — API & Communication Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: architecture.md — Implementation Patterns](../_bmad-output/planning-artifacts/architecture.md)
- [Source: epics.md — Story 1.2 Acceptance Criteria](../_bmad-output/planning-artifacts/epics.md)

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
