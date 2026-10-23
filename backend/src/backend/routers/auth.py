from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session

from backend.core.db import get_session
from backend.schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from backend.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    return auth_service.login(
        session,
        usuario=body.usuario,
        password=body.password,
    )


@router.post("/renovar", response_model=TokenResponse)
def renovar(body: RefreshRequest, session: SessionDep) -> TokenResponse:
    return auth_service.renovar(session, refresh_token=body.refresh_token)


@router.post("/cerrar-sesion", status_code=status.HTTP_204_NO_CONTENT)
def cerrar_sesion(body: RefreshRequest, session: SessionDep) -> Response:
    auth_service.cerrar_sesion(session, refresh_token=body.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
