from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from backend.utils import Player, Room, ROOMS_LOCK, ROOMS, LAST_DISCONNECTED, DISCONNECTED_LOCK, generate_unique_pin, AuthData, MAX_ROOMS, RoomCreateRequest, delete_room
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pydantic import ValidationError
import asyncio

app = FastAPI()

# Load environment variables
env = load_dotenv()
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
allow_credentials = os.getenv("ALLOW_CREDENTIALS", False) or os.getenv("ALLOW_CREDENTIALS", "False").lower() == "true"
allowed_methods = os.getenv("ALLOWED_METHODS", "*").split(",")
allowed_headers = os.getenv("ALLOWED_HEADERS", "*").split(",")
expose_headers = os.getenv("EXPOSE_HEADERS", "*").split(",")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,     # type: ignore
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=allowed_methods,
    allow_headers=allowed_headers,
    expose_headers=expose_headers,
)


# Check server status and current amount of room
@app.get(
    "/",
    summary="Server status check",
    description="Check server status and current amount of room")
async def root():
    """
    Check server status and current amount of room
    :return: Dictionary with status (true if server is running), and number of active rooms
    :rtype: dict
    """
    print(f"ROOMS: {len(ROOMS)}")
    return {"status": True, "rooms": len(ROOMS)}


# Create a new room and returns pin
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


# Check whether room is available
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


# Join player to the room
@app.websocket("/ws/{pin}")
async def websocket_endpoint(websocket: WebSocket, pin: int):
    print(f"🔵 Starting connection for room {pin}")

    # Finding room
    async with ROOMS_LOCK:
        room = ROOMS.get(pin, None)
        if not room:
            print(f"Room not found: {pin}")
            await websocket.close(code=4001)
            return

    await websocket.accept()
    print(f"🟢 WebSocket accepted for room {pin}")

    try:
        # Receiving player data
        print("🕒 Waiting for auth data...")
        raw_data = await websocket.receive_json()
        print(f"Received data: {raw_data}")
        try:
            auth_data = AuthData(**raw_data)
        except ValidationError as e:
            print(f"Auth Data Validation Error: {e}")
            await websocket.send_json({"error": "Invalid auth data: " + str(e.errors())})
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

        # Verification
        async with room._lock:

            if player_id in room.players:
                await websocket.send_json({"error": "Player already connected"})
                await websocket.close(code=4002)
                return

            if room.is_full():
                await websocket.send_json({"error": "Room full"})
                await websocket.close(code=4003)
                return

            print("Joining player starts")
            # Joining player
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
                for p in list(room.players.values()):
                    await p.websocket.send_json({
                        "type": "message",
                        "content": f"{player.username} joined room",
                        "senderId": "system-join"
                    })
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

    # Main communication loop
    try:
        while True:
            data = await websocket.receive_json()
            print(f"MESSAGE: Received data: {data}")

            async with room._lock:
                if data.get("type") == "put_token":
                    ROOMS[pin].putted += data["content"]
                    ROOMS[pin].players[data["playerId"]].amount -= data["content"]
                    ROOMS[pin].players[data["playerId"]].putted += data["content"]
                    await room.update_players()

                if data.get("type") == "claim_all":
                    await room.claim_all(data["playerId"])

                for p in list(room.players.values()):
                    try:
                        await p.websocket.send_json(data)
                        print(f"Player {p.id}: {p}, sending {data}")
                    except (WebSocketDisconnect, RuntimeError):
                        print(f"WebSocket disconnected for room {p.id}")
                        await room.remove_player(p.id)

    except WebSocketDisconnect:
        async with room._lock:
            print(f"Player {player_id} disconnected")
            await room.remove_player(player_id)
            await room.update_players()
            for p in list(room.players.values()):
                await p.websocket.send_json({
                    "type": "message",
                    "content": f"{player.username} left room",
                    "senderId": "system-left"
                })

            # Delete room automatically
            async with ROOMS_LOCK:
                if pin in ROOMS and ROOMS[pin].is_empty():
                    asyncio.create_task(delete_room(pin))

    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        await websocket.close()
        print(f"WebSocket closed for room {pin}")


# Check whether room is available
@app.get("/check_player/{player_id}/{pin}")
async def check_player(player_id: str, pin: int):
    async with DISCONNECTED_LOCK:
        if pin in LAST_DISCONNECTED:
            if player_id in LAST_DISCONNECTED[pin]:
                player = LAST_DISCONNECTED[pin].pop(player_id, None)
            if len(LAST_DISCONNECTED[pin]) == 0:
                del LAST_DISCONNECTED[pin]
            return {"found": True, "player": {
                "username": player.username,
                "id": player.id,
                "amount": player.amount,
                "putted": player.putted
            }}
        else:
            return {"found": False}
