import uuid
from typing import Dict, List
from pydantic import BaseModel, PrivateAttr
from starlette.websockets import WebSocket
import asyncio

class RoomCreateRequest(BaseModel):
    max_players: int


class AuthData(BaseModel):
    player_id: str
    username: str
    amount: int
    putted: int


class Player(BaseModel):
    id: str                     # Unique player ID
    username: str               # Player username
    amount: int                 # Total value
    putted: int                 # Value on board
    websocket: WebSocket

    class Config:
        arbitrary_types_allowed = True      # Allows using websocket in pytest
        exclude = {"websocket"}


class Room(BaseModel):
    pin: int                            # Room pin
    max_players: int                    # Maximum number of players at once
    players: Dict[str, Player] = {}     # Dict of player ID and player object
    putted: int                         # Total value on board
    _lock: asyncio.Lock = PrivateAttr(default_factory=asyncio.Lock) # asyncio.Lock objects are not serializable (explicitly defined). They must be private to pass pedantic validations

    class Config:
        arbitrary_types_allowed = True      # Allows types like asyncio.Lock to be used in pytest

    # Check weather room is full
    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

    # Check weather room is empty
    def is_empty(self) -> bool:
        return len(self.players) == 0

    # Add player to the room
    def add_player(self, player: Player) -> None:
        if player.id in self.players:
            raise ValueError("Player already in room")
        self.players[player.id] = player

    # Remove player from the room
    async def remove_player(self, player_id: str) -> None:
        if player_id in self.players:
            async with DISCONNECTED_LOCK:
                if self.pin in LAST_DISCONNECTED:
                    LAST_DISCONNECTED[self.pin][player_id] = self.players[player_id]
                else:
                    LAST_DISCONNECTED[self.pin] = {player_id: self.players[player_id]}
                del self.players[player_id]

    # Return the current players list
    def current_players(self) -> List[Dict]:
        current_players = [
            {"id": p.id, "username": p.username, "amount": p.amount}
            for p in self.players.values()
        ]
        return current_players

    # Send an updated players list to all players
    async def update_players(self) -> None:
        for player in self.players.values():
            await player.websocket.send_json({
                "type": "players_update",
                "players": self.current_players(),
                "putted": self.putted,
                "maxPlayers": self.max_players
            })

    # Player claims all tokens on board
    async def claim_all(self, player_id: str) -> None:
        winner = self.players[player_id]
        win: int = self.putted
        winner.amount += win
        self.putted = 0
        if win:
            for player in self.players.values():
                await player.websocket.send_json({
                    "type": "claim_all",
                    "players": self.current_players(),
                })
                await player.websocket.send_json({
                    "type": "message",
                    "content": f"{winner.username} collected ${win}",
                    "senderId": "system-win"
                })


ROOMS: Dict[int, Room] = {}     # Dict containing a room pin and room object
ROOMS_LOCK = asyncio.Lock()

MAX_ROOMS: int = 100            # Maximum number of rooms at once

LAST_DISCONNECTED: Dict[int, Dict[str, Player]] = {}   # Dict containing a room pin and Player object list
DISCONNECTED_LOCK = asyncio.Lock()


# Generate unique PIN
def generate_unique_pin(max_attempts: int = MAX_ROOMS*100) -> int:
    for attempt in range(max_attempts):
        pin = uuid.uuid4().int % 1_000_000
        if pin >= 100_000 and pin not in ROOMS:
            return pin
    raise RuntimeError("No available PINs")

# Delete room after delay
async def delete_room(pin: int) -> None:
    await asyncio.sleep(5)

    async with ROOMS_LOCK:
        if pin in ROOMS and ROOMS[pin].is_empty():
            del ROOMS[pin]
            print(f"Auto delete room {pin}")
