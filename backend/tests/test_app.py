import pytest
from fastapi.testclient import TestClient
from backend.main import app, check_player, root, create_room, check_room
from backend.utils import ROOMS, generate_unique_pin, delete_room, Room, LAST_DISCONNECTED, Player, del_from_last_disconnected, RoomCreateRequest
from unittest.mock import MagicMock
from starlette.websockets import WebSocket, WebSocketDisconnect


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

TEST_PLAYER_2: Player = Player(
    id="def",
    username="test_player_2",
    amount=0,
    putted=1000,
    websocket=MagicMock(spec=WebSocket)
)

TEST_ROOM: Room = Room(
    pin=123456,
    max_players=2,
    putted=0,
)


@pytest.mark.asyncio
async def test_root(client):
    response = await root()
    assert response == {
        "status": True,
        "rooms": len(ROOMS)
    }


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


@pytest.mark.asyncio
async def test_check_player():
    response = await check_player(player_id=TEST_PLAYER.id, pin=TEST_ROOM.pin)
    assert not response["found"]
    LAST_DISCONNECTED[TEST_ROOM.pin] = {TEST_PLAYER.id: TEST_PLAYER}
    response = await check_player(player_id=TEST_PLAYER.id, pin=TEST_ROOM.pin)
    assert response["found"]
    assert response["player"] == {
        "username": TEST_PLAYER.username,
        "id": TEST_PLAYER.id,
        "amount": TEST_PLAYER.amount,
        "putted": TEST_PLAYER.putted
    }


@pytest.mark.asyncio
async def test_create_room(client):
    assert len(ROOMS) == 0
    response = await create_room(RoomCreateRequest(max_players=4))
    assert len(ROOMS) == 1
    assert response["PIN"] in ROOMS


@pytest.mark.asyncio
async def test_check_room(client):
    response = await check_room(pin=TEST_ROOM.pin)
    assert "allow" in response
    assert "room_status" in response
    assert not response["allow"]
    assert response["room_status"] == "Room not found"
    ROOMS[TEST_ROOM.pin] = TEST_ROOM
    response = await check_room(pin=TEST_ROOM.pin)
    assert response["allow"]
    assert response["room_status"] == "Ready to join"
    TEST_ROOM.add_player(TEST_PLAYER)
    TEST_ROOM.add_player(TEST_PLAYER_2)
    response = await check_room(pin=TEST_ROOM.pin)
    assert not response["allow"]
    assert response["room_status"] == "Room is full"
    del ROOMS[TEST_ROOM.pin]


@pytest.mark.asyncio
async def test_websocket_endpoint_disconnect_4001(client):
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/ws/{TEST_ROOM.pin}") as websocket:
            pass    # We shouldn't get here, the connection should be closed immediately
    assert exc.value.code == 4001
