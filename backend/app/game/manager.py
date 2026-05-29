from fastapi import WebSocket
import asyncio
from backend.app.schemas.payloads import *
from typing import cast
from backend.app.game.engine import *

class ConnectionManager:
    def __init__(self):
        self.rooms = dict() # all rooms currently running on the server

    async def connect(self, websocket: WebSocket, room: str, player_id: str) -> None:
        await websocket.accept()
        if room not in self.rooms:
            self.rooms[room] = { # holds all room info
                "websockets" : [],
                "mode" : "time", # represents lobby gamemode one of:
                                 # 1) time 2) words 3) quote
                "status" : "waiting", # represents lobby states, one of: 
                                      # 1) waiting 2) completed 3) countdown 4) active
                "text" : "The quick brown fox jumps over the lazy dog.", 
                "time_setting" : 60, # selected time setting, int
                "time_remaining" : 60, # time remaining in the match, float
                "players" : {},
                "host" : player_id
            }
        else:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                await websocket.close()
                return
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = {"cursor" : 0, # player's current cursor pos.
                                         "completed_words" : 0,
                                                     "wpm" : 0}
    
    def disconnect(self, websocket: WebSocket, room: str, player_id: str) -> None:
        if room in self.rooms:
            self.rooms[room]["websockets"].remove(websocket)
            del self.rooms[room]["players"][player_id]
            if self.rooms[room]["websockets"] == []: # if no more players in the room, deletes the room
                del self.rooms[room]
            else:
                self.rooms[room]["host"] = next(iter(self.rooms[room]["players"])) # else, promote first joined player to host

    async def broadcast(self, room: str, payload: Payload) -> None:
        if room in self.rooms:
            for connection in self.rooms[room]["websockets"]:
                await connection.send_json(payload.model_dump_json())
    
    # handles incoming progress from players
    async def handle_progress(self):
        pass
         
    
    # handles host starting the game
    async def handle_host_start(self, room: str, payload: StartPayload):
        if payload.type == self.rooms[room]["host"]:
            self.rooms[room]["status"] = "countdown"
            await self.handle_room_update(room)
        await run_game(room, self.rooms[room]["time_setting"])
            
            


    # handles a player completing the text
    async def handle_player_finish(self, room: str):
        pass


    # sends an payload of curr. room state to user
    async def handle_room_update(self, room: str):
        await self.broadcast(room, RoomPayload(type = "room",
                                               mode = self.rooms[room]["mode"],
                                               status = self.rooms[room]["status"],
                                               time_setting = self.rooms[room]["time_setting"],
                                               time_remaining = self.rooms[room]["time_remaining"],
                                               text = self.rooms[room]["text"],
                                               players = self.rooms[room]["players"],
                                               host = self.rooms[room]["host"]))

                                               


    async def handle_messages(self):
        pass 

manager = ConnectionManager()
            


        



