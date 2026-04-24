from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from models.schemas import UserRegister, UserLogin, Token, UserProfile
from services.auth import hash_password, verify_password, create_access_token, get_current_user
from config import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

def calc_bmi(weight, height):
    return round(weight / ((height / 100) ** 2), 1)

def fmt_user(u) -> UserProfile:
    return UserProfile(
        id=str(u["_id"]),
        name=u["name"],
        email=u["email"],
        age=u["age"],
        height=u["height"],
        weight=u["weight"],
        goal=u["goal"],
        bmi=calc_bmi(u["weight"], u["height"]),
    )

@router.post("/register", response_model=Token)
async def register(data: UserRegister, db=Depends(get_db)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "age": data.age,
        "height": data.height,
        "weight": data.weight,
        "goal": data.goal,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return Token(access_token=token, token_type="bearer", user=fmt_user(user_doc))

@router.post("/login", response_model=Token)
async def login(data: UserLogin, db=Depends(get_db)):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, token_type="bearer", user=fmt_user(user))

@router.get("/me", response_model=UserProfile)
async def get_me(current_user=Depends(get_current_user)):
    return fmt_user(current_user)

@router.put("/profile")
async def update_profile(
    updates: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    allowed = {"weight", "height", "goal", "age"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": filtered}
    )
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return fmt_user(updated)
