from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from utils import Player, Room, ROOMS

app = FastAPI()

# Zwraca status serwerow i ilosc obecnych pokoi
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
