from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(
        default="postgresql+psycopg://cc:cc@localhost:5433/cuentas_claras",
    )
    jwt_secret: str = Field(default="cambia-este-secreto-en-produccion")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
    )
    environment: Literal["development", "test", "production"] = Field(
        default="development",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
