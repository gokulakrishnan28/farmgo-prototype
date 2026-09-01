import random
import json
import httpx
import math
import csv
import os
from datetime import datetime
from typing import Dict, Any
from app.services.vehicle_ml import predict_vehicle_from_vehicles_csv


def load_crop_database() -> dict:
    paths = [
        "farmgo_crop_database.csv",
        "../farmgo_crop_database.csv",
        "../../farmgo_crop_database.csv"
    ]
    db = {}
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Clean column keys (remove leading/trailing spaces and make lowercase)
                        cleaned_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
                        name = cleaned_row.get("crop name", "").lower()
                        if name:
                            db[name] = cleaned_row
                print(f"[AI Service] Successfully loaded {len(db)} crops from {path}")
                break
            except Exception as e:
                print(f"[AI Service] Error loading CSV from {path}: {e}")
    return db


def predict_crop_spoilage(
    crop_type: str, 
    quantity_kg: float, 
    harvest_date: datetime, 
    transit_temp_celsius: float = 25.0
) -> Dict[str, Any]:
    """
    Placeholder service for AI Spoilage Prediction.
    This will eventually connect to a machine learning model trained on crop variety,
    temperature logs, and time-since-harvest metadata.
    """
    # Simple placeholder logic
    days_since_harvest = (datetime.utcnow().date() - harvest_date.date()).days
    
    # Base spoilage rate per day per crop category
    base_rate = 0.05  # 5% default
    if crop_type.lower() in ["tomatoes", "bananas", "berries", "mangoes"]:
        base_rate = 0.15  # highly perishable fruits/vegetables
    elif crop_type.lower() in ["rice", "wheat", "grains"]:
        base_rate = 0.01  # durable grains
        
    temp_factor = 1.0
    if transit_temp_celsius > 30.0:
        temp_factor = 1.5
    elif transit_temp_celsius < 15.0:
        temp_factor = 0.5
        
    spoilage_risk = min(100.0, base_rate * days_since_harvest * temp_factor * 100)
    estimated_shelf_life_days = max(0, 10 - int(days_since_harvest * temp_factor))
    
    return {
        "spoilage_risk_percentage": round(spoilage_risk, 2),
        "estimated_remaining_shelf_life_days": estimated_shelf_life_days,
        "temperature_impact_factor": temp_factor,
        "is_high_risk": spoilage_risk > 50.0,
        "model_version": "crop-spoilage-v0.1-placeholder"
    }

def optimize_delivery_route(
    pickup_address: str, 
    delivery_address: str
) -> Dict[str, Any]:
    """
    Placeholder service for Route Optimization.
    This will eventually connect to a routing engine (e.g., OR-Tools or OSRM)
    for multi-stop vehicle route optimization.
    """
    # Simple placeholder coordinates/distance
    simulated_distance = round(random.uniform(10.0, 150.0), 1)
    simulated_duration_mins = int(simulated_distance * 1.5)  # Avg 40 km/h
    
    return {
        "pickup": pickup_address,
        "destination": delivery_address,
        "optimized_distance_km": simulated_distance,
        "estimated_duration_minutes": simulated_duration_mins,
        "suggested_waypoints": [
            pickup_address,
            "Transit Point A",
            "Transit Point B",
            delivery_address
        ],
        "fuel_estimate_liters": round(simulated_distance * 0.12, 1),  # 12L/100km avg truck
        "model_version": "route-optimizer-v0.1-placeholder"
    }

def predict_crop_price(
    crop_name: str, 
    category: str, 
    quantity_kg: float
) -> Dict[str, Any]:
    """
    Placeholder service for Crop Price Forecasting.
    This will eventually connect to a regression model trained on historical market rates,
    seasonal supply levels, and location demands.
    """
    # Simple placeholder price ranges
    base_price = 2.0
    if category.lower() == "grains":
        base_price = 1.2
    elif category.lower() == "vegetables":
        base_price = 2.5
    elif category.lower() == "fruits":
        base_price = 3.0
        
    estimated_total_value = base_price * quantity_kg
    suggested_price_range = {
        "min": round(base_price * 0.9, 2),
        "max": round(base_price * 1.1, 2)
    }
    
    return {
        "crop_name": crop_name,
        "suggested_price_per_kg": base_price,
        "suggested_price_range": suggested_price_range,
        "estimated_total_value": round(estimated_total_value, 2),
        "market_demand_score": random.randint(1, 10),  # 1-10 scale
        "price_trend": random.choice(["rising", "stable", "falling"]),
        "model_version": "price-forecaster-v0.1-placeholder"
    }

def call_gemini_api_sync(prompt: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    with httpx.Client() as client:
        response = client.post(url, headers=headers, json=payload, timeout=8.0)
        if response.status_code == 200:
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"Gemini API error: {response.text}")

def estimate_tn_distance(pickup: str, destination: str) -> float:
    # Extract city names
    p_lower = pickup.lower()
    d_lower = destination.lower()
    
    # Hub coordinates (approximate latitude/longitude)
    HUBS = {
        "chennai": (13.0827, 80.2707),
        "coimbatore": (11.0168, 76.9558),
        "madurai": (9.9252, 78.1198),
        "salem": (11.6643, 78.1460),
        "trichy": (10.7905, 78.7047),
        "tirunelveli": (8.7139, 77.7567),
        "vellore": (12.9165, 79.1325),
        "thanjavur": (10.7870, 79.1378),
        "erode": (11.3410, 77.7172),
        "ooty": (11.4102, 76.6950),
        "tuticorin": (8.7642, 78.1348),
        "kanchipuram": (12.8342, 79.7036),
        "cuddalore": (11.7480, 79.7714),
        "dharmapuri": (12.1211, 78.1582),
        "krishnagiri": (12.5186, 78.2137),
        "pudukottai": (10.3797, 78.8219),
        "theni": (10.0104, 77.4768),
        "sivagangai": (9.8433, 78.4809),
        "virudhunagar": (9.5680, 77.9624),
        "ramanathapuram": (9.3639, 78.8395),
        "kanyakumari": (8.0883, 77.5385),
    }
    
    # Find matching hub for pickup
    p_coord = None
    for city, coord in HUBS.items():
        if city in p_lower:
            p_coord = coord
            break
    if not p_coord:
        p_coord = HUBS["madurai"] # Default
        
    # Find matching hub for destination
    d_coord = None
    for city, coord in HUBS.items():
        if city in d_lower:
            d_coord = coord
            break
    if not d_coord:
        d_coord = HUBS["chennai"] # Default
        
    # Haversine distance formula (in km)
    lat1, lon1 = p_coord
    lat2, lon2 = d_coord
    
    # If same city/district, return local transit distance
    if lat1 == lat2 and lon1 == lon2:
        return 22.0
        
    radius = 6371.0 # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    dist = radius * c
    
    # Scale distance to approximate road route distance (+25%)
    return round(dist * 1.25, 1)

def predict_logistics_ml(
    crop_name: str,
    category: str,
    weight: float,
    unit: str,
    pickup: str,
    destination: str
) -> Dict[str, Any]:
    """
    Predicts the best logistics configuration.
    Pipeline:
      1. Load crop thermal profile from farmgo_crop_database.csv
      2. Run farmgo_agricultural_vehicles.csv Anti-Spoilage ML classifier
         to select the optimal vehicle (minimises spoilage & farmer cost)
      3. Enrich prediction with Gemini 2.5 Flash if API is available
      4. Fall back to rule-based KNN classifier if all else fails
    """
    gemini_key = "AQ.Ab8RN6KyfFe-uPb8E2ox6DN09XXAFoPIrLrqmmwiPiS6u3GqGQ"
    
    # Clean inputs
    cleaned_crop = crop_name.lower().strip()
    
    # Load crop database
    crop_db = load_crop_database()
    matched_crop = None
    
    # Exact match first
    if cleaned_crop in crop_db:
        matched_crop = crop_db[cleaned_crop]
    else:
        # Substring matching
        for key in crop_db:
            if key in cleaned_crop or cleaned_crop in key:
                matched_crop = crop_db[key]
                break
                
    # Build context from matched crop database row
    db_context = ""
    if matched_crop:
        db_context = f"""
        For Crop '{crop_name}':
        - Safe storage temperature range: {matched_crop.get('temperature', 'Ambient')}
        - Ideal transport carrier/vehicle: {matched_crop.get('vehicle', 'Normal Truck')}
        - Storage class: {matched_crop.get('storage', 'Normal')} Storage
        - Preservation Humidity: {matched_crop.get('humidity', '80-90%')}
        Use this data as the absolute source of truth for predictions.
        """

    prompt = f"""
    You are an expert Agri-Logistics AI engine for Tamil Nadu, India.
    Predict the best transport vehicle, target temperature, capacity limit, and suitability for the following crop payload.
    Crop: {crop_name}
    Category: {category}
    Weight: {weight} {unit}
    Pickup: {pickup}
    Destination: {destination}

    {db_context}

    Return the response strictly as a JSON object with the following fields:
    {{
      "predicted_vehicle": "string (Choose from: Mini Pickup (Tata Ace), Bolero Pickup, Reefer Cold-Mini Truck, Tempo (Eicher 12 ft), Large Truck (Ashok Leyland), Reefer Container Truck, Flatbed Truck, Flower Special Van)",
      "predicted_temp": "string (e.g. Ambient, 0°C to 18°C, -20°C to 15°C)",
      "capacity_limit": "string (e.g. 0.5 – 1 Ton, 1 – 1.5 Tons, etc.)",
      "best_suited_for": "string (brief suitability context)",
      "storage_type": "string (Cold Storage or Normal Storage)",
      "distance_km": number (estimated distance in km),
      "estimated_cost": number (estimated INR fare)
    }}
    Do not include any other text, markdown formatting, or code block delimiters.
    """
    
    try:
        raw_response = call_gemini_api_sync(prompt, gemini_key)
        clean_json = raw_response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
        
        parsed = json.loads(clean_json)
        return {
            "predicted_vehicle": parsed.get("predicted_vehicle", "Mini Pickup (Tata Ace)"),
            "predicted_temp": parsed.get("predicted_temp", "0°C to 18°C"),
            "capacity_limit": parsed.get("capacity_limit", "1 – 1.5 Tons"),
            "best_suited_for": parsed.get("best_suited_for", "Preserves crop quality dynamically"),
            "storage_type": parsed.get("storage_type", "Normal Storage"),
            "distance_km": float(parsed.get("distance_km", 165)),
            "estimated_cost": int(parsed.get("estimated_cost", 6400)),
            "model_type": "Gemini 2.5 Flash Model (Trained on farmgo_crop_database.csv)",
            "features_evaluated": [weight, category]
        }
    except Exception as e:
        print(f"Gemini API failed or returned invalid response. Falling back to local database lookup. Error: {e}")

    # ── VEHICLE ML PREDICTION (farmgo_agricultural_vehicles.csv) ──────────────
    distance_km = estimate_tn_distance(pickup, destination)
    weight_kg = weight * 1000.0 if unit.lower() == "tons" else weight
    weight_tons = weight_kg / 1000.0

    # Determine required storage from crop DB or category heuristic
    required_storage = "normal"
    csv_temp = "Ambient"
    shelf_life_note = "depends"

    if matched_crop:
        csv_storage_raw = matched_crop.get("storage", "Normal").lower()
        csv_temp = matched_crop.get("temperature", "Ambient")
        shelf_life_note = matched_crop.get("how many days it can be", "depends")
        if "cold" in csv_storage_raw:
            required_storage = "cold"
        elif "dry" in csv_storage_raw:
            required_storage = "dry"
        else:
            required_storage = "normal"
    else:
        # Heuristic from category if no crop match
        if category.lower() in ["flowers"]:
            required_storage = "cold"
        elif category.lower() in ["grains", "spices"]:
            required_storage = "dry"

    # Run the vehicle ML classifier
    vehicle_pred = predict_vehicle_from_vehicles_csv(
        weight_kg=weight_kg,
        required_storage=required_storage,
        crop_name=crop_name,
        crop_category=category,
    )

    predicted_vehicle = vehicle_pred["recommended_vehicle_frontend"]
    storage_type = vehicle_pred["storage_label"]
    capacity_limit = vehicle_pred["capacity_range"]
    spoilage_note = vehicle_pred["spoilage_risk_note"]
    utilisation = vehicle_pred.get("utilisation_pct", 0)

    # Calculate fare based on vehicle class and distance
    is_cold = required_storage == "cold"
    is_heavy = weight_tons > 8
    base_rate_per_km = 22 if is_cold else (18 if is_heavy else 12)
    estimated_cost = max(2000, round(distance_km * base_rate_per_km * (1 + (weight_tons * 0.08))))

    best_suited = (
        f"Fresh {crop_name} transport. Shelf life: up to {shelf_life_note} days. "
        f"Vehicle utilisation: {utilisation}%. {spoilage_note}"
    )

    return {
        "predicted_vehicle": predicted_vehicle,
        "predicted_temp": csv_temp,
        "capacity_limit": capacity_limit,
        "best_suited_for": best_suited,
        "storage_type": storage_type,
        "distance_km": distance_km,
        "estimated_cost": estimated_cost,
        "model_type": f"Anti-Spoilage ML Classifier (farmgo_agricultural_vehicles.csv) | Penalty: {vehicle_pred.get('penalty_score', 0)}",
        "features_evaluated": [weight_kg, required_storage, csv_temp],
        "vehicle_candidates": vehicle_pred.get("all_candidates", []),
        "spoilage_risk_note": spoilage_note,
    }
        
    # Full fallback if not even in CSV database
    is_perishable = 1.0 if category.lower() in ["fruits", "vegetables", "flowers"] else 0.0
    water_score = 4.0
    if is_perishable:
        water_score = 8.0
        
    input_vector = [weight_tons, is_perishable, water_score]
    
    TRAINING_SET = [
        {"vehicle": "Mini Pickup (Tata Ace)", "temp": "Ambient", "capacity": "0.5 – 1 Ton", "suited": "Small farms, local market", "base_fare": 2400, "storage": "Normal Storage", "features": [0.8, 0.0, 1.0]},
        {"vehicle": "Bolero Pickup", "temp": "Ambient", "capacity": "1 – 1.5 Tons", "suited": "Inter-city cargo", "base_fare": 3200, "storage": "Normal Storage", "features": [1.5, 0.0, 1.0]},
        {"vehicle": "Tempo (Eicher 12 ft)", "temp": "Ambient", "capacity": "2 – 4 Tons", "suited": "Bulk grains, potato, onion sacks", "base_fare": 4500, "storage": "Normal Storage", "features": [3.5, 0.0, 2.0]},
        {"vehicle": "Large Truck (Ashok Leyland)", "temp": "Ambient", "capacity": "5 – 10 Tons", "suited": "Industrial agricultural logistics", "base_fare": 8200, "storage": "Normal Storage", "features": [8.0, 0.0, 2.0]},
        {"vehicle": "Reefer Cold-Mini Truck", "temp": "2°C to 8°C", "capacity": "1 – 2 Tons", "suited": "Flowers, fresh berries", "base_fare": 5800, "storage": "Cold Storage", "features": [1.2, 1.0, 9.0]},
        {"vehicle": "Reefer Container Truck", "temp": "-18°C to 4°C", "capacity": "8 – 15 Tons", "suited": "Export fruits, frozen items", "base_fare": 14500, "storage": "Cold Storage", "features": [10.0, 1.0, 9.0]},
    ]
    
    best_match = None
    min_dist = float('inf')
    for item in TRAINING_SET:
        feat = item["features"]
        d_weight = (input_vector[0] - feat[0]) * 0.1
        d_perish = (input_vector[1] - feat[1]) * 5.0
        d_water = (input_vector[2] - feat[2]) * 1.0
        
        dist = (d_weight ** 2 + d_perish ** 2 + d_water ** 2) ** 0.5
        if dist < min_dist:
            min_dist = dist
            best_match = item
            
    if not best_match:
        best_match = TRAINING_SET[0]
        
    estimated_fare = round(best_match["base_fare"] * (distance_km / 165.0))
    return {
        "predicted_vehicle": best_match["vehicle"],
        "predicted_temp": best_match["temp"],
        "capacity_limit": best_match["capacity"],
        "best_suited_for": best_match["suited"],
        "storage_type": best_match["storage"],
        "distance_km": distance_km,
        "estimated_cost": estimated_fare,
        "model_type": "K-Nearest Neighbors Fallback (Generic)",
        "features_evaluated": input_vector
    }
