from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models.models import Meal, User
from routes.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter(prefix="/meals", tags=["Meals"])

class MealSchema(BaseModel):
    name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float] = 0.0
    health_score: int
    insights: List[str] = []
    healthier_alternatives: List[str] = []
    personalized_advice: Optional[str] = ""
    top_ingredients: List[str] = []

@router.get("/")
async def get_meals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).order_by(Meal.timestamp.desc()).all()
    
    result = []
    for m in meals:
        result.append({
            "id": m.id,
            "name": m.name,
            "calories": m.calories,
            "protein": m.protein,
            "carbs": m.carbs,
            "fat": m.fat,
            "fiber": m.fiber,
            "health_score": m.health_score,
            "timestamp": m.timestamp.isoformat(),
            "insights": json.loads(m.insights),
            "healthier_alternatives": json.loads(m.healthier_alternatives),
            "personalized_advice": m.personalized_advice,
            "top_ingredients": json.loads(m.top_ingredients)
        })
    return result

@router.post("/")
async def save_meal(meal_data: MealSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_meal = Meal(
        user_id=current_user.id,
        name=meal_data.name,
        calories=meal_data.calories,
        protein=meal_data.protein,
        carbs=meal_data.carbs,
        fat=meal_data.fat,
        fiber=meal_data.fiber,
        health_score=meal_data.health_score,
        insights=json.dumps(meal_data.insights),
        healthier_alternatives=json.dumps(meal_data.healthier_alternatives),
        personalized_advice=meal_data.personalized_advice,
        top_ingredients=json.dumps(meal_data.top_ingredients)
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return {"status": "success", "meal_id": db_meal.id}

@router.delete("/{meal_id}")
async def delete_meal(meal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(meal)
    db.commit()
    return {"status": "success"}
