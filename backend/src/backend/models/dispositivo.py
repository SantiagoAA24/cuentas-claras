from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Text, UniqueConstraint
from sqlmodel import Column, Field, SQLModel

from backend.core.time import utcnow


class Dispositivo(SQLModel, table=True):
    __tablename__ = "dispositivos"
    __table_args__ = (
        UniqueConstraint(
            "negocio_id",
            "prefijo",
            name="uq_dispositivos_negocio_prefijo",
        ),
        CheckConstraint("prefijo ~ '^[A-Z]$'", name="ck_dispositivos_prefijo"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=True)
    prefijo: str = Field(sa_column=Column(Text, nullable=False))
    ultimo_consecutivo: int = Field(
        default=0,
        sa_column=Column(BigInteger, nullable=False, server_default="0"),
    )
    nombre: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
