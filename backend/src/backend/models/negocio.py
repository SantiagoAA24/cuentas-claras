from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, DateTime, Text
from sqlmodel import Column, Field, SQLModel

from backend.core.time import utcnow


class Negocio(SQLModel, table=True):
    __tablename__ = "negocios"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    nombre: str = Field(sa_column=Column(Text, nullable=False))
    documento: str = Field(sa_column=Column(Text, nullable=False))
    pie_recibo: str = Field(sa_column=Column(Text, nullable=False))
    ultimo_seq: int = Field(
        default=0,
        sa_column=Column(BigInteger, nullable=False, server_default="0"),
    )
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    actualizado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
