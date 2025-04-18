from fastapi import FastAPI, HTTPException
from starlette.websockets import WebSocket, WebSocketDisconnect
from backend.utils import Player, Room, ROOMS_LOCK, ROOMS, generate_unique_pin, AuthData, MAX_ROOMS, RoomCreateRequest
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
async def create_room(request_data: RoomCreateRequest):
    async with ROOMS_LOCK:
        if len(ROOMS) >= MAX_ROOMS:
            return {"error": "Server room limit reached"}
        new_pin = generate_unique_pin()
        room = Room(pin=new_pin, max_players=request_data.max_players, putted=0)
        ROOMS[new_pin] = room
        print(f"Created new room {new_pin}")
    return {"PIN": room.pin}

# Sprawdza dostępność pokoju
@app.get("/check_room/{pin}")
async def check_room(pin: int):
    async with ROOMS_LOCK:
        if pin in ROOMS:
            room = ROOMS[pin]
            if room.is_full():
                return {"allow": False, "room_status": "Room is full"}
            else:
                return {"allow": True, "room_status": "Ready to join"}
        else:
            return {"allow": False, "room_status": "Room not found"}

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
        try:
            auth_data = AuthData(**raw_data)
        except Exception as validation_error:
            print(f"Auth Data Validation Error: {validation_error}")
            await websocket.send_json({"error": "Invalid auth data"})
            await websocket.close(code=4005)
            return

        print(f"Auth Data: {auth_data}")

        player_id = auth_data.player_id
        username = auth_data.username
        amount = auth_data.amount
        putted = auth_data.putted

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
                putted=putted,
                websocket=websocket
            )
            print(f"Player {player_id}: {player}")
            try:
                print("trying to add player")
                room.add_player(player)
                await room.update_players()
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
                if data.get("type") == "put_token":
                    ROOMS[pin].putted += data["content"]
                    ROOMS[pin].players[data["playerId"]].amount -= data["content"]
                    await room.update_players()

                if data.get("type") == "claim_all":
                    await room.claim_all(data["playerId"])

                for p in list(room.players.values()):   # Kopia listy zamiast oryginalnej dla bezpieczenstwa
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
            await room.update_players()

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