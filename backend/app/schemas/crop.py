import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CropBase(BaseModel):
    name: str
    category: str
    quantity_kg: float
    price_per_kg: float
    description: Optional[str] = None
    status: Optional[str] = "available"  # "available", "pending_transport", "sold", "archived"
    image_url: Optional[str] = None
    harvest_date: Optional[datetime] = None

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    harvest_date: Optional[datetime] = None

class CropResponse(CropBase):
    id: uuid.UUID
    farmer_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
