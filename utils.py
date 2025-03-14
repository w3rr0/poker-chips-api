import uuid
from typing import Dict
from pydantic import BaseModel
from starlette.websockets import WebSocket
import asyncio

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

def generate_unique_pin() -> int:
    while True:
        pin = int(str(uuid.uuid4().int)[:4])
        if pin not in ROOMS:
            return pin