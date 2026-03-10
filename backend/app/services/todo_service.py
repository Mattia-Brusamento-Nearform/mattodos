import logging

from sqlalchemy import func, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate

logger = logging.getLogger(__name__)

MAX_TODOS = 50


async def get_todos(db: AsyncSession) -> list[Todo]:
    result = await db.execute(select(Todo).order_by(Todo.created_at.desc()))
    return list(result.scalars().all())


async def create_todo(db: AsyncSession, todo_data: TodoCreate) -> Todo:
    count = await get_todo_count(db)
    if count >= MAX_TODOS:
        raise ValueError(
            "Todo limit reached. Delete or complete some items to add more."
        )

    todo = Todo(description=todo_data.description)
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    logger.info("Todo created (id=%s)", todo.id)
    return todo


async def get_todo_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Todo.id)))
    return result.scalar_one()


async def get_todo_by_id(db: AsyncSession, todo_id) -> Todo:
    """Fetch a todo by ID, raise ValueError if not found."""
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    todo = result.scalar_one_or_none()
    if not todo:
        raise ValueError(f"Todo not found")
    return todo


async def toggle_todo(db: AsyncSession, todo_id, todo_data) -> Todo:
    """Toggle the completed status of a todo."""
    todo = await get_todo_by_id(db, todo_id)
    if todo_data.completed is not None:
        todo.completed = todo_data.completed
    await db.commit()
    await db.refresh(todo)
    logger.info("Todo toggled (id=%s)", todo.id)
    return todo


async def delete_todo(db: AsyncSession, todo_id) -> None:
    """Delete a todo by ID."""
    # Verify the todo exists first
    await get_todo_by_id(db, todo_id)
    # Delete it
    stmt = delete(Todo).where(Todo.id == todo_id)
    await db.execute(stmt)
    await db.commit()
    logger.info("Todo deleted (id=%s)", todo_id)