import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
from main import app

@pytest.mark.asyncio
async def test_weekly_report_success():
    mock_meals = [
        {"food_name": "Oats", "calories": 300, "health_score": 9},
        {"food_name": "Chicken Salad", "calories": 400, "health_score": 8},
        {"food_name": "Fruit Bowl", "calories": 200, "health_score": 10},
    ]
    
    mock_gemini_response = MagicMock()
    mock_gemini_response.text = "## Weekly Insights\nYour diet is excellent."
    
    # We patch the model's generate_content method
    # Since it's imported as 'model' in routes.report
    with patch('routes.report.model.generate_content') as mock_generate:
        mock_generate.return_value = mock_gemini_response
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/report/weekly", json={"meals": mock_meals})
            
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "weekly_report" in data["data"]
    assert "Weekly Insights" in data["data"]["weekly_report"]

@pytest.mark.asyncio
async def test_weekly_report_insufficient_data():
    mock_meals = [
        {"food_name": "Oats", "calories": 300, "health_score": 9},
    ]
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/report/weekly", json={"meals": mock_meals})
        
    assert response.status_code == 400
    assert "At least 3 meals are required" in response.text
