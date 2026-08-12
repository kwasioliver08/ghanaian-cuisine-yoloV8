from database import Base
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
import datetime

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True)  # Will hold locally generated UUIDs
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # <-- Added for secure local authentication
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 1-to-1 link with their computed metabolic metrics
    targets = relationship("NutritionalTargets", uselist=False, back_populates="user", cascade="all, delete-orphan")
    
    # 1-to-many link with their logged meals (full lifetime history)
    meals = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")


class NutritionalTargets(Base):
    __tablename__ = "nutritional_targets"

    user_id = Column(String, ForeignKey("user_profiles.id", ondelete="CASCADE"), primary_key=True)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    height = Column(Integer, nullable=False)
    calories = Column(Integer, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)

    user = relationship("UserProfile", back_populates="targets")


class MealLog(Base):
    __tablename__ = "meals_log"

    id = Column(String, primary_key=True, index=True)  # Locally generated UUID for the meal entry
    user_id = Column(String, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # Breakfast, Lunch, Dinner, Snack
    name = Column(String, nullable=False)  # e.g., "Waakye & Plantain"
    calories = Column(Integer, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    is_ai_detected = Column(Boolean, default=False)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)
    image_url = Column(String, nullable=True)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserProfile", back_populates="meals")


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(String, primary_key=True, index=True)  # e.g., "waakye", "jollof", "banku"
    name = Column(String, unique=True, nullable=False)  # e.g., "Waakye Rice & Beans"
    calories = Column(Integer, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    serving_size = Column(String, default="1 plate")