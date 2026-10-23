from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Text, UniqueConstraint
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("negocio_id", "usuario", name="uq_usuarios_negocio_usuario"),
        Index("ix_usuarios_negocio_id", "negocio_id"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    negocio_id: UUID = Field(foreign_key="negocios.id", nullable=False, index=False)
    nombre: str = Field(sa_column=Column(Text, nullable=False))
    usuario: str = Field(sa_column=Column(Text, nullable=False))
    password_hash: str = Field(sa_column=Column(Text, nullable=False))
    activo: bool = Field(
        default=True,
        sa_column=Column(Boolean, nullable=False, server_default="true"),
    )
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
