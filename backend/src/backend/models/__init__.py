"""Modelos SQLModel. Importar aquí las tablas para que Alembic las detecte."""

from backend.models.alerta_sync import AlertaSync
from backend.models.anulacion import Anulacion
from backend.models.dispositivo import Dispositivo
from backend.models.negocio import Negocio
from backend.models.producto import Producto
from backend.models.token_renovacion import TokenRenovacion
from backend.models.usuario import Usuario
from backend.models.venta import ItemVenta, Venta

__all__ = [
    "AlertaSync",
    "Anulacion",
    "Dispositivo",
    "ItemVenta",
    "Negocio",
    "Producto",
    "TokenRenovacion",
    "Usuario",
    "Venta",
]
