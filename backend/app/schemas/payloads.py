from pydantic import BaseModel
from typing import Literal

class Payload(BaseModel):
    type: str

class ProgressPayload(Payload):
    type: Literal["progress"]
    cursor: int
    completed_words: int 
    wpm: float
    
class RoomPayload(Payload):
    type: Literal["room"]
    status: Literal["waiting", "countdown", "active", "completed"]
    text: str
    host: str

class CountdownPayload(Payload):
    pass 

class MessagePayload(Payload):
    type: Literal["message"]
    sender: Literal["user", "server"]
    message: str