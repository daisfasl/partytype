from fastapi import WebSocket
import asyncio


class ConnectionManager:
    def __init__(self):
        self.rooms = dict() # all rooms currently running on the server

    async def connect(self, websocket: WebSocket, room: str, player_id: str):
        await websocket.accept()
        if room not in self.rooms:
            self.rooms[room] = { # holds all room info
                "websockets" : [],
                "status" : "waiting", # represents lobby states, one of: 
                                      # 1) waiting 2) completed 3) countdown 4) active
                "text" : "The quick brown fox jumps over the lazy dog.", 
                "players" : {}
            }
        else:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                websocket.close()
                return
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = {"cursor" : 0, # player's current cursor pos.
                                                     "wpm" : 0}
    
    def disconnect(self, websocket: WebSocket, room: str, player_id: str):
        if room in self.rooms:
            self.rooms[room]["websockets"].remove(websocket)
            del self.rooms[room]["players"][player_id]
            if self.rooms[room]["websockets"] == []: # if no more players in the room, deletes the room
                del self.rooms[room]
    
    async def broadcast(self, room: str, message: dict):
        if room in self.rooms:
            for connection in self.rooms[room]:
                await connection.send_json(message)

manager = ConnectionManager()
            


        



