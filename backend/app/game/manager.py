from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.rooms = dict()

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room in self.rooms:
            self.rooms[room] += [websocket]
        else:
            self.rooms.get(room, [websocket])
    
    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.rooms:
            self.rooms[room].remove(websocket)
            if not self.rooms[room]:
                del self.rooms[room]
    
    async def broadcast(self, room: str, message: dict):
        if room in self.rooms:
            for connection in room:
                await connection.send_json(message)

manager = ConnectionManager()
            


        



