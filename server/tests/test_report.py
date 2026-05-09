import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_weekly_report_success():
    mock_report_data = {
        "summary": "Excellent diet.",
        "average_calories": 1800,
        "average_macros": {"carbs_g": 200, "protein_g": 100, "fat_g": 60, "fiber_g": 25, "sodium_mg": 1500, "sugar_g": 30, "glycemic_load": 15},
        "daily_summaries": [],
        "strengths": ["High protein"],
        "areas_for_improvement": ["More fiber"],
        "personalized_plan": "Keep it up."
    }

    with patch('routes.report.generate_weekly_report') as mock_gen:
        mock_gen.return_value = {"success": True, "data": mock_report_data}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/report/weekly?user_id=test_user")
            
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["data"]["summary"] == "Excellent diet."

@pytest.mark.asyncio
async def test_weekly_report_failure():
    with patch('routes.report.generate_weekly_report') as mock_gen:
        mock_gen.return_value = {"success": False, "error": "service_failure", "message": "Failed"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/report/weekly?user_id=test_user")
            
        assert response.status_code == 500
        assert "Failed" in response.json()["detail"]["message"]
