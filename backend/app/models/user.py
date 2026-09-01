import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    role = Column(String, nullable=False)  # "farmer", "transporter", "admin", "buyer"
    profile_picture_url = Column(String, nullable=True)
    preferred_language = Column(String, nullable=True, default="en")  # "en", "mr", "hi", "ta"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transporter_profile = relationship("TransporterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    created_orders = relationship("Order", foreign_keys="[Order.farmer_id]", back_populates="farmer", cascade="all, delete-orphan")
    accepted_orders = relationship("Order", foreign_keys="[Order.transporter_id]", back_populates="transporter")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    farm_name = Column(String, nullable=True)
    farm_location = Column(String, nullable=True)
    farm_size = Column(String, nullable=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user = relationship("User", back_populates="farmer_profile")


class TransporterProfile(Base):
    __tablename__ = "transporter_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    vehicle_type = Column(String, nullable=True)
    vehicle_number = Column(String, nullable=True)
    capacity_tons = Column(Float, nullable=True)

    user = relationship("User", back_populates="transporter_profile")


class BuyerProfile(Base):
    """
    Profile for buyers (Wholesalers, Processors, Retailers, FPOs, Institutional buyers).
    """
    __tablename__ = "buyer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    organization_name = Column(String, nullable=True)
    buyer_type = Column(String, nullable=True)       # "Wholesaler", "Processor", "Retailer", "FPO", "Institutional"
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    gst_number = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, nullable=True)             # 0.0 - 5.0
    total_transactions = Column(Float, nullable=True, default=0)

    user = relationship("User", back_populates="buyer_profile")
