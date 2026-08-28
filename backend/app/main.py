from fastapi import FastAPI
# from fastapi import WebSocket, WebSocketDisconnect
from pathlib import Path
import random
import json


app = FastAPI()

# @app.get("/")
# async def root():
#     return {"message": "backend for party type :p"}

@app.get("/api/words")
def get_words(dataset_file: str):
    app_directory = Path(__file__).resolve().parent
    dataset_file_directory = app_directory / "data" / dataset_file

    if not dataset_file_directory.is_file():
        return {"error": "File not found"}

    with dataset_file_directory.open("r", encoding="utf-8") as file:
        data = json.load(file)
        
    words = data["words"]
    
    return {"word": [random.choice(words) for _ in range(50)]}
    
    


