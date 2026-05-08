from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.rooms = dict()

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room in self.rooms:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                websocket.close()
                return
            self.rooms[room]["websockets"].append(websocket)
        else:
            self.rooms[room] = { # holds all room info
                "websockets" : [],
                "status" : "waiting", # represents lobby states, one of: 
                                      # 1) waiting 2) completed 3) countdown 4) active
                "text" : "The quick brown fox jumps over the lazy dog.", 
            }
            self.rooms[room]["websockets"].append(websocket)
    
    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.rooms:
            self.rooms[room].remove(websocket)
            if not self.rooms[room]:
                del self.rooms[room]
    
    async def broadcast(self, room: str, message: dict):
        if room in self.rooms:
            for connection in self.rooms[room]:
                await connection.send_json(message)

manager = ConnectionManager()
            


        



