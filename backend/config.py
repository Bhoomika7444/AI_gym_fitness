from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/gymapp"
    JWT_SECRET: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

db_instance = Database()

async def connect_db():
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance.db = db_instance.client.gymapp
    print("✅ Connected to MongoDB")

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        print("🔌 MongoDB connection closed")

def get_db():
    return db_instance.db
