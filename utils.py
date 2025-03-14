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
    players: Dict[str, Player] = {}  # klucz id gracza
    lock: asyncio.Lock = asyncio.Lock()

    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

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

def generate_unique_pin() -> int:
    while True:
        pin = int(f"{uuid.uuid4().int % 10_000_000:06d}")
        if pin not in ROOMS:
            return pin