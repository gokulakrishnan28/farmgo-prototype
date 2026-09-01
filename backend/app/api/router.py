from fastapi import APIRouter
from app.api.v1 import auth, crops, orders, ai, markets, buyer

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(markets.router, prefix="", tags=["markets"])
api_router.include_router(buyer.router, prefix="", tags=["buyer"])
