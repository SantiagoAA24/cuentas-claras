"""Utilidades de seguridad (JWT). Auth completa llega en un paso posterior."""

from backend.core.config import get_settings


def get_jwt_secret() -> str:
    return get_settings().jwt_secret
