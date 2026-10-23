from fastapi import APIRouter

from backend.routers import auth, dispositivos, salud

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(salud.router)
api_router.include_router(auth.router)
api_router.include_router(dispositivos.router)
