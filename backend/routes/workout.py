from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timedelta
from models.schemas import WorkoutLog, WorkoutLogDB
from services.auth import get_current_user
from config import get_db

router = APIRouter(prefix="/workout", tags=["Workout"])

@router.post("/log")
async def log_workout(data: WorkoutLog, current_user=Depends(get_current_user), db=Depends(get_db)):
    doc = {
        "user_id": str(current_user["_id"]),
        "exercise": data.exercise,
        "reps": data.reps,
        "sets": data.sets,
        "duration_minutes": data.duration_minutes,
        "calories_burned": data.calories_burned,
        "notes": data.notes,
        "date": datetime.utcnow(),
    }
    result = await db.workouts.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Workout logged successfully!"}

@router.get("/history")
async def get_history(current_user=Depends(get_current_user), db=Depends(get_db)):
    cursor = db.workouts.find(
        {"user_id": str(current_user["_id"])},
        sort=[("date", -1)],
    ).limit(50)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["date"] = doc["date"].isoformat()
        logs.append(doc)
    return logs

@router.get("/stats")
async def get_stats(current_user=Depends(get_current_user), db=Depends(get_db)):
    uid = str(current_user["_id"])
    since = datetime.utcnow() - timedelta(days=30)

    pipeline = [
        {"$match": {"user_id": uid, "date": {"$gte": since}}},
        {"$group": {
            "_id": None,
            "total_workouts": {"$sum": 1},
            "total_calories": {"$sum": "$calories_burned"},
            "total_minutes": {"$sum": "$duration_minutes"},
        }},
    ]
    result = await db.workouts.aggregate(pipeline).to_list(1)
    stats = result[0] if result else {"total_workouts": 0, "total_calories": 0, "total_minutes": 0}
    stats.pop("_id", None)

    # Weekly breakdown
    weekly_pipeline = [
        {"$match": {"user_id": uid, "date": {"$gte": since}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
            "calories": {"$sum": "$calories_burned"},
            "minutes": {"$sum": "$duration_minutes"},
        }},
        {"$sort": {"_id": 1}},
    ]
    weekly = await db.workouts.aggregate(weekly_pipeline).to_list(30)

    return {"summary": stats, "weekly": weekly}

@router.delete("/log/{workout_id}")
async def delete_workout(workout_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    from bson import ObjectId
    await db.workouts.delete_one({"_id": ObjectId(workout_id), "user_id": str(current_user["_id"])})
    return {"message": "Deleted"}
