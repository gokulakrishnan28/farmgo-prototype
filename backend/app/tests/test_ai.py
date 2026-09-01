import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # 1. Register a user
    email = f"test_{uuid.uuid4().hex[:8]}@farmgo.com"
    password = "password123"
    register_data = {
        "email": email,
        "password": password,
        "full_name": "Test AI User",
        "phone_number": "+111222333",
        "role": "farmer"
    }
    client.post("/api/v1/auth/register", json=register_data)
    
    # 2. Login to get token
    login_data = {"username": email, "password": password}
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_price_prediction_endpoint(auth_headers):
    response = client.get(
        "/api/v1/ai/price-prediction?crop_name=Rice&category=Grains&quantity_kg=1000",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "Rice"
    assert data["suggested_price_per_kg"] == 1.2
    assert "suggested_price_range" in data
    assert "market_demand_score" in data

def test_route_optimization_endpoint(auth_headers):
    response = client.get(
        "/api/v1/ai/route-optimization?pickup=Warehouse+A&destination=Market+B",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["pickup"] == "Warehouse A"
    assert data["destination"] == "Market B"
    assert "optimized_distance_km" in data
    assert "estimated_duration_minutes" in data
    assert "suggested_waypoints" in data

def test_spoilage_prediction_endpoint(auth_headers):
    response = client.get(
        "/api/v1/ai/spoilage-prediction?crop_type=Tomatoes&quantity_kg=500&harvest_date=2026-07-10&transit_temp=28.0",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "spoilage_risk_percentage" in data
    assert "estimated_remaining_shelf_life_days" in data
    assert "is_high_risk" in data
