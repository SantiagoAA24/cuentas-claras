from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    Uuid,
    text,
)
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class Venta(SQLModel, table=True):
    __tablename__ = "ventas"
    __table_args__ = (
        CheckConstraint(
            "medio_pago IN ('Efectivo', 'Nequi', 'Daviplata', 'Transferencia')",
            name="ck_ventas_medio_pago",
        ),
        CheckConstraint("prefijo ~ '^[A-Z]$'", name="ck_ventas_prefijo"),
        CheckConstraint("consecutivo >= 1", name="ck_ventas_consecutivo"),
        Index("ix_ventas_negocio_seq", "negocio_id", "seq"),
        Index("ix_ventas_negocio_fecha", "negocio_id", "fecha"),
        Index("ix_ventas_negocio_dispositivo", "negocio_id", "dispositivo_id"),
        Index(
            "uq_ventas_negocio_prefijo_consecutivo_sin_conflicto",
            "negocio_id",
            "prefijo",
            "consecutivo",
            unique=True,
            postgresql_where=text("conflicto_recibo = false"),
        ),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    dispositivo_id: UUID = Field(
        foreign_key="dispositivos.id",
        nullable=False,
        index=False,
    )
    registrada_por_id: UUID = Field(
        foreign_key="usuarios.id",
        nullable=False,
        index=False,
    )
    prefijo: str = Field(sa_column=Column(Text, nullable=False))
    consecutivo: int = Field(sa_column=Column(Integer, nullable=False))
    recibo: str = Field(sa_column=Column(Text, nullable=False))
    fecha: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    total: int = Field(sa_column=Column(BigInteger, nullable=False))
    medio_pago: str = Field(sa_column=Column(Text, nullable=False))
    paga_con: int | None = Field(
        default=None,
        sa_column=Column(BigInteger, nullable=True),
    )
    vueltas: int | None = Field(
        default=None,
        sa_column=Column(BigInteger, nullable=True),
    )
    impreso: bool = Field(
        default=False,
        sa_column=Column(Boolean, nullable=False, server_default="false"),
    )
    conflicto_recibo: bool = Field(
        default=False,
        sa_column=Column(Boolean, nullable=False, server_default="false"),
    )
    seq: int = Field(sa_column=Column(BigInteger, nullable=False))
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class ItemVenta(SQLModel, table=True):
    __tablename__ = "items_venta"
    __table_args__ = (
        CheckConstraint("cantidad >= 1", name="ck_items_venta_cantidad"),
        CheckConstraint("precio_unitario >= 0", name="ck_items_venta_precio"),
        Index("ix_items_venta_venta_id", "venta_id"),
        Index("ix_items_venta_negocio_id", "negocio_id"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    venta_id: UUID = Field(foreign_key="ventas.id", nullable=False, index=False)
    producto_id: UUID | None = Field(
        default=None,
        sa_column=Column(
            Uuid,
            ForeignKey("productos.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    nombre: str = Field(sa_column=Column(Text, nullable=False))
    precio_unitario: int = Field(sa_column=Column(BigInteger, nullable=False))
    cantidad: int = Field(sa_column=Column(Integer, nullable=False))
