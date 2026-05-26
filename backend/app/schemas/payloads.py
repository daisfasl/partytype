from pydantic import BaseModel, Field
from typing import Literal, TypedDict

# refer here for payload types/json formatting
class Payload(BaseModel):
    type: str

# progress sent from players to server
class ProgressPayload(Payload):
    type: Literal["progress"]
    cursor: int
    completed_words: int 
    wpm: float

class StartPayload(Payload):
    type: Literal["start"]
    player_id: str

# player information
class Player(TypedDict):
    cursor: int
    completed_words: int
    wpm: float
# room information sent from server to user
class RoomPayload(Payload):
    type: Literal["room"]
    mode: Literal["time", "words", "quote"]
    status: Literal["waiting", "countdown", "active", "completed"]
    time_setting: float
    time_remaining: float
    text: str
    players: dict[str, Player] 
    host: str

class CountdownPayload(Payload):
    type: Literal["countdown"]
    value: int = Field(ge = 1, le = 3) # int 1, 2, or 3

class MessagePayload(Payload):
    type: Literal["message"]
    sender: Literal["user", "server"]
    message: str