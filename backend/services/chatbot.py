import random
from config import settings

# ── Rule-based fallback responses ─────────────────────────────────────────────

RESPONSES = {
    "greeting": [
        "Hey there, champion! 💪 Ready to crush your fitness goals today?",
        "Hi! I'm your AI fitness buddy. What can I help you with?",
    ],
    "workout": [
        "For a great full-body workout, try: 3x15 squats, 3x12 push-ups, 3x10 pull-ups, and 3x20 lunges. Rest 60s between sets.",
        "Looking to build muscle? Focus on compound movements: deadlifts, bench press, squats, and overhead press.",
        "For fat loss, combine HIIT (20 min, 3x/week) with strength training (3x/week). Keep rest days too!",
    ],
    "diet": [
        "Protein is key for muscle building! Aim for 1.6–2.2g per kg of body weight. Good sources: chicken, eggs, legumes, Greek yogurt.",
        "For weight loss, focus on a 300–500 calorie deficit, not crash dieting. Eat whole foods, plenty of veg, and lean protein.",
        "Pre-workout meal: complex carbs + protein 1-2 hours before (e.g., oats + whey or rice + chicken). Post-workout: fast protein within 30 mins.",
    ],
    "motivation": [
        "Every rep counts! The only bad workout is the one you didn't do. 🔥",
        "Progress, not perfection. You're already doing better than yesterday by showing up.",
        "It's not about being the best. It's about being better than you were yesterday. 💯",
        "Pain is temporary. Quitting lasts forever. Keep going! 💪",
    ],
    "rest": [
        "Rest days are NOT lazy days — they're when your muscles actually grow! Aim for 1-2 rest days per week.",
        "Sleep is your secret weapon. 7-9 hours of quality sleep boosts growth hormone and muscle recovery.",
        "Active recovery is great on rest days: light walking, yoga, or stretching can help reduce soreness.",
    ],
    "hydration": [
        "Drink at least 2-3 litres of water daily, more on workout days. Dehydration kills performance and recovery!",
        "Pro tip: Drink 500ml water first thing in the morning to kickstart your metabolism.",
    ],
    "cardio": [
        "Best cardio for fat loss: HIIT (20-30 min, 3x/week). Burns more calories than steady-state in less time!",
        "Mix it up with running, cycling, swimming, or jump rope. Variety keeps it fun and challenges your body.",
    ],
    "default": [
        "That's a great fitness question! I'd suggest consulting with a professional trainer for personalized advice. But remember — consistency is the ultimate secret to fitness success! 💪",
        "Great question! The best fitness strategy is one you can stick to. Stay consistent, stay patient, and the results will come.",
    ],
}

KEYWORDS = {
    "greeting":   ["hi", "hello", "hey", "good morning", "good evening", "sup", "wassup"],
    "workout":    ["workout", "exercise", "training", "gym", "reps", "sets", "lift", "squat", "push-up", "pull-up", "routine"],
    "diet":       ["diet", "eat", "food", "nutrition", "meal", "protein", "carbs", "calories", "weight loss", "bulk", "cut"],
    "motivation": ["motivated", "motivation", "tired", "give up", "quit", "lazy", "inspire", "help me", "can't"],
    "rest":       ["rest", "sleep", "recovery", "sore", "pain", "hurt", "overtraining"],
    "hydration":  ["water", "hydrate", "drink", "thirst"],
    "cardio":     ["cardio", "run", "jog", "hiit", "cycling", "swim", "endurance"],
}

def rule_based_response(message: str) -> str:
    msg_lower = message.lower()
    for category, keywords in KEYWORDS.items():
        if any(kw in msg_lower for kw in keywords):
            return random.choice(RESPONSES[category])
    return random.choice(RESPONSES["default"])

async def get_chat_response(message: str) -> dict:
    # Try OpenAI first if key is set
    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-your"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert AI fitness coach and nutritionist. "
                            "Give concise, practical fitness and diet advice. "
                            "Be motivating and supportive. Keep responses under 150 words. "
                            "Use emojis occasionally. Focus on evidence-based advice."
                        ),
                    },
                    {"role": "user", "content": message},
                ],
                max_tokens=200,
            )
            return {
                "reply": response.choices[0].message.content,
                "source": "openai",
            }
        except Exception:
            pass  # Fall through to rule-based

    return {"reply": rule_based_response(message), "source": "local"}
