from datetime import datetime
from typing import List, Optional

GOAL_CONTEXT = {
    "weight_loss": "caloric deficit and satiety. Focus on glycemic load and high sugar flags",
    "muscle_gain": "protein intake and muscle recovery. Focus on electrolyte balance (sodium)",
    "energy": "sustained energy levels. Focus on glycemic load to avoid blood sugar spikes",
    "gut_health": "digestive health. Focus on fiber content",
    "general": "balanced nutrition and overall wellbeing"
}

RESTRICTION_CONTEXT = {
    "none": "",
    "vegetarian": "The user is vegetarian (no meat).",
    "vegan": "The user is vegan (no animal products).",
    "diabetic": "CRITICAL: The user is diabetic. HEAVILY prioritize Glycemic Load (GL) and sugar content. Flag anything with GL > 20 as dangerous.",
    "lactose_free": "The user is lactose intolerant."
}

def get_time_context():
    hour = datetime.now().hour
    if 5 <= hour < 10: return "morning meal (metabolic rate peaking)"
    elif 10 <= hour < 14: return "midday meal (peak energy window)"
    elif 14 <= hour < 18: return "afternoon snack (stable glucose needed)"
    elif 18 <= hour < 21: return "evening meal (light/low GL preferred)"
    else: return "late-night eating (CRITICAL: flag circadian disruption risk)"

def build_analysis_prompt(meal_description: str, user_profile=None, meal_type: str = "meal", meal_history: Optional[List] = None) -> str:
    history_context = ""
    if meal_history:
        history_context = f"PREVIOUS MEALS CONTEXT: {len(meal_history)} previous logs. Scores: {[m.get('health_score') for m in meal_history]}"

    if user_profile:
        goal_text = GOAL_CONTEXT.get(user_profile.goal, GOAL_CONTEXT["general"])
        restriction_text = RESTRICTION_CONTEXT.get(user_profile.restriction, "")
        profile_context = f"""
USER PROFILE:
- Goal: {user_profile.goal} ({goal_text})
- Restriction: {user_profile.restriction}. {restriction_text}
- Timing: {get_time_context()}
{history_context}
"""
    else:
        profile_context = f"USER PROFILE: General. Timing: {get_time_context()}"

    return f"""Analyze this {meal_type} for a health-conscious user: {meal_description}. 

{profile_context}

Return ONLY valid JSON with this structure:
{{
  "food_name": "string",
  "health_score": <int 1-10>,
  "calories_estimate": <int>,
  "macros": {{
    "carbs_g": <float>,
    "protein_g": <float>,
    "fat_g": <float>,
    "fiber_g": <float>,
    "sodium_mg": <float, estimated>,
    "sugar_g": <float, estimated>,
    "glycemic_load": <float, estimated 1-30+>
  }},
  "insights": ["list", "max 3"],
  "healthier_alternatives": ["list", "max 2"],
  "personalized_advice": "2-3 sentences max",
  "portion_note": "optional string",
  "top_ingredients": [{{ "name": "string", "health_impact": "positive|neutral|negative", "reason": "string" }}]
}}"""

def build_diet_report_prompt(meals: List[dict], user_profile: dict) -> str:
    meals_summary = []
    for m in meals:
        date_str = m.get('timestamp', '').split('T')[0] if m.get('timestamp') else 'Unknown'
        meals_summary.append(f"Date: {date_str}, Food: {m.get('food_name')}, Cal: {m.get('calories_estimate')}, Macros: {m.get('macros')}")
    
    meals_text = "\n".join(meals_summary)
    
    return f"""Generate a comprehensive diet report for the following historical meals:
{meals_text}

USER CONTEXT:
- Goal: {user_profile.get('goal', 'general')}
- Restrictions: {user_profile.get('restriction', 'none')}

Generate a response in valid JSON with this EXACT structure:
{{
  "summary": "1-paragraph summary of overall trends",
  "average_calories": <float>,
  "average_macros": {{
    "carbs_g": <float>,
    "protein_g": <float>,
    "fat_g": <float>,
    "fiber_g": <float>,
    "sodium_mg": <float>,
    "sugar_g": <float>,
    "glycemic_load": <float>
  }},
  "daily_summaries": [
    {{
      "date": "YYYY-MM-DD",
      "calories": <int>,
      "macros": {{ "carbs_g": <float>, "protein_g": <float>, "fat_g": <float> }},
      "notable_events": ["list of 1-2 key things that happened this day"]
    }}
  ],
  "strengths": ["list of 3 strengths"],
  "areas_for_improvement": ["list of 3 areas"],
  "personalized_plan": "A concrete 3-step action plan for next week"
}}"""
