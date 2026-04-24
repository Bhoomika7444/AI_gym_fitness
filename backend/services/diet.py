from models.schemas import DietPlan, Meal, DietRequest

MEAL_PLANS = {
    "weight_loss": {
        "vegetarian": {
            "breakfast": {"name": "Oats & Fruit Bowl", "items": ["50g rolled oats", "1 banana", "200ml almond milk", "1 tbsp chia seeds", "handful of berries"]},
            "lunch": {"name": "Quinoa Salad", "items": ["100g quinoa", "mixed greens", "cherry tomatoes", "cucumber", "olive oil dressing", "100g paneer"]},
            "snack": {"name": "Greek Yogurt & Nuts", "items": ["150g Greek yogurt", "10 almonds", "1 apple"]},
            "dinner": {"name": "Dal & Vegetables", "items": ["150g moong dal", "200g mixed vegetables", "1 roti", "small bowl of salad"]},
        },
        "non-vegetarian": {
            "breakfast": {"name": "Egg White Omelette", "items": ["4 egg whites", "1 whole egg", "spinach", "tomatoes", "1 slice whole grain toast"]},
            "lunch": {"name": "Grilled Chicken Salad", "items": ["150g grilled chicken breast", "mixed greens", "cherry tomatoes", "cucumber", "lemon dressing"]},
            "snack": {"name": "Protein Shake & Fruit", "items": ["1 scoop whey protein", "1 banana", "200ml water"]},
            "dinner": {"name": "Baked Fish & Vegetables", "items": ["200g baked salmon/tilapia", "steamed broccoli", "sweet potato", "olive oil"]},
        },
        "vegan": {
            "breakfast": {"name": "Smoothie Bowl", "items": ["1 banana", "100g frozen berries", "200ml oat milk", "2 tbsp hemp seeds", "1 tbsp almond butter"]},
            "lunch": {"name": "Chickpea Wrap", "items": ["100g chickpeas", "whole wheat wrap", "hummus", "cucumber", "lettuce", "tomatoes"]},
            "snack": {"name": "Edamame & Fruit", "items": ["100g edamame", "1 orange", "handful of walnuts"]},
            "dinner": {"name": "Lentil Soup & Brown Rice", "items": ["200g red lentils", "100g brown rice", "mixed spices", "spinach", "tomatoes"]},
        },
    },
    "muscle_gain": {
        "vegetarian": {
            "breakfast": {"name": "High-Protein Pancakes", "items": ["100g whole wheat flour", "2 eggs", "200ml milk", "1 banana", "honey"]},
            "lunch": {"name": "Paneer Burji & Rice", "items": ["200g paneer", "200g basmati rice", "mixed vegetables", "2 rotis", "curd"]},
            "snack": {"name": "Mass Gainer Shake", "items": ["2 scoops protein powder", "1 banana", "2 tbsp peanut butter", "300ml whole milk"]},
            "dinner": {"name": "Rajma & Roti", "items": ["200g rajma", "3 rotis", "curd", "salad", "small bowl ghee rice"]},
        },
        "non-vegetarian": {
            "breakfast": {"name": "Muscle Breakfast", "items": ["4 whole eggs scrambled", "100g chicken sausage", "2 whole grain toasts", "avocado", "orange juice"]},
            "lunch": {"name": "Chicken Rice Bowl", "items": ["250g chicken breast", "200g white rice", "broccoli", "olive oil", "seasoning"]},
            "snack": {"name": "Tuna & Crackers", "items": ["1 can tuna", "whole grain crackers", "1 apple", "1 scoop protein shake"]},
            "dinner": {"name": "Beef/Chicken Stir Fry", "items": ["200g lean beef/chicken", "noodles", "mixed vegetables", "soy sauce", "sesame oil"]},
        },
        "vegan": {
            "breakfast": {"name": "Tofu Scramble", "items": ["200g firm tofu", "nutritional yeast", "turmeric", "vegetables", "2 slices whole grain bread"]},
            "lunch": {"name": "Tempeh Bowl", "items": ["200g tempeh", "200g brown rice", "roasted vegetables", "tahini sauce"]},
            "snack": {"name": "Vegan Protein Shake", "items": ["2 scoops pea protein", "oat milk", "banana", "almond butter"]},
            "dinner": {"name": "Seitan & Quinoa", "items": ["200g seitan", "150g quinoa", "mixed greens", "avocado", "lemon tahini dressing"]},
        },
    },
    "maintenance": {
        "vegetarian": {
            "breakfast": {"name": "Balanced Breakfast", "items": ["2 eggs", "1 cup poha/upma", "1 glass milk", "seasonal fruit"]},
            "lunch": {"name": "Dal Rice & Sabzi", "items": ["150g dal", "150g rice", "1 seasonal vegetable sabzi", "2 rotis", "curd"]},
            "snack": {"name": "Afternoon Snack", "items": ["handful of mixed nuts", "green tea", "1 fruit"]},
            "dinner": {"name": "Light Dinner", "items": ["2 rotis", "paneer or dal", "vegetable curry", "salad"]},
        },
        "non-vegetarian": {
            "breakfast": {"name": "Balanced Egg Breakfast", "items": ["2 eggs any style", "1 slice whole grain toast", "1 glass milk", "banana"]},
            "lunch": {"name": "Chicken Curry & Rice", "items": ["150g chicken curry", "200g rice", "dal", "salad", "curd"]},
            "snack": {"name": "Evening Snack", "items": ["boiled egg", "handful of nuts", "1 fruit", "green tea"]},
            "dinner": {"name": "Balanced Dinner", "items": ["150g fish/chicken", "2 rotis", "vegetable", "salad"]},
        },
        "vegan": {
            "breakfast": {"name": "Vegan Balanced Breakfast", "items": ["overnight oats", "plant milk", "mixed berries", "flaxseeds"]},
            "lunch": {"name": "Buddha Bowl", "items": ["quinoa", "roasted chickpeas", "mixed greens", "avocado", "tahini"]},
            "snack": {"name": "Vegan Snack", "items": ["fruit & nut mix", "green tea", "dark chocolate (1-2 pieces)"]},
            "dinner": {"name": "Lentil Dhal & Roti", "items": ["200g lentil dhal", "2 rotis", "sautéed greens", "mango pickle"]},
        },
    },
}

CALORIE_MACROS = {
    "weight_loss":   {"multiplier": 0.80, "protein_pct": 0.35, "carbs_pct": 0.35, "fat_pct": 0.30},
    "muscle_gain":   {"multiplier": 1.15, "protein_pct": 0.30, "carbs_pct": 0.45, "fat_pct": 0.25},
    "maintenance":   {"multiplier": 1.00, "protein_pct": 0.25, "carbs_pct": 0.50, "fat_pct": 0.25},
}

MEAL_CALORIE_SPLIT = {
    "breakfast": 0.30,
    "lunch":     0.35,
    "snack":     0.10,
    "dinner":    0.25,
}

MEAL_MACROS = {
    "breakfast": {"protein": 0.30, "carbs": 0.40, "fat": 0.30},
    "lunch":     {"protein": 0.35, "carbs": 0.40, "fat": 0.25},
    "snack":     {"protein": 0.25, "carbs": 0.50, "fat": 0.25},
    "dinner":    {"protein": 0.35, "carbs": 0.35, "fat": 0.30},
}

def calculate_bmi(weight: float, height: float) -> tuple[float, str]:
    bmi = weight / ((height / 100) ** 2)
    bmi = round(bmi, 1)
    if bmi < 18.5:
        cat = "Underweight"
    elif bmi < 25:
        cat = "Normal weight"
    elif bmi < 30:
        cat = "Overweight"
    else:
        cat = "Obese"
    return bmi, cat

def calculate_tdee(weight: float, height: float, age: int) -> int:
    # Mifflin-St Jeor (unisex estimate with moderate activity)
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
    return int(bmr * 1.55)

def generate_diet_plan(req: DietRequest) -> DietPlan:
    bmi, bmi_cat = calculate_bmi(req.weight, req.height)
    tdee = calculate_tdee(req.weight, req.height, req.age)

    macros = CALORIE_MACROS.get(req.goal, CALORIE_MACROS["maintenance"])
    daily_cal = int(tdee * macros["multiplier"])
    protein_g = int((daily_cal * macros["protein_pct"]) / 4)
    carbs_g   = int((daily_cal * macros["carbs_pct"]) / 4)
    fat_g     = int((daily_cal * macros["fat_pct"]) / 9)

    pref = req.dietary_preference or "non-vegetarian"
    goal_plans = MEAL_PLANS.get(req.goal, MEAL_PLANS["maintenance"])
    pref_plan = goal_plans.get(pref, goal_plans.get("non-vegetarian"))

    meals: list[Meal] = []
    for meal_type, split in MEAL_CALORIE_SPLIT.items():
        m_data = pref_plan[meal_type]
        m_cal = int(daily_cal * split)
        m_macro = MEAL_MACROS[meal_type]
        meals.append(Meal(
            name=m_data["name"],
            calories=m_cal,
            protein=round((m_cal * m_macro["protein"]) / 4, 1),
            carbs=round((m_cal * m_macro["carbs"]) / 4, 1),
            fat=round((m_cal * m_macro["fat"]) / 9, 1),
            items=m_data["items"],
        ))

    tips_map = {
        "weight_loss": [
            "Drink at least 2.5L of water daily",
            "Eat slowly and stop at 80% fullness",
            "Avoid processed sugar and fried foods",
            "Include 30-45 min of cardio 5x/week",
        ],
        "muscle_gain": [
            "Consume protein within 30 min post-workout",
            "Sleep 8+ hours for optimal muscle recovery",
            "Track progressive overload in your lifts",
            "Don't skip carbs — they fuel your workouts",
        ],
        "maintenance": [
            "Maintain a consistent meal schedule",
            "Mix cardio and strength training weekly",
            "Monitor weight weekly, not daily",
            "Prioritize whole foods over processed ones",
        ],
    }

    return DietPlan(
        bmi=bmi,
        bmi_category=bmi_cat,
        daily_calories=daily_cal,
        protein_g=protein_g,
        carbs_g=carbs_g,
        fat_g=fat_g,
        meals=meals,
        tips=tips_map.get(req.goal, tips_map["maintenance"]),
    )
