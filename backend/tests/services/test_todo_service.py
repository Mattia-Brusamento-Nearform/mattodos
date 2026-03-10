import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.todo import TodoCreate
from app.services.todo_service import MAX_TODOS, create_todo, get_todo_count, get_todos


@pytest.mark.asyncio
async def test_get_todos_empty(db_session: AsyncSession):
    todos = await get_todos(db_session)
    assert todos == []


@pytest.mark.asyncio
async def test_create_and_get_todos(db_session: AsyncSession):
    todo_data = TodoCreate(description="Test todo")
    created = await create_todo(db_session, todo_data)

    assert created.description == "Test todo"
    assert created.completed is False
    assert created.id is not None

    todos = await get_todos(db_session)
    assert len(todos) == 1
    assert todos[0].description == "Test todo"


@pytest.mark.asyncio
async def test_get_todo_count(db_session: AsyncSession):
    assert await get_todo_count(db_session) == 0

    await create_todo(db_session, TodoCreate(description="Todo 1"))
    assert await get_todo_count(db_session) == 1

    await create_todo(db_session, TodoCreate(description="Todo 2"))
    assert await get_todo_count(db_session) == 2


@pytest.mark.asyncio
async def test_create_todo_limit(db_session: AsyncSession):
    for i in range(MAX_TODOS):
        await create_todo(db_session, TodoCreate(description=f"Todo {i}"))

    with pytest.raises(ValueError, match="Todo limit reached"):
        await create_todo(db_session, TodoCreate(description="One more"))
