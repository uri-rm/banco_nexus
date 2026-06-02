from xmlrpc import client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, transactions, users
from backend.db import create_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
)

@app.on_event("startup")
async def startup():
    try:
        await create_db()
        print("Creaeting db")
    except Exception as e:
        print(f"Error: {e}")

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(auth.router)
