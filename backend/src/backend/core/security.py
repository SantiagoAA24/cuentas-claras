"""Utilidades de seguridad (JWT, argon2). Auth completa llega en un paso posterior."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from backend.core.config import get_settings

_ph = PasswordHasher()


def get_jwt_secret() -> str:
    return get_settings().jwt_secret


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _ph.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False
