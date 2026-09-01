"""
Buyer & Crop Lot API
---------------------
Endpoints for:
  - CropLot management (farmer creates a lot for sale)
  - Buyer matching (find buyers for a crop lot)
  - BuyerRequirement management
  - Offer creation and acceptance
  - Buyer listing
"""
import uuid
from typing import Any, List, Optional
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User, BuyerProfile
from app.models.marketplace import CropLot, BuyerRequirement, Offer, Commodity
from app.services.market_service import buyer_match_score, road_distance_km, haversine_km
from app.core.config import settings

router = APIRouter()


# ---------------------------------------------------------------------------
# Crop Lots
# ---------------------------------------------------------------------------

@router.post("/crop-lots", status_code=status.HTTP_201_CREATED)
def create_crop_lot(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Farmer Only] Create a new crop lot for sale."""
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can create crop lots.")
    
    lot = CropLot(
        id=uuid.uuid4(),
        farmer_id=current_user.id,
        crop_name=payload.get("crop_name", ""),
        quantity_kg=float(payload.get("quantity_kg", 0)),
        quality_grade=payload.get("quality_grade", "A"),
        variety=payload.get("variety"),
        harvest_date=date.fromisoformat(payload["harvest_date"]) if payload.get("harvest_date") else None,
        state=payload.get("state", ""),
        district=payload.get("district", ""),
        village=payload.get("village"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        expected_price_per_kg=payload.get("expected_price_per_kg"),
        packaging=payload.get("packaging"),
        farmer_notes=payload.get("farmer_notes"),
        status="active",
    )
    
    # Try to link to commodity
    if lot.crop_name:
        commodity = db.query(Commodity).filter(
            func.lower(Commodity.canonical_name) == lot.crop_name.lower()
        ).first()
        if commodity:
            lot.commodity_id = commodity.id
    
    db.add(lot)
    db.commit()
    db.refresh(lot)
    
    return {
        "id": str(lot.id),
        "crop_name": lot.crop_name,
        "quantity_kg": lot.quantity_kg,
        "quality_grade": lot.quality_grade,
        "state": lot.state,
        "district": lot.district,
        "status": lot.status,
        "created_at": lot.created_at.isoformat() if lot.created_at else None,
    }


@router.get("/crop-lots")
def list_crop_lots(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List crop lots. Farmers see their own; admins/buyers see all active."""
    query = db.query(CropLot)
    
    if current_user.role == "farmer":
        query = query.filter(CropLot.farmer_id == current_user.id)
    elif current_user.role == "buyer":
        query = query.filter(CropLot.status == "active")
    
    if commodity:
        query = query.filter(func.lower(CropLot.crop_name) == commodity.lower())
    if state:
        query = query.filter(func.lower(CropLot.state) == state.lower())
    if district:
        query = query.filter(func.lower(CropLot.district) == district.lower())
    if status_filter:
        query = query.filter(CropLot.status == status_filter)
    
    lots = query.order_by(CropLot.created_at.desc()).limit(limit).all()
    
    result = [
        {
            "id": str(lot.id),
            "farmer_id": str(lot.farmer_id),
            "crop_name": lot.crop_name,
            "quantity_kg": lot.quantity_kg,
            "quality_grade": lot.quality_grade,
            "variety": lot.variety,
            "harvest_date": lot.harvest_date.isoformat() if lot.harvest_date else None,
            "state": lot.state,
            "district": lot.district,
            "village": lot.village,
            "expected_price_per_kg": lot.expected_price_per_kg,
            "packaging": lot.packaging,
            "status": lot.status,
            "created_at": lot.created_at.isoformat() if lot.created_at else None,
        }
        for lot in lots
    ]
    
    return {"crop_lots": result, "count": len(result)}


# ---------------------------------------------------------------------------
# Buyers
# ---------------------------------------------------------------------------

@router.get("/buyers")
def list_buyers(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    buyer_type: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
) -> Any:
    """List verified buyers with profiles."""
    query = (
        db.query(User, BuyerProfile)
        .join(BuyerProfile, User.id == BuyerProfile.user_id)
        .filter(User.role == "buyer")
    )
    
    if state:
        query = query.filter(func.lower(BuyerProfile.state) == state.lower())
    if buyer_type:
        query = query.filter(func.lower(BuyerProfile.buyer_type) == buyer_type.lower())
    
    buyers = query.limit(limit).all()
    
    result = [
        {
            "id": str(user.id),
            "full_name": user.full_name,
            "organization_name": profile.organization_name,
            "buyer_type": profile.buyer_type,
            "state": profile.state,
            "district": profile.district,
            "latitude": profile.latitude,
            "longitude": profile.longitude,
            "rating": profile.rating,
            "total_transactions": profile.total_transactions,
            "is_verified": profile.is_verified,
        }
        for user, profile in buyers
    ]
    
    # Demo fallback
    if not result and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_buyers
        result = get_demo_buyers(commodity or "Tomato")
    
    return {"buyers": result, "count": len(result)}


# ---------------------------------------------------------------------------
# Buyer Requirements
# ---------------------------------------------------------------------------

@router.post("/buyer-requirements", status_code=status.HTTP_201_CREATED)
def create_buyer_requirement(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Buyer Only] Create a procurement requirement."""
    if current_user.role not in ("buyer", "admin"):
        raise HTTPException(status_code=403, detail="Only buyers can create requirements.")
    
    req = BuyerRequirement(
        id=uuid.uuid4(),
        buyer_id=current_user.id,
        crop_name=payload.get("crop_name", ""),
        quantity_kg_min=payload.get("quantity_kg_min"),
        quantity_kg_max=payload.get("quantity_kg_max"),
        quality_grade=payload.get("quality_grade"),
        max_price_per_kg=payload.get("max_price_per_kg"),
        preferred_state=payload.get("preferred_state"),
        preferred_district=payload.get("preferred_district"),
        buyer_type=payload.get("buyer_type"),
        required_by_date=date.fromisoformat(payload["required_by_date"]) if payload.get("required_by_date") else None,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return {"id": str(req.id), "status": "created"}


# ---------------------------------------------------------------------------
# Buyer Matching
# ---------------------------------------------------------------------------

@router.post("/buyer-matching")
def match_buyers(
    payload: dict,
    db: Session = Depends(get_db),
) -> Any:
    """
    Find and score buyers matching a crop lot.
    
    Body: {
      crop_name, quantity_kg, quality_grade, state, district,
      farmer_lat, farmer_lon, expected_price_per_kg
    }
    
    Match score = Price 30% + Quantity 20% + Quality 20% + Distance 15% + Reliability 15%
    """
    crop_lot = {
        "crop_name": payload.get("crop_name", "Tomato"),
        "quantity_kg": float(payload.get("quantity_kg", 1000)),
        "quality_grade": payload.get("quality_grade", "A"),
        "expected_price_per_kg": payload.get("expected_price_per_kg", 35.0),
        "latitude": payload.get("farmer_lat"),
        "longitude": payload.get("farmer_lon"),
    }
    
    # Get buyers from DB
    buyers_query = (
        db.query(User, BuyerProfile)
        .join(BuyerProfile, User.id == BuyerProfile.user_id)
        .filter(User.role == "buyer")
    )
    db_buyers = buyers_query.all()
    
    buyers_data = [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "organization_name": bp.organization_name,
            "buyer_type": bp.buyer_type,
            "state": bp.state,
            "district": bp.district,
            "latitude": bp.latitude,
            "longitude": bp.longitude,
            "rating": bp.rating or 3.5,
            "total_transactions": bp.total_transactions or 0,
            "is_verified": bp.is_verified or False,
        }
        for u, bp in db_buyers
    ]
    
    # Demo fallback
    if not buyers_data and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_buyers
        buyers_data = get_demo_buyers(crop_lot["crop_name"])
        # Flatten requirement into buyer
        for b in buyers_data:
            req = b.pop("requirement", {})
            b.update(req)
    
    # Get requirements
    requirements = db.query(BuyerRequirement).filter(
        func.lower(BuyerRequirement.crop_name) == crop_lot["crop_name"].lower(),
        BuyerRequirement.is_active == True,
    ).all()
    
    req_map = {str(r.buyer_id): r for r in requirements}
    
    # Score each buyer
    scored = []
    for buyer in buyers_data:
        req = req_map.get(buyer.get("id", ""))
        req_dict = {
            "quantity_kg_min": getattr(req, "quantity_kg_min", buyer.get("quantity_kg_min")),
            "quantity_kg_max": getattr(req, "quantity_kg_max", buyer.get("quantity_kg_max")),
            "quality_grade": getattr(req, "quality_grade", buyer.get("quality_grade")),
            "max_price_per_kg": getattr(req, "max_price_per_kg", buyer.get("max_price_per_kg")),
        } if req else {
            "quantity_kg_min": buyer.get("quantity_kg_min"),
            "quantity_kg_max": buyer.get("quantity_kg_max"),
            "quality_grade": buyer.get("quality_grade"),
            "max_price_per_kg": buyer.get("max_price_per_kg"),
        }
        
        score_result = buyer_match_score(crop_lot, buyer, req_dict)
        
        # Calculate distance for display
        blat = buyer.get("latitude") or 0
        blon = buyer.get("longitude") or 0
        flat = crop_lot.get("latitude") or 0
        flon = crop_lot.get("longitude") or 0
        
        dist_km = None
        if flat and flon and blat and blon:
            dist_km = round(road_distance_km(haversine_km(flat, flon, blat, blon)), 1)
        
        scored.append({
            **buyer,
            "match_score": score_result["total_score"],
            "match_breakdown": score_result["breakdown"],
            "distance_km": dist_km,
            "offered_price_per_kg": req_dict.get("max_price_per_kg"),
            "required_quantity_kg": req_dict.get("quantity_kg_max"),
            "quality_requirement": req_dict.get("quality_grade", "Any"),
        })
    
    # Sort by match score
    scored.sort(key=lambda x: x.get("match_score", 0), reverse=True)
    
    return {
        "crop_lot": crop_lot,
        "matches": scored,
        "count": len(scored),
        "scoring_note": "Match Score = Price 30% + Quantity 20% + Quality 20% + Distance 15% + Reliability 15%",
        "is_demo": not bool(db_buyers) and settings.DEMO_MODE,
    }


# ---------------------------------------------------------------------------
# Offers
# ---------------------------------------------------------------------------

@router.post("/offers", status_code=status.HTTP_201_CREATED)
def create_offer(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Buyer Only] Create an offer for a crop lot."""
    if current_user.role not in ("buyer", "admin"):
        raise HTTPException(status_code=403, detail="Only buyers can make offers.")
    
    crop_lot_id = payload.get("crop_lot_id")
    if not crop_lot_id:
        raise HTTPException(status_code=400, detail="crop_lot_id is required.")
    
    lot = db.query(CropLot).filter(CropLot.id == crop_lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Crop lot not found.")
    if lot.status != "active":
        raise HTTPException(status_code=400, detail="This crop lot is no longer active.")
    
    offer = Offer(
        id=uuid.uuid4(),
        crop_lot_id=lot.id,
        buyer_id=current_user.id,
        offered_price_per_kg=float(payload.get("offered_price_per_kg", 0)),
        offered_quantity_kg=float(payload.get("offered_quantity_kg", lot.quantity_kg)),
        message=payload.get("message"),
        status="pending",
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    
    return {
        "id": str(offer.id),
        "crop_lot_id": str(offer.crop_lot_id),
        "buyer_id": str(offer.buyer_id),
        "offered_price_per_kg": offer.offered_price_per_kg,
        "offered_quantity_kg": offer.offered_quantity_kg,
        "status": offer.status,
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
    }


@router.get("/offers")
def list_offers(
    crop_lot_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List offers."""
    query = db.query(Offer)
    
    if current_user.role == "farmer":
        # Farmers see offers on their lots
        farmer_lot_ids = [lot.id for lot in db.query(CropLot).filter(CropLot.farmer_id == current_user.id).all()]
        query = query.filter(Offer.crop_lot_id.in_(farmer_lot_ids))
    elif current_user.role == "buyer":
        query = query.filter(Offer.buyer_id == current_user.id)
    
    if crop_lot_id:
        query = query.filter(Offer.crop_lot_id == crop_lot_id)
    
    offers = query.order_by(Offer.created_at.desc()).all()
    
    return {
        "offers": [
            {
                "id": str(o.id),
                "crop_lot_id": str(o.crop_lot_id),
                "buyer_id": str(o.buyer_id) if o.buyer_id else None,
                "offered_price_per_kg": o.offered_price_per_kg,
                "offered_quantity_kg": o.offered_quantity_kg,
                "match_score": o.match_score,
                "message": o.message,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in offers
        ]
    }


@router.patch("/offers/{offer_id}/accept")
def accept_offer(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Farmer Only] Accept a buyer's offer."""
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can accept offers.")
    
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")
    
    lot = db.query(CropLot).filter(CropLot.id == offer.crop_lot_id).first()
    if not lot or lot.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this crop lot.")
    
    if offer.status != "pending":
        raise HTTPException(status_code=400, detail=f"Offer is already {offer.status}.")
    
    offer.status = "accepted"
    lot.status = "sold"
    
    # Reject other pending offers for same lot
    db.query(Offer).filter(
        Offer.crop_lot_id == lot.id,
        Offer.id != offer.id,
        Offer.status == "pending",
    ).update({"status": "rejected"})
    
    db.commit()
    db.refresh(offer)
    
    return {
        "id": str(offer.id),
        "status": offer.status,
        "message": "Offer accepted successfully. The crop lot is now marked as sold.",
    }


@router.patch("/offers/{offer_id}/reject")
def reject_offer(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Farmer Only] Reject a buyer's offer."""
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can reject offers.")
    
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")
    
    offer.status = "rejected"
    db.commit()
    return {"id": str(offer.id), "status": "rejected"}
