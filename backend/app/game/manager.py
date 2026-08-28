from fastapi import WebSocket
import asyncio
from app.schemas.payloads import *
from typing import cast
import time

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
                                      # 1) waiting 2) countdown 3) active
                "text" : "The quick brown fox jumps over the lazy dog.", 
                "time_setting" : 60, # selected time setting, int
                "time_remaining" : 60, # time remaining in the match, float
                "players" : {},
                "host" : player_id,
                "start_time": None,
            }
        else:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                await websocket.close()
                return
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = {"cursor" : 0, # player's current character position (ignoring errors)
                                         "completed_words" : 0,
                                                     "wpm" : 0}
    async def create_room(self, websocket: WebSocket, player_id: str) -> None:
        await websocket.accept():
            
    
    async def disconnect(self, websocket: WebSocket, room: str, player_id: str) -> None:
        if room in self.rooms:
            self.rooms[room]["websockets"].remove(websocket)
            del self.rooms[room]["players"][player_id]
            if self.rooms[room]["websockets"] == []: # if no more players in the room, deletes the room
                del self.rooms[room]
            else:
                await self.broadcast(room,
                                     MessagePayload(type= "message",
                                                    sender="server",
                                                    message=f"{player_id} has left the party :("))
                await self.handle_room_update(room)
                self.rooms[room]["host"] = next(iter(self.rooms[room]["players"])) # else, promote first joined player to host

    async def broadcast(self, room: str, payload: Payload) -> None:
        if room in self.rooms:
            for connection in self.rooms[room]["websockets"]:
                await connection.send_json(payload.model_dump_json())
    
    # handles incoming progress from players
    async def handle_progress(self, room: str, payload: ProgressPayload):
        if room in self.rooms:
            id = payload.player_id
            self.rooms[room]["players"][id]["cursor"] = payload.cursor
            self.rooms[room]["players"][id]["completed_words"] = payload.completed_words

            # calc. wpm
            start_time = self.rooms[room]["start_time"]
            self.rooms[room]["players"][id]["wpm"] = (payload.cursor / 5) // (start_time - time.perf_counter())

            await self.handle_room_update(room)


    # handles host starting the game
    async def handle_host_start(self, room: str, payload: StartPayload):
        if payload.player_id == self.rooms[room]["host"]:
            self.rooms[room]["status"] = "countdown"
            await self.handle_room_update(room)
            from app.game.engine import run_game
            await run_game(room, self.rooms[room]["time_setting"])
            
        

    # handles a player completing the text
    async def handle_player_finish(self, room: str, player_id: str):
        if room in self.rooms:
            if self.rooms[room]["status"] == "active":
                self.rooms[room]["status"] = "waiting"
                await self.broadcast(room, GameEndPayload(type = "end",
                                                          winner = player_id))

            

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
    
    def set_start_time(self, room: str, start_time):
        if room in self.rooms:
            self.rooms[room]["start_time"] = start_time

    def set_status(self, room: str, status: Literal["waiting", "countdown", "active"]):
        if room in self.rooms:
            self.rooms[room]["status"] = status

manager = ConnectionManager()
            


        



