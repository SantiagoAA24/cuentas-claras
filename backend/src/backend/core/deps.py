from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from backend.core.db import get_session
from backend.core.errors import AppError
from backend.core.security import decodificar_access_token
from backend.models import Negocio, Usuario
from backend.services.auth import obtener_usuario_activo

_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[Session, Depends(get_session)]
BearerDep = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(_bearer),
]


@dataclass(frozen=True, slots=True)
class CurrentUser:
    usuario: Usuario
    negocio: Negocio

    @property
    def id(self) -> UUID:
        return self.usuario.id

    @property
    def negocio_id(self) -> UUID:
        return self.usuario.negocio_id


def _no_autorizado(mensaje: str = "No autorizado.") -> AppError:
    return AppError(
        codigo="no_autorizado",
        mensaje=mensaje,
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


def get_current_user(session: SessionDep, credentials: BearerDep) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _no_autorizado("Se requiere un token de acceso.")

    try:
        payload = decodificar_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError as exc:
        raise _no_autorizado("El token de acceso expiró.") from exc
    except jwt.PyJWTError as exc:
        raise _no_autorizado("El token de acceso no es válido.") from exc

    try:
        usuario_id = UUID(str(payload["sub"]))
        negocio_id = UUID(str(payload["negocio_id"]))
    except (KeyError, ValueError, TypeError) as exc:
        raise _no_autorizado("El token de acceso no es válido.") from exc

    usuario = obtener_usuario_activo(session, usuario_id)
    if usuario is None:
        raise _no_autorizado("El usuario no existe o está inactivo.")
    if usuario.negocio_id != negocio_id:
        raise _no_autorizado("El token de acceso no es válido.")

    negocio = session.get(Negocio, usuario.negocio_id)
    if negocio is None:
        raise _no_autorizado("El negocio asociado no existe.")

    return CurrentUser(usuario=usuario, negocio=negocio)


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
