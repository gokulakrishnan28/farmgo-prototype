from app.core.database import Base
from app.models.user import User, FarmerProfile, TransporterProfile, BuyerProfile
from app.models.marketplace import (
    Crop, Order,
    Market, Commodity, MarketPrice, DataSyncLog,
    CropLot, BuyerRequirement, Offer,
    PriceForecast, TransportEstimate
)

# Make sure all models are imported so Base.metadata has them loaded
__all__ = [
    "Base",
    # User models
    "User", "FarmerProfile", "TransporterProfile", "BuyerProfile",
    # Logistics models (existing)
    "Crop", "Order",
    # Market intelligence models (new)
    "Market", "Commodity", "MarketPrice", "DataSyncLog",
    "CropLot", "BuyerRequirement", "Offer",
    "PriceForecast", "TransportEstimate",
]
