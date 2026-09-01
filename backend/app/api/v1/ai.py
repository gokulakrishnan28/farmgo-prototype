from datetime import datetime
from typing import Any
from fastapi import APIRouter, Query
from app.services.ai_service import predict_crop_price, optimize_delivery_route, predict_crop_spoilage, predict_logistics_ml, call_gemini_api_sync, load_crop_database
from app.services.nllb_service import translate_nllb

router = APIRouter()

@router.get("/price-prediction")
def get_price_prediction(
    crop_name: str = Query(..., description="Name of the crop"),
    category: str = Query(..., description="Category of the crop (e.g. Grains, Vegetables, Fruits)"),
    quantity_kg: float = Query(..., description="Quantity of the crop in kilograms")
) -> Any:
    """
    Get price suggestions, trend suggestions, and market demand forecasts for a crop.
    """
    return predict_crop_price(crop_name=crop_name, category=category, quantity_kg=quantity_kg)

@router.get("/route-optimization")
def get_route_optimization(
    pickup: str = Query(..., description="Pickup location address"),
    destination: str = Query(..., description="Destination location address")
) -> Any:
    """
    Get optimized delivery distances, travel time suggestions, and wapyoints.
    """
    return optimize_delivery_route(pickup_address=pickup, delivery_address=destination)

@router.get("/spoilage-prediction")
def get_spoilage_prediction(
    crop_type: str = Query(..., description="Type of crop"),
    quantity_kg: float = Query(..., description="Quantity in kg"),
    harvest_date: str = Query(..., description="Harvest date in YYYY-MM-DD format"),
    transit_temp: float = Query(25.0, description="Transit temperature in Celsius")
) -> Any:
    """
    Get crop spoilage risk percentages and shelf life suggestions.
    """
    try:
        parsed_harvest_date = datetime.strptime(harvest_date, "%Y-%m-%d")
    except ValueError:
        parsed_harvest_date = datetime.utcnow()
        
    return predict_crop_spoilage(
        crop_type=crop_type, 
        quantity_kg=quantity_kg, 
        harvest_date=parsed_harvest_date,
        transit_temp_celsius=transit_temp
    )

@router.get("/logistics-prediction")
def get_logistics_prediction(
    crop_name: str = Query(..., description="Name of the crop"),
    category: str = Query(..., description="Category of the crop"),
    weight: float = Query(..., description="Weight of the harvest"),
    unit: str = Query("kg", description="Weight unit"),
    pickup: str = Query(..., description="Pickup location"),
    destination: str = Query(..., description="Destination location")
) -> Any:
    """
    Predict the best vehicle grade and ideal temperature target using ML classification.
    """
    return predict_logistics_ml(
        crop_name=crop_name,
        category=category,
        weight=weight,
        unit=unit,
        pickup=pickup,
        destination=destination
    )

def local_chat_assistant(message: str) -> str:
    # Detect language using NLLB or Tamil character detection
    has_tamil = any(char >= '\u0b80' and char <= '\u0bff' for char in message)
    is_tamil = has_tamil or any(x in message.lower() for x in ["tamil", "வணக்கம்", "தக்காளி", "வண்டி"])
    
    # Pre-process: if query is Tamil, translate to English to perform better matching
    english_query = message
    if is_tamil:
        try:
            english_query = translate_nllb(message, src_lang="tam_Taml", tgt_lang="eng_Latn")
            print(f"[NLLB] Translated Tamil query to English: {english_query}")
        except Exception as e:
            print(f"[NLLB] Query translation failed: {e}")
            
    lower = english_query.lower()
    english_response = ""
    
    # 1. Banana and temperature requirements
    if "banana" in lower and ("degree" in lower or "temp" in lower or "dispatch" in lower or "cold" in lower or "heat" in lower or "temperature" in lower):
        english_response = "Bananas require a controlled temperature of 13°C to 15°C (with 90% relative humidity) for dispatch to prevent premature ripening or chilling injury."
    
    # 2. General temperature requirements
    elif "temp" in lower or "degree" in lower or "dispatch" in lower or "celsius" in lower:
        english_response = "For dispatch, fresh vegetables need 5°C to 12°C. Perishable fruits like berries need 0°C to 4°C, and ambient crops can travel at normal room temperature."
        
    # 3. Price queries
    elif any(x in lower for x in ["price", "rate", "cost", "tariff", "value", "worth", "rupees", "inr"]):
        english_response = "Current market rates per kg: Tomatoes ₹35 - ₹40, Small Onions ₹60, Potatoes ₹30, Salem Malgova Mangoes ₹95. Grains like Ponni Rice are ₹54/kg."
        
    # 4. Vehicle recommendations
    elif any(x in lower for x in ["vehicle", "truck", "transport", "carrier", "hvac", "reefer", "lorry"]):
        english_response = "For perishable fruits/veg under 2 Tons, we recommend a Reefer Cold-Mini Van. For grains/dry items under 1.5 Tons, a Tata Ace/Bolero is ideal."
        
    # 5. Chennai markets routing
    elif any(x in lower for x in ["chennai", "koyambedu"]):
        english_response = "Chennai Koyambedu is our primary terminal hub. Dispatches from Madurai Silo typically take ~6 hours via NH-38."
        
    # 6. Madurai markets routing
    elif any(x in lower for x in ["madurai", "mattuthavani"]):
        english_response = "Madurai Mattuthavani is a major agricultural hub in south Tamil Nadu, directly linked to local farming blocks."
        
    # 7. Greetings & Thanks
    elif any(x in lower for x in ["thanks", "thank you", "great", "hello", "hi", "hey", "hola"]):
        english_response = "Hello! I am your FarmGo Assistant. I can help you check vegetable prices, find vehicle options, and check dispatch temperature requirements."
        
    else:
        # Smart generic response using the translated terms
        english_response = "I can help you coordinate logistics for your crop dispatch. Bananas need 13°C to 15°C, tomatoes need ₹35/kg, and Chennai Koyambedu is our main market."
        
    # Post-process: if the query was Tamil, translate the English response back to Tamil!
    if is_tamil:
        try:
            tamil_response = translate_nllb(english_response, src_lang="eng_Latn", tgt_lang="tam_Taml")
            print(f"[NLLB] Translated English response to Tamil: {tamil_response}")
            return tamil_response
        except Exception as e:
            print(f"[NLLB] Response translation failed: {e}")
            return "வாழைப்பழங்கள் கொண்டு செல்ல 13°C முதல் 15°C வெப்பநிலை தேவைப்படுகிறது." # Tamil fallback
            
    return english_response

@router.post("/chat")
def chat_with_gemini(payload: dict) -> Any:
    """
    Agri-Logistics chatbot endpoint powered by Gemini API, with NLLB-200 
    translation-augmented fallback.
    """
    message = payload.get("message", "")
    from app.core.config import settings
    api_key = settings.GEMINI_API_KEY
    
    # Check if key is available and test call
    prompt = f"""
    You are FarmGo Assistant, a helpful AI chatbot for direct farmer-transporter logistics in Tamil Nadu.
    Answer the following agricultural or logistics query concisely:
    Query: {message}
    """
    try:
        response_text = call_gemini_api_sync(prompt, api_key)
        return {"response": response_text}
    except Exception as e:
        print(f"Gemini Chat API failed, using NLLB translation fallback. Error: {e}")
        return {"response": local_chat_assistant(message)}

@router.get("/crop-database")
def get_crop_database() -> Any:
    """
    Get the complete list of crop entries parsed from farmgo_crop_database.csv
    """
    db_dict = load_crop_database()
    return list(db_dict.values())

@router.get("/active-dispatches")
def get_active_dispatches() -> Any:
    """
    Retrieve the shared list of active crop shipments.
    """
    import os
    import json
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "active_dispatches.json")
    
    # Return default initial list if the file doesn't exist yet
    if not os.path.exists(filepath):
        default_list = [
            {
                "id": "FG-ORD-7281",
                "crop": "Marigold (சாமந்தி)",
                "weight": "1.5 Tons",
                "pickup": "Madurai Hub (மதுரை)",
                "destination": "Chennai Koyambedu Market",
                "driver": "Karthikeyan",
                "storage": "Normal Storage",
                "fee": 7281,
                "carrier": "Ashok Leyland Truck",
                "tempRange": "18-22°C (Ambient)",
                "badge": "Cold Chain Active",
                "badgeType": "cold",
                "route": "Madurai (Silo) ➔ Chennai Koyambedu",
                "progress": 42
            },
            {
                "id": "FG-ORD-8500",
                "crop": "Erode Turmeric (Grade A)",
                "weight": "800 kg",
                "pickup": "Green Agros, Erode",
                "destination": "Koyambedu Market, Chennai",
                "driver": "Anbarasan K.",
                "storage": "Normal Storage",
                "fee": 8500,
                "carrier": "Bolero Pickup",
                "tempRange": "12-15°C (Dry)",
                "badge": "Ambient Logistics",
                "badgeType": "ambient",
                "route": "Erode ➔ Gandhi Market, Trichy",
                "progress": 100
            }
        ]
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(default_list, f, ensure_ascii=False, indent=2)
        return default_list

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Backend API] Error reading active_dispatches.json: {e}")
        return []

@router.post("/active-dispatches")
def add_active_dispatch(payload: dict) -> Any:
    """
    Post a new active shipment to the list.
    """
    import os
    import json
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "active_dispatches.json")
    
    current_list = get_active_dispatches()
    
    # Generate unique ID if not provided
    if not payload.get("id"):
        import random
        payload["id"] = f"FG-ORD-{random.randint(1000, 9999)}"
        
    current_list.insert(0, payload)
    
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(current_list, f, ensure_ascii=False, indent=2)
        print(f"[Backend API] Successfully saved dispatch: {payload['id']}")
    except Exception as e:
        print(f"[Backend API] Error saving dispatch to JSON: {e}")
        
    return payload



