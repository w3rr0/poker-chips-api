import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

# Test tworzenia pokoju
def test_create_room(client):
    response = client.post("/create_room")
    assert response.status_code == 200
    room_data = response.json()
    assert 'PIN' in room_data
    assert 100000 <= room_data['PIN'] <= 999999  # Sprawdzamy, czy PIN jest 6-cyfrowym intem


def test_websocket_connection(client):
    response = client.post("/create_room")
    pin = response.json()["PIN"]

    # Gracz 1
    with client.websocket_connect(f"/ws/{pin}") as ws1:
        ws1.send_json({
            "player_id": "player1",
            "username": "Gracz 1",
            "amount": 1000
        })

        # Gracz 2
        with client.websocket_connect(f"/ws/{pin}") as ws2:
            ws2.send_json({
                "player_id": "player2",
                "username": "Gracz 2",
                "amount": 2000
            })

            # Test komunikacji
            test_msg = {"action": "bet", "value": 100}
            ws1.send_json(test_msg)

            # Odbierz wiadomość
            response = ws2.receive_json()
            assert response == test_msg