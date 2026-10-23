from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, Boolean, CheckConstraint, DateTime, Text
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class Producto(SQLModel, table=True):
    __tablename__ = "productos"
    __table_args__ = (
        CheckConstraint(
            "categoria IN ('Arepas', 'Bebidas', 'Adicionales')",
            name="ck_productos_categoria",
        ),
        Index("ix_productos_negocio_seq", "negocio_id", "seq"),
        Index(
            "ix_productos_negocio_activo_categoria", "negocio_id", "activo", "categoria"
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    nombre: str = Field(sa_column=Column(Text, nullable=False))
    precio: int = Field(sa_column=Column(BigInteger, nullable=False))
    categoria: str = Field(sa_column=Column(Text, nullable=False))
    activo: bool = Field(
        default=True,
        sa_column=Column(Boolean, nullable=False, server_default="true"),
    )
    seq: int = Field(sa_column=Column(BigInteger, nullable=False))
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    actualizado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
