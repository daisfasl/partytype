from fastapi import FastAPI
from fastapi import WebSocket, WebSocketDisconnect
from app.game.manager import manager 
from app.api.websockets import router
import json

app = FastAPI()

app.include_router(router)