import os
import json
import base64
import hashlib
import time
from typing import Optional, List, Dict
from google import genai
from google.genai import types
from dotenv import load_dotenv
from services.prompt_builder import build_analysis_prompt, build_diet_report_prompt
from models.schemas import AnalyzeResponse, DietReportResponse

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_ID = "gemini-2.0-flash"  # Latest and fastest for analysis

client = genai.Client(api_key=API_KEY)

# In-memory cache for text-only queries
_cache = {}  # {hash: (result, timestamp)}
CACHE_TTL = 3600  # 1 hour

def get_cache_key(meal_text: str, profile_str: str) -> str:
    return hashlib.md5(f"{meal_text}:{profile_str}".encode()).hexdigest()

async def analyze_meal(
    meal_text: Optional[str] = None,
    image_base64: Optional[str] = None,
    image_mime_type: str = "image/jpeg",
    user_profile = None,
    meal_type: str = "meal",
    meal_history: Optional[List] = None
) -> Dict:
    # Cache check for text-only queries
    if meal_text and not image_base64:
        profile_str = str(user_profile) if user_profile else "none"
        cache_key = get_cache_key(meal_text.lower().strip(), profile_str)
        if cache_key in _cache:
            result_data, ts = _cache[cache_key]
            if time.time() - ts < CACHE_TTL:
                return {"success": True, "data": result_data, "cached": True}

    try:
        prompt = build_analysis_prompt(meal_text or "Analyze this meal", user_profile, meal_type, meal_history)
        
        content_parts = [prompt]
        if image_base64:
            content_parts.append(
                types.Part.from_bytes(
                    data=base64.b64decode(image_base64),
                    mime_type=image_mime_type
                )
            )

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=content_parts,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnalyzeResponse,
                temperature=0.3
            )
        )

        data = response.parsed.model_dump()
        
        # Save to cache
        if meal_text and not image_base64:
            _cache[cache_key] = (data, time.time())
            
        return {"success": True, "data": data}

    except Exception as e:
        print(f"Gemini Service Error: {str(e)}")
        error_msg = str(e).lower()
        suggestion = "Please try again later"
        if "quota" in error_msg or "rate" in error_msg:
            suggestion = "Please wait a moment and try again"
        elif "safety" in error_msg:
            suggestion = "Please try a different image or describe your meal in text"
            
        return {
            "success": False,
            "error": "service_failure",
            "message": "The AI metabolic engine is currently unreachable.",
            "suggestion": suggestion
        }

async def generate_weekly_report(meals: List[Dict], user_profile: Optional[Dict] = None) -> Dict:
    try:
        if not meals:
            return {
                "success": False,
                "error": "no_data",
                "message": "No meal history found for this period.",
                "suggestion": "Start logging your meals to see metabolic trends."
            }

        prompt = build_diet_report_prompt(meals, user_profile or {})
        
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DietReportResponse,
                temperature=0.4
            )
        )

        return {"success": True, "data": response.parsed.model_dump()}

    except Exception as e:
        print(f"Weekly Report Error: {str(e)}")
        return {
            "success": False,
            "error": "service_failure",
            "message": "Metabolic synthesis engine offline.",
            "suggestion": "Please retry in a few moments."
        }
