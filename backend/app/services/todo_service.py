import logging

from sqlalchemy import func, select
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
