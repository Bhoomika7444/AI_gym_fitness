from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    height: float       # cm
    weight: float       # kg
    goal: str           # weight_loss | muscle_gain | maintenance

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    age: int
    height: float
    weight: float
    goal: str
    bmi: float

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

# ── Diet ──────────────────────────────────────────────────────────────────────

class DietRequest(BaseModel):
    height: float
    weight: float
    age: int
    goal: str
    dietary_preference: Optional[str] = "non-vegetarian"  # vegetarian | vegan | non-vegetarian

class Meal(BaseModel):
    name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    items: List[str]

class DietPlan(BaseModel):
    bmi: float
    bmi_category: str
    daily_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    meals: List[Meal]
    tips: List[str]

# ── Workout ───────────────────────────────────────────────────────────────────

class WorkoutLog(BaseModel):
    exercise: str
    reps: int
    sets: int
    duration_minutes: int
    calories_burned: int
    notes: Optional[str] = ""

class WorkoutLogDB(WorkoutLog):
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)

# ── Chatbot ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    source: str  # "openai" or "local"

# ── Progress ──────────────────────────────────────────────────────────────────

class ProgressEntry(BaseModel):
    weight: float
    notes: Optional[str] = ""

class ProgressEntryDB(ProgressEntry):
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
