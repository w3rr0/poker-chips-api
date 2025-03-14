from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from utils import Player, Room, ROOMS_LOCK, ROOMS, generate_unique_pin, AuthData, MAX_ROOMS

app = FastAPI()

# Zwraca status serwerow i ilosc obecnych pokoi
@app.get("/")
async def root():
    return {"status": True, "rooms": len(ROOMS)}

# Tworzy nowy pokój i zwraca do niego pin
@app.post("/create_room")
async def create_room(max_players: int = 4):
    async with ROOMS_LOCK:
        if len(ROOMS) < MAX_ROOMS:
            return {"error": "Server room limit reached"}
        pin = generate_unique_pin()
        room = Room(pin=pin, max_players=max_players)
        ROOMS[pin] = room
    return {"PIN": room.pin}

# Dołącza gracza do pokoju
@app.websocket("/ws/{pin}")
async def websocket_endpoint(websocket: WebSocket, pin: int):
    await websocket.accept()

    try:
        # Odbieranie ID gracza
        raw_data = await websocket.receive_json()
        auth_data = AuthData(**raw_data)

        player_id = auth_data.player_id
        username = auth_data.username
        amount = auth_data.amount

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
                await websocket.send_json({"error": "Player already connected"})
                await websocket.close(code=4002)
                return

            if room.is_full():
                await websocket.send_json({"error": "Room full"})
                await websocket.close(code=4003)
                return

            # dodawanie gracza
            player = Player(
                id=player_id,
                username=username,
                amount=amount,
                websocket=websocket
            )
            try:
                room.add_player(player)
            except ValueError as e:
                await websocket.send_json({"error": str(e)})
                await websocket.close()
                return

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
                for p in list(room.players.values()):   # Kopia listy zamiast oryginalnej dla bezpieczenstwa
                    if p.id != player_id:
                        try:
                            await p.websocket.send_json(data)
                        except (WebSocketDisconnect, RuntimeError):
                            room.remove_player(p.id)

    except WebSocketDisconnect:
        async with room.lock:
            room.remove_player(player_id)

            # automatyczne usuwanie pokoi
            async with ROOMS_LOCK:
                if pin in ROOMS and len(ROOMS[pin].players) == 0:
                    del ROOMS[pin]

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await websocket.close()