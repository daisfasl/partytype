from fastapi import WebSocket
import asyncio
from app.schemas.payloads import *
from app.game.constants import (
    MAX_RACE_DURATION,
    GRACE_PERIOD_SECONDS,
    AFK_LOBBY_CHECK_INTERVAL_SECONDS,
    AFK_LOBBY_TIMEOUT_SECONDS,
)
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
            "language" : "english", # selected word/quote list language
            "quote_length" : "medium", # selected quote length tier, only meaningful in "quote" mode
            "quote_source" : None, # title/source of the current quote, only meaningful in "quote" mode
            "players" : {},
            "host" : player_id,
            "start_time": None,
            "finish_order": [], # player_ids in the order they finished this race
            "grace_task": None, # pending asyncio task for the post-first-finish grace period
            "afk_task": None, # long-lived watchdog task that closes out an idle "waiting" room
            "last_activity": time.perf_counter(), # bumped on any inbound payload, used by the AFK watchdog
        }
        self.rooms[room]["websockets"].append(websocket)
        self.rooms[room]["players"][player_id] = self._new_player()
        self.rooms[room]["afk_task"] = asyncio.create_task(self._afk_lobby_watchdog(room))

    def _new_player(self) -> Player:
        return {"cursor": 0, # player's current character position (ignoring errors)
                "completed_words": 0,
                "wpm": 0,
                "correct_chars": 0,
                "accuracy": 0,
                "finished": False}

    # periodically closes out "waiting" rooms that have seen no activity for
    # too long, so an abandoned lobby doesn't live in memory forever
    async def _afk_lobby_watchdog(self, room: str) -> None:
        while True:
            await asyncio.sleep(AFK_LOBBY_CHECK_INTERVAL_SECONDS)
            if room not in self.rooms:
                return
            if self.rooms[room]["status"] != "waiting":
                return
            if time.perf_counter() - self.rooms[room]["last_activity"] > AFK_LOBBY_TIMEOUT_SECONDS:
                await self.broadcast(room, MessagePayload(type="message",
                                                          sender="server",
                                                          message="Lobby timed out due to inactivity."))
                for connection in list(self.rooms[room]["websockets"]):
                    await connection.close()
                del self.rooms[room]
                return

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
        self.rooms[room]["last_activity"] = time.perf_counter()

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
            self.rooms[room]["last_activity"] = time.perf_counter()
            start_time = self.rooms[room]["start_time"]
            if start_time is None: # progress arrived before the game actually started; ignore
                return

            self.rooms[room]["players"][player_id]["cursor"] = payload.cursor
            self.rooms[room]["players"][player_id]["completed_words"] = payload.completed_words
            self.rooms[room]["players"][player_id]["correct_chars"] = payload.correct_chars

            # calc. wpm/accuracy
            # wpm from *correct* chars only, over elapsed minutes. Below
            # MIN_ELAPSED_MINUTES_FOR_WPM the number blows up toward infinity
            # for a fraction of a second right as the race starts (matches
            # the same floor in the TUI's useTypingEngine.ts) - hold at 0
            # instead of broadcasting a spike to everyone else in the room.
            MIN_ELAPSED_MINUTES_FOR_WPM = 1 / 60  # 1 second
            elapsed_minutes = (time.perf_counter() - start_time) / 60
            wpm = round((payload.correct_chars / 5) / elapsed_minutes) if elapsed_minutes >= MIN_ELAPSED_MINUTES_FOR_WPM else 0
            accuracy = round((payload.correct_chars / payload.cursor) * 100) if payload.cursor > 0 else 0

            self.rooms[room]["players"][player_id]["wpm"] = wpm
            self.rooms[room]["players"][player_id]["accuracy"] = accuracy

            await self.handle_room_update(room)


    # handles host starting the game
    async def handle_host_start(self, room: str, player_id: str, payload: StartPayload):
        if room in self.rooms:
            self.rooms[room]["last_activity"] = time.perf_counter()
            if player_id == self.rooms[room]["host"] and self.rooms[room]["status"] == "waiting":
                self.rooms[room]["status"] = "countdown"
                self.rooms[room]["text"] = payload.text
                self.rooms[room]["quote_source"] = payload.quote_source
                # fresh per-race state for this (re)start
                self.rooms[room]["finish_order"] = []
                for player in self.rooms[room]["players"].values():
                    player["finished"] = False
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
        if room not in self.rooms:
            return
        self.rooms[room]["last_activity"] = time.perf_counter()
        if self.rooms[room]["status"] != "active":
            return
        player = self.rooms[room]["players"].get(player_id)
        if player is None or player["finished"]:
            return  # unknown player, or duplicate FinishPayload for a race already finished
        player["finished"] = True
        self.rooms[room]["finish_order"].append(player_id)

        if len(self.rooms[room]["finish_order"]) == 1:
            # first finisher of the race - start the grace period for stragglers
            self.rooms[room]["grace_task"] = asyncio.create_task(_grace_period_timeout(room))

        if all(p["finished"] for p in self.rooms[room]["players"].values()):
            grace_task = self.rooms[room].get("grace_task")
            if grace_task is not None and not grace_task.done():
                grace_task.cancel()
            self.rooms[room]["grace_task"] = None
            await finalize_race(room)
        else:
            await self.handle_room_update(room)


    # sends an payload of curr. room state to user
    async def handle_room_update(self, room: str):
        await self.broadcast(room, RoomPayload(type = "room",
                                               room = room,
                                               mode = self.rooms[room]["mode"],
                                               status = self.rooms[room]["status"],
                                               time_setting = self.rooms[room]["time_setting"],
                                               word_count = self.rooms[room]["word_count"],
                                               language = self.rooms[room]["language"],
                                               quote_length = self.rooms[room]["quote_length"],
                                               text = self.rooms[room]["text"],
                                               quote_source = self.rooms[room]["quote_source"],
                                               players = self.rooms[room]["players"],
                                               host = self.rooms[room]["host"]))

    # handles the host updating room settings (mode/time_setting/word_count/language)
    async def host_change_settings(self, room: str, player_id: str, payload: UpdateSettingsPayload):
        if room in self.rooms:
            self.rooms[room]["last_activity"] = time.perf_counter()
            if player_id == self.rooms[room]["host"] and self.rooms[room]["status"] == "waiting":
                self.rooms[room]["mode"] = payload.mode
                self.rooms[room]["time_setting"] = payload.time_setting
                self.rooms[room]["word_count"] = payload.word_count
                self.rooms[room]["language"] = payload.language
                self.rooms[room]["quote_length"] = payload.quote_length
                await self.handle_room_update(room)
    
    def set_start_time(self, room: str, start_time):
        if room in self.rooms:
            self.rooms[room]["start_time"] = start_time

    def set_status(self, room: str, status: Literal["waiting", "countdown", "active"]):
        if room in self.rooms:
            self.rooms[room]["status"] = status

manager = ConnectionManager()


async def _grace_period_timeout(room: str) -> None:
    """Waits out the post-first-finish grace period, then finalizes the race
    if it's still active (i.e. nobody else finished/timed it out first)."""
    try:
        await asyncio.sleep(GRACE_PERIOD_SECONDS)
    except asyncio.CancelledError:
        return
    if room in manager.rooms and manager.rooms[room]["status"] == "active":
        await finalize_race(room)


async def finalize_race(room: str) -> None:
    """Ends a race and broadcasts the leaderboard. Called from either the
    grace-period timeout, the all-finished early exit, or run_game's overall
    timer. Idempotent - a no-op if the room's already been finalized (status
    is no longer "active") by whichever path got there first."""
    if room not in manager.rooms:
        return
    room_state = manager.rooms[room]
    if room_state["status"] != "active":
        return
    players = room_state["players"]

    # Rank by final wpm, not finish order - the server-arrival order of
    # FinishPayload messages is subject to network latency jitter between
    # players and isn't a reliable proxy for who actually typed faster. A
    # finisher outranks a non-finisher on an exact wpm tie (completing the
    # whole text is strictly a stronger result than partial progress at the
    # same rate); accuracy is the final tiebreak.
    ranked_ids = sorted(
        players.keys(),
        key=lambda pid: (players[pid]["wpm"], players[pid]["finished"], players[pid]["accuracy"]),
        reverse=True,
    )

    leaderboard: list[LeaderboardEntry] = []
    for rank, player_id in enumerate(ranked_ids, start=1):
        p = players[player_id]
        leaderboard.append(LeaderboardEntry(player_id=player_id,
                                            wpm=p["wpm"],
                                            accuracy=p["accuracy"],
                                            rank=rank,
                                            finished=p["finished"]))

    room_state["status"] = "waiting"
    await manager.broadcast(room, GameEndPayload(type="end", leaderboard=leaderboard))
    await manager.handle_room_update(room)
            


        



