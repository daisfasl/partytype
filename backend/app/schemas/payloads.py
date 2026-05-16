from pydantic import BaseModel
from typing import Literal

class Payload(BaseModel):
    pass

class ProgressPayload(Payload):
    cursor: int
    completed_words: int 
    wpm: float

class ReadyPayload(Payload):
    ready: bool
    
class RoomPayload(Payload):
    status: Literal["waiting", "countdown", "active", "completed"]
    text: str


