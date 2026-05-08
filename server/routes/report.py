from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict
import os
from datetime import datetime, timedelta
import google.generativeai as genai
from limiter import limiter

router = APIRouter()

# Simple weekly report implementation (Snippet 3)
@router.post("/report/weekly")
@limiter.limit("5/minute")
async def weekly_report(request: Request, uid: str):
    # In a real app with Firebase Admin:
    # meals = await get_meals_last_n_days(uid, 7)
    
    # Mock data for demonstration purposes, as current firebase.js integration 
    # uses client-side Firebase SDK. 
    # For now, this acts as the structure for the integration.
    
    # Simulating data fetch logic
    meals = [
        {"food_name": "Greek Yogurt Bowl", "health_score": 8, "user_goal": "maintain"},
        {"food_name": "Chicken Quinoa", "health_score": 9, "user_goal": "maintain"},
        {"food_name": "Deep Dish Pizza", "health_score": 3, "user_goal": "maintain"}
    ]
    
    if len(meals) < 3:
        return {"error": "Need at least 3 meals logged for a weekly report"}
    
    avg_score = sum(m['health_score'] for m in meals) / len(meals)
    best = max(meals, key=lambda m: m['health_score'])
    worst = min(meals, key=lambda m: m['health_score'])
    
    model = genai.GenerativeModel("gemini-1.5-pro")
    
    prompt = f"""
You are a personal dietitian writing a weekly health summary.
The user logged {len(meals)} meals this week.
Average health score: {avg_score:.1f}/10
Best meal: {best['food_name']} (score {best['health_score']})
Worst meal: {worst['food_name']} (score {worst['health_score']})
All meals: {[m['food_name'] for m in meals]}
User goal: {meals[0].get('user_goal','general')}

Write a warm, personal 3-paragraph weekly summary:
1. Overall performance this week (honest, not sycophantic)
2. The one pattern you noticed (positive or negative)
3. One specific, actionable focus for next week

Keep it under 150 words. Warm but direct tone.
"""
    try:
        response = model.generate_content(prompt)
        return {
            "report": response.text, 
            "stats": {
                "avg_score": round(avg_score,1), 
                "meals_logged": len(meals)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
