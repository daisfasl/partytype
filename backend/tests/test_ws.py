from fastapi.testclient import TestClient
from app.main import app
from app.schemas.payloads import *
from pydantic import TypeAdapter
import pytest
import json

tc = TestClient(app)

def test_ws():
    with tc.websocket_connect("/ws/party/testroom/player1") as ws:
        ws.send_text('{"type":"join","payload":{}}')
        msg = ws.receive_text()
        assert msg

def test_payloads():
   payload1 = {"type":"start",
               "player_id":"test"}
   payload1 = TypeAdapter(Payload).validate_python(payload1)
   match payload1:
       case StartPayload():
           pass
       case _:
           pytest.fail()

        
