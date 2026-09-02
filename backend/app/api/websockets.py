from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.game.manager import manager    
from pydantic import ValidationError, TypeAdapter
from app.schemas.payloads import *
import asyncio
import json

websockets_router = APIRouter()

async def game_loop(ws: WebSocket, player_id: str, room_id: str):
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
            except ValidationError as e:
                error_msg = ErrorPayload(type="error",
                                         message = str(e))
                await ws.send_json(error_msg.model_dump_json())
            match payload: # call corresponding ConnectionManager func. to payload
                case StartPayload():
                    asyncio.create_task(manager.handle_host_start(room_id, payload,player_id))
                case ProgressPayload():
                    await manager.handle_progress(room_id, payload,player_id)
                case MessagePayload():
                    await manager.broadcast(room_id, payload)
                case FinishPayload():
                    await manager.handle_player_finish(room_id, player_id)
    except WebSocketDisconnect:
        await manager.disconnect(ws, room_id, player_id)

@websockets_router.websocket("/ws/party/create")
async def websocket_create_party(ws: WebSocket, player_id: str):
    room_id = await manager.create_party(ws, player_id)
    await game_loop(ws, player_id, room_id)

@websockets_router.websocket("/ws/party/{room_id}/{player_id}")
async def websocket_endpoint(ws: WebSocket, player_id: str, room_id: str):
    # connect to room
    connection = await manager.connect(ws, room_id, player_id)
    if connection: # connection = ErrorPayload
       await ws.send_json(connection.model_dump_json()) # send error message to player
       await ws.close()
       return
    else:
        await game_loop(ws, player_id, room_id)


    
