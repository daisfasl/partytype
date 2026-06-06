import asyncio
import time 
from app.game.manager import manager
from app.schemas.payloads import *

def calculate_wpm():
    pass

async def run_game(room: str, time_setting: int):
    # start countdown
    for i in range(3, 0, -1):
        await manager.broadcast(room, CountdownPayload(type = "countdown",
                                                            value = i))
        await asyncio.sleep(1)

    # starts game timer
    await asyncio.sleep(time_setting)
    if room in manager.rooms and manager.rooms[room]["status"] == "active": 
        # if active, close room 
        manager.rooms[room]["status"] = "waiting"  
        await manager.handle_room_update(room)

