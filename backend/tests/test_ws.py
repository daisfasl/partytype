from fastapi.testclient import TestClient
from app.main import app
from app.game.manager import manager
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
               "text":"the quick brown fox"}
   payload1 = TypeAdapter(Payload).validate_python(payload1)
   match payload1:
       case StartPayload():
           pass
       case _:
           pytest.fail()

def test_game_end_payload_leaderboard():
    payload = {"type": "end",
               "leaderboard": [
                   {"player_id": "p1", "wpm": 80.0, "accuracy": 97.0, "rank": 1, "finished": True},
                   {"player_id": "p2", "wpm": 50.0, "accuracy": 90.0, "rank": 2, "finished": False},
               ]}
    payload = TypeAdapter(Payload).validate_python(payload)
    match payload:
        case GameEndPayload():
            assert payload.leaderboard[0].rank == 1
            assert payload.leaderboard[0].finished is True
            assert payload.leaderboard[1].finished is False
        case _:
            pytest.fail()

def _drain_until(ws, predicate):
    for _ in range(20):
        msg = json.loads(ws.receive_text())
        if predicate(msg):
            return msg
    pytest.fail("expected message never arrived")

def test_race_does_not_end_until_all_finished():
    with tc.websocket_connect("/ws/party/create?player_id=p1") as ws1:
        ws1.receive_text()  # join message
        room_msg = json.loads(ws1.receive_text())  # room payload
        room_id = room_msg["room"]

        with tc.websocket_connect(f"/ws/party/{room_id}/p2") as ws2:
            ws1.receive_text()  # join broadcast for p2
            ws2.receive_text()  # join broadcast (self)
            ws2.receive_text()  # room payload
            ws1.receive_text()  # room payload update

            ws1.send_text(json.dumps({"type": "start", "text": "hi there friend"}))
            _drain_until(ws1, lambda m: m.get("type") == "room" and m.get("status") == "active")
            _drain_until(ws2, lambda m: m.get("type") == "room" and m.get("status") == "active")

            ws1.send_text(json.dumps({"type": "finish"}))
            # a lone finisher should be marked finished but not end the race
            msg = _drain_until(ws1, lambda m: m.get("type") == "room" and m["players"]["p1"]["finished"])
            assert msg["status"] == "active"

            # duplicate finish from the same player is a no-op (no duplicate
            # finish_order entry). Follow it with a progress payload (which
            # always broadcasts) as a synchronization marker, since the
            # server processes messages from one connection in order - by
            # the time this room update arrives, the duplicate finish above
            # is guaranteed to have already been handled.
            ws1.send_text(json.dumps({"type": "finish"}))
            ws1.send_text(json.dumps({"type": "progress", "cursor": 1, "completed_words": 0, "correct_chars": 1}))
            _drain_until(ws1, lambda m: m.get("type") == "room" and m["players"]["p1"]["cursor"] == 1)
            assert len(manager.rooms[room_id]["finish_order"]) == 1

            # once the other player finishes too, the race ends immediately
            # rather than waiting out the grace period
            ws2.send_text(json.dumps({"type": "finish"}))
            end_msg = _drain_until(ws1, lambda m: m.get("type") == "end")
            leaderboard = end_msg["leaderboard"]
            assert leaderboard[0] == {"player_id": "p1", "wpm": 0.0, "accuracy": 100.0, "rank": 1, "finished": True}
            assert leaderboard[1] == {"player_id": "p2", "wpm": 0.0, "accuracy": 0.0, "rank": 2, "finished": True}

