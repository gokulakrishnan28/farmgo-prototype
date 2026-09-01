import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# Profile Schemas
class FarmerProfileBase(BaseModel):
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None

class FarmerProfileCreate(FarmerProfileBase):
    pass

class FarmerProfileResponse(FarmerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class TransporterProfileBase(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    capacity_tons: Optional[float] = None

class TransporterProfileCreate(TransporterProfileBase):
    pass

class TransporterProfileResponse(TransporterProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: str = Field(..., description="Must be 'farmer', 'transporter', or 'admin'")
    profile_picture_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    # Optional fields for inline profile creation
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None
    
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    capacity_tons: Optional[float] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    # Profile update fields
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    farm_size: Optional[str] = None
    
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    capacity_tons: Optional[float] = None

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    farmer_profile: Optional[FarmerProfileResponse] = None
    transporter_profile: Optional[TransporterProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
