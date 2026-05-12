from fastapi import APIRouter, HTTPException, Request as FastRequest, Depends
from sqlalchemy.orm import Session
from models.schemas import AnalyzeRequest, AnalyzeResponse, ErrorResponse
from models.models import Meal, User
from services.gemini_service import analyze_meal
from routes.auth import get_current_user
from limiter import limiter
from database import get_db
import json
from datetime import datetime

router = APIRouter()

@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze_food(
    request: FastRequest, 
    body: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not body.meal_text and not body.image_base64:
        raise HTTPException(
            status_code=400, 
            detail="Either meal_text or image_base64 must be provided"
        )
    
    uid = current_user.id
    
    # Optional: Fetch meal history for better context
    meal_history = None

    result = await analyze_meal(
        meal_text=body.meal_text,
        image_base64=body.image_base64,
        image_mime_type=body.image_mime_type,
        user_profile=body.user_profile,
        meal_type=body.meal_type,
        meal_history=meal_history
    )
    
    if not result["success"]:
        return {
            "success": False,
            "error": result.get("error", "unknown_error"),
            "message": result.get("message", "Analysis failed"),
            "suggestion": result.get("suggestion", "Please try again")
        }
    
    try:
        meal_data = result["data"]
        
        new_meal = Meal(
            user_id=uid,
            name=meal_data.get("name", "Unknown Meal"),
            calories=meal_data.get("calories", 0),
            protein=meal_data.get("protein", 0.0),
            carbs=meal_data.get("carbs", 0.0),
            fat=meal_data.get("fat", 0.0),
            fiber=meal_data.get("fiber", 0.0),
            health_score=meal_data.get("health_score", 0),
            timestamp=datetime.utcnow(),
            insights=json.dumps(meal_data.get("insights", [])),
            healthier_alternatives=json.dumps(meal_data.get("healthier_alternatives", [])),
            personalized_advice=meal_data.get("personalized_advice", ""),
            top_ingredients=json.dumps(meal_data.get("top_ingredients", []))
        )
        
        db.add(new_meal)
        db.commit()
        db.refresh(new_meal)
        meal_id = new_meal.id

    except Exception as e:
        print(f"Failed to save meal to Database: {e}")
        meal_id = None
    
    return {"success": True, "data": result["data"], "meal_id": meal_id}
