from fastapi import WebSocket

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
                self.rooms.remove(room)

        



