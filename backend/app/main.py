from fastapi import FastAPI
from fastapi import WebSocket, WebSocketDisconnect
from app.game.manager import manager 
import json

app = FastAPI()

@app.websocket("/ws/party/{room_id}/{player_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str, player_id: str):
    # connect to room
    await manager.connect(ws) 
    # broadcast to other players in the room that this player has joined
    await manager.broadcast(room_id, {
        "message": f"Player {player_id} has joined the party"
    })

    # listens for typing progress and other data from user 
    try: 
        while True:
            data = await ws.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(ws, room_id)
        await manager.broadcast(room_id, {
            "message" : "Player {player_id} disconnected..."
        })


    
