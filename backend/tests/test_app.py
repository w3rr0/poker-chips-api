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


TEST_PLAYER: Player = Player(
    id="abc",
    username="test_player",
    amount=1000,
    putted=0,
    websocket=MagicMock(spec=WebSocket)
)

TEST_ROOM: Room = Room(
    pin=123456,
    max_players=4,
    putted=0,
)


def test_generate_unique_pin():
    pin = generate_unique_pin()
    assert isinstance(pin, int)
    assert 100000 <= pin <= 999999
    assert pin not in ROOMS


@pytest.mark.asyncio
async def test_delete_room():
    ROOMS[TEST_ROOM.pin] = TEST_ROOM
    assert TEST_ROOM.pin in ROOMS
    await delete_room(TEST_ROOM.pin)
    assert TEST_ROOM.pin not in ROOMS


@pytest.mark.asyncio
async def test_delete_from_last_disconnected():
    LAST_DISCONNECTED[TEST_ROOM.pin] = {TEST_PLAYER.id: TEST_PLAYER}
    assert TEST_ROOM.pin in LAST_DISCONNECTED
    await del_from_last_disconnected(player_id=TEST_PLAYER.id, pin=TEST_ROOM.pin)
    assert TEST_ROOM.pin not in LAST_DISCONNECTED
