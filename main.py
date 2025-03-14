from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from utils import Player, Room, ROOMS_LOCK, ROOMS

app = FastAPI()

# Zwraca status serwerow i ilosc obecnych pokoi
@app.get("/")
async def root():
    return {"status": True, "rooms": len(ROOMS)}

# Tworzy nowy pokój i zwraca do niego pin
@app.post("/create_room")
async def create_room():
    room = Room()
    async with ROOMS_LOCK:
        ROOMS[room.pin] = room
    return {"PIN": room.get_pin()}

# Dołącza gracza do pokoju
@app.websocket("/ws/{pin}")
async def websocket_endpoint(websocket: WebSocket, pin: int):
    await websocket.accept()

    try:
        # Odbieranie ID gracza
        auth_data = await websocket.receive_json()
        player_id = auth_data.get("player_id")

        if not player_id:
            await websocket.close(code=4000)
            return

        # Znajdowanie pokoju
        async with ROOMS_LOCK:
            room = ROOMS.get(pin, None)
            if not room:
                await websocket.send_json({"error": "Room not found"})
                await websocket.close(code=4001)
                return

        # Weryfikacja
        async with room.lock:
            if player_id in room.players:
                await websocket.send_json({"error": "Room already connected"})
                await websocket.close(code=4002)
                return

            if room.is_full():
                await websocket.send_json({"error": "Room full"})
                await websocket.close(code=4003)

            # dodawanie gracza
            player = Player(id=player_id, websocket=websocket)
            room.add_player(player)

    except WebSocketDisconnect:
        return
    except Exception as e:
        print(f"Init error: {e}")
        await websocket.close(code=4004)
        return

    # główna pętla komunikacyjna
    try:
        while True:
            data = await websocket.receive_json()

            async with room.lock:
                for p in room.players.values():
                    if p.id != player_id:
                        await p.websocket.send_json(data)

    except WebSocketDisconnect:
        async with room.lock:
            room.remove_player(player_id)

            # automatyczne usuwanie pokoi
            async with ROOMS_LOCK:
                if len(room.players) == 0:
                    del ROOMS[pin]

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await websocket.close()