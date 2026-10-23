from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Text
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class AlertaSync(SQLModel, table=True):
    __tablename__ = "alertas_sync"
    __table_args__ = (
        Index("ix_alertas_sync_negocio_creado", "negocio_id", "creado_en"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    tipo: str = Field(sa_column=Column(Text, nullable=False))
    venta_existente_id: UUID = Field(foreign_key="ventas.id", nullable=False)
    venta_nueva_id: UUID = Field(foreign_key="ventas.id", nullable=False)
    dispositivo_id: UUID = Field(foreign_key="dispositivos.id", nullable=False)
    prefijo: str = Field(sa_column=Column(Text, nullable=False))
    consecutivo: int = Field(nullable=False)
    detalle: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
