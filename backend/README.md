# Backend — Cuentas Claras

API FastAPI + SQLModel + PostgreSQL + Alembic.

## Requisitos

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Docker (para Postgres)

## Configuración

```bash
cp .env.example .env
uv sync
```

Variables principales (ver `.env.example`):

- `DATABASE_URL` — conexión Postgres (`postgresql+psycopg://…`)
- `JWT_SECRET` — secreto para tokens
- `CORS_ORIGINS` — orígenes permitidos (JSON), p. ej. Vite en desarrollo
- `ENVIRONMENT` — `development` | `test` | `production`

## Levantar la base de datos

```bash
docker compose up -d
```

Postgres queda en `localhost:5433` (usuario/clave/db: `cc` / `cc` / `cuentas_claras`). El puerto del host es 5433 para no chocar con un Postgres local en 5432.

## Migraciones

```bash
uv run alembic upgrade head
```

Crear una revisión nueva tras cambiar modelos:

```bash
uv run alembic revision --autogenerate -m "descripcion"
uv run alembic upgrade head
```

## Correr el servidor

Desde el directorio `backend/`:

```bash
uv run uvicorn backend.main:app --reload --app-dir src --host 0.0.0.0 --port 8000
```

- Salud: [http://localhost:8000/api/v1/salud](http://localhost:8000/api/v1/salud)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Pruebas

Requieren Postgres levantado. Pytest crea y elimina la base `cuentas_claras_test` automáticamente.

```bash
uv run pytest
```
