import random
from typing import Dict, List
from pydantic import BaseModel
from starlette.websockets import WebSocket
import asyncio

class Player(BaseModel):
    id: str                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów
    websocket: WebSocket

    # def define(self, player_id: int, username: str, amount: int):
    #     self.id = player_id
    #     self.username = username
    #     self.amount = amount
    #
    # # ustawia wartosc żetonów posiadanych przez gracza
    # def set_amount(self, amount: int) -> None:
    #     self.amount = amount
    #
    # # Ustawia id gracza
    # def set_id(self, player_id: int) -> None:
    #     self.id = player_id
    #
    # # Ustawia nazwe gracza
    # def set_username(self, username: str) -> None:
    #     self.username = username


class Room(BaseModel):
    pin: int
    limit: int = 4
    players: Dict[str, WebSocket] = {}  # klucz id gracza
    lock: asyncio.Lock = asyncio.Lock()

    def is_full(self) -> bool:
        return len(self.players) >= self.limit

    def add_player(self, player: Player) -> None:
        if player.id in self.players:
            raise ValueError("Player already in room")
        self.players[player.id] = player

    def remove_player(self, player_id: str) -> None:
        if player_id in self.players:
            del self.players[player_id]

    # def get_pin(self) -> int:
    #     return self.pin
    #
    # def get_limit(self) -> int:
    #     return self.limit
    #
    # def get_players(self) -> List[WebSocket]:
    #     return self.players

ROOMS: Dict[int, Room] = {}     # Zawiera słownik par pin i obiekt pokoju
ROOMS_LOCK = asyncio.Lock()