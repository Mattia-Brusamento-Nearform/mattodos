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


@pytest.mark.asyncio
async def test_toggle_todo_complete(client: AsyncClient):
    create_resp = await client.post("/api/todos", json={"description": "Buy milk"})
    todo_id = create_resp.json()["id"]
    
    response = await client.patch(f"/api/todos/{todo_id}", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True
    assert data["description"] == "Buy milk"


@pytest.mark.asyncio
async def test_toggle_todo_incomplete(client: AsyncClient):
    create_resp = await client.post("/api/todos", json={"description": "Buy milk"})
    todo_id = create_resp.json()["id"]
    
    # Toggle to complete
    await client.patch(f"/api/todos/{todo_id}", json={"completed": True})
    
    # Toggle back to incomplete
    response = await client.patch(f"/api/todos/{todo_id}", json={"completed": False})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is False


@pytest.mark.asyncio
async def test_toggle_todo_not_found(client: AsyncClient):
    from uuid import uuid4
    
    response = await client.patch(f"/api/todos/{uuid4()}", json={"completed": True})
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_toggle_updates_timestamp(client: AsyncClient):
    create_resp = await client.post("/api/todos", json={"description": "Buy milk"})
    todo_id = create_resp.json()["id"]
    created_at = create_resp.json()["updatedAt"]
    
    # Wait a moment and update
    import asyncio
    await asyncio.sleep(0.1)
    
    response = await client.patch(f"/api/todos/{todo_id}", json={"completed": True})
    updated_at = response.json()["updatedAt"]
    
    assert updated_at != created_at


@pytest.mark.asyncio
async def test_delete_todo(client: AsyncClient):
    create_resp = await client.post("/api/todos", json={"description": "Buy milk"})
    todo_id = create_resp.json()["id"]
    
    response = await client.delete(f"/api/todos/{todo_id}")
    assert response.status_code == 204
    assert response.content == b""
    
    # Verify todo is gone
    get_resp = await client.get("/api/todos")
    assert get_resp.status_code == 200
    assert len(get_resp.json()) == 0


@pytest.mark.asyncio
async def test_delete_todo_not_found(client: AsyncClient):
    from uuid import uuid4
    
    response = await client.delete(f"/api/todos/{uuid4()}")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_delete_todo_decrements_count(client: AsyncClient):
    # Create 2 todos
    resp1 = await client.post("/api/todos", json={"description": "Todo 1"})
    resp2 = await client.post("/api/todos", json={"description": "Todo 2"})
    
    todo1_id = resp1.json()["id"]
    
    # Delete first one
    delete_resp = await client.delete(f"/api/todos/{todo1_id}")
    assert delete_resp.status_code == 204
    
    # Verify count is 1
    get_resp = await client.get("/api/todos")
    assert len(get_resp.json()) == 1
