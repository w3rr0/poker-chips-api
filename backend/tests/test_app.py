import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.utils import ROOMS, generate_unique_pin, delete_room, Room, LAST_DISCONNECTED, Player, del_from_last_disconnected
from unittest.mock import MagicMock
from starlette.websockets import WebSocket


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


@pytest.mark.asyncio
async def test_delete_from_last_disconnected():
    pin = 123456
    player_id = "abc"
    username = "test_player"
    amount = 1000
    putted = 0
    websocket = MagicMock(spec=WebSocket)
    player = Player(id=player_id, username=username, amount=amount, putted=putted, websocket=websocket)
    LAST_DISCONNECTED[pin] = {player_id: player}
    assert pin in LAST_DISCONNECTED
    await del_from_last_disconnected(player_id=player_id, pin=pin)
    assert pin not in LAST_DISCONNECTED