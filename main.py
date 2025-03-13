from fastapi import FastAPI
import random
from typing import Dict, List
from pydantic import BaseModel

app = FastAPI()

ROOMS = []

class Player(BaseModel):
    id: int                     # unikalne id gracza
    username: str               # nazwa gracza
    amount: int                 # łączna wartość żetonów

    def define(self, player_id: int, username: str, amount: int):
        self.id = player_id
        self.username = username
        self.amount = amount

    # ustawia wartosc żetonów posiadanych przez gracza
    def set_amount(self, amount: int) -> None:
        self.amount = amount

    # Ustawia id gracza
    def set_id(self, player_id: int) -> None:
        self.id = player_id

    # Ustawia nazwe gracza
    def set_username(self, username: str) -> None:
        self.username = username


class Room:
    def __init__(self):
        # Generowanie nowego pinu i sprawdzanie czy już nie istnieje
        while True:
            p = random.randint(1000, 9999)
            if p not in ROOMS:
                break
        self.pin: int = p
        self.limit: int = 4
        self.players: List[Player] = []

@app.get("/")
async def root():
    return {"message": "Welcome to poker chips!!!"}


@app.get("/create")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
