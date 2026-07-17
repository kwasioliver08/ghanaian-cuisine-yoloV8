from database import SessionLocal
from models import FoodItem

# Nutritional estimates matching your 11 YOLOv8 food classes
GHANAIAN_FOODS_11 = [
    {
        "id": "banku",
        "name": "Banku",
        "calories": 350,
        "carbs": 80,
        "protein": 6,
        "fats": 2,
        "serving_size": "1 medium ball"
    },
    {
        "id": "beans",
        "name": "Gob3 / Beans with Plantain",
        "calories": 580,
        "carbs": 85,
        "protein": 18,
        "fats": 22,
        "serving_size": "1 plate"
    },
    {
        "id": "bread",
        "name": "Bread (Tea / Butter / Sugar)",
        "calories": 240,
        "carbs": 48,
        "protein": 7,
        "fats": 3,
        "serving_size": "2 thick slices"
    },
    {
        "id": "fufu",
        "name": "Fufu",
        "calories": 400,
        "carbs": 95,
        "protein": 3,
        "fats": 1,
        "serving_size": "1 medium ball (excluding soup)"
    },
    {
        "id": "jollof",
        "name": "Jollof Rice",
        "calories": 450,
        "carbs": 75,
        "protein": 8,
        "fats": 14,
        "serving_size": "1 plate"
    },
    {
        "id": "kenkey",
        "name": "Ga / Fante Kenkey",
        "calories": 420,
        "carbs": 92,
        "protein": 7,
        "fats": 3,
        "serving_size": "1 ball"
    },
    {
        "id": "koko",
        "name": "Hausa Koko",
        "calories": 180,
        "carbs": 38,
        "protein": 4,
        "fats": 2,
        "serving_size": "1 medium bowl"
    },
    {
        "id": "kokonte",
        "name": "Kokonte (Face the Wall)",
        "calories": 310,
        "carbs": 74,
        "protein": 2,
        "fats": 1,
        "serving_size": "1 medium ball"
    },
    {
        "id": "plainrice",
        "name": "Plain Rice",
        "calories": 350,
        "carbs": 78,
        "protein": 7,
        "fats": 1,
        "serving_size": "1 plate"
    },
    {
        "id": "plantain",
        "name": "Fried / Boiled Plantain",
        "calories": 220,
        "carbs": 54,
        "protein": 2,
        "fats": 5,
        "serving_size": "1 medium plantain"
    },
    {
        "id": "waakye",
        "name": "Waakye Rice & Beans",
        "calories": 500,
        "carbs": 98,
        "protein": 14,
        "fats": 6,
        "serving_size": "1 plate (rice & beans only)"
    },
    {
        "id": "yam",
        "name": "Boiled / Fried Yam",
        "calories": 330,
        "carbs": 79,
        "protein": 3,
        "fats": 1,
        "serving_size": "3 medium slices"
    }
]

def seed_database():
    db = SessionLocal()
    try:
        print("🌱 Seeding 11 YOLOv8 Food Classes into Directory...")
        for food in GHANAIAN_FOODS_11:
            existing_food = db.query(FoodItem).filter(FoodItem.id == food["id"]).first()
            if not existing_food:
                new_food = FoodItem(
                    id=food["id"],
                    name=food["name"],
                    calories=food["calories"],
                    carbs=food["carbs"],
                    protein=food["protein"],
                    fats=food["fats"],
                    serving_size=food["serving_size"]
                )
                db.add(new_food)
                print(f"✅ Added: {food['name']} (Class ID: '{food['id']}')")
            else:
                # Update existing entry metrics to match these targets if needed
                existing_food.name = food["name"]
                existing_food.calories = food["calories"]
                existing_food.carbs = food["carbs"]
                existing_food.protein = food["protein"]
                existing_food.fats = food["fats"]
                existing_food.serving_size = food["serving_size"]
                print(f"🔄 Updated: {food['name']}")
        
        db.commit()
        print("🎉 Seeding 11 Food Classes complete!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()