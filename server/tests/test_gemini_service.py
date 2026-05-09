# pyrefly: ignore [missing-import]
import pytest
import json
from services.gemini_service import clean_json_response
from services.prompt_builder import build_analysis_prompt
from models.schemas import UserProfile

def test_clean_json_strips_markdown_fences():
    raw = "```json\n{\"food_name\": \"apple\"}\n```"
    result = clean_json_response(raw)
    assert result == '{"food_name": "apple"}'

def test_clean_json_strips_plain_fences():
    raw = "```\n{\"food_name\": \"banana\"}\n```"
    result = clean_json_response(raw)
    assert result == '{"food_name": "banana"}'

def test_clean_json_leaves_valid_json_untouched():
    raw = '{"health_score": 7, "food_name": "salad"}'
    result = clean_json_response(raw)
    assert result == raw

def test_prompt_includes_diabetic_warning():
    profile = UserProfile(goal="general", restriction="diabetic", activity_level="sedentary")
    prompt = build_analysis_prompt("white rice", profile)
    assert "diabetic" in prompt.lower() or "CRITICAL" in prompt

def test_prompt_includes_vegan_restriction():
    profile = UserProfile(goal="general", restriction="vegan", activity_level="moderate")
    prompt = build_analysis_prompt("salad", profile)
    assert "vegan" in prompt.lower()

def test_prompt_includes_meal_type():
    prompt = build_analysis_prompt("oats", meal_type="breakfast")
    assert "breakfast" in prompt.lower()

def test_prompt_without_profile_gives_general_advice():
    prompt = build_analysis_prompt("pizza", user_profile=None)
    assert "general" in prompt.lower()
