import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def unique_farmer_email():
    return f"farmer_{uuid.uuid4().hex[:8]}@farmgo.com"

@pytest.fixture
def unique_transporter_email():
    return f"transporter_{uuid.uuid4().hex[:8]}@farmgo.com"

def test_marketplace_workflow(unique_farmer_email, unique_transporter_email):
    password = "password123"
    
    # 1. Register and login Farmer
    farmer_data = {
        "email": unique_farmer_email,
        "password": password,
        "full_name": "Farmer Joe",
        "phone_number": "+111222333",
        "role": "farmer",
        "farm_name": "Sunny Farms"
    }
    r_farmer = client.post("/api/v1/auth/register", json=farmer_data)
    assert r_farmer.status_code == 201
    
    login_farmer = {"username": unique_farmer_email, "password": password}
    l_farmer = client.post("/api/v1/auth/login", data=login_farmer)
    assert l_farmer.status_code == 200
    farmer_token = l_farmer.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    
    # 2. Register and login Transporter
    transporter_data = {
        "email": unique_transporter_email,
        "password": password,
        "full_name": "Transporter Bob",
        "phone_number": "+444555666",
        "role": "transporter",
        "vehicle_type": "Truck",
        "capacity_tons": 5.0
    }
    r_trans = client.post("/api/v1/auth/register", json=transporter_data)
    assert r_trans.status_code == 201
    trans_id = r_trans.json()["id"]
    
    login_trans = {"username": unique_transporter_email, "password": password}
    l_trans = client.post("/api/v1/auth/login", data=login_trans)
    assert l_trans.status_code == 200
    trans_token = l_trans.json()["access_token"]
    trans_headers = {"Authorization": f"Bearer {trans_token}"}
    
    # 3. [Farmer] Create a Crop Listing
    crop_data = {
        "name": "Organic Tomatoes",
        "category": "Vegetables",
        "quantity_kg": 500.0,
        "price_per_kg": 2.50,
        "description": "Freshly harvested organic tomatoes"
    }
    r_crop = client.post("/api/v1/crops/", json=crop_data, headers=farmer_headers)
    assert r_crop.status_code == 201
    crop = r_crop.json()
    assert crop["status"] == "available"
    
    # 4. [Farmer] Create a Transport Order for the Crop
    order_data = {
        "crop_id": crop["id"],
        "pickup_address": "Sunny Farms, Sector 4",
        "delivery_address": "City Market, Block B",
        "delivery_fee": 150.0
    }
    r_order = client.post("/api/v1/orders/", json=order_data, headers=farmer_headers)
    assert r_order.status_code == 201
    order = r_order.json()
    assert order["status"] == "pending"
    
    # 5. [Farmer] Verify Crop status changed to pending_transport
    r_crop_check = client.get(f"/api/v1/crops/{crop['id']}", headers=farmer_headers)
    assert r_crop_check.status_code == 200
    assert r_crop_check.json()["status"] == "pending_transport"
    
    # 6. [Transporter] View Available Pending Orders
    r_pending = client.get("/api/v1/orders/?status=pending", headers=trans_headers)
    assert r_pending.status_code == 200
    pending_list = r_pending.json()
    assert any(o["id"] == order["id"] for o in pending_list)
    
    # 7. [Transporter] Accept the Order
    r_accept = client.patch(f"/api/v1/orders/{order['id']}/accept", headers=trans_headers)
    assert r_accept.status_code == 200
    accepted_order = r_accept.json()
    assert accepted_order["status"] == "accepted"
    assert accepted_order["transporter_id"] == trans_id
    
    # 8. [Transporter] Set status to in_transit
    r_transit = client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": "in_transit"}, headers=trans_headers)
    assert r_transit.status_code == 200
    transit_order = r_transit.json()
    assert transit_order["status"] == "in_transit"
    assert transit_order["actual_pickup"] is not None
    
    # 9. [Transporter] Set status to delivered
    r_delivered = client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": "delivered"}, headers=trans_headers)
    assert r_delivered.status_code == 200
    delivered_order = r_delivered.json()
    assert delivered_order["status"] == "delivered"
    assert delivered_order["actual_delivery"] is not None
    
    # 10. Verify Crop status is updated to sold
    r_crop_final = client.get(f"/api/v1/crops/{crop['id']}", headers=farmer_headers)
    assert r_crop_final.status_code == 200
    assert r_crop_final.json()["status"] == "sold"
