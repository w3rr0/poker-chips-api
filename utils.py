import uuid
from typing import Dict
from pydantic import BaseModel
from starlette.websockets import WebSocket
import asyncio

class AuthData(BaseModel):
    player_id: str
    username: str
    amount: int

class Player(BaseModel):
    id: str                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów
    websocket: WebSocket


class Room(BaseModel):
    pin: int
    max_players: int = 4
    players: Dict[str, Player] = {}  # Unikatowy klucz id gracza

    # Asynchronous lock - only one task at a time can modify the resource
    def __init__(self, **data):
        super().__init__(**data)
        self.lock = asyncio.Lock()

    # Sprawdza czy pokoj jest zapelniony
    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

    # dodaje gracza do pokoju
    def add_player(self, player: Player) -> None:
        if player.id in self.players:
            raise ValueError("Player already in room")
        self.players[player.id] = player

    def remove_player(self, player_id: str) -> None:
        if player_id in self.players:
            del self.players[player_id]


ROOMS: Dict[int, Room] = {}     # Zawiera słownik par pin i obiekt pokoju
ROOMS_LOCK = asyncio.Lock()

MAX_ROOMS: int = 100

def generate_unique_pin(max_attempts: int = MAX_ROOMS*100) -> int:
    for attempt in range(max_attempts):
        pin = int(f"{uuid.uuid4().int % 10_000_000:06d}")
        if pin not in ROOMS:
            return pin
    raise RuntimeError("No available PINs")