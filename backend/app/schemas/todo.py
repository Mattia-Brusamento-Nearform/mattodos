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
