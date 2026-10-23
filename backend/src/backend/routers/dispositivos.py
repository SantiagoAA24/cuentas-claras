from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from backend.core.db import get_session
from backend.core.deps import CurrentUser, get_current_user
from backend.schemas.dispositivo import (
    DispositivoResponse,
    RegistrarDispositivoRequest,
)
from backend.services import dispositivos as dispositivos_service

router = APIRouter(prefix="/dispositivos", tags=["dispositivos"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


@router.post("/registrar", response_model=DispositivoResponse)
def registrar(
    body: RegistrarDispositivoRequest,
    session: SessionDep,
    current: CurrentUserDep,
) -> DispositivoResponse:
    return dispositivos_service.registrar_dispositivo(
        session,
        negocio_id=current.negocio_id,
        dispositivo_id=body.id,
    )
