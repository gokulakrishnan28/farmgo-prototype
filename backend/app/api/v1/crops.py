from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.marketplace import get_crop, get_crops, create_crop, update_crop, delete_crop
from app.models.user import User
from app.schemas.crop import CropCreate, CropResponse, CropUpdate

router = APIRouter()

@router.post("/", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_new_crop(
    *,
    db: Session = Depends(get_db),
    crop_in: CropCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    [Farmer Only] Create a new crop listing.
    """
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can create crop listings."
        )
    return create_crop(db=db, crop_in=crop_in, farmer_id=str(current_user.id))

@router.get("/", response_model=List[CropResponse])
def read_crops(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve crop listings. 
    - Farmers see only their own listings.
    - Transporters and Admins see all listings.
    """
    if current_user.role == "farmer":
        return get_crops(db=db, farmer_id=str(current_user.id), status=status, category=category)
    return get_crops(db=db, status=status, category=category)

@router.get("/{id}", response_model=CropResponse)
def read_crop_by_id(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific crop listing by ID.
    """
    db_crop = get_crop(db=db, crop_id=id)
    if not db_crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    # Farmers can only view their own listings
    if current_user.role == "farmer" and db_crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this crop listing."
        )
    return db_crop

@router.put("/{id}", response_model=CropResponse)
def update_crop_listing(
    id: str,
    crop_in: CropUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a crop listing. 
    - Farmers can only update their own listings.
    - Admins can update any listing.
    """
    db_crop = get_crop(db=db, crop_id=id)
    if not db_crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    if current_user.role != "admin" and db_crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this crop listing."
        )
    return update_crop(db=db, db_crop=db_crop, crop_in=crop_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_crop_listing(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a crop listing.
    - Farmers can only delete their own listings.
    - Admins can delete any listing.
    """
    db_crop = get_crop(db=db, crop_id=id)
    if not db_crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    if current_user.role != "admin" and db_crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this crop listing."
        )
    delete_crop(db=db, crop_id=id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
