from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.marketplace import Crop, Order
from app.schemas.crop import CropCreate, CropUpdate
from app.schemas.order import OrderCreate, OrderUpdate

# Crop CRUD operations
def get_crop(db: Session, crop_id: str) -> Optional[Crop]:
    return db.query(Crop).filter(Crop.id == crop_id).first()

def get_crops(
    db: Session, 
    farmer_id: Optional[str] = None, 
    status: Optional[str] = None,
    category: Optional[str] = None
) -> List[Crop]:
    query = db.query(Crop)
    if farmer_id:
        query = query.filter(Crop.farmer_id == farmer_id)
    if status:
        query = query.filter(Crop.status == status)
    if category:
        query = query.filter(Crop.category == category)
    return query.all()

def create_crop(db: Session, crop_in: CropCreate, farmer_id: str) -> Crop:
    db_crop = Crop(
        farmer_id=farmer_id,
        name=crop_in.name,
        category=crop_in.category,
        quantity_kg=crop_in.quantity_kg,
        price_per_kg=crop_in.price_per_kg,
        description=crop_in.description,
        status=crop_in.status,
        image_url=crop_in.image_url,
        harvest_date=crop_in.harvest_date
    )
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

def update_crop(db: Session, db_crop: Crop, crop_in: CropUpdate) -> Crop:
    update_data = crop_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_crop, field, value)
    db.commit()
    db.refresh(db_crop)
    return db_crop

def delete_crop(db: Session, crop_id: str) -> bool:
    db_crop = get_crop(db, crop_id)
    if db_crop:
        db.delete(db_crop)
        db.commit()
        return True
    return False


# Order CRUD operations
def get_order(db: Session, order_id: str) -> Optional[Order]:
    return db.query(Order).filter(Order.id == order_id).first()

def get_orders(
    db: Session, 
    farmer_id: Optional[str] = None, 
    transporter_id: Optional[str] = None, 
    status: Optional[str] = None
) -> List[Order]:
    query = db.query(Order)
    if farmer_id:
        query = query.filter(Order.farmer_id == farmer_id)
    if transporter_id:
        query = query.filter(Order.transporter_id == transporter_id)
    if status:
        query = query.filter(Order.status == status)
    return query.all()

def create_order(db: Session, order_in: OrderCreate, farmer_id: str) -> Order:
    db_order = Order(
        crop_id=order_in.crop_id,
        farmer_id=farmer_id,
        pickup_address=order_in.pickup_address,
        delivery_address=order_in.delivery_address,
        delivery_fee=order_in.delivery_fee,
        scheduled_pickup=order_in.scheduled_pickup,
        status="pending"
    )
    # Automatically update Crop status to pending_transport
    db_crop = get_crop(db, str(order_in.crop_id))
    if db_crop:
        db_crop.status = "pending_transport"
        
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, db_order: Order, order_in: OrderUpdate) -> Order:
    update_data = order_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
        
    # Handle state transitions and record actual timestamps
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == "in_transit":
            db_order.actual_pickup = datetime.utcnow()
        elif new_status == "delivered":
            db_order.actual_delivery = datetime.utcnow()
            # Mark crop as sold when order is delivered
            db_crop = get_crop(db, str(db_order.crop_id))
            if db_crop:
                db_crop.status = "sold"
        elif new_status == "cancelled":
            # Revert crop status back to available if order is cancelled
            db_crop = get_crop(db, str(db_order.crop_id))
            if db_crop:
                db_crop.status = "available"
                
    db.commit()
    db.refresh(db_order)
    return db_order

def accept_order(db: Session, db_order: Order, transporter_id: str) -> Order:
    db_order.transporter_id = transporter_id
    db_order.status = "accepted"
    db.commit()
    db.refresh(db_order)
    return db_order
