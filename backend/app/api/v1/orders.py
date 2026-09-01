from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.marketplace import get_order, get_orders, create_order, update_order, accept_order, get_crop
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_new_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    [Farmer Only] Request logistics/transport for a listed crop.
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can request transport orders."
        )
        
    # Check if the crop exists and belongs to this farmer
    crop = get_crop(db=db, crop_id=str(order_in.crop_id))
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found."
        )
    if crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only request transport for crops you own."
        )
        
    return create_order(db=db, order_in=order_in, farmer_id=str(current_user.id))

@router.get("/", response_model=List[OrderResponse])
def read_orders(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List transport orders.
    - Farmers see orders they created.
    - Transporters see orders they accepted, or any "pending" orders available to accept.
    - Admins see all.
    """
    if current_user.role == "farmer":
        return get_orders(db=db, farmer_id=str(current_user.id), status=status)
    elif current_user.role == "transporter":
        if status == "pending":
            return get_orders(db=db, status="pending")
        # By default, transporter sees their accepted deliveries + available pending deliveries
        accepted_deliveries = get_orders(db=db, transporter_id=str(current_user.id), status=status)
        available_pending = get_orders(db=db, status="pending")
        return accepted_deliveries + (available_pending if not status else [])
    return get_orders(db=db, status=status)

@router.get("/{id}", response_model=OrderResponse)
def read_order_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific transport order by ID.
    """
    db_order = get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    # Check authorization
    if current_user.role == "farmer" and db_order.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order."
        )
    return db_order

@router.patch("/{id}/accept", response_model=OrderResponse)
def accept_transport_order(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    [Transporter Only] Accept a pending transport order.
    """
    if current_user.role != "transporter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transporters can accept transport orders."
        )
        
    db_order = get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    if db_order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This transport order has already been accepted or cancelled."
        )
        
    return accept_order(db=db, db_order=db_order, transporter_id=str(current_user.id))

@router.patch("/{id}/status", response_model=OrderResponse)
def update_transport_status(
    id: str,
    order_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update transport order status.
    - Transporters can update status for orders they accepted.
    - Admins can update status for any order.
    """
    db_order = get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check permissions
    if current_user.role != "admin" and db_order.transporter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned as the transporter for this order."
        )
        
    # Valid status transitions
    allowed_statuses = ["in_transit", "delivered", "cancelled"]
    if order_in.status and order_in.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status update must be one of: {allowed_statuses}"
        )
        
    return update_order(db=db, db_order=db_order, order_in=order_in)
