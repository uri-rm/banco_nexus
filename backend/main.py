from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, transactions, users
from backend.db import create_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    print("DB tables created")
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(auth.router)
