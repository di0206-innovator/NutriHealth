from google import genai
from google.genai import types
import json
import base64
import os
import hashlib
import time
from typing import List, Optional
from models.schemas import AnalyzeResponse, DailySummary
from services.prompt_builder import build_analysis_prompt, build_diet_report_prompt
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Snippet 13: In-memory cache
_cache = {}  # {hash: (result, timestamp)}
CACHE_TTL = 3600  # 1 hour

def get_cache_key(meal_text: str, profile_str: str) -> str:
    return hashlib.md5(f"{meal_text}:{profile_str}".encode()).hexdigest()

def clean_json_response(response_text: str) -> str:
    """Removes potential markdown code fences from AI response."""
    text = response_text.strip()
    if text.startswith("```json"):
        text = text[len("```json"):]
    elif text.startswith("```"):
        text = text[len("```"):]
    
    if text.endswith("```"):
        text = text[:-len("```")]
    
    return text.strip()

async def analyze_meal(meal_text: str = None, image_base64: str = None, 
                       image_mime_type: str = "image/jpeg", user_profile=None, 
                       meal_type: str = "meal", meal_history: Optional[List] = None) -> dict:
    
    # Snippet 13: Cache check for text-only queries
    if meal_text and not image_base64:
        profile_str = str(user_profile) if user_profile else "none"
        cache_key = get_cache_key(meal_text.lower().strip(), profile_str)
        
        if cache_key in _cache:
            result_data, ts = _cache[cache_key]
            if time.time() - ts < CACHE_TTL:
                return {"success": True, "data": result_data, "cached": True}

    try:
        meal_description = meal_text or "food shown in the image"
        prompt = build_analysis_prompt(meal_description, user_profile, meal_type, meal_history)
        
        contents = [prompt]
        
        if image_base64:
            image_data = base64.b64decode(image_base64)
            contents.append(types.Part.from_bytes(data=image_data, mime_type=image_mime_type))
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnalyzeResponse,
                temperature=0.3,
            )
        )
        
        # Use .parsed to get the Pydantic model directly
        parsed_model = response.parsed
        # Convert to dict for compatibility with existing code
        parsed = parsed_model.model_dump()
        
        # Snippet 13: Save to cache
        if meal_text and not image_base64:
            _cache[cache_key] = (parsed, time.time())
            
        return {"success": True, "data": parsed}
        
    except Exception as e:
        error_msg = str(e).lower()
        suggestion = "Please try again later"
        if "quota" in error_msg or "rate" in error_msg:
            suggestion = "Please wait a moment and try again"
        elif "safety" in error_msg:
            suggestion = "Please try a different image or describe your meal in text"
            
        return {
            "success": False,
            "error": "api_error", 
            "message": "Analysis temporarily unavailable",
            "suggestion": suggestion
        }

async def generate_diet_report(meals: List[dict], user_profile: dict) -> dict:
    """Generates a comprehensive end-of-day diet report and personalized advice."""
    try:
        prompt = build_diet_report_prompt(meals, user_profile)
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DailySummary,
                temperature=0.4,
            )
        )
        
        parsed_model = response.parsed
        return {"success": True, "data": parsed_model.model_dump()}
        
    except Exception as e:
        return {
            "success": False,
            "error": "report_error",
            "message": f"Failed to generate daily report: {str(e)}"
        }

