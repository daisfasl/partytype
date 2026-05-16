from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.game.manager import manager    
import json

router = APIRouter()

@router.websocket("/ws/party/{room_id}/{player_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str, player_id: str):
    # connect to room
    await manager.connect(ws, room_id, player_id) 
    # broadcast to other players in the room that this player has joined
    await manager.broadcast(room_id, {
        "message": f"Player {player_id} has joined the party"
    })

    # listens for typing progress and other data from user 
    try: 
        while True:
            data = await ws.receive_text()
            payload = json.loads(data)
            payload["player_id"] = player_id
            await manager.broadcast(room_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(ws, room_id, player_id)
        await manager.broadcast(room_id, {
            "message" : "Player {player_id} disconnected..."
        })

    
