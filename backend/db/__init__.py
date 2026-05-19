from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = (
    "mongodb://localhost:27017,localhost:27018,localhost:27019/"
    "banco_nexus?replicaSet=rsBanco"
)

client = AsyncIOMotorClient(MONGO_URI)
db = client["banco_nexus"]

def get_db():
    return db
