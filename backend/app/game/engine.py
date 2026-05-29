import asyncio
import time 
from backend.app.game.manager import manager

def calculate_wpm():
    pass

async def run_game(room: str, time_setting: int):
    # starts game timer
    await asyncio.sleep(time_setting)
    