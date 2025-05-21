import asyncio
from time import sleep

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.utils import ROOMS, generate_unique_pin, delete_room, Room


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


def test_generate_unique_pin():
    pin = generate_unique_pin()
    assert isinstance(pin, int)
    assert 100000 <= pin <= 999999
    assert pin not in ROOMS


@pytest.mark.asyncio
async def test_delete_room():
    pin = 123456
    max_players = 4
    putted = 0
    room = Room(pin=pin, max_players=max_players, putted=putted)
    ROOMS[pin] = room
    assert pin in ROOMS
    await delete_room(pin)
    assert pin not in ROOMS



# Creating room
def test_create_room(client):
    ROOMS.clear()
    response = client.post("/create_room", json={"max_players": 4})
    assert response.status_code == 200
    room_data = response.json()
    assert 'PIN' in room_data
    assert isinstance(room_data["PIN"], int)
    assert 100000 <= room_data["PIN"] <= 999999  # Sprawdzamy, czy PIN jest 6-cyfrowym intem


def test_websocket_connection(client):
    response = client.post("/create_room")
    pin = response.json()["PIN"]

    # Gracz 1
    with client.websocket_connect(f"/ws/{pin}") as ws1:
        ws1.send_json({
            "player_id": "player1",
            "username": "Gracz 1",
            "amount": 1000
        })

        # Gracz 2
        with client.websocket_connect(f"/ws/{pin}") as ws2:
            ws2.send_json({
                "player_id": "player2",
                "username": "Gracz 2",
                "amount": 2000
            })

            # Test komunikacji
            test_msg = {"action": "bet", "value": 100}
            ws1.send_json(test_msg)

            # Odbierz wiadomość
            response = ws2.receive_json()
            assert response == test_msg