from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Text
from sqlmodel import Column, Field, Index, SQLModel

from backend.core.time import utcnow


class TokenRenovacion(SQLModel, table=True):
    __tablename__ = "tokens_renovacion"
    __table_args__ = (Index("ix_tokens_renovacion_usuario_id", "usuario_id"),)

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    usuario_id: UUID = Field(foreign_key="usuarios.id", nullable=False, index=False)
    token_hash: str = Field(
        sa_column=Column(Text, nullable=False, unique=True),
    )
    creado_en: datetime = Field(
        default_factory=utcnow,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    expira_en: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    invalidado_en: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
