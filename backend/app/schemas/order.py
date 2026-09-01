import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class OrderBase(BaseModel):
    crop_id: uuid.UUID
    pickup_address: str
    delivery_address: str
    delivery_fee: float
    scheduled_pickup: Optional[datetime] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    pickup_address: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_fee: Optional[float] = None
    scheduled_pickup: Optional[datetime] = None
    status: Optional[str] = None  # "pending", "accepted", "in_transit", "delivered", "cancelled"

class OrderResponse(OrderBase):
    id: uuid.UUID
    farmer_id: uuid.UUID
    transporter_id: Optional[uuid.UUID] = None
    delivery_distance_km: Optional[float] = None
    status: str
    actual_pickup: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
