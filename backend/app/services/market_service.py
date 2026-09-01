"""
Market Intelligence Service
---------------------------
Handles:
  - Net return calculation
  - Best market recommendation
  - Buyer matching score
  - Transport cost estimation
"""
import math
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Vehicle configuration (configurable assumptions for transport cost estimation)
# ---------------------------------------------------------------------------
VEHICLE_CONFIG = {
    "Mini Truck (Tata Ace)": {
        "capacity_kg": 750,
        "base_fare": 800,
        "per_km_rate": 18,
        "suitable_for": ["Vegetables", "Fruits", "Spices"],
    },
    "Medium Truck (Bolero Pickup)": {
        "capacity_kg": 1500,
        "base_fare": 1200,
        "per_km_rate": 22,
        "suitable_for": ["Vegetables", "Fruits", "Grains", "Spices"],
    },
    "Large Truck (Eicher 19ft)": {
        "capacity_kg": 7000,
        "base_fare": 2500,
        "per_km_rate": 30,
        "suitable_for": ["Grains", "Vegetables", "Fruits", "Cotton", "Sugarcane"],
    },
    "Container Truck": {
        "capacity_kg": 20000,
        "base_fare": 5000,
        "per_km_rate": 45,
        "suitable_for": ["Grains", "Cotton", "Sugarcane", "Others"],
    },
    "Reefer Van (Cold Chain)": {
        "capacity_kg": 2000,
        "base_fare": 2000,
        "per_km_rate": 35,
        "suitable_for": ["Fruits", "Flowers", "Perishables"],
    },
}

COLD_CHAIN_CROPS = {"Grapes", "Pomegranate", "Jasmine", "Rose", "Berries", "Strawberry"}
AMBIENT_CROPS = {"Tomato", "Onion", "Potato", "Carrot", "Mango", "Banana", "Coconut"}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate straight-line distance in km using Haversine formula."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def road_distance_km(straight_km: float) -> float:
    """Approximate road distance: 1.3x straight-line (Indian road factor)."""
    return round(straight_km * 1.3, 1)


def recommend_vehicle(crop_name: str, quantity_kg: float, category: str = "") -> str:
    """Recommend the most appropriate vehicle type."""
    crop_lower = crop_name.lower()
    
    # Cold chain crops
    if any(c.lower() in crop_lower for c in COLD_CHAIN_CROPS):
        return "Reefer Van (Cold Chain)"
    
    # By quantity
    if quantity_kg <= 700:
        return "Mini Truck (Tata Ace)"
    elif quantity_kg <= 1500:
        return "Medium Truck (Bolero Pickup)"
    elif quantity_kg <= 7000:
        return "Large Truck (Eicher 19ft)"
    else:
        return "Container Truck"


def estimate_transport_cost(
    crop_name: str,
    quantity_kg: float,
    distance_km: float,
    category: str = "",
) -> Dict[str, Any]:
    """
    Estimate transport cost for a crop lot to a market.
    Returns breakdown and total cost.
    NOTE: Always labelled as 'estimate' — not a live quote.
    """
    vehicle_name = recommend_vehicle(crop_name, quantity_kg, category)
    vehicle = VEHICLE_CONFIG.get(vehicle_name, VEHICLE_CONFIG["Medium Truck (Bolero Pickup)"])
    
    # Determine number of trips
    trips = math.ceil(quantity_kg / vehicle["capacity_kg"])
    
    # Per-trip cost
    trip_cost = vehicle["base_fare"] + (distance_km * vehicle["per_km_rate"])
    total_cost = round(trip_cost * trips, 2)
    cost_per_kg = round(total_cost / quantity_kg, 2) if quantity_kg > 0 else 0
    
    # Estimated travel time: 40 km/h average on Indian roads
    travel_time_hrs = round(distance_km / 40, 1)
    
    return {
        "recommended_vehicle": vehicle_name,
        "vehicle_capacity_kg": vehicle["capacity_kg"],
        "trips_required": trips,
        "distance_km": distance_km,
        "base_fare_per_trip": vehicle["base_fare"],
        "distance_cost_per_trip": round(distance_km * vehicle["per_km_rate"], 2),
        "cost_per_trip": round(trip_cost, 2),
        "total_transport_cost": total_cost,
        "cost_per_kg": cost_per_kg,
        "travel_time_hrs": travel_time_hrs,
        "basis": "estimate",  # always label as estimate
        "note": "Transport cost is an estimated figure based on average Indian road transport rates. Actual quotes may vary."
    }


def calculate_net_return(
    selling_price_per_kg: float,
    quantity_kg: float,
    transport_cost: float,
    storage_cost: float = 0.0,
    other_costs: float = 0.0,
    commission_pct: float = 2.0,  # APMC commission ~2%
) -> Dict[str, Any]:
    """
    Calculate estimated net return for a sale.
    
    Net Return = (Price × Qty) - Transport - Storage - Commission - Other
    """
    gross_revenue = round(selling_price_per_kg * quantity_kg, 2)
    commission = round(gross_revenue * commission_pct / 100, 2)
    net_return = round(gross_revenue - transport_cost - storage_cost - commission - other_costs, 2)
    
    return {
        "gross_revenue": gross_revenue,
        "transport_cost": round(transport_cost, 2),
        "storage_cost": round(storage_cost, 2),
        "commission": commission,
        "commission_pct": commission_pct,
        "other_costs": round(other_costs, 2),
        "net_return": net_return,
        "net_return_per_kg": round(net_return / quantity_kg, 2) if quantity_kg > 0 else 0,
        "profit_margin_pct": round((net_return / gross_revenue) * 100, 1) if gross_revenue > 0 else 0,
    }


def recommend_best_market(
    markets_data: List[Dict[str, Any]],
    farmer_lat: float,
    farmer_lon: float,
    crop_name: str,
    quantity_kg: float,
    category: str = "",
) -> Dict[str, Any]:
    """
    Recommend the best market based on estimated net return.
    
    Input markets_data: list of dicts with keys:
      market_id, market_name, district, modal_price (₹/quintal), min_price, max_price,
      latitude, longitude
    
    Returns the recommended market with full breakdown.
    NOTE: Does NOT simply recommend highest price — uses net return.
    """
    if not markets_data:
        return {"error": "No market data available for comparison."}
    
    enriched = []
    for m in markets_data:
        lat = m.get("latitude")
        lon = m.get("longitude")
        
        # Calculate distance
        if lat and lon and farmer_lat and farmer_lon:
            straight_km = haversine_km(farmer_lat, farmer_lon, lat, lon)
            dist_km = road_distance_km(straight_km)
        else:
            dist_km = 0
        
        # Convert quintal to kg (OGD prices are ₹/quintal, 1 quintal = 100 kg)
        modal_price_quintal = m.get("modal_price", 0) or 0
        modal_price_kg = round(modal_price_quintal / 100, 2)
        min_price_kg = round((m.get("min_price", 0) or 0) / 100, 2)
        max_price_kg = round((m.get("max_price", 0) or 0) / 100, 2)
        
        # Transport estimate
        transport = estimate_transport_cost(crop_name, quantity_kg, dist_km, category)
        
        # Net return
        net = calculate_net_return(
            selling_price_per_kg=modal_price_kg,
            quantity_kg=quantity_kg,
            transport_cost=transport["total_transport_cost"],
        )
        
        enriched.append({
            **m,
            "distance_km": dist_km,
            "modal_price_per_kg": modal_price_kg,
            "min_price_per_kg": min_price_kg,
            "max_price_per_kg": max_price_kg,
            "transport_estimate": transport,
            "net_return_breakdown": net,
            "estimated_net_return": net["net_return"],
            "estimated_gross_revenue": net["gross_revenue"],
        })
    
    # Sort by highest net return
    enriched.sort(key=lambda x: x.get("estimated_net_return", 0), reverse=True)
    
    best = enriched[0]
    alternatives = enriched[1:]
    
    # Generate human-readable reason
    reason_parts = []
    if best.get("estimated_net_return", 0) > 0:
        reason_parts.append(f"Highest estimated net return of ₹{best['estimated_net_return']:,.0f}")
    if best.get("distance_km", 0) < 100:
        reason_parts.append(f"relatively close at {best['distance_km']:.0f} km")
    reason_parts.append("based on current market price, distance, and estimated transport cost")
    reason = ", ".join(reason_parts) + "."
    
    return {
        "recommended": best,
        "alternatives": alternatives[:4],  # top 4 alternatives
        "reason": reason,
        "comparison_basis": "Estimated net return = Gross Revenue − Transport − APMC Commission (2%)",
        "disclaimer": "Prices and transport costs are estimates. Verify actual prices before selling.",
    }


# ---------------------------------------------------------------------------
# Buyer Matching Score
# ---------------------------------------------------------------------------
MATCH_WEIGHTS = {
    "price_score": 0.30,
    "quantity_score": 0.20,
    "quality_score": 0.20,
    "distance_score": 0.15,
    "reliability_score": 0.15,
}


def buyer_match_score(
    crop_lot: Dict[str, Any],
    buyer: Dict[str, Any],
    requirement: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Calculate a 0-100 match score between a crop lot and a buyer/requirement.
    
    Weights: Price 30%, Quantity 20%, Quality 20%, Distance 15%, Reliability 15%
    """
    scores = {}
    
    # 1. Price Score (buyer price ≥ farmer asking price)
    farmer_ask = crop_lot.get("expected_price_per_kg", 0) or 0
    buyer_offer = (requirement or {}).get("max_price_per_kg", 0) or buyer.get("typical_price_per_kg", 0) or 0
    if farmer_ask > 0 and buyer_offer > 0:
        price_ratio = min(buyer_offer / farmer_ask, 2.0)  # cap at 200%
        scores["price_score"] = min(price_ratio * 50, 100)  # 1.0 ratio = 50 score
    else:
        scores["price_score"] = 50  # neutral if no price info

    # 2. Quantity Score
    lot_qty = crop_lot.get("quantity_kg", 0) or 0
    req_min = (requirement or {}).get("quantity_kg_min", 0) or 0
    req_max = (requirement or {}).get("quantity_kg_max", lot_qty * 2) or lot_qty * 2
    if req_min <= lot_qty <= req_max:
        scores["quantity_score"] = 100
    elif lot_qty < req_min:
        scores["quantity_score"] = max(0, 100 - ((req_min - lot_qty) / req_min) * 100)
    else:
        scores["quantity_score"] = max(0, 100 - ((lot_qty - req_max) / lot_qty) * 50)

    # 3. Quality Score
    lot_grade = (crop_lot.get("quality_grade") or "").upper()
    req_grade = ((requirement or {}).get("quality_grade") or "").upper()
    if not req_grade or req_grade in ("ANY", ""):
        scores["quality_score"] = 100
    elif lot_grade == req_grade:
        scores["quality_score"] = 100
    elif (lot_grade == "A" and req_grade in ("B", "C")) or (lot_grade == "B" and req_grade == "C"):
        scores["quality_score"] = 80  # better than required
    else:
        scores["quality_score"] = 40

    # 4. Distance Score (closer = better, >200 km = 0)
    lot_lat = crop_lot.get("latitude") or 0
    lot_lon = crop_lot.get("longitude") or 0
    buyer_lat = buyer.get("latitude") or 0
    buyer_lon = buyer.get("longitude") or 0
    
    if lot_lat and lot_lon and buyer_lat and buyer_lon:
        dist_km = road_distance_km(haversine_km(lot_lat, lot_lon, buyer_lat, buyer_lon))
        scores["distance_score"] = max(0, 100 - (dist_km / 2))  # 0 km=100, 200 km=0
    else:
        scores["distance_score"] = 50  # neutral

    # 5. Reliability Score (based on rating and transactions)
    rating = buyer.get("rating", 3.0) or 3.0
    transactions = buyer.get("total_transactions", 0) or 0
    is_verified = buyer.get("is_verified", False)
    
    reliability = (rating / 5.0) * 60      # up to 60 points for rating
    reliability += min(transactions / 100 * 30, 30)  # up to 30 points for experience
    reliability += 10 if is_verified else 0  # 10 points for verified
    scores["reliability_score"] = min(reliability, 100)

    # Weighted total
    total = sum(scores[k] * MATCH_WEIGHTS[k] for k in MATCH_WEIGHTS)
    total = round(min(total, 100), 1)

    return {
        "total_score": total,
        "breakdown": {k: round(scores[k], 1) for k in scores},
        "weights": MATCH_WEIGHTS,
    }
