from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class SyncCamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )


OperacionSync = Literal[
    "venta.registrar",
    "venta.anular",
    "producto.crear",
    "producto.actualizar",
]

EstadoCambio = Literal["aplicado", "ya_existia", "rechazado"]


class CambioSync(SyncCamelModel):
    id: UUID
    operacion: OperacionSync
    entidad_id: UUID
    payload: dict[str, Any]


class SyncPushRequest(SyncCamelModel):
    dispositivo_id: UUID
    cambios: list[CambioSync] = Field(default_factory=list)


class AvisoCambio(SyncCamelModel):
    codigo: str
    mensaje: str


class ResultadoCambio(SyncCamelModel):
    id: UUID
    estado: EstadoCambio
    codigo: str | None = None
    mensaje: str | None = None
    aviso: AvisoCambio | None = None


class SyncPushResponse(SyncCamelModel):
    resultados: list[ResultadoCambio]


class ItemVentaSync(SyncCamelModel):
    producto_id: UUID | None = None
    nombre: str
    precio_unitario: int
    cantidad: int


class VentaPull(SyncCamelModel):
    id: UUID
    dispositivo_id: UUID
    prefijo: str
    consecutivo: int
    recibo: str
    fecha: datetime
    registrada_por_id: UUID
    total: int
    medio_pago: str
    paga_con: int | None = None
    vueltas: int | None = None
    impreso: bool
    conflicto_recibo: bool
    seq: int
    items: list[ItemVentaSync]


class ProductoPull(SyncCamelModel):
    id: UUID
    nombre: str
    precio: int
    categoria: str
    activo: bool
    seq: int
    actualizado_en: datetime


class AnulacionPull(SyncCamelModel):
    id: UUID
    venta_id: UUID
    motivo: str
    texto: str | None = None
    anulada_por_id: UUID
    anulada_en: datetime
    seq: int


class DispositivoPull(SyncCamelModel):
    id: UUID
    prefijo: str
    ultimo_consecutivo: int


class SyncPullResponse(SyncCamelModel):
    cursor: int
    hay_mas: bool
    productos: list[ProductoPull]
    ventas: list[VentaPull]
    anulaciones: list[AnulacionPull]
    dispositivo: DispositivoPull


# --- Payloads tipados (validación interna del servicio) ---


class ItemVentaPayload(SyncCamelModel):
    producto_id: UUID | None = None
    nombre: str = Field(min_length=1)
    precio_unitario: int
    cantidad: int

    @field_validator("precio_unitario")
    @classmethod
    def precio_no_negativo(cls, value: int) -> int:
        if value < 0:
            raise ValueError("precio_unitario debe ser >= 0")
        return value

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, value: int) -> int:
        if value < 1:
            raise ValueError("cantidad debe ser >= 1")
        return value


class VentaRegistrarPayload(SyncCamelModel):
    id: UUID
    recibo: str = Field(min_length=3)
    fecha: datetime
    items: list[ItemVentaPayload] = Field(min_length=1)
    total: int
    medio_pago: str
    paga_con: int | None = None
    vueltas: int | None = None
    impreso: bool = False


class AnulacionPayload(SyncCamelModel):
    motivo: str
    texto: str | None = None
    en: datetime


class VentaAnularPayload(SyncCamelModel):
    venta_id: UUID
    anulada: AnulacionPayload


class ProductoPayload(SyncCamelModel):
    id: UUID
    nombre: str = Field(min_length=1)
    precio: int
    categoria: str
    activo: bool = True

    @field_validator("precio")
    @classmethod
    def precio_no_negativo(cls, value: int) -> int:
        if value < 0:
            raise ValueError("precio debe ser >= 0")
        return value
