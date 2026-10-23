from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Text, UniqueConstraint
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class Anulacion(SQLModel, table=True):
    __tablename__ = "anulaciones"
    __table_args__ = (
        UniqueConstraint("venta_id", name="uq_anulaciones_venta_id"),
        CheckConstraint(
            "motivo IN ("
            "'Error al registrar', "
            "'Cliente canceló', "
            "'Producto equivocado', "
            "'Otro'"
            ")",
            name="ck_anulaciones_motivo",
        ),
        Index("ix_anulaciones_negocio_seq", "negocio_id", "seq"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    venta_id: UUID = Field(foreign_key="ventas.id", nullable=False, index=False)
    anulada_por_id: UUID = Field(
        foreign_key="usuarios.id",
        nullable=False,
        index=False,
    )
    motivo: str = Field(sa_column=Column(Text, nullable=False))
    texto: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    anulada_en: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    seq: int = Field(sa_column=Column(BigInteger, nullable=False))
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
