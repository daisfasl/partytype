from fastapi.testclient import TestClient
from app.main import app

tc = TestClient(app)

def test_ws():
    with tc.websocket_connect("/ws/party/testroom/player1") as ws:
        ws.send_text('{"type":"join","payload":{}}')
        msg = ws.receive_text()
        assert msg