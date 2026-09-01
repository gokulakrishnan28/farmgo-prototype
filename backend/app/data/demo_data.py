"""
Demo Data Loader
-----------------
Provides realistic demo data for the SIH 2026 presentation.

All demo data is clearly labeled with is_demo=True / source="demo".
NEVER mixed with real government data.

SIH Demo Scenario:
  Farmer: Maharashtra, Nashik
  Crop: Tomato, 1000 kg, Grade A
  Compare: Nashik, Pune, Mumbai, Lasalgaon, Ahmednagar markets
"""
import json
import os
import random
from datetime import date, timedelta
from typing import Any, Dict, List

DEMO_FLAG = True  # All data returned by this module is demo data

# ---------------------------------------------------------------------------
# Maharashtra APMC Markets
# ---------------------------------------------------------------------------
def get_demo_markets() -> List[Dict[str, Any]]:
    """Load demo Maharashtra APMC markets."""
    data_path = os.path.join(os.path.dirname(__file__), "maharashtra_markets.json")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("markets", [])
    except Exception:
        return _fallback_markets()


def _fallback_markets():
    return [
        {"id": "mh-nashik-apmc", "market_name": "Nashik APMC", "state": "Maharashtra", "district": "Nashik", "latitude": 19.9975, "longitude": 73.7898, "market_type": "APMC"},
        {"id": "mh-pune-apmc", "market_name": "Pune APMC (Market Yard)", "state": "Maharashtra", "district": "Pune", "latitude": 18.5204, "longitude": 73.8567, "market_type": "APMC"},
        {"id": "mh-mumbai-vashi-apmc", "market_name": "Navi Mumbai APMC (Vashi)", "state": "Maharashtra", "district": "Thane", "latitude": 19.0760, "longitude": 73.0014, "market_type": "APMC"},
    ]


# ---------------------------------------------------------------------------
# Demo Price Data: 30 days Tomato prices across 5 Maharashtra markets
# ---------------------------------------------------------------------------
def get_demo_prices(commodity: str = "Tomato", state: str = "Maharashtra") -> List[Dict[str, Any]]:
    """
    Generate 30 days of realistic demo market price data.
    Prices in ₹/quintal (OGD standard). 1 quintal = 100 kg.
    """
    today = date.today()
    markets = get_demo_markets()
    
    # Base prices per market (₹/quintal)
    base_prices = {
        "Nashik APMC": 3600,
        "Nashik": 3600,
        "Lasalgaon APMC": 3500,
        "Pune APMC (Market Yard)": 3800,
        "Pune": 3800,
        "Navi Mumbai APMC (Vashi)": 4100,
        "Mumbai": 4100,
        "Ahmednagar APMC": 3400,
        "Aurangabad APMC": 3700,
        "Solapur APMC": 3300,
        "Kolhapur APMC": 3650,
        "Nagpur APMC": 3550,
        "Sangli APMC": 3750,
        "Satara APMC": 3450,
        "Dhule APMC": 3200,
    }
    
    records = []
    seed = hash(commodity + state) % 10000
    random.seed(seed)
    
    for market in markets:
        mname = market["market_name"]
        base = base_prices.get(mname, 3500)
        
        for day_offset in range(30, 0, -1):
            price_date = today - timedelta(days=day_offset)
            # Add realistic daily variation ±5%
            variation = random.uniform(-0.05, 0.07)
            modal = round(base * (1 + variation))
            min_p = round(modal * random.uniform(0.88, 0.96))
            max_p = round(modal * random.uniform(1.04, 1.12))
            arrival = round(random.uniform(50, 400))  # tonnes
            
            # Slight weekly pattern: lower on weekends
            if price_date.weekday() in (5, 6):
                modal = round(modal * 0.95)
            
            records.append({
                "market_id": market["id"],
                "market_name": mname,
                "state": market["state"],
                "district": market["district"],
                "commodity": commodity,
                "price_date": price_date.isoformat(),
                "min_price": min_p,
                "modal_price": modal,
                "max_price": max_p,
                "arrival_quantity": arrival,
                "unit": "quintal",
                "source": "demo",
                "is_demo": True,
            })
    
    return records


def get_demo_market_comparison(
    commodity: str = "Tomato",
    district: str = "Nashik",
    state: str = "Maharashtra",
    quantity_kg: float = 1000.0,
    farmer_lat: float = 19.9975,
    farmer_lon: float = 73.7898,
) -> List[Dict[str, Any]]:
    """
    Get current demo prices for all markets with today's data.
    Used for the market comparison table.
    """
    markets = get_demo_markets()
    today = date.today()
    
    base_prices = {
        "Nashik APMC": 3750,
        "Lasalgaon APMC": 3600,
        "Pune APMC (Market Yard)": 3900,
        "Navi Mumbai APMC (Vashi)": 4200,
        "Ahmednagar APMC": 3500,
        "Aurangabad APMC": 3800,
        "Solapur APMC": 3400,
        "Kolhapur APMC": 3700,
        "Nagpur APMC": 3600,
        "Sangli APMC": 3800,
        "Satara APMC": 3500,
        "Dhule APMC": 3300,
    }
    
    comparison = []
    for m in markets:
        mname = m["market_name"]
        base = base_prices.get(mname, 3500)
        modal = base + random.randint(-100, 150)
        min_p = round(modal * 0.93)
        max_p = round(modal * 1.07)
        arrival = random.randint(80, 500)
        
        comparison.append({
            "market_id": m["id"],
            "market_name": mname,
            "state": m["state"],
            "district": m["district"],
            "latitude": m.get("latitude"),
            "longitude": m.get("longitude"),
            "market_type": m.get("market_type", "APMC"),
            "commodity": commodity,
            "price_date": today.isoformat(),
            "min_price": min_p,           # ₹/quintal
            "modal_price": modal,          # ₹/quintal
            "max_price": max_p,            # ₹/quintal
            "min_price_per_kg": round(min_p / 100, 2),
            "modal_price_per_kg": round(modal / 100, 2),
            "max_price_per_kg": round(max_p / 100, 2),
            "arrival_quantity_tonnes": arrival,
            "unit": "quintal",
            "source": "demo",
            "is_demo": True,
        })
    
    return comparison


def get_demo_buyers(commodity: str = "Tomato", district: str = "Nashik") -> List[Dict[str, Any]]:
    """Demo buyer profiles for the SIH scenario."""
    return [
        {
            "id": "buyer-demo-001",
            "full_name": "Rajesh Traders Pvt Ltd",
            "organization_name": "Rajesh Traders Pvt Ltd",
            "buyer_type": "Wholesaler",
            "state": "Maharashtra",
            "district": "Nashik",
            "latitude": 19.9975,
            "longitude": 73.7898,
            "rating": 4.5,
            "total_transactions": 245,
            "is_verified": True,
            "requirement": {
                "crop_name": commodity,
                "quantity_kg_min": 500,
                "quantity_kg_max": 5000,
                "quality_grade": "A",
                "max_price_per_kg": 42.0,
            },
            "is_demo": True,
        },
        {
            "id": "buyer-demo-002",
            "full_name": "Maharashtra Food Processing FPO",
            "organization_name": "MH FoodTech FPO",
            "buyer_type": "FPO",
            "state": "Maharashtra",
            "district": "Pune",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "rating": 4.2,
            "total_transactions": 180,
            "is_verified": True,
            "requirement": {
                "crop_name": commodity,
                "quantity_kg_min": 2000,
                "quantity_kg_max": 20000,
                "quality_grade": "B",
                "max_price_per_kg": 38.0,
            },
            "is_demo": True,
        },
        {
            "id": "buyer-demo-003",
            "full_name": "BigBasket Procurement (Pune Hub)",
            "organization_name": "BigBasket India",
            "buyer_type": "Institutional",
            "state": "Maharashtra",
            "district": "Pune",
            "latitude": 18.5642,
            "longitude": 73.9125,
            "rating": 4.8,
            "total_transactions": 1200,
            "is_verified": True,
            "requirement": {
                "crop_name": commodity,
                "quantity_kg_min": 1000,
                "quantity_kg_max": 50000,
                "quality_grade": "A",
                "max_price_per_kg": 44.0,
            },
            "is_demo": True,
        },
        {
            "id": "buyer-demo-004",
            "full_name": "Suresh Kirana & Retail",
            "organization_name": "Suresh Kirana Mart",
            "buyer_type": "Retailer",
            "state": "Maharashtra",
            "district": "Nashik",
            "latitude": 19.9980,
            "longitude": 73.7912,
            "rating": 3.9,
            "total_transactions": 67,
            "is_verified": False,
            "requirement": {
                "crop_name": commodity,
                "quantity_kg_min": 100,
                "quantity_kg_max": 800,
                "quality_grade": "A",
                "max_price_per_kg": 45.0,
            },
            "is_demo": True,
        },
        {
            "id": "buyer-demo-005",
            "full_name": "Mumbai Cold Storage & Trading",
            "organization_name": "MumbaiFresh Pvt Ltd",
            "buyer_type": "Processor",
            "state": "Maharashtra",
            "district": "Mumbai",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "rating": 4.3,
            "total_transactions": 430,
            "is_verified": True,
            "requirement": {
                "crop_name": commodity,
                "quantity_kg_min": 5000,
                "quantity_kg_max": 100000,
                "quality_grade": "B",
                "max_price_per_kg": 40.0,
            },
            "is_demo": True,
        },
    ]
