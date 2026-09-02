from fastapi import WebSocket
import asyncio
from app.schemas.payloads import *
from app.game.constants import MAX_RACE_DURATION
from typing import cast
import time

import random
import string

class ConnectionManager:
    def __init__(self):
        self.rooms = dict() # all rooms currently running on the server

    def create_new_room(self, websocket: WebSocket, room: str, player_id: str) -> None:
        self.rooms[room] = { # holds all room info
            "websockets" : [],
            "mode" : "time", # represents lobby gamemode one of:
                             # 1) time 2) words 3) quote
            "status" : "waiting", # represents lobby states, one of:
                                  # 1) waiting 2) countdown 3) active
            "text" : "The quick brown fox jumps over the lazy dog.",
            "time_setting" : 60, # selected time setting (seconds), only meaningful in "time" mode
            "word_count" : 25, # selected word count, only meaningful in "words" mode
            "players" : {},
            "host" : player_id,
            "start_time": None,
        }
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = self._new_player()

    def _new_player(self) -> Player:
        return {"cursor": 0, # player's current character position (ignoring errors)
                "completed_words": 0,
                "wpm": 0,
                "correct_chars": 0,
                "accuracy": 0}

    async def connect(self, websocket: WebSocket, room: str, player_id: str) -> None | ErrorPayload: # return error payload if unable to join
        await websocket.accept()
        if room not in self.rooms:
            return ErrorPayload(type="error",
                                message="Party ID not found...")
        else:
            if self.rooms[room]["status"] != "waiting": # if not lobby is not waiting, closes websocket and terminates
                return ErrorPayload(type="error",
                                    message="Game still in progress...")
        if player_id in self.rooms[room]["players"]:
            return ErrorPayload(type="error",
                                message="Chosen player ID already in party, please pick a new one!")
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = self._new_player()

    async def create_party(self, websocket: WebSocket, player_id: str) -> str: # returns the new room id
        await websocket.accept()

        while True:
            room = "".join(random.choices(string.ascii_uppercase, k=6))
            if room not in self.rooms:
                break
        self.create_new_room(websocket, room, player_id)
        return room
    
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
                self.rooms[room]["host"] = next(iter(self.rooms[room]["players"])) # else, promote first joined player to host
                await self.handle_room_update(room)

    async def broadcast(self, room: str, payload: Payload) -> None:
        if room in self.rooms:
            for connection in self.rooms[room]["websockets"]:
                await connection.send_text(payload.model_dump_json())
    
    # handles incoming progress from players
    async def handle_progress(self, room: str, payload: ProgressPayload, player_id: str):
        if room in self.rooms:
            start_time = self.rooms[room]["start_time"]
            if start_time is None: # progress arrived before the game actually started; ignore
                return

            self.rooms[room]["players"][player_id]["cursor"] = payload.cursor
            self.rooms[room]["players"][player_id]["completed_words"] = payload.completed_words
            self.rooms[room]["players"][player_id]["correct_chars"] = payload.correct_chars

            # calc. wpm/accuracy
            # wpm from *correct* chars only, over elapsed minutes
            elapsed_minutes = (time.perf_counter() - start_time) / 60
            wpm = round((payload.correct_chars / 5) / elapsed_minutes) if elapsed_minutes > 0 else 0
            accuracy = round((payload.correct_chars / payload.cursor) * 100) if payload.cursor > 0 else 0

            self.rooms[room]["players"][player_id]["wpm"] = wpm
            self.rooms[room]["players"][player_id]["accuracy"] = accuracy

            await self.handle_room_update(room)


    # handles host starting the game
    async def handle_host_start(self, room: str, player_id: str, payload: StartPayload):
        if room in self.rooms:
            if player_id == self.rooms[room]["host"] and self.rooms[room]["status"] == "waiting":
                self.rooms[room]["status"] = "countdown"
                self.rooms[room]["text"] = payload.text
                await self.handle_room_update(room)
                from app.game.engine import run_game
                mode = self.rooms[room]["mode"]
                # "time" mode uses the host-configured duration; "words"/"quote"
                # modes end when someone finishes, but get a safety-cap backstop
                # so an abandoned race can't hold the room open forever.
                duration = self.rooms[room]["time_setting"] if mode == "time" else MAX_RACE_DURATION
                await run_game(room, duration)



    # handles a player completing the text
    async def handle_player_finish(self, room: str, player_id: str):
        if room in self.rooms:
            if self.rooms[room]["status"] == "active":
                self.rooms[room]["status"] = "waiting"
                await self.broadcast(room, GameEndPayload(type = "end",
                                                          winner = player_id))
                await self.handle_room_update(room)


    # sends an payload of curr. room state to user
    async def handle_room_update(self, room: str):
        await self.broadcast(room, RoomPayload(type = "room",
                                               mode = self.rooms[room]["mode"],
                                               status = self.rooms[room]["status"],
                                               time_setting = self.rooms[room]["time_setting"],
                                               word_count = self.rooms[room]["word_count"],
                                               text = self.rooms[room]["text"],
                                               players = self.rooms[room]["players"],
                                               host = self.rooms[room]["host"]))

    # handles the host updating room settings (mode/time_setting/word_count)
    async def host_change_settings(self, room: str, player_id: str, payload: UpdateSettingsPayload):
        if room in self.rooms:
            if player_id == self.rooms[room]["host"] and self.rooms[room]["status"] == "waiting":
                self.rooms[room]["mode"] = payload.mode
                self.rooms[room]["time_setting"] = payload.time_setting
                self.rooms[room]["word_count"] = payload.word_count
                await self.handle_room_update(room)
    
    def set_start_time(self, room: str, start_time):
        if room in self.rooms:
            self.rooms[room]["start_time"] = start_time

    def set_status(self, room: str, status: Literal["waiting", "countdown", "active"]):
        if room in self.rooms:
            self.rooms[room]["status"] = status

manager = ConnectionManager()
            


        



