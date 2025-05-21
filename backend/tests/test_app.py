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