"""
Market Intelligence API
------------------------
Endpoints for market price discovery, comparison, forecasting,
net-return recommendation, and government data ingestion.
"""
from typing import Any, List, Optional
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.marketplace import Market, Commodity, MarketPrice, DataSyncLog
from app.services.market_service import (
    recommend_best_market,
    estimate_transport_cost,
    road_distance_km,
    haversine_km,
)
from app.services.forecast_service import simple_forecast_from_db_prices
from app.services.ingestion_service import ingest_ogd_csv
from app.core.config import settings

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper: get demo data if DEMO_MODE or no DB data
# ---------------------------------------------------------------------------
def _get_demo_comparison(commodity: str, district: str, state: str, quantity_kg: float,
                         farmer_lat: float, farmer_lon: float):
    from app.data.demo_data import get_demo_market_comparison
    from app.services.market_service import recommend_best_market
    
    markets = get_demo_market_comparison(commodity, district, state, quantity_kg, farmer_lat, farmer_lon)
    return markets


# ---------------------------------------------------------------------------
# Markets
# ---------------------------------------------------------------------------

@router.get("/markets")
def list_markets(
    state: Optional[str] = Query(None, description="Filter by state (e.g., Maharashtra, Tamil Nadu)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
) -> Any:
    """List all markets, optionally filtered by state/district."""
    query = db.query(Market).filter(Market.is_active == True)
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    if district:
        query = query.filter(func.lower(Market.district) == district.lower())
    
    markets = query.order_by(Market.state, Market.district, Market.market_name).all()
    
    result = [
        {
            "id": str(m.id),
            "market_name": m.market_name,
            "state": m.state,
            "district": m.district,
            "taluka": m.taluka,
            "latitude": m.latitude,
            "longitude": m.longitude,
            "market_type": m.market_type,
            "source": m.source,
        }
        for m in markets
    ]
    
    # If no DB markets and demo mode, return demo data
    if not result and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_markets
        demo_markets = get_demo_markets()
        if state:
            demo_markets = [m for m in demo_markets if m.get("state", "").lower() == state.lower()]
        result = [{"is_demo": True, **m} for m in demo_markets]
    
    return {"markets": result, "count": len(result)}


@router.get("/markets/nearby")
def get_nearby_markets(
    lat: float = Query(..., description="Farmer latitude"),
    lon: float = Query(..., description="Farmer longitude"),
    radius_km: float = Query(200, description="Search radius in km"),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """Get markets within a radius of a given coordinate."""
    query = db.query(Market).filter(Market.is_active == True)
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    
    all_markets = query.all()
    
    nearby = []
    for m in all_markets:
        if m.latitude and m.longitude:
            dist = road_distance_km(haversine_km(lat, lon, m.latitude, m.longitude))
            if dist <= radius_km:
                nearby.append({
                    "id": str(m.id),
                    "market_name": m.market_name,
                    "state": m.state,
                    "district": m.district,
                    "latitude": m.latitude,
                    "longitude": m.longitude,
                    "market_type": m.market_type,
                    "distance_km": round(dist, 1),
                })
    
    nearby.sort(key=lambda x: x["distance_km"])
    
    # Demo fallback
    if not nearby and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_markets
        from app.services.market_service import haversine_km, road_distance_km
        demo_markets = get_demo_markets()
        for m in demo_markets:
            if m.get("latitude") and m.get("longitude"):
                dist = road_distance_km(haversine_km(lat, lon, m["latitude"], m["longitude"]))
                if dist <= radius_km:
                    nearby.append({"is_demo": True, "distance_km": round(dist, 1), **m})
        nearby.sort(key=lambda x: x["distance_km"])
    
    return {"markets": nearby, "count": len(nearby)}


# ---------------------------------------------------------------------------
# Commodities
# ---------------------------------------------------------------------------

@router.get("/commodities")
def list_commodities(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """List all commodity types."""
    query = db.query(Commodity)
    if category:
        query = query.filter(func.lower(Commodity.category) == category.lower())
    
    commodities = query.order_by(Commodity.canonical_name).all()
    return {
        "commodities": [
            {
                "id": str(c.id),
                "canonical_name": c.canonical_name,
                "category": c.category,
                "localized_names": c.localized_names,
                "unit": c.unit,
            }
            for c in commodities
        ]
    }


# ---------------------------------------------------------------------------
# Market Prices
# ---------------------------------------------------------------------------

@router.get("/market-prices")
def get_market_prices(
    commodity: Optional[str] = Query(None, description="Commodity canonical name (e.g., Tomato)"),
    market_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get market prices with filtering.
    Returns ₹/quintal prices (OGD standard) with ₹/kg conversion.
    """
    query = (
        db.query(MarketPrice, Market, Commodity)
        .join(Market, MarketPrice.market_id == Market.id)
        .join(Commodity, MarketPrice.commodity_id == Commodity.id)
    )
    
    if commodity:
        query = query.filter(func.lower(Commodity.canonical_name) == commodity.lower())
    if market_id:
        query = query.filter(MarketPrice.market_id == market_id)
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    if district:
        query = query.filter(func.lower(Market.district) == district.lower())
    if date_from:
        try:
            query = query.filter(MarketPrice.price_date >= date.fromisoformat(date_from))
        except ValueError:
            pass
    if date_to:
        try:
            query = query.filter(MarketPrice.price_date <= date.fromisoformat(date_to))
        except ValueError:
            pass
    
    total = query.count()
    records = query.order_by(MarketPrice.price_date.desc()).offset(offset).limit(limit).all()
    
    result = []
    for price, market, commodity_obj in records:
        result.append({
            "id": str(price.id),
            "commodity": commodity_obj.canonical_name,
            "market": market.market_name,
            "state": market.state,
            "district": market.district,
            "price_date": price.price_date.isoformat() if price.price_date else None,
            "min_price": price.min_price,            # ₹/quintal
            "modal_price": price.modal_price,         # ₹/quintal
            "max_price": price.max_price,             # ₹/quintal
            "min_price_per_kg": round((price.min_price or 0) / 100, 2),
            "modal_price_per_kg": round((price.modal_price or 0) / 100, 2),
            "max_price_per_kg": round((price.max_price or 0) / 100, 2),
            "unit": price.unit,
            "unit_note": "1 quintal = 100 kg",
            "arrival_quantity": price.arrival_quantity,
            "source": price.source,
            "fetched_at": price.fetched_at.isoformat() if price.fetched_at else None,
        })
    
    # Demo fallback
    if not result and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_prices
        result = get_demo_prices(commodity or "Tomato", state or "Maharashtra")
        result = result[offset:offset + limit]
    
    return {
        "prices": result,
        "total": total or len(result),
        "limit": limit,
        "offset": offset,
        "source_note": "Prices from Government OGD / AGMARKNET. Demo mode may be active.",
    }


@router.get("/market-prices/trend")
def get_price_trend(
    commodity: str = Query(..., description="Commodity name"),
    market_id: Optional[str] = Query(None),
    market_name: Optional[str] = Query(None),
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
) -> Any:
    """Get price trend for a commodity at a market over N days."""
    date_from = date.today() - timedelta(days=days)
    
    query = (
        db.query(MarketPrice, Market, Commodity)
        .join(Market, MarketPrice.market_id == Market.id)
        .join(Commodity, MarketPrice.commodity_id == Commodity.id)
        .filter(MarketPrice.price_date >= date_from)
        .filter(func.lower(Commodity.canonical_name) == commodity.lower())
    )
    
    if market_id:
        query = query.filter(MarketPrice.market_id == market_id)
    if market_name:
        query = query.filter(func.lower(Market.market_name).contains(market_name.lower()))
    
    records = query.order_by(MarketPrice.price_date.asc()).all()
    
    trend_data = []
    for price, market, commodity_obj in records:
        trend_data.append({
            "date": price.price_date.isoformat(),
            "modal_price": price.modal_price,
            "min_price": price.min_price,
            "max_price": price.max_price,
            "modal_price_per_kg": round((price.modal_price or 0) / 100, 2),
            "arrival_quantity": price.arrival_quantity,
            "market": market.market_name,
        })
    
    # Demo fallback
    if not trend_data and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_prices
        all_demo = get_demo_prices(commodity, "Maharashtra")
        if market_name:
            all_demo = [r for r in all_demo if market_name.lower() in r["market_name"].lower()]
        trend_data = [
            {
                "date": r["price_date"],
                "modal_price": r["modal_price"],
                "min_price": r["min_price"],
                "max_price": r["max_price"],
                "modal_price_per_kg": r["modal_price_per_kg"],
                "arrival_quantity": r["arrival_quantity_tonnes"],
                "market": r["market_name"],
                "is_demo": True,
            }
            for r in sorted(all_demo, key=lambda x: x["price_date"])
        ]
    
    return {
        "commodity": commodity,
        "market": market_name or market_id or "All",
        "days": days,
        "data": trend_data,
        "count": len(trend_data),
    }


@router.get("/market-prices/compare")
def compare_markets(
    commodity: str = Query(...),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    quantity_kg: float = Query(1000, gt=0),
    farmer_lat: Optional[float] = Query(None),
    farmer_lon: Optional[float] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """
    Compare today's prices across multiple markets for a commodity.
    Returns markets sorted by estimated net return.
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    query = (
        db.query(MarketPrice, Market, Commodity)
        .join(Market, MarketPrice.market_id == Market.id)
        .join(Commodity, MarketPrice.commodity_id == Commodity.id)
        .filter(func.lower(Commodity.canonical_name) == commodity.lower())
        .filter(MarketPrice.price_date >= yesterday)
    )
    
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    if district:
        query = query.filter(func.lower(Market.district) == district.lower())
    
    records = query.all()
    
    markets_data = []
    for price, market, _ in records:
        markets_data.append({
            "market_id": str(market.id),
            "market_name": market.market_name,
            "state": market.state,
            "district": market.district,
            "latitude": market.latitude,
            "longitude": market.longitude,
            "modal_price": price.modal_price,
            "min_price": price.min_price,
            "max_price": price.max_price,
            "arrival_quantity": price.arrival_quantity,
            "price_date": price.price_date.isoformat() if price.price_date else None,
            "source": price.source,
        })
    
    # Demo fallback
    if not markets_data and settings.DEMO_MODE:
        markets_data = _get_demo_comparison(
            commodity, district or "", state or "Maharashtra",
            quantity_kg,
            farmer_lat or 19.9975, farmer_lon or 73.7898
        )
        # Mark as demo
        for m in markets_data:
            m["is_demo"] = True
    
    if not markets_data:
        return {"markets": [], "recommendation": None, "message": "No price data available."}
    
    # Get recommendation
    if farmer_lat and farmer_lon:
        recommendation = recommend_best_market(
            markets_data, farmer_lat, farmer_lon, commodity, quantity_kg
        )
    else:
        recommendation = None
    
    # Add transport estimates to each market
    fl = farmer_lat or 19.9975
    fn = farmer_lon or 73.7898
    for m in markets_data:
        lat = m.get("latitude") or fl
        lon = m.get("longitude") or fn
        dist = road_distance_km(haversine_km(fl, fn, lat, lon))
        transport = estimate_transport_cost(commodity, quantity_kg, dist)
        modal_kg = (m.get("modal_price") or 0) / 100
        net = modal_kg * quantity_kg - transport["total_transport_cost"] - (modal_kg * quantity_kg * 0.02)
        m["distance_km"] = round(dist, 1)
        m["transport_estimate"] = transport
        m["modal_price_per_kg"] = modal_kg
        m["min_price_per_kg"] = (m.get("min_price") or 0) / 100
        m["max_price_per_kg"] = (m.get("max_price") or 0) / 100
        m["estimated_net_return"] = round(net, 2)
    
    markets_data.sort(key=lambda x: x.get("estimated_net_return", 0), reverse=True)
    
    return {
        "commodity": commodity,
        "quantity_kg": quantity_kg,
        "price_date": today.isoformat(),
        "markets": markets_data,
        "recommendation": recommendation,
        "source_note": "Prices in ₹/quintal (100 kg). Transport costs are estimates.",
        "unit_note": "1 quintal = 100 kg",
    }


# ---------------------------------------------------------------------------
# Net Return Recommendation
# ---------------------------------------------------------------------------

@router.post("/recommendations/best-market")
def best_market_recommendation(payload: dict) -> Any:
    """
    Calculate best market recommendation with net return breakdown.
    
    Body: {
      commodity, quantity_kg, quality_grade, state, district,
      farmer_lat, farmer_lon, markets_data (optional)
    }
    """
    commodity = payload.get("commodity", "Tomato")
    quantity_kg = float(payload.get("quantity_kg", 1000))
    state = payload.get("state", "Maharashtra")
    district = payload.get("district", "Nashik")
    farmer_lat = float(payload.get("farmer_lat", 19.9975))
    farmer_lon = float(payload.get("farmer_lon", 73.7898))
    markets_data = payload.get("markets_data")
    
    if not markets_data:
        from app.data.demo_data import get_demo_market_comparison
        markets_data = get_demo_market_comparison(commodity, district, state, quantity_kg, farmer_lat, farmer_lon)
    
    result = recommend_best_market(markets_data, farmer_lat, farmer_lon, commodity, quantity_kg)
    result["is_demo"] = settings.DEMO_MODE
    result["disclaimer"] = "This recommendation is based on estimated prices and transport costs. Verify actual market prices before selling."
    return result


# ---------------------------------------------------------------------------
# Transport Estimate
# ---------------------------------------------------------------------------

@router.post("/transport/estimate")
def get_transport_estimate(payload: dict) -> Any:
    """
    Estimate transport cost from farmer location to a market.
    
    Body: {
      crop_name, quantity_kg, distance_km (OR farmer_lat/lon + market_lat/lon), category
    }
    """
    crop_name = payload.get("crop_name", "")
    quantity_kg = float(payload.get("quantity_kg", 1000))
    category = payload.get("category", "")
    
    distance_km = payload.get("distance_km")
    
    if distance_km is None:
        # Calculate from coordinates
        farmer_lat = float(payload.get("farmer_lat", 0))
        farmer_lon = float(payload.get("farmer_lon", 0))
        market_lat = float(payload.get("market_lat", 0))
        market_lon = float(payload.get("market_lon", 0))
        
        if farmer_lat and farmer_lon and market_lat and market_lon:
            distance_km = road_distance_km(haversine_km(farmer_lat, farmer_lon, market_lat, market_lon))
        else:
            raise HTTPException(status_code=400, detail="Provide distance_km or coordinates (farmer_lat/lon + market_lat/lon)")
    
    estimate = estimate_transport_cost(crop_name, quantity_kg, float(distance_km), category)
    return estimate


# ---------------------------------------------------------------------------
# Price Forecast
# ---------------------------------------------------------------------------

@router.get("/forecast/{commodity}/{market_name}")
def get_price_forecast(
    commodity: str,
    market_name: str,
    horizon_days: int = Query(7, ge=1, le=14),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get ML price forecast for a commodity at a market.
    
    Returns:
    - Historical prices
    - Forecasted prices (1-14 days)
    - Trend, Confidence, MAE/RMSE
    """
    # Query historical prices from DB
    query = (
        db.query(MarketPrice, Market, Commodity)
        .join(Market, MarketPrice.market_id == Market.id)
        .join(Commodity, MarketPrice.commodity_id == Commodity.id)
        .filter(func.lower(Commodity.canonical_name) == commodity.lower())
        .filter(func.lower(Market.market_name).contains(market_name.lower()))
    )
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    
    records = query.order_by(MarketPrice.price_date.asc()).all()
    
    price_records = [
        {"price_date": p.price_date, "modal_price": p.modal_price}
        for p, m, c in records
        if p.modal_price and p.modal_price > 0
    ]
    
    # Demo fallback: use demo prices
    if not price_records and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_prices
        demo = get_demo_prices(commodity)
        price_records = [
            {"price_date": r["price_date"], "modal_price": r["modal_price"]}
            for r in demo
            if market_name.lower() in r["market_name"].lower()
        ]
        # Also get historical series for forecast
        if not price_records:
            all_demo = [
                {"price_date": r["price_date"], "modal_price": r["modal_price"]}
                for r in demo
            ]
            price_records = all_demo
    
    forecast_result = simple_forecast_from_db_prices(
        price_records, horizon_days, commodity, market_name
    )
    
    # Also return historical data for chart
    historical = [
        {"date": str(r["price_date"]), "modal_price": r["modal_price"],
         "modal_price_per_kg": round((r["modal_price"] or 0) / 100, 2)}
        for r in price_records[-30:]  # last 30 days for chart
    ]
    
    return {
        "commodity": commodity,
        "market": market_name,
        "historical": historical,
        "forecast": forecast_result,
        "unit": "₹/quintal (1 quintal = 100 kg)",
        "is_demo": not bool(records) and settings.DEMO_MODE,
    }


# ---------------------------------------------------------------------------
# Admin: OGD Data Ingestion
# ---------------------------------------------------------------------------

@router.post("/ingest/market-prices")
async def ingest_market_prices(
    file: UploadFile = File(..., description="OGD market prices CSV file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    [Admin Only] Import OGD mandi price CSV data.
    
    Accepts the standard Government of India OGD CSV format:
    state, district, market, commodity, variety, arrival_date, min_price, max_price, modal_price
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")
    
    log = ingest_ogd_csv(db, csv_text, source_name="OGD_CSV", filename=file.filename)
    
    return {
        "log_id": str(log.id),
        "status": log.status,
        "records_processed": log.records_processed,
        "records_inserted": log.records_inserted,
        "records_rejected": log.records_rejected,
        "errors": log.errors,
        "started_at": log.started_at.isoformat() if log.started_at else None,
        "completed_at": log.completed_at.isoformat() if log.completed_at else None,
    }


@router.get("/ingest/logs")
def get_sync_logs(
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """[Admin Only] Get data sync history."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    
    logs = db.query(DataSyncLog).order_by(DataSyncLog.started_at.desc()).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": str(log.id),
                "source": log.source,
                "filename": log.filename,
                "status": log.status,
                "records_processed": log.records_processed,
                "records_inserted": log.records_inserted,
                "records_rejected": log.records_rejected,
                "started_at": log.started_at.isoformat() if log.started_at else None,
                "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            }
            for log in logs
        ]
    }


# ---------------------------------------------------------------------------
# Dashboard data
# ---------------------------------------------------------------------------

@router.get("/dashboard/farmer")
def farmer_dashboard_data(
    state: Optional[str] = Query("Maharashtra"),
    commodity: Optional[str] = Query("Tomato"),
    db: Session = Depends(get_db),
) -> Any:
    """Aggregated data for the farmer dashboard."""
    # Latest prices for selected commodity in state
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    query = (
        db.query(MarketPrice, Market, Commodity)
        .join(Market, MarketPrice.market_id == Market.id)
        .join(Commodity, MarketPrice.commodity_id == Commodity.id)
        .filter(func.lower(Commodity.canonical_name) == (commodity or "").lower())
        .filter(MarketPrice.price_date >= yesterday)
    )
    if state:
        query = query.filter(func.lower(Market.state) == state.lower())
    
    records = query.order_by(MarketPrice.modal_price.desc()).limit(10).all()
    
    today_prices = [
        {
            "market": m.market_name,
            "district": m.district,
            "modal_price": p.modal_price,
            "modal_price_per_kg": round((p.modal_price or 0) / 100, 2),
            "min_price_per_kg": round((p.min_price or 0) / 100, 2),
            "max_price_per_kg": round((p.max_price or 0) / 100, 2),
        }
        for p, m, c in records
    ]
    
    if not today_prices and settings.DEMO_MODE:
        from app.data.demo_data import get_demo_market_comparison
        demo_data = get_demo_market_comparison(commodity or "Tomato", "", state or "Maharashtra", 1000)
        today_prices = [
            {
                "market": d["market_name"],
                "district": d["district"],
                "modal_price": d["modal_price"],
                "modal_price_per_kg": d["modal_price_per_kg"],
                "min_price_per_kg": d["min_price_per_kg"],
                "max_price_per_kg": d["max_price_per_kg"],
                "is_demo": True,
            }
            for d in sorted(demo_data, key=lambda x: x.get("modal_price", 0), reverse=True)[:5]
        ]
    
    return {
        "today_prices": today_prices,
        "commodity": commodity,
        "state": state,
        "as_of": today.isoformat(),
        "is_demo": not bool(records) and settings.DEMO_MODE,
    }


@router.get("/dashboard/admin")
def admin_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Admin dashboard with data health."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    
    from app.models.user import User as UserModel
    from app.models.marketplace import CropLot, Order
    
    total_farmers = db.query(UserModel).filter(UserModel.role == "farmer").count()
    total_buyers = db.query(UserModel).filter(UserModel.role == "buyer").count()
    total_transporters = db.query(UserModel).filter(UserModel.role == "transporter").count()
    total_markets = db.query(Market).count()
    total_commodities = db.query(Commodity).count()
    total_price_records = db.query(MarketPrice).count()
    
    # Latest sync log
    last_sync = db.query(DataSyncLog).order_by(DataSyncLog.completed_at.desc()).first()
    
    # Price data freshness
    latest_price = db.query(func.max(MarketPrice.price_date)).scalar()
    
    data_health = "No Data"
    if latest_price:
        days_old = (date.today() - latest_price).days
        if days_old <= 1:
            data_health = "Fresh"
        elif days_old <= 3:
            data_health = "Recent"
        elif days_old <= 7:
            data_health = "Aging"
        else:
            data_health = "Stale"
    elif settings.DEMO_MODE:
        data_health = "Demo Mode Active"
    
    return {
        "users": {
            "farmers": total_farmers,
            "buyers": total_buyers,
            "transporters": total_transporters,
        },
        "market_data": {
            "total_markets": total_markets,
            "total_commodities": total_commodities,
            "total_price_records": total_price_records,
            "latest_price_date": latest_price.isoformat() if latest_price else None,
            "data_health": data_health,
        },
        "last_sync": {
            "status": last_sync.status if last_sync else None,
            "source": last_sync.source if last_sync else None,
            "completed_at": last_sync.completed_at.isoformat() if last_sync and last_sync.completed_at else None,
            "records_inserted": last_sync.records_inserted if last_sync else 0,
        },
        "demo_mode": settings.DEMO_MODE,
    }
