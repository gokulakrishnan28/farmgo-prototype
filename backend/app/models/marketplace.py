import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, Boolean, Text, Date, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Market(Base):
    """
    Represents an APMC / Mandi market.
    State-agnostic: works for Maharashtra, Tamil Nadu, or any Indian state.
    """
    __tablename__ = "markets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_name = Column(String, nullable=False)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    taluka = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    market_type = Column(String, nullable=True)  # "APMC", "Uzhavar Sandai", "Wholesale", etc.
    source = Column(String, nullable=True)        # "OGD", "eNAM", "manual"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prices = relationship("MarketPrice", back_populates="market", cascade="all, delete-orphan")
    transport_estimates = relationship("TransportEstimate", back_populates="market")

    __table_args__ = (
        Index("ix_markets_state_district", "state", "district"),
    )


class Commodity(Base):
    """
    Canonical crop/commodity with multilingual display names.
    Canonical name is always English (internal key).
    localized_names stores: {"mr": "टोमॅटो", "hi": "टमाटर", "ta": "தக்காளி", "en": "Tomato"}
    """
    __tablename__ = "commodities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_name = Column(String, nullable=False, unique=True, index=True)
    category = Column(String, nullable=True)  # "Vegetables", "Fruits", "Grains", etc.
    localized_names = Column(JSON, nullable=True)   # {"en": "...", "mr": "...", "hi": "...", "ta": "..."}
    unit = Column(String, default="quintal")         # "quintal" or "kg" (official OGD unit)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prices = relationship("MarketPrice", back_populates="commodity", cascade="all, delete-orphan")
    forecasts = relationship("PriceForecast", back_populates="commodity", cascade="all, delete-orphan")


class MarketPrice(Base):
    """
    Daily price record for a commodity at a specific market.
    Source: OGD data.gov.in / AGMARKNET CSV import or manual entry.
    """
    __tablename__ = "market_prices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)
    market_id = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    price_date = Column(Date, nullable=False, index=True)
    min_price = Column(Float, nullable=True)        # ₹ per quintal (OGD standard)
    max_price = Column(Float, nullable=True)        # ₹ per quintal
    modal_price = Column(Float, nullable=True)      # ₹ per quintal (most common traded price)
    arrival_quantity = Column(Float, nullable=True) # in tonnes
    unit = Column(String, default="quintal")
    source = Column(String, nullable=True)          # "OGD_CSV", "manual", "demo"
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    commodity = relationship("Commodity", back_populates="prices")
    market = relationship("Market", back_populates="prices")

    __table_args__ = (
        Index("ix_market_prices_commodity_market_date", "commodity_id", "market_id", "price_date"),
    )


class DataSyncLog(Base):
    """
    Audit log for each market data ingestion pipeline run.
    """
    __tablename__ = "data_sync_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String, nullable=False)               # "OGD_CSV", "OGD_API", "manual"
    filename = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    records_processed = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_rejected = Column(Integer, default=0)
    errors = Column(Text, nullable=True)
    status = Column(String, default="running")            # "running", "success", "failed", "partial"


class CropLot(Base):
    """
    A farmer's crop lot for sale — more detailed than the logistics Crop model.
    Used for market intelligence, buyer matching, and price discovery.
    """
    __tablename__ = "crop_lots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id"), nullable=True)
    crop_name = Column(String, nullable=False)          # Display name
    quantity_kg = Column(Float, nullable=False)
    quality_grade = Column(String, nullable=True)       # "A", "B", "C"
    variety = Column(String, nullable=True)             # "Hybrid", "Local", etc.
    harvest_date = Column(Date, nullable=True)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    village = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    expected_price_per_kg = Column(Float, nullable=True)
    packaging = Column(String, nullable=True)           # "Loose", "50kg bag", "Crate"
    farmer_notes = Column(Text, nullable=True)
    status = Column(String, default="active")           # "active", "sold", "expired"
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    farmer = relationship("User", foreign_keys=[farmer_id])
    commodity = relationship("Commodity")
    offers = relationship("Offer", back_populates="crop_lot", cascade="all, delete-orphan")
    transport_estimates = relationship("TransportEstimate", back_populates="crop_lot", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_crop_lots_state_district", "state", "district"),
    )


class BuyerRequirement(Base):
    """
    A buyer's procurement requirement — matched against active CropLots.
    """
    __tablename__ = "buyer_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id"), nullable=True)
    crop_name = Column(String, nullable=False)
    quantity_kg_min = Column(Float, nullable=True)
    quantity_kg_max = Column(Float, nullable=True)
    quality_grade = Column(String, nullable=True)       # "A", "B", "C" or "Any"
    max_price_per_kg = Column(Float, nullable=True)
    preferred_state = Column(String, nullable=True)
    preferred_district = Column(String, nullable=True)
    buyer_type = Column(String, nullable=True)          # "Wholesaler", "Processor", "Retailer", "FPO", "Institutional"
    required_by_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id])
    commodity = relationship("Commodity")
    offers = relationship("Offer", back_populates="requirement")


class Offer(Base):
    """
    A buyer's offer to a farmer's CropLot.
    """
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_lot_id = Column(UUID(as_uuid=True), ForeignKey("crop_lots.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("buyer_requirements.id", ondelete="SET NULL"), nullable=True)
    offered_price_per_kg = Column(Float, nullable=False)
    offered_quantity_kg = Column(Float, nullable=False)
    match_score = Column(Float, nullable=True)          # 0-100
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")          # "pending", "accepted", "rejected", "expired"
    valid_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    crop_lot = relationship("CropLot", back_populates="offers")
    buyer = relationship("User", foreign_keys=[buyer_id])
    requirement = relationship("BuyerRequirement", back_populates="offers")


class PriceForecast(Base):
    """
    Stored ML price forecast result for a commodity at a market.
    """
    __tablename__ = "price_forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity_id = Column(UUID(as_uuid=True), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)
    market_id = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_date = Column(Date, nullable=False)           # date forecasted for
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    predicted_modal_price = Column(Float, nullable=True)   # ₹/quintal
    predicted_min_price = Column(Float, nullable=True)
    predicted_max_price = Column(Float, nullable=True)
    confidence = Column(String, nullable=True)             # "Low", "Medium", "High"
    trend = Column(String, nullable=True)                  # "Increasing", "Decreasing", "Stable"
    model_name = Column(String, nullable=True)             # "xgboost", "random_forest", "rolling_avg"
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2 = Column(Float, nullable=True)
    horizon_days = Column(Integer, default=7)
    is_demo = Column(Boolean, default=False)

    # Relationships
    commodity = relationship("Commodity", back_populates="forecasts")
    market = relationship("Market")


class TransportEstimate(Base):
    """
    Estimated transport cost for a crop lot to a specific market.
    Calculated on demand and cached.
    """
    __tablename__ = "transport_estimates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_lot_id = Column(UUID(as_uuid=True), ForeignKey("crop_lots.id", ondelete="CASCADE"), nullable=False)
    market_id = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False)
    distance_km = Column(Float, nullable=True)
    estimated_cost = Column(Float, nullable=True)         # total transport cost ₹
    cost_per_kg = Column(Float, nullable=True)            # ₹/kg
    recommended_vehicle = Column(String, nullable=True)   # "Mini Truck", "Medium Truck", etc.
    travel_time_hrs = Column(Float, nullable=True)
    calculation_basis = Column(String, nullable=True)     # "estimate" always (unless real provider)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    crop_lot = relationship("CropLot", back_populates="transport_estimates")
    market = relationship("Market", back_populates="transport_estimates")


# Keep the original Crop and Order models unchanged
class Crop(Base):
    """Original logistics crop listing — preserved from existing system."""
    __tablename__ = "crops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="available")
    image_url = Column(String, nullable=True)
    harvest_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farmer = relationship("User", back_populates="crops")
    orders = relationship("Order", back_populates="crop", cascade="all, delete-orphan")


class Order(Base):
    """Original logistics transport order — preserved from existing system."""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    pickup_address = Column(String, nullable=False)
    delivery_address = Column(String, nullable=False)
    delivery_distance_km = Column(Float, nullable=True)
    delivery_fee = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")
    scheduled_pickup = Column(DateTime(timezone=True), nullable=True)
    actual_pickup = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    crop = relationship("Crop", back_populates="orders")
    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="created_orders")
    transporter = relationship("User", foreign_keys=[transporter_id], back_populates="accepted_orders")
