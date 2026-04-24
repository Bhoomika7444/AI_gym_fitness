from fastapi import APIRouter, Depends
from models.schemas import ChatMessage, ChatResponse, ProgressEntry
from services.chatbot import get_chat_response
from services.auth import get_current_user
from config import get_db
from datetime import datetime

chat_router = APIRouter(prefix="/chat", tags=["Chatbot"])
progress_router = APIRouter(prefix="/progress", tags=["Progress"])

@chat_router.post("/", response_model=ChatResponse)
async def chat(msg: ChatMessage, current_user=Depends(get_current_user)):
    result = await get_chat_response(msg.message)
    return ChatResponse(**result)

@progress_router.post("/log")
async def log_progress(data: ProgressEntry, current_user=Depends(get_current_user), db=Depends(get_db)):
    doc = {
        "user_id": str(current_user["_id"]),
        "weight": data.weight,
        "notes": data.notes,
        "date": datetime.utcnow(),
    }
    result = await db.progress.insert_one(doc)
    return {"id": str(result.inserted_id)}

@progress_router.get("/history")
async def get_progress(current_user=Depends(get_current_user), db=Depends(get_db)):
    cursor = db.progress.find(
        {"user_id": str(current_user["_id"])},
        sort=[("date", 1)],
    ).limit(90)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["date"] = doc["date"].isoformat()
        logs.append(doc)
    return logs
