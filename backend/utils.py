import uuid
from typing import Dict
from pydantic import BaseModel, PrivateAttr
from starlette.websockets import WebSocket
import asyncio

class AuthData(BaseModel):
    player_id: str
    username: str
    amount: int
    putted: int

class Player(BaseModel):
    id: str                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów
    putted: int             # żetony postawione przez gracza
    websocket: WebSocket

    class Config:
        arbitrary_types_allowed = True      # Pozwala na uzycie WebSocket w pytest


class Room(BaseModel):
    pin: int
    max_players: int
    players: Dict[str, Player] = {}     # Unikatowy klucz id gracza
    putted: int                         # Łączna wartość żetonów na stole
    _lock: asyncio.Lock = PrivateAttr(default_factory=asyncio.Lock) # obiekty asyncio.Lock nie są serializowane (jawnie zdefiniowane), czyli muszą być prywatne aby przeszły walidacje pydantic

    class Config:
        arbitrary_types_allowed = True      # Polzwala na uzycie typow takich jak asyncio.Lock w pytest

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

    async def update_players(self) -> None:
        current_players = []
        for p in self.players.values():
            current_players.append({"id": p.id, "username": p.username, "amount": p.amount})
        for player in self.players.values():
            await player.websocket.send_json({
                "type": "players_update",
                "players": current_players,
                "putted": self.putted,
                "maxPlayers": self.max_players
            })


ROOMS: Dict[int, Room] = {}     # Zawiera słownik par pin i obiekt pokoju
ROOMS_LOCK = asyncio.Lock()

MAX_ROOMS: int = 100

def generate_unique_pin(max_attempts: int = MAX_ROOMS*100) -> int:
    for attempt in range(max_attempts):
        pin = uuid.uuid4().int % 1_000_000
        if pin >= 100_000 and pin not in ROOMS:
            return pin
    raise RuntimeError("No available PINs")

def update_players(room: Room) -> None:
    current_players = [
        {"id": p.id, "username": p.username, "amount": p.amount}
        for p in room.players.values()
    ]
    for player in room.players.values():
        player.websocket.send_json({
            "type": "players_update",
            #"players": [p.model_dump() for p in room.players.values()],
            "players": current_players,
            "putted": room.putted
        })
