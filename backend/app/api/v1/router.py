from fastapi import APIRouter
from app.api.v1 import inspections, lots, dashboard, hardware, settings as settings_api

api_v1_router = APIRouter()

api_v1_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])
api_v1_router.include_router(lots.router, prefix="/lots", tags=["Lots"])
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(hardware.router, prefix="/hardware", tags=["Hardware"])
api_v1_router.include_router(settings_api.router, prefix="/settings", tags=["Settings"])