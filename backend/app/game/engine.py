import asyncio
import time 
from app.game.manager import manager
from app.schemas.payloads import *


async def run_game(room: str, time_setting: int):
    # start countdown
    for i in range(3, 0, -1):
        await manager.broadcast(room, CountdownPayload(type = "countdown",
                                                            value = i))
        await asyncio.sleep(1)
    
    manager.set_start_time(room, time.perf_counter())
    if room in manager.rooms:
        manager.rooms[room]["status"] = "active"
    # starts game timer
    await asyncio.sleep(time_setting)
    if room in manager.rooms and manager.rooms[room]["status"] == "active": 
        # if active, select winner and end game
        max_wpm_player_id = None
        for player in manager.rooms[room]["players"]:
            if player[]
        manager.rooms[room]["status"] = "waiting"  
        await manager.handle_room_update(room)

