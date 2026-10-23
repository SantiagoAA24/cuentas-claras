"""Utilidades de seguridad: argon2, JWT de acceso y refresh opacos."""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from backend.core.config import get_settings
from backend.core.time import utcnow

_ph = PasswordHasher()

ACCESS_TOKEN_TYP = "access"
ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return get_settings().jwt_secret


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _ph.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def crear_access_token(
    *,
    usuario_id: UUID,
    negocio_id: UUID,
    ahora: datetime | None = None,
    minutos: int | None = None,
) -> str:
    settings = get_settings()
    issued = ahora if ahora is not None else utcnow()
    ttl = minutos if minutos is not None else settings.jwt_access_minutos
    payload: dict[str, Any] = {
        "sub": str(usuario_id),
        "negocio_id": str(negocio_id),
        "typ": ACCESS_TOKEN_TYP,
        "iat": issued,
        "exp": issued + timedelta(minutes=ttl),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=ALGORITHM)


def decodificar_access_token(token: str) -> dict[str, Any]:
    """Decodifica y valida un access JWT. Lanza jwt.PyJWTError si es inválido."""
    payload = jwt.decode(
        token,
        get_jwt_secret(),
        algorithms=[ALGORITHM],
    )
    if payload.get("typ") != ACCESS_TOKEN_TYP:
        raise jwt.InvalidTokenError("tipo de token inválido")
    return payload


def generar_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
