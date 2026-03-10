from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate
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
        raise HTTPException(
            status_code=400,
            detail={"detail": str(e), "code": "VALIDATION_ERROR"},
        )


@router.patch("/todos/{todo_id}", response_model=TodoResponse)
async def toggle_todo(todo_id: UUID, todo_data: TodoUpdate, db: AsyncSession = Depends(get_db)):
    try:
        return await todo_service.toggle_todo(db, todo_id, todo_data)
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail={"detail": "Todo not found", "code": "NOT_FOUND"},
        )


@router.delete("/todos/{todo_id}", status_code=204)
async def delete_todo(todo_id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        await todo_service.delete_todo(db, todo_id)
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail={"detail": "Todo not found", "code": "NOT_FOUND"},
        )
