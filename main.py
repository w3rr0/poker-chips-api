from fastapi import FastAPI
import random
from typing import Dict, List
from pydantic import BaseModel
from starlette.websockets import WebSocket, WebSocketDisconnect

app = FastAPI()

class Player(BaseModel):
    id: int                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów

    def define(self, player_id: int, username: str, amount: int):
        self.id = player_id
        self.username = username
        self.amount = amount

    # ustawia wartosc żetonów posiadanych przez gracza
    def set_amount(self, amount: int) -> None:
        self.amount = amount

    # Ustawia id gracza
    def set_id(self, player_id: int) -> None:
        self.id = player_id

    # Ustawia nazwe gracza
    def set_username(self, username: str) -> None:
        self.username = username


class Room:
    def __init__(self):
        # Generowanie nowego pinu i sprawdzanie czy już nie istnieje
        while True:
            p = random.randint(1000, 9999)
            if p not in ROOMS:
                break
        self.pin: int = p
        self.limit: int = 4
        self.players: List[WebSocket] = []

    def get_pin(self) -> int:
        return self.pin

    def get_limit(self) -> int:
        return self.limit

    def get_players(self) -> List[WebSocket]:
        return self.players

ROOMS: Dict[int, Room] = {}     # Zawiera słownik par pin i obiekt pokoju

@app.get("/")
async def root():
    return {"status": True, "rooms": len(ROOMS)}


# Tworzy nowy pokój i zwraca do niego pin
@app.post("/create_room")
async def create_room():
    room = Room()
    ROOMS[room.pin] = room
    return {"PIN": room.get_pin()}

# Dołącza gracza do pokoju
@app.websocket("/ws/{pin}")
async def websocket_endpoint(websocket: WebSocket, pin: int):
    await websocket.accept()
    if pin not in ROOMS:
        await websocket.close()
        return {"message": "Room not found"}

    room = ROOMS[pin]
    players = room.get_players()

    if websocket in players:
        await websocket.close()
        return {"message": "Player already in room"}

    elif len(players) >= room.get_limit():
        await websocket.close()
        return {"message": "Room is full"}

    room.players.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            for player in room.players:
                if player != websocket:
                    await player.send_text(data)
    except WebSocketDisconnect:
        room.players.remove(websocket)
        await websocket.close()
