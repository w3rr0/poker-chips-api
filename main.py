from fastapi import FastAPI
import uuid
from typing import Dict, List
from pydantic import BaseModel

app = FastAPI()

class Player(BaseModel):
    id: int                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów

    def define(self, ):

    def set_amount(self, amount: int) -> None:
        self.amount = amount


class Room:
    def __init__(self):
        self.id_value: str = str(uuid.uuid4())
        self.limit: int = 4
        self.players: List[Player] = []

@app.get("/")
async def root():
    return {"message": "Welcome to poker chips!!!"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
