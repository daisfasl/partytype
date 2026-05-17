from fastapi import WebSocket
import asyncio
from backend.app.schemas.payloads import *

class ConnectionManager:
    def __init__(self):
        self.rooms = dict() # all rooms currently running on the server

    async def connect(self, websocket: WebSocket, room: str, player_id: str):
        await websocket.accept()
        if room not in self.rooms:
            self.rooms[room] = { # holds all room info
                "websockets" : [],
                "mode" : "time", # represents lobby gamemode one of:
                                 # 1) time 2) words 3) quote
                "status" : "waiting", # represents lobby states, one of: 
                                      # 1) waiting 2) completed 3) countdown 4) active
                "text" : "The quick brown fox jumps over the lazy dog.", 
                "time_setting" : 60, # selected time setting
                "time_remaining" : 60, # time remaining in the match
                "players" : {},
                "host" : None
            }
        else:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                await websocket.close()
                return
        self.rooms[room]["host"] = player_id
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = {"cursor" : 0, # player's current cursor pos.
                                         "completed_words" : 0,
                                                     "wpm" : 0}
    
    def disconnect(self, websocket: WebSocket, room: str, player_id: str):
        if room in self.rooms:
            self.rooms[room]["websockets"].remove(websocket)
            del self.rooms[room]["players"][player_id]
            if self.rooms[room]["websockets"] == []: # if no more players in the room, deletes the room
                del self.rooms[room]
            else:
                self.rooms[room]["host"] = self.rooms[room]["players"][0] # else, promote first joined player to host

    async def broadcast(self, room: str, payload: Payload):
        if room in self.rooms:
            for connection in self.rooms[room]["websockets"]:
                await connection.send_json(payload.model_dump_json())

    def get_room(self, room: str):
        if room in self.rooms:
            return self.rooms[room]
    
    # handles incoming progress from players
    async def handle_progress(self):
        pass
    
    # handles host starting the game
    async def handle_host_start(self):
        pass

    # handles a player completing the text
    async def handle_player_finish(self):
        pass

    async def handle_room_update(self):
        pass
manager = ConnectionManager()
            


        



