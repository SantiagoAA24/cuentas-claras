from collections.abc import Generator
from urllib.parse import urlparse

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel

import backend.models  # noqa: F401
from backend.core.config import get_settings
from backend.core.db import get_session
from backend.main import create_app

TEST_DB_NAME = "cuentas_claras_test"
TEST_DATABASE_URL = f"postgresql+psycopg://cc:cc@localhost:5433/{TEST_DB_NAME}"


def _admin_url() -> str:
    """URL a una DB distinta de la de pruebas para CREATE/DROP."""
    parsed = urlparse(TEST_DATABASE_URL)
    return parsed._replace(path="/cuentas_claras").geturl()


def _terminate_connections(admin_engine: Engine, db_name: str) -> None:
    with admin_engine.connect() as conn:
        conn.execute(
            text(
                """
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = :db_name AND pid <> pg_backend_pid()
                """
            ),
            {"db_name": db_name},
        )
        conn.commit()


@pytest.fixture(scope="session")
def test_engine() -> Generator[Engine, None, None]:
    admin_engine = create_engine(
        _admin_url(),
        isolation_level="AUTOCOMMIT",
    )
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": TEST_DB_NAME},
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))

    engine = create_engine(TEST_DATABASE_URL)
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    yield engine

    engine.dispose()
    _terminate_connections(admin_engine, TEST_DB_NAME)
    with admin_engine.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}"'))
    admin_engine.dispose()


@pytest.fixture
def session(test_engine: Engine) -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
    )

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(session: Session) -> Generator[TestClient, None, None]:
    get_settings.cache_clear()
    app = create_app()

    def _override_session() -> Generator[Session, None, None]:
        yield session

    app.dependency_overrides[get_session] = _override_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()
