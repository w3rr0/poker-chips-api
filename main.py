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



    async with ROOMS_LOCK:
        if pin not in ROOMS:
            await websocket.send_json({"error": "Room not found"})
            await websocket.close(code=4000)
            return

        room = ROOMS[pin]
        players = room.get_players()

    # porównuje instancje obiektu które są unikalne dla każdego połączenia
    # Nigdy nie będzie True, nawet dla tego samego użytkownika
    # TODO: Wprowdzić unikalne id graczy i po nich sprawdzać
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
    except Exception as e:
        print(f"Unexpected error: {e}")
        room.players.remove(websocket)
