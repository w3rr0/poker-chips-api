import uuid
from typing import Dict, List
from pydantic import BaseModel, PrivateAttr
from starlette.websockets import WebSocket
import asyncio


class RoomCreateRequest(BaseModel):
    """
    Request model for creating a new room.
    :param max_players: The Maximum allowed number of players in the room at once.
    """
    max_players: int


class AuthData(BaseModel):
    """
    Request model for player authentication.
    :param player_id: The unique identifier for the player.
    :param username: The username of the player.
    :param amount: The initial amount of chips the player has.
    :param putted: The initial amount of chips the player has putted.
    """
    player_id: str
    username: str
    amount: int
    putted: int


class Player(BaseModel):
    """
    Represents a player in a room.
    :param id: The unique identifier for the player.
    :param username: The username of the player.
    :param amount: The total amount of chips the player has.
    :param putted: The amount of chips the player has putted on the board.
    :param websocket: The WebSocket connection for the player.
    """
    id: str                     # Unique player ID
    username: str               # Player username
    amount: int                 # Total value
    putted: int                 # Value on board
    websocket: WebSocket

    class Config:
        arbitrary_types_allowed = True      # Allows using websocket in pytest
        exclude = {"websocket"}


class Room(BaseModel):
    """
    Represents a game room.
    :param pin: The unique PIN for the room.
    :param max_players: The maximum number of players allowed in the room.
    :param players: A dictionary of players in the room, keyed by player ID.
    :param putted: The total amount of chips currently on the board.
    :param _lock: An asyncio.Lock for synchronizing access to the room data.
    """
    pin: int                            # Room pin
    max_players: int                    # Maximum number of players at once
    players: Dict[str, Player] = {}     # Dict of player ID and player object
    putted: int                         # Total value on board
    _lock: asyncio.Lock = PrivateAttr(default_factory=asyncio.Lock) # asyncio.Lock objects are not serializable (explicitly defined). They must be private to pass pedantic validations

    class Config:
        arbitrary_types_allowed = True      # Allows types like asyncio.Lock to be used in pytest

    # Check whether the room is full
    def is_full(self) -> bool:
        return len(self.players) >= self.max_players

    # Check whether the room is empty
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

            # Add player to LAST_DICONNECTED
            async with DISCONNECTED_LOCK:
                if self.pin in LAST_DISCONNECTED:
                    LAST_DISCONNECTED[self.pin][player_id] = self.players[player_id]
                else:
                    LAST_DISCONNECTED[self.pin] = {player_id: self.players[player_id]}

            # Delete player from the room
            del self.players[player_id]

            # Delete player from LAST_DISCONNECTED after delay
            asyncio.create_task(del_from_last_disconnected(player_id=player_id, pin=self.pin))

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
    """
    Generates a unique 6-digit PIN for a new room.
    :param max_attempts: Max attempts that can be made in order to generate a new pin.
    :return: New pin.
    :rtype: int
    """
    for attempt in range(max_attempts):
        pin = uuid.uuid4().int % 1_000_000
        if pin >= 100_000 and pin not in ROOMS:
            return pin
    raise RuntimeError("No available PINs")

# Delete room after delay
async def delete_room(pin: int) -> None:
    """
    Deletes a room from a room list and last disconnected list after a delay (if the room still exists there),
    otherwise it does nothing.
    :param pin: Room pin.
    :return: None.
    """
    await asyncio.sleep(5)

    # Delete room
    async with ROOMS_LOCK:
        if pin in ROOMS and ROOMS[pin].is_empty():
            del ROOMS[pin]
            print(f"Auto delete room {pin}")

    # Delete room from LAST_DISCONNECTED
    async with DISCONNECTED_LOCK:
        if pin in LAST_DISCONNECTED:
            del LAST_DISCONNECTED[pin]


# Delete player from LAST_DISCONNECTED after delay
async def del_from_last_disconnected(player_id: str, pin: int):
    """
    Delete room from last disconnected after a delay (if the room still exists there).
    :param player_id: Player id.
    :param pin: Room pin.
    :return: None.
    """
    await asyncio.sleep(5)

    async with DISCONNECTED_LOCK:
        if pin in LAST_DISCONNECTED:
            if player_id in LAST_DISCONNECTED[pin]:
                del LAST_DISCONNECTED[pin][player_id]
            if len(LAST_DISCONNECTED[pin]) == 0:
                del LAST_DISCONNECTED[pin]
