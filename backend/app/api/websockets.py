from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.game.manager import manager    
from pydantic import ValidationError, TypeAdapter
from app.schemas.payloads import *
import json

websockets_router = APIRouter()

@websockets_router.websocket("/ws/party/{room_id}/{player_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str, player_id: str):
    # connect to room
    await manager.connect(ws, room_id, player_id) 
    # broadcast to other players in the room that this player has joined
    await manager.broadcast(room_id, MessagePayload(type = "message", 
                                                    sender = "server", 
                                                    message = f"Player {player_id} has joined the party"))
    await manager.handle_room_update(room_id)

    # listens for payloads from user
    try: 
        while True:
            data = await ws.receive_text()
            payload = json.loads(data) # parse json
            type_adapter = TypeAdapter(Payload)
            try:
                payload = type_adapter.validate_python(payload)
            except ValidationError as error:
                await ws.send_json({"message" : "error"})
                return
            match payload: # call corresponding ConnectionManager func. to payload
                case StartPayload():
                    await manager.handle_host_start(room_id, payload)
                case ProgressPayload():
                    await manager.handle_progress(room_id, payload)
                case MessagePayload():
                    await manager.broadcast(room_id, payload)
                case FinishPayload():
                    pass
    except WebSocketDisconnect:
        manager.disconnect(ws, room_id, player_id)
        await manager.broadcast(room_id, MessagePayload(type = "message", 
                                                    sender = "server",
                                                    message = f"Player {player_id} has disconnected..."))


    
