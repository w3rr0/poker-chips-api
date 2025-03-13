import pytest
from fastapi.testclient import TestClient
from fastapi import WebSocket
from main import app


# Używamy TestClient do testowania WebSocketów w FastAPI
@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


# Test tworzenia pokoju
def test_create_room(client):
    response = client.post("/create_room")
    assert response.status_code == 200
    room_data = response.json()
    assert 'PIN' in room_data
    assert  999 < room_data['PIN'] < 10000   # Sprawdzamy, czy pin jest poprawnym 4 cyfrowym intem


# Test połączenia WebSocket
@pytest.mark.asyncio
async def test_websocket_connection(client):
    # Najpierw tworzymy pokój
    response = client.post("/create_room")
    room_id = response.json()["room_id"]

    # Łączymy dwóch klientów do pokoju (graczy)
    websocket_1 = client.websocket_connect(f"/ws/{room_id}")
    websocket_2 = client.websocket_connect(f"/ws/{room_id}")

    # Sprawdzamy, czy połączenie się udało
    assert websocket_1 is not None
    assert websocket_2 is not None

    # Test przesyłania wiadomości
    websocket_1.send_text("Hello from player 1")
    message = websocket_2.receive_text()
    assert message == "Player says: Hello from player 1"

    # Zamykamy połączenia
    websocket_1.close()
    websocket_2.close()