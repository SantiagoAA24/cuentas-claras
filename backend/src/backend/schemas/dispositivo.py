from uuid import UUID

from pydantic import BaseModel, Field


class RegistrarDispositivoRequest(BaseModel):
    id: UUID


class DispositivoResponse(BaseModel):
    id: UUID
    prefijo: str = Field(min_length=1, max_length=1)
    ultimo_consecutivo: int
