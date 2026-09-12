import asyncio
import time
from app.game.manager import manager, finalize_race
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
        await manager.handle_room_update(room)
    # starts game timer - the overall backstop for the race. If everyone
    # already finished (or the grace period already ran out) finalize_race
    # is a no-op here, since the room's status won't be "active" anymore.
    await asyncio.sleep(time_setting)
    await finalize_race(room)

