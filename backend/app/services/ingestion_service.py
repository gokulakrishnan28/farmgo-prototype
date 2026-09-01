"""
Market Data Ingestion Service
-------------------------------
Handles importing government OGD mandi price data (CSV format).

Official data source:
  "Current Daily Price of Various Commodities from Various Markets (Mandi)"
  URL: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi

CSV Column schema (OGD standard):
  state, district, market, commodity, variety, arrival_date,
  min_price, max_price, modal_price

Pipeline:
  CSV File → Validate → Normalize → Deduplicate → Insert → DataSyncLog
"""
import csv
import io
import re
import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.marketplace import Market, Commodity, MarketPrice, DataSyncLog


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

STATE_ALIASES = {
    "maharashtra": "Maharashtra",
    "tamil nadu": "Tamil Nadu",
    "tamilnadu": "Tamil Nadu",
    "karnataka": "Karnataka",
    "gujarat": "Gujarat",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "rajasthan": "Rajasthan",
    "uttar pradesh": "Uttar Pradesh",
    "up": "Uttar Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "mp": "Madhya Pradesh",
    "andhra pradesh": "Andhra Pradesh",
    "ap": "Andhra Pradesh",
    "telangana": "Telangana",
    "kerala": "Kerala",
    "west bengal": "West Bengal",
    "wb": "West Bengal",
}

COMMODITY_ALIASES = {
    "tomato": "Tomato",
    "tamater": "Tomato",
    "onion": "Onion",
    "pyaz": "Onion",
    "kanda": "Onion",
    "potato": "Potato",
    "aloo": "Potato",
    "carrot": "Carrot",
    "cabbage": "Cabbage",
    "brinjal": "Brinjal",
    "bhindi": "Ladyfinger",
    "okra": "Ladyfinger",
    "ladyfinger": "Ladyfinger",
    "ladys finger": "Ladyfinger",
    "mango": "Mango",
    "banana": "Banana",
    "grapes": "Grapes",
    "pomegranate": "Pomegranate",
    "wheat": "Wheat",
    "paddy": "Paddy",
    "rice": "Paddy",
    "maize": "Maize",
    "corn": "Maize",
    "soyabean": "Soybean",
    "soybean": "Soybean",
    "groundnut": "Groundnut",
    "turmeric": "Turmeric",
    "chilli": "Red Chilli",
    "chilly": "Red Chilli",
    "red chilli": "Red Chilli",
    "green chilli": "Green Chilli",
    "ginger": "Ginger",
    "garlic": "Garlic",
    "sugarcane": "Sugarcane",
    "cotton": "Cotton",
}


def normalize_state(raw: str) -> str:
    clean = raw.strip().lower()
    return STATE_ALIASES.get(clean, raw.strip().title())


def normalize_commodity(raw: str) -> str:
    clean = re.sub(r'\s+', ' ', raw.strip().lower())
    return COMMODITY_ALIASES.get(clean, raw.strip().title())


def normalize_market_name(raw: str) -> str:
    """Strip common suffixes and normalize casing."""
    name = raw.strip()
    # Remove common unwanted chars
    name = re.sub(r'\s+', ' ', name)
    return name


def parse_price(raw: Any) -> Optional[float]:
    """Parse price string to float. Returns None if invalid."""
    if raw is None or raw == "":
        return None
    try:
        return float(str(raw).replace(",", "").strip())
    except ValueError:
        return None


def parse_date(raw: str) -> Optional[date]:
    """Try multiple date formats common in OGD data."""
    formats = ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d %b %Y", "%d-%b-%y"]
    for fmt in formats:
        try:
            return datetime.strptime(raw.strip(), fmt).date()
        except ValueError:
            continue
    return None


def is_price_valid(min_p: Optional[float], max_p: Optional[float], modal_p: Optional[float]) -> bool:
    """Validate price logic."""
    if modal_p is None:
        return False
    if modal_p <= 0 or modal_p > 200000:  # sanity check — max ₹2 lakh/quintal
        return False
    if min_p and max_p and min_p > max_p:
        return False
    if min_p and modal_p < min_p * 0.5:  # modal shouldn't be less than half of min
        return False
    return True


# ---------------------------------------------------------------------------
# Market / Commodity lookup or create
# ---------------------------------------------------------------------------

def get_or_create_market(
    db: Session,
    state: str,
    district: str,
    market_name: str,
    source: str = "OGD_CSV"
) -> Market:
    """Get existing market or create a new one."""
    market = db.query(Market).filter(
        Market.state == state,
        Market.district == district,
        Market.market_name == market_name,
    ).first()
    
    if not market:
        market = Market(
            id=uuid.uuid4(),
            state=state,
            district=district,
            market_name=market_name,
            source=source,
        )
        db.add(market)
        db.flush()
    
    return market


def get_or_create_commodity(db: Session, canonical_name: str) -> Commodity:
    """Get existing commodity or create a new one."""
    commodity = db.query(Commodity).filter(
        Commodity.canonical_name == canonical_name
    ).first()
    
    if not commodity:
        commodity = Commodity(
            id=uuid.uuid4(),
            canonical_name=canonical_name,
            category="Unknown",
        )
        db.add(commodity)
        db.flush()
    
    return commodity


def price_record_exists(
    db: Session,
    commodity_id: uuid.UUID,
    market_id: uuid.UUID,
    price_date: date,
) -> bool:
    """Check if a price record already exists (deduplication)."""
    return db.query(MarketPrice).filter(
        MarketPrice.commodity_id == commodity_id,
        MarketPrice.market_id == market_id,
        MarketPrice.price_date == price_date,
    ).first() is not None


# ---------------------------------------------------------------------------
# Main ingestion function
# ---------------------------------------------------------------------------

def ingest_ogd_csv(
    db: Session,
    csv_content: str,
    source_name: str = "OGD_CSV",
    filename: str = "",
) -> DataSyncLog:
    """
    Ingest OGD mandi price CSV data.
    
    Expected columns (case-insensitive):
      state, district, market, commodity, variety, arrival_date,
      min_price, max_price, modal_price
    
    Returns a DataSyncLog entry with statistics.
    """
    log = DataSyncLog(
        id=uuid.uuid4(),
        source=source_name,
        filename=filename,
        started_at=datetime.utcnow(),
        status="running",
    )
    db.add(log)
    db.flush()
    
    processed = 0
    inserted = 0
    rejected = 0
    rejected_reasons = []
    
    try:
        reader = csv.DictReader(io.StringIO(csv_content))
        
        # Normalize column names
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row")
        
        fieldmap = {col.strip().lower(): col for col in reader.fieldnames}
        
        def get_col(row: dict, *keys: str) -> str:
            for k in keys:
                col = fieldmap.get(k)
                if col and col in row:
                    return (row[col] or "").strip()
            return ""
        
        for row in reader:
            processed += 1
            
            # Extract fields
            state_raw = get_col(row, "state", "state name")
            district_raw = get_col(row, "district", "district name")
            market_raw = get_col(row, "market", "market name")
            commodity_raw = get_col(row, "commodity", "commodity name")
            date_raw = get_col(row, "arrival_date", "date", "price_date")
            min_raw = get_col(row, "min_price", "minimum price", "min price")
            max_raw = get_col(row, "max_price", "maximum price", "max price")
            modal_raw = get_col(row, "modal_price", "modal price", "average price")
            
            # Validate required fields
            if not all([state_raw, market_raw, commodity_raw, date_raw, modal_raw]):
                rejected += 1
                rejected_reasons.append(f"Row {processed}: Missing required fields")
                continue
            
            # Normalize
            state = normalize_state(state_raw)
            district = district_raw.strip().title() if district_raw else state
            market_name = normalize_market_name(market_raw)
            commodity_name = normalize_commodity(commodity_raw)
            
            # Parse date
            price_date = parse_date(date_raw)
            if not price_date:
                rejected += 1
                rejected_reasons.append(f"Row {processed}: Invalid date '{date_raw}'")
                continue
            
            # Parse prices
            min_price = parse_price(min_raw)
            max_price = parse_price(max_raw)
            modal_price = parse_price(modal_raw)
            
            # Validate prices
            if not is_price_valid(min_price, max_price, modal_price):
                rejected += 1
                rejected_reasons.append(f"Row {processed}: Invalid price values {min_price}/{modal_price}/{max_price}")
                continue
            
            # Get or create market / commodity
            market = get_or_create_market(db, state, district, market_name, source=source_name)
            commodity = get_or_create_commodity(db, commodity_name)
            
            # Deduplicate
            if price_record_exists(db, commodity.id, market.id, price_date):
                continue  # Skip duplicate
            
            # Insert price record
            price_rec = MarketPrice(
                id=uuid.uuid4(),
                commodity_id=commodity.id,
                market_id=market.id,
                price_date=price_date,
                min_price=min_price,
                max_price=max_price,
                modal_price=modal_price,
                unit="quintal",
                source=source_name,
            )
            db.add(price_rec)
            inserted += 1
        
        db.commit()
        
        log.status = "success" if rejected < processed else "partial"
        log.records_processed = processed
        log.records_inserted = inserted
        log.records_rejected = rejected
        log.completed_at = datetime.utcnow()
        if rejected_reasons:
            log.errors = "\n".join(rejected_reasons[:50])  # limit stored errors
        db.commit()
        
    except Exception as e:
        db.rollback()
        log.status = "failed"
        log.errors = str(e)
        log.completed_at = datetime.utcnow()
        db.add(log)
        db.commit()
    
    return log
