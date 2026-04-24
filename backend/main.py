from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import connect_db, close_db
from routes.auth import router as auth_router
from routes.diet import router as diet_router
from routes.workout import router as workout_router
from routes.chat_progress import chat_router, progress_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="AI Gym & Fitness Assistant API",
    description="Full-stack AI fitness management backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(diet_router)
app.include_router(workout_router)
app.include_router(chat_router)
app.include_router(progress_router)

@app.get("/")
async def root():
    return {"message": "🏋️ AI Gym & Fitness Assistant API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
