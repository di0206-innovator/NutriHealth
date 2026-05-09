from fastapi import APIRouter, HTTPException, Request as FastRequest, Query
from typing import Optional, List, Dict
from models.schemas import DietReportRequest, DietReportResponse
from services.gemini_service import generate_weekly_report
from limiter import limiter
from database import db
from datetime import datetime, timedelta
from firebase_admin import firestore

router = APIRouter()

@router.get("/report/weekly")
@limiter.limit("5/minute")
async def get_weekly_report(request: FastRequest, user_id: str, days: int = 7):
    # Fetch actual user history from Firestore
    try:
        # Calculate time threshold
        threshold = datetime.utcnow() - timedelta(days=days)
        
        # Query meals for the user within the time range
        meals_ref = db.collection("users").document(user_id).collection("meals")
        query = meals_ref.where("timestamp", ">=", threshold.isoformat()).order_by("timestamp", direction=firestore.Query.DESCENDING)
        docs = query.stream()
        
        history = []
        for doc in docs:
            history.append(doc.to_dict())
            
        if not history:
            # If no history, we can't generate a report
            return {
                "success": False, 
                "error": "no_data",
                "message": "No meal history found for the selected period",
                "suggestion": "Log some meals first to generate a report"
            }
            
        # Fetch user profile for personalization
        user_doc = db.collection("users").document(user_id).get()
        user_profile = user_doc.to_dict().get("profile", {}) if user_doc.exists else {}
        
        result = await generate_weekly_report(history, user_profile)
    except Exception as e:
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
