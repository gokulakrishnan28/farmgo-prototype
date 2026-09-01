from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, FarmerProfile, TransporterProfile
from app.schemas.user import UserCreate, UserUpdate

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> User:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    # 1. Create User
    db_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        role=user_in.role.lower(),
        profile_picture_url=user_in.profile_picture_url,
    )
    db.add(db_user)
    db.flush()  # Populates db_user.id for foreign keys
    
    # 2. Create role-specific profiles
    if db_user.role == "farmer":
        db_profile = FarmerProfile(
            user_id=db_user.id,
            farm_name=user_in.farm_name,
            farm_location=user_in.farm_location,
            farm_size=user_in.farm_size,
        )
        db.add(db_profile)
    elif db_user.role == "transporter":
        db_profile = TransporterProfile(
            user_id=db_user.id,
            vehicle_type=user_in.vehicle_type,
            vehicle_number=user_in.vehicle_number,
            capacity_tons=user_in.capacity_tons,
        )
        db.add(db_profile)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    # Update User model fields
    if user_in.full_name is not None:
        db_user.full_name = user_in.full_name
    if user_in.phone_number is not None:
        db_user.phone_number = user_in.phone_number
    if user_in.profile_picture_url is not None:
        db_user.profile_picture_url = user_in.profile_picture_url
        
    # Update role-specific profile fields
    if db_user.role == "farmer":
        if db_user.farmer_profile is None:
            # Create if it didn't exist
            db_user.farmer_profile = FarmerProfile(user_id=db_user.id)
            db.add(db_user.farmer_profile)
            
        if user_in.farm_name is not None:
            db_user.farmer_profile.farm_name = user_in.farm_name
        if user_in.farm_location is not None:
            db_user.farmer_profile.farm_location = user_in.farm_location
        if user_in.farm_size is not None:
            db_user.farmer_profile.farm_size = user_in.farm_size
            
    elif db_user.role == "transporter":
        if db_user.transporter_profile is None:
            # Create if it didn't exist
            db_user.transporter_profile = TransporterProfile(user_id=db_user.id)
            db.add(db_user.transporter_profile)
            
        if user_in.vehicle_type is not None:
            db_user.transporter_profile.vehicle_type = user_in.vehicle_type
        if user_in.vehicle_number is not None:
            db_user.transporter_profile.vehicle_number = user_in.vehicle_number
        if user_in.capacity_tons is not None:
            db_user.transporter_profile.capacity_tons = user_in.capacity_tons
            
    db.commit()
    db.refresh(db_user)
    return db_user
