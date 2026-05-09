import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from main import app

from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()

# Snippet 21: API integration test with httpx
@pytest.mark.asyncio
async def test_analyze_text_meal_success():
    mock_response = {
        "success": True,
        "data": {
            "food_name": "Dal rice",
            "health_score": 7,
            "calories_estimate": 450,
            "macros": {"carbs_g": 60, "protein_g": 15, "fat_g": 8, "fiber_g": 4},
            "insights": ["Good protein source", "High in fiber"],
            "healthier_alternatives": ["Brown rice dal"],
            "personalized_advice": "Great choice for your goal.",
            "portion_note": None,
            "top_ingredients": []
        }
    }
    # Mocking the service to avoid real API calls during test
    with patch('routes.analyze.analyze_meal', 
               new_callable=AsyncMock, return_value=mock_response):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/analyze", 
                json={"meal_text": "dal rice"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["health_score"] == 7
    assert data["data"]["food_name"] == "Dal rice"

@pytest.mark.asyncio  
async def test_analyze_rejects_empty_request():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Pydantic will catch empty body if required fields aren't optional
        # or if we send malformed JSON
        response = await client.post("/api/analyze", json={})
    
    # AnalyzeRequest has optional fields but body must have either text or image
    # Current implementation in analyze.py raises 400
    assert response.status_code == 400
    assert "Either meal_text or image_base64 must be provided" in response.text
