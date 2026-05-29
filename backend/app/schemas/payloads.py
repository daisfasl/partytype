from pydantic import BaseModel, Field
from typing import Literal, TypedDict, Union
from typing_extensions import Annotated

# refer here for BaseModel types/json formatting

# progress sent from players to server
class ProgressPayload(BaseModel):
    type: Literal["progress"]
    player_id: str
    cursor: int
    completed_words: int 
    wpm: float

class StartPayload(BaseModel):
    type: Literal["start"]
    player_id: str

# player information
class Player(TypedDict):
    cursor: int
    completed_words: int
    wpm: float
# room information sent from server to user
class RoomPayload(BaseModel):
    type: Literal["room"]
    mode: Literal["time", "words", "quote"]
    status: Literal["waiting", "countdown", "active", "completed"]
    time_setting: int
    time_remaining: float
    text: str
    players: dict[str, Player] 
    host: str

class CountdownPayload(BaseModel):
    type: Literal["countdown"]
    value: int = Field(ge = 1, le = 3) # int 1, 2, or 3

class MessagePayload(BaseModel):
    type: Literal["message"]
    sender: Literal["user", "server"]
    message: str

# BaseModel union type 
Payload = Annotated[Union[ProgressPayload, 
                          StartPayload,
                          RoomPayload,
                          CountdownPayload,
                          MessagePayload],
                Field(discriminator= 'type')] ## tells pydantic to look at 'type'
                                              ## to differentiate between payloads