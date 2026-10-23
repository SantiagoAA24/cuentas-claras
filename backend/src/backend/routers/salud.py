from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlmodel import Session

from backend.core.db import get_session
from backend.core.errors import AppError

router = APIRouter(tags=["salud"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/salud")
def salud(session: SessionDep) -> dict[str, str]:
    try:
        session.execute(text("SELECT 1"))
    except Exception as exc:
        raise AppError(
            codigo="base_datos_no_disponible",
            mensaje="No se pudo conectar a la base de datos.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        ) from exc
    return {"estado": "ok"}
