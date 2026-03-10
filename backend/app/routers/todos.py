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
        raise HTTPException(
            status_code=400,
            detail={"detail": str(e), "code": "VALIDATION_ERROR"},
        )
