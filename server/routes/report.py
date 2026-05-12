from fastapi import APIRouter, HTTPException, Request as FastRequest, Query, Depends
from typing import Optional, List, Dict
from models.schemas import DietReportRequest, DietReportResponse
from models.models import Meal, User
from services.gemini_service import generate_weekly_report
from routes.auth import get_current_user
from limiter import limiter
from database import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/report/weekly")
@limiter.limit("5/minute")
async def get_weekly_report(
    request: FastRequest, 
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = current_user.id
        
        # Calculate time threshold
        threshold = datetime.utcnow() - timedelta(days=days)
        
        # Query meals for the user within the time range
        meals = db.query(Meal).filter(
            Meal.user_id == user_id, 
            Meal.timestamp >= threshold
        ).order_by(Meal.timestamp.desc()).all()
        
        history = []
        for meal in meals:
            history.append({
                "id": meal.id,
                "name": meal.name,
                "calories": meal.calories,
                "protein": meal.protein,
                "carbs": meal.carbs,
                "fat": meal.fat,
                "fiber": meal.fiber,
                "health_score": meal.health_score,
                "timestamp": meal.timestamp.isoformat(),
                "insights": json.loads(meal.insights) if meal.insights else [],
                "healthier_alternatives": json.loads(meal.healthier_alternatives) if meal.healthier_alternatives else [],
                "personalized_advice": meal.personalized_advice,
                "top_ingredients": json.loads(meal.top_ingredients) if meal.top_ingredients else []
            })
            
        if not history:
            return {
                "success": False, 
                "error": "no_data",
                "message": "No meal history found for the selected period",
                "suggestion": "Log some meals first to generate a report"
            }
            
        # Fetch user profile for personalization
        user_profile = {
            "goal": current_user.profile.goal,
            "activity_level": current_user.profile.activity_level,
            "restriction": current_user.profile.restriction,
            "target_calories": current_user.profile.target_calories
        } if current_user.profile else {}
        
        result = await generate_weekly_report(history, user_profile)
    except Exception as e:
        print(f"Report generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    if not result["success"]:
        raise HTTPException(
            status_code=500, 
            detail={
                "error": result.get("error"),
                "message": result.get("message"),
                "suggestion": result.get("suggestion")
            }
        )
    
    return {"success": True, "data": result["data"]}
