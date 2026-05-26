from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.game.manager import manager    
from pydantic import ValidationError, TypeAdapter
from app.schemas.payloads import *
import json

router = APIRouter()

@router.websocket("/ws/party/{room_id}/{player_id}")
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
            try:
                payload = Payload.model_validate(payload) # checks if payload is valid (pydantic)
            except ValidationError as error:
                await ws.send_json({"message" : "error"})
                return
            match payload: # call corresponding ConnectionManager func. to payload
                case StartPayload():
                    pass
                case ProgressPayload():
                    pass
                case CountdownPayload():
                    pass
                case MessagePayload():
                    pass

    except WebSocketDisconnect:
        manager.disconnect(ws, room_id, player_id)
        await manager.broadcast(room_id, MessagePayload(type = "message", 
                                                    sender = "server",
                                                    message = f"Player {player_id} has disconnected..."))


    
