import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def unique_email():
    return f"test_{uuid.uuid4().hex[:8]}@farmgo.com"

def test_user_registration_and_login(unique_email):
    password = "testpassword123"
    
    # 1. Register a Farmer
    register_data = {
        "email": unique_email,
        "password": password,
        "full_name": "John Doe",
        "phone_number": "+1234567890",
        "role": "farmer",
        "farm_name": "Green Acres",
        "farm_location": "Midwest",
        "farm_size": "50 acres"
    }
    
    response = client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    user_response = response.json()
    assert user_response["email"] == unique_email
    assert user_response["role"] == "farmer"
    assert user_response["farmer_profile"]["farm_name"] == "Green Acres"
    assert user_response["farmer_profile"]["farm_location"] == "Midwest"
    assert user_response["farmer_profile"]["farm_size"] == "50 acres"
    assert "password_hash" not in user_response
    
    # 2. Register Duplicate Email (should fail)
    response_dup = client.post("/api/v1/auth/register", json=register_data)
    assert response_dup.status_code == 400
    assert "exists" in response_dup.json()["detail"]

    # 3. Login
    login_data = {
        "username": unique_email,
        "password": password
    }
    response_login = client.post("/api/v1/auth/login", data=login_data)
    assert response_login.status_code == 200
    token_data = response_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    # 4. Get current user profile (using bearer token)
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    response_me = client.get("/api/v1/auth/me", headers=headers)
    assert response_me.status_code == 200
    me_data = response_me.json()
    assert me_data["email"] == unique_email
    assert me_data["role"] == "farmer"
    assert me_data["farmer_profile"]["farm_name"] == "Green Acres"

def test_login_invalid_credentials():
    login_data = {
        "username": "nonexistent_user@farmgo.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 400
    assert "Incorrect email" in response.json()["detail"]

def test_get_me_unauthorized():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]
