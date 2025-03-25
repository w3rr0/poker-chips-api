from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from backend.utils import Player, Room, ROOMS_LOCK, ROOMS, generate_unique_pin, AuthData, MAX_ROOMS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Zwraca status serwerow i ilosc obecnych pokoi
@app.get("/")
async def root():
    print(f"ROOMS: {len(ROOMS)}")
    return {"status": True, "rooms": len(ROOMS)}

# Tworzy nowy pokój i zwraca do niego pin
@app.post("/create_room")
async def create_room(max_players: int = 4):
    async with ROOMS_LOCK:
        if len(ROOMS) >= MAX_ROOMS:
            return {"error": "Server room limit reached"}
        pin = generate_unique_pin()
        room = Room(pin=pin, max_players=max_players)
        ROOMS[pin] = room
        print(f"Created new room {pin}")
    return {"PIN": room.pin}

# Dołącza gracza do pokoju
@app.websocket("/ws/{pin}")
async def websocket_endpoint(websocket: WebSocket, pin: int):
    print(f"🔵 Starting connection for room {pin}")
    await websocket.accept()
    print(f"🟢 WebSocket accepted for room {pin}")

    try:
        # Odbieranie ID gracza
        print("🕒 Waiting for auth data...")
        raw_data = await websocket.receive_json()
        print(f"Received data: {raw_data}")
        auth_data = AuthData(**raw_data)
        print(f"Auth Data: {auth_data}")

        player_id = auth_data.player_id
        username = auth_data.username
        amount = auth_data.amount

        if not player_id:
            await websocket.close(code=4000)
            return

        # Znajdowanie pokoju
        async with ROOMS_LOCK:
            room = ROOMS.get(pin, None)
            print(f"znaleziono pokoj: {room}")
            if not room:
                await websocket.send_json({"error": "Room not found"})
                await websocket.close(code=4001)
                return

        # Weryfikacja
        async with room._lock:
            if player_id in room.players:
                await websocket.send_json({"error": "Player already connected"})
                await websocket.close(code=4002)
                return

            if room.is_full():
                await websocket.send_json({"error": "Room full"})
                await websocket.close(code=4003)
                return

            print("rozpoczyna dodawanie gracza")
            # dodawanie gracza
            player = Player(
                id=player_id,
                username=username,
                amount=amount,
                websocket=websocket
            )
            print(f"Player {player_id}: {player}")
            try:
                print("trying to add player")
                room.add_player(player)
                current_players = []
                for p in room.players.values():
                    current_players.append({"id": p.id, "username": p.username, "amount": p.amount})
                await websocket.send_json({"players": current_players})
                print("player added")
            except ValueError as e:
                await websocket.send_json({"error": str(e)})
                print("value error, closing websocket")
                await websocket.close()
                return

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for room {pin}")
        return
    except Exception as e:
        print(f"Init error: {e}")
        await websocket.close(code=4004)
        return

    # główna pętla komunikacyjna
    try:
        while True:
            data = await websocket.receive_json()
            print(f"MESSAGE: Received data: {data}")

            async with room._lock:
                for p in list(room.players.values()):   # Kopia listy zamiast oryginalnej dla bezpieczenstwa
                    if p.id != player_id:
                        try:
                            await p.websocket.send_json(data)
                            print(f"Player {p.id}: {p}, sending {data}")
                        except (WebSocketDisconnect, RuntimeError):
                            print(f"WebSocket disconnected for room {p.id}")
                            room.remove_player(p.id)

    except WebSocketDisconnect:
        async with room._lock:
            print(f"Player {player_id} disconnected")
            room.remove_player(player_id)

            # automatyczne usuwanie pokoi
            async with ROOMS_LOCK:
                if pin in ROOMS and len(ROOMS[pin].players) == 0:
                    del ROOMS[pin]
                    print(f"Auto delete room {pin}")

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await websocket.close()
        print(f"WebSocket closed for room {pin}")