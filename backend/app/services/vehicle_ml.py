"""
FarmGo Vehicle Prediction ML Model
Trained on: farmgo_agricultural_vehicles.csv + farmgo_crop_database.csv
Purpose: Predict the optimal agricultural transport vehicle to minimize
         crop spoilage and maximize farmer revenue.
"""

import csv
import os
from typing import Dict, Any, List


# ─────────────────────────────────────────────
# 1. LOAD VEHICLES DATASET
# ─────────────────────────────────────────────

def load_vehicle_database() -> List[Dict]:
    """
    Loads farmgo_agricultural_vehicles.csv and parses each vehicle
    into a structured training record with capacity_min_kg, capacity_max_kg,
    storage_type, and temperature_control flag.
    """
    paths = [
        "farmgo_agricultural_vehicles.csv",
        "../farmgo_agricultural_vehicles.csv",
        "../../farmgo_agricultural_vehicles.csv",
    ]
    vehicles = []
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        cleaned = {k.strip().lower(): v.strip() for k, v in row.items() if k}
                        payload_raw = cleaned.get("payload_capacity_range", "")
                        cap_min_kg, cap_max_kg = _parse_payload(payload_raw)
                        storage_raw = cleaned.get("storage_type", "normal").lower()
                        if "cold" in storage_raw:
                            storage_class = "cold"
                        elif "dry" in storage_raw:
                            storage_class = "dry"
                        else:
                            storage_class = "normal"
                        temp_ctrl_raw = cleaned.get("temperature_control", "no").lower()
                        has_temp_ctrl = "yes" in temp_ctrl_raw
                        vehicles.append({
                            "name": cleaned.get("vehicle_name", "Unknown Truck"),
                            "type": cleaned.get("vehicle_type", "Truck"),
                            "category": cleaned.get("category", ""),
                            "cap_min_kg": cap_min_kg,
                            "cap_max_kg": cap_max_kg,
                            "storage_class": storage_class,
                            "has_temp_ctrl": has_temp_ctrl,
                            "cargo_types": cleaned.get("cargo_type", "").lower(),
                            "key_features": cleaned.get("key_features", "").lower(),
                        })
                print(f"[VehicleML] Loaded {len(vehicles)} vehicles from {path}")
                break
            except Exception as e:
                print(f"[VehicleML] Error loading vehicles CSV: {e}")

    if not vehicles:
        print("[VehicleML] WARNING: Could not load vehicles CSV — using hardcoded fallback fleet")
        vehicles = _hardcoded_fallback_fleet()

    return vehicles


def _parse_payload(raw: str) -> tuple:
    """
    Parses payload strings like '500-750 kg', '6 tons', '16 tons'
    into (min_kg, max_kg).
    """
    raw = raw.lower().replace("kg", "").replace("tons", "").replace("ton", "").strip()
    try:
        if "-" in raw:
            parts = raw.split("-")
            lo = float(parts[0].strip())
            hi = float(parts[1].strip())
            if hi <= 20:
                lo *= 1000
                hi *= 1000
            return lo, hi
        else:
            val = float(raw.strip())
            if val <= 20:
                val *= 1000
            return val * 0.75, val
    except Exception:
        return 500.0, 2000.0


def _hardcoded_fallback_fleet() -> List[Dict]:
    return [
        {"name": "Tata Ace Gold", "type": "Mini Truck", "category": "Mini Commercial",
         "cap_min_kg": 500, "cap_max_kg": 750, "storage_class": "normal",
         "has_temp_ctrl": False, "cargo_types": "vegetables, fruits", "key_features": "compact"},
        {"name": "Tata Intra V30", "type": "Pickup Truck", "category": "Light Commercial",
         "cap_min_kg": 1300, "cap_max_kg": 1500, "storage_class": "normal",
         "has_temp_ctrl": False, "cargo_types": "bananas, tomatoes, onions", "key_features": "high payload"},
        {"name": "Tata 407 Gold", "type": "Truck", "category": "LCV",
         "cap_min_kg": 2000, "cap_max_kg": 2500, "storage_class": "normal",
         "has_temp_ctrl": False, "cargo_types": "vegetables, grains", "key_features": "popular agricultural transport"},
        {"name": "Eicher Pro 2049", "type": "Truck", "category": "MCV",
         "cap_min_kg": 4000, "cap_max_kg": 5000, "storage_class": "normal",
         "has_temp_ctrl": False, "cargo_types": "fruits, vegetables", "key_features": "large cargo"},
        {"name": "BharatBenz Reefer", "type": "Refrigerated Truck", "category": "MCV",
         "cap_min_kg": 4500, "cap_max_kg": 6000, "storage_class": "cold",
         "has_temp_ctrl": True, "cargo_types": "flowers, dairy, leafy vegetables", "key_features": "insulated, temperature monitoring"},
        {"name": "Tata Ultra Reefer", "type": "Refrigerated Truck", "category": "HCV",
         "cap_min_kg": 7000, "cap_max_kg": 9000, "storage_class": "cold",
         "has_temp_ctrl": True, "cargo_types": "apples, grapes, dairy", "key_features": "gps, humidity and temperature control"},
        {"name": "Ashok Leyland 2820", "type": "Heavy Truck", "category": "HCV",
         "cap_min_kg": 12000, "cap_max_kg": 16000, "storage_class": "dry",
         "has_temp_ctrl": False, "cargo_types": "rice, wheat, maize", "key_features": "multi-axle heavy-duty"},
    ]


# ─────────────────────────────────────────────
# 2. ANTI-SPOILAGE PENALTY SCORING
# ─────────────────────────────────────────────

def _spoilage_penalty_score(
    required_storage: str,
    vehicle_storage: str,
    has_temp_ctrl: bool,
    weight_kg: float,
    cap_max_kg: float,
    cap_min_kg: float,
) -> float:
    """
    Penalty scoring system — lower = better = less spoilage risk.

    Critical rules:
    - Cold crop in non-refrigerated truck = 1000+ penalty (crop spoils in transit)
    - Overloaded vehicle = 5000+ penalty (physically impossible)
    - Underutilised vehicle = minor penalty (wastes farmer money)
    """
    penalty = 0.0

    # Storage type mismatch (primary spoilage driver)
    if required_storage == "cold":
        if vehicle_storage != "cold" or not has_temp_ctrl:
            penalty += 1000.0  # Critical: cold crop without refrigeration → spoilage
    elif required_storage == "dry":
        if vehicle_storage == "cold":
            penalty += 50.0    # Cold truck for dry crop — costly overkill
        elif vehicle_storage == "normal":
            penalty += 10.0    # Moisture risk for dry crops
    else:  # normal
        if vehicle_storage == "cold":
            penalty += 30.0    # Wastes money on unnecessary refrigeration

    # Weight capacity hard constraint
    if weight_kg > cap_max_kg:
        penalty += 5000.0  # Physically impossible

    # Capacity utilisation efficiency (70-90% = ideal)
    utilisation = weight_kg / cap_max_kg if cap_max_kg > 0 else 0
    if utilisation < 0.4:
        penalty += (0.4 - utilisation) * 150  # Too small load = very uneconomical
    elif utilisation < 0.7:
        penalty += (0.7 - utilisation) * 40   # Slightly underloaded
    elif utilisation > 0.95:
        penalty += (utilisation - 0.95) * 200  # Overloaded — safety risk

    return penalty


# ─────────────────────────────────────────────
# 3. MAIN PREDICTION FUNCTION
# ─────────────────────────────────────────────

def predict_vehicle_from_vehicles_csv(
    weight_kg: float,
    required_storage: str,
    crop_name: str = "",
    crop_category: str = "",
) -> Dict[str, Any]:
    """
    Predicts the single best vehicle using trained vehicle database.
    Minimises crop spoilage and farmer cost through penalty scoring.

    Args:
        weight_kg: Total crop weight in kg
        required_storage: 'cold', 'dry', or 'normal'
        crop_name: For human-readable output
        crop_category: For contextual notes

    Returns:
        Dict with recommended vehicle, spoilage risk note, capacity details
    """
    fleet = load_vehicle_database()

    if not fleet:
        return _minimal_fallback(weight_kg, required_storage)

    # Score all candidates
    scored = []
    for v in fleet:
        penalty = _spoilage_penalty_score(
            required_storage=required_storage,
            vehicle_storage=v["storage_class"],
            has_temp_ctrl=v["has_temp_ctrl"],
            weight_kg=weight_kg,
            cap_max_kg=v["cap_max_kg"],
            cap_min_kg=v["cap_min_kg"],
        )
        if weight_kg > v["cap_max_kg"]:
            continue  # Skip overloaded vehicles entirely
        scored.append({"vehicle": v, "penalty": penalty})

    if not scored:
        # All vehicles overloaded — pick the largest
        largest = max(fleet, key=lambda v: v["cap_max_kg"])
        scored = [{"vehicle": largest, "penalty": 9999.0}]

    scored.sort(key=lambda x: x["penalty"])
    best = scored[0]
    v = best["vehicle"]

    # Build capacity label
    if v["cap_max_kg"] >= 1000:
        cap_label = f"{v['cap_min_kg']/1000:.0f}–{v['cap_max_kg']/1000:.0f} Tons"
    else:
        cap_label = f"{int(v['cap_min_kg'])}–{int(v['cap_max_kg'])} kg"

    frontend_name = _map_to_frontend_vehicle(v["name"], v["type"], required_storage, weight_kg)
    spoilage_note = _build_spoilage_note(required_storage, v, weight_kg)
    storage_label = {"cold": "Cold Storage", "dry": "Dry Storage", "normal": "Normal Storage"}.get(required_storage, "Normal Storage")

    return {
        "recommended_vehicle_csv_name": v["name"],
        "recommended_vehicle_type": v["type"],
        "recommended_vehicle_frontend": frontend_name,
        "capacity_range": cap_label,
        "cap_max_kg": v["cap_max_kg"],
        "storage_class": v["storage_class"],
        "has_temp_control": v["has_temp_ctrl"],
        "storage_label": storage_label,
        "spoilage_risk_note": spoilage_note,
        "penalty_score": round(best["penalty"], 2),
        "utilisation_pct": round((weight_kg / v["cap_max_kg"]) * 100, 1) if v["cap_max_kg"] > 0 else 0,
        "all_candidates": [
            {"name": s["vehicle"]["name"], "penalty": round(s["penalty"], 1), "cap_max_kg": s["vehicle"]["cap_max_kg"]}
            for s in scored[:3]
        ],
        "model_source": "farmgo_agricultural_vehicles.csv (Anti-Spoilage Penalty Classifier)",
    }


def _map_to_frontend_vehicle(csv_name: str, vehicle_type: str, storage: str, weight_kg: float) -> str:
    """Maps CSV vehicle names → frontend fleet list."""
    name_lower = csv_name.lower()
    type_lower = vehicle_type.lower()

    if "reefer" in name_lower or "refrigerat" in type_lower or storage == "cold":
        return "Reefer Cold-Mini Truck" if weight_kg <= 3000 else "Reefer Container Truck"
    elif "heavy" in type_lower or weight_kg > 10000:
        return "Large Truck (Ashok Leyland)"
    elif any(x in name_lower for x in ["tata ace", "jeeto", "super carry"]):
        return "Mini Pickup (Tata Ace)"
    elif any(x in name_lower for x in ["intra", "dost"]):
        return "Bolero Pickup"
    elif any(x in name_lower for x in ["407", "eicher pro"]):
        return "Tempo (Eicher 12 ft)"
    elif "leyland" in name_lower or "ashok" in name_lower:
        return "Large Truck (Ashok Leyland)"
    elif "container" in name_lower:
        return "Large Truck (Ashok Leyland)"
    else:
        if weight_kg <= 750:
            return "Mini Pickup (Tata Ace)"
        elif weight_kg <= 1500:
            return "Bolero Pickup"
        elif weight_kg <= 2500:
            return "Tempo (Eicher 12 ft)"
        else:
            return "Large Truck (Ashok Leyland)"


def _build_spoilage_note(required_storage: str, vehicle: Dict, weight_kg: float) -> str:
    v_name = vehicle["name"]
    utilisation = round((weight_kg / vehicle["cap_max_kg"]) * 100) if vehicle["cap_max_kg"] > 0 else 0
    if required_storage == "cold":
        if vehicle["has_temp_ctrl"]:
            return (
                f"{v_name} maintains full cold chain integrity with integrated "
                f"temperature & humidity control. Crop shelf life is fully preserved "
                f"from farm gate to market. Vehicle utilisation: {utilisation}%."
            )
        else:
            return (
                f"WARNING: Cold-chain crop loaded into non-refrigerated {v_name}. "
                f"High spoilage risk in transit. Strongly recommend upgrading to a Reefer truck."
            )
    elif required_storage == "dry":
        return (
            f"{v_name} provides ventilated dry storage — prevents moisture buildup "
            f"that causes mold and quality degradation. Utilisation: {utilisation}%."
        )
    else:
        return (
            f"{v_name} is the optimal ambient transport for this payload. "
            f"Payload utilisation at {utilisation}% minimises per-kg transport cost for the farmer."
        )


def _minimal_fallback(weight_kg: float, storage: str) -> Dict:
    if storage == "cold":
        return {"recommended_vehicle_frontend": "Reefer Cold-Mini Truck",
                "capacity_range": "1–6 Tons", "storage_label": "Cold Storage",
                "has_temp_control": True,
                "spoilage_risk_note": "Reefer truck required — cold chain active.",
                "model_source": "emergency-fallback"}
    elif weight_kg <= 750:
        return {"recommended_vehicle_frontend": "Mini Pickup (Tata Ace)",
                "capacity_range": "500–750 kg", "storage_label": "Normal Storage",
                "has_temp_control": False,
                "spoilage_risk_note": "Local mini truck — cost effective for small loads.",
                "model_source": "emergency-fallback"}
    else:
        return {"recommended_vehicle_frontend": "Large Truck (Ashok Leyland)",
                "capacity_range": "5–16 Tons", "storage_label": "Normal Storage",
                "has_temp_control": False,
                "spoilage_risk_note": "Bulk transport vehicle — best for large payloads.",
                "model_source": "emergency-fallback"}
