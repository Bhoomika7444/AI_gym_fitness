from fastapi import APIRouter, Depends
from models.schemas import DietRequest, DietPlan
from services.diet import generate_diet_plan
from services.auth import get_current_user
from config import get_db

router = APIRouter(prefix="/diet", tags=["Diet"])

@router.post("/plan", response_model=DietPlan)
async def get_diet_plan(req: DietRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    plan = generate_diet_plan(req)

    # Save plan to DB
    await db.diet_plans.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": {"user_id": str(current_user["_id"]), "plan": plan.model_dump()}},
        upsert=True,
    )
    return plan

@router.get("/my-plan")
async def get_my_plan(current_user=Depends(get_current_user), db=Depends(get_db)):
    doc = await db.diet_plans.find_one({"user_id": str(current_user["_id"])})
    if not doc:
        # Auto-generate based on user profile
        from models.schemas import DietRequest
        req = DietRequest(
            height=current_user["height"],
            weight=current_user["weight"],
            age=current_user["age"],
            goal=current_user["goal"],
        )
        plan = generate_diet_plan(req)
        await db.diet_plans.insert_one({"user_id": str(current_user["_id"]), "plan": plan.model_dump()})
        return plan.model_dump()
    return doc["plan"]
