from fastapi import APIRouter

from backend.routers import salud

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(salud.router)
