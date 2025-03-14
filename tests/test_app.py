import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi import WebSocket, WebSocketDisconnect
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
    assert  1000 <= room_data['PIN'] <= 9999   # Sprawdzamy, czy pin jest poprawnym 4 cyfrowym intem


# Test połączenia WebSocket
@pytest.mark.asyncio
async def test_websocket_connection(client):
    # Najpierw tworzymy pokój
    response = client.post("/create_room")
    pin = response.json()["PIN"]

    # Łączymy dwóch klientów do pokoju (graczy)
    with client.websocket_connect(f"/ws/{pin}") as websocket_1:
        with client.websocket_connect(f"/ws/{pin}") as websocket_2:
            # Sprawdzamy czy połączenie się udało
            assert websocket_1 is not None
            assert websocket_2 is not None

            # Test przesyłania wiadomości
            websocket_1.send_text('{"Test": True}')

            # Sprawdzanie odbierania wiadomości
            message = websocket_2.receive_text()
            assert message == '{"Test": True}'