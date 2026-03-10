import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_todos_empty(client: AsyncClient):
    response = await client.get("/api/todos")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_todo(client: AsyncClient):
    response = await client.post("/api/todos", json={"description": "Buy milk"})
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Buy milk"
    assert data["completed"] is False
    assert "id" in data
    assert "createdAt" in data
    assert "updatedAt" in data


@pytest.mark.asyncio
async def test_get_todos_with_data(client: AsyncClient):
    await client.post("/api/todos", json={"description": "Buy milk"})
    response = await client.get("/api/todos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["description"] == "Buy milk"


@pytest.mark.asyncio
async def test_create_todo_empty_description(client: AsyncClient):
    response = await client.post("/api/todos", json={"description": ""})
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_create_todo_whitespace_description(client: AsyncClient):
    response = await client.post("/api/todos", json={"description": "   "})
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_create_todo_empty_body(client: AsyncClient):
    response = await client.post("/api/todos", json={})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_todo_camelcase_response(client: AsyncClient):
    response = await client.post("/api/todos", json={"description": "Test camelCase"})
    assert response.status_code == 201
    data = response.json()
    assert "createdAt" in data
    assert "updatedAt" in data
    assert "created_at" not in data
    assert "updated_at" not in data


@pytest.mark.asyncio
async def test_create_todo_limit(client: AsyncClient):
    # Create 50 todos
    for i in range(50):
        resp = await client.post("/api/todos", json={"description": f"Todo {i}"})
        assert resp.status_code == 201

    # 51st should fail
    response = await client.post("/api/todos", json={"description": "One more"})
    assert response.status_code == 400
    data = response.json()
    assert "limit" in data["detail"]["detail"].lower()
