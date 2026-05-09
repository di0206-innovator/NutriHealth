# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Request as FastRequest
from models.schemas import AnalyzeRequest, AnalyzeResponse, ErrorResponse
from services.gemini_service import analyze_meal
from limiter import limiter

router = APIRouter()

@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze_food(request: FastRequest, body: AnalyzeRequest):
    if not body.meal_text and not body.image_base64:
        raise HTTPException(
            status_code=400, 
            detail="Either meal_text or image_base64 must be provided"
        )
    
    # In a full integration, we'd fetch meal_history for similarity memory (Snippet 1)
    # meal_history = await get_similar_meals(uid, body.meal_text)
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
    
    return {"success": True, "data": result["data"]}
