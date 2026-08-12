import os
import uuid
import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, database, auth_utils

# Automatically construct schemas inside your local PostgreSQL database on startup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Ghanaian Cuisine Local Food Analyzer API")

# Configure CORS so your React Native mobile emulator can query this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 CREATE & MOUNT LOCAL UPLOADS DIRECTORY FOR PUBLIC HTTP ACCESS
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# --- PYDANTIC VALIDATION SCHEMAS ---

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema matching the columns in models.NutritionalTargets perfectly
class UserTargets(BaseModel):
    user_id: str
    gender: str
    age: int
    weight: float
    height: int
    calories: int
    carbs: int
    protein: int
    fats: int


# --- LOCAL USER AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(database.get_db)):
    # Normalize email to lowercase to guarantee case-insensitive uniqueness
    lowercased_email = user_data.email.lower()
    
    # Check if email already exists
    existing_user = db.query(models.UserProfile).filter(models.UserProfile.email == lowercased_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")
    
    # Create the user profile locally
    user_id = str(uuid.uuid4())
    hashed_pwd = auth_utils.hash_password(user_data.password)
    
    new_user = models.UserProfile(
        id=user_id,
        full_name=user_data.full_name,
        email=lowercased_email,
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate session token
    token = auth_utils.create_access_token(user_id)
    return {"token": token, "user": {"id": user_id, "full_name": new_user.full_name, "email": new_user.email}}


@app.post("/api/auth/login")
def login_user(credentials: UserLogin, db: Session = Depends(database.get_db)):
    # Normalize lookup email to lowercase to allow case-insensitive login
    lowercased_email = credentials.email.lower()
    
    user = db.query(models.UserProfile).filter(models.UserProfile.email == lowercased_email).first()
    if not user or not auth_utils.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # 🔑 Query the user's saved nutritional targets and physical metrics
    targets = db.query(models.NutritionalTargets).filter(
        models.NutritionalTargets.user_id == user.id
    ).first()

    token = auth_utils.create_access_token(user.id)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "gender": targets.gender if targets else None,
            "age": targets.age if targets else None,
            "weight": targets.weight if targets else None,
            "height": targets.height if targets else None,
            "calories": targets.calories if targets else 2150,
            "carbs": targets.carbs if targets else 295,
            "protein": targets.protein if targets else 108,
            "fats": targets.fats if targets else 60,
        }
    }


# --- USER & TARGET METRICS ENDPOINTS ---

@app.post("/api/user/targets")
def save_targets(
    targets_data: UserTargets,
    db: Session = Depends(database.get_db)
):
    # Search if targets already exist for this user_id
    db_targets = db.query(models.NutritionalTargets).filter(
        models.NutritionalTargets.user_id == targets_data.user_id
    ).first()
    
    payload = targets_data.model_dump()
    
    if db_targets:
        # If record exists, update each attribute dynamically
        for key, value in payload.items():
            setattr(db_targets, key, value)
    else:
        # If no record exists, initialize a new database entry
        db_targets = models.NutritionalTargets(**payload)
        db.add(db_targets)
        
    db.commit()
    return {"status": "success"}


# --- MEAL LOGGING ENDPOINTS ---

@app.get("/api/meals/today/{user_id}")
def get_todays_meals(user_id: str, db: Session = Depends(database.get_db)):
    """
    Fetches ONLY meals logged on the current calendar day for the Home Screen Daily Log.
    Resets naturally at midnight.
    """
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + datetime.timedelta(days=1)
    
    return db.query(models.MealLog).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.logged_at >= today_start,
        models.MealLog.logged_at < today_end
    ).order_by(models.MealLog.logged_at.desc()).all()


@app.get("/api/meals/history/{user_id}")
def get_user_meals_history(user_id: str, db: Session = Depends(database.get_db)):
    """
    Fetches the full lifetime historical ledger of logged meals for the History profile screen.
    """
    return db.query(models.MealLog).filter(models.MealLog.user_id == user_id).order_by(models.MealLog.logged_at.desc()).all()


@app.post("/api/meals")
def log_meal(
    user_id: str,
    meal_type: str,
    name: str,
    calories: int,
    carbs: int,
    protein: int,
    fats: int,
    is_ai: bool = False,
    image_url: Optional[str] = None,  # 🔑 Added optional image URL parameter
    db: Session = Depends(database.get_db)
):
    new_meal = models.MealLog(
        id=f"meal_{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        type=meal_type,
        name=name,
        calories=calories,
        carbs=carbs,
        protein=protein,
        fats=fats,
        is_ai_detected=is_ai,
        image_url=image_url  # 🔑 Saved to DB
    )
    db.add(new_meal)
    db.commit()
    return {"status": "success", "meal_id": new_meal.id}


# --- COMPUTER VISION WORKSPACE HOOK ---

@app.post("/api/scan")
async def scan_plate_image(file: UploadFile = File(...)):
    """
    Intakes raw phone viewfinders snapshots, saves the file to local disk,
    and returns localized item detections alongside the hosted image URL.
    """
    try:
        # Generate a unique filename to prevent overwriting existing uploads
        file_filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join("uploads", file_filename)
        
        # Read uploaded image bytes and save file to local disk
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Public HTTP URL accessible by React Native
        image_url = f"http://192.168.137.1:8000/uploads/{file_filename}"

        CANVAS_SIZE = 350.0  
        return {
            "image_url": image_url,  # 🔑 Sent back to React Native frontend
            "predictions": [
                {
                    "class": "waakye",
                    "confidence": 0.94,
                    "box": {
                        "x": CANVAS_SIZE * 0.12, 
                        "y": CANVAS_SIZE * 0.2, 
                        "w": CANVAS_SIZE * 0.55, 
                        "h": CANVAS_SIZE * 0.6
                    }
                },
                {
                    "class": "plantain",
                    "confidence": 0.88,
                    "box": {
                        "x": CANVAS_SIZE * 0.65, 
                        "y": CANVAS_SIZE * 0.35, 
                        "w": CANVAS_SIZE * 0.28, 
                        "h": CANVAS_SIZE * 0.4
                    }
                }
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )