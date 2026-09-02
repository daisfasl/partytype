from pydantic import BaseModel, Field
from typing import Literal, TypedDict, Union
from typing_extensions import Annotated

# refer here for BaseModel types/json formatting

# player information
class Player(TypedDict):
    cursor: int
    completed_words: int
    wpm: float

# ------------------------- 
# ------------------------- Players -> Server
# ------------------------- 
class ProgressPayload(BaseModel):
    type: Literal["progress"]
    cursor: int
    completed_words: int 

class StartPayload(BaseModel):
    type: Literal["start"]
    player_id: str

class FinishPayload(BaseModel):
    type: Literal["finish"]
    player_id: str

# ------------------------- 
# ------------------------- Server -> Players
# ------------------------- 


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

class GameEndPayload(BaseModel):
    type: Literal["end"]
    winner: str

class ErrorPayload(BaseModel):
    type: Literal["error"]
    message: str
    

# ------------------------- 
# ------------------------- Server <-> Players (Bidirectional)
# ------------------------- 

class MessagePayload(BaseModel):
    type: Literal["message"]
    sender: Literal["user", "server"]
    message: str


# BaseModel union type
Payload = Annotated[Union[ProgressPayload, 
                          StartPayload,
                          RoomPayload,
                          CountdownPayload,
                          MessagePayload,
                          GameEndPayload,
                          ErrorPayload,
                          ],
                Field(discriminator= 'type')] ## tells pydantic to look at 'type'
                                              ## to differentiate between payloads

