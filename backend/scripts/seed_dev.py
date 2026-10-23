"""Semilla de desarrollo: negocio, Carlos/Laura, dispositivo A y catálogo.

Idempotente: si el negocio seed ya existe, no duplica.

Uso (desde backend/):
    uv run python scripts/seed_dev.py
"""

from __future__ import annotations

from uuid import UUID

from sqlmodel import Session, select

from backend.core.db import engine
from backend.core.security import hash_password
from backend.core.time import utcnow
from backend.models import Dispositivo, Negocio, Producto, Usuario

NEGOCIO_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
DISPOSITIVO_ID = UUID("33333333-3333-4333-8333-333333333001")

USUARIOS = [
    {
        "id": UUID("00000000-0000-4000-8000-000000000001"),
        "nombre": "Carlos",
        "usuario": "carlos",
        "password": "arepa12",
    },
    {
        "id": UUID("00000000-0000-4000-8000-000000000002"),
        "nombre": "Laura",
        "usuario": "laura",
        "password": "arepa12",
    },
]

PRODUCTOS = [
    {
        "id": UUID("11111111-1111-4111-8111-111111111001"),
        "nombre": "Arepa de queso",
        "precio": 5000,
        "categoria": "Arepas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111002"),
        "nombre": "Arepa rellena de carne",
        "precio": 9000,
        "categoria": "Arepas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111003"),
        "nombre": "Arepa de huevo",
        "precio": 7000,
        "categoria": "Arepas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111004"),
        "nombre": "Arepa mixta",
        "precio": 11000,
        "categoria": "Arepas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111005"),
        "nombre": "Arepa de choclo",
        "precio": 6000,
        "categoria": "Arepas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111006"),
        "nombre": "Gaseosa",
        "precio": 3000,
        "categoria": "Bebidas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111007"),
        "nombre": "Jugo natural",
        "precio": 4500,
        "categoria": "Bebidas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111008"),
        "nombre": "Café",
        "precio": 2000,
        "categoria": "Bebidas",
        "activo": True,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111009"),
        "nombre": "Chocolate",
        "precio": 3000,
        "categoria": "Bebidas",
        "activo": False,
    },
    {
        "id": UUID("11111111-1111-4111-8111-111111111010"),
        "nombre": "Queso extra",
        "precio": 1500,
        "categoria": "Adicionales",
        "activo": False,
    },
]


def seed(session: Session) -> bool:
    """Inserta la semilla. Devuelve False si el negocio ya existía."""
    existente = session.get(Negocio, NEGOCIO_ID)
    if existente is not None:
        return False

    ahora = utcnow()
    negocio = Negocio(
        id=NEGOCIO_ID,
        nombre="Arepas La Esquina",
        documento="1.098.765.432",
        pie_recibo="¡Gracias por su compra!",
        ultimo_seq=0,
        creado_en=ahora,
        actualizado_en=ahora,
    )
    session.add(negocio)
    session.flush()

    for u in USUARIOS:
        session.add(
            Usuario(
                id=u["id"],
                negocio_id=NEGOCIO_ID,
                nombre=u["nombre"],
                usuario=u["usuario"],
                password_hash=hash_password(u["password"]),
                activo=True,
                creado_en=ahora,
            )
        )

    session.add(
        Dispositivo(
            id=DISPOSITIVO_ID,
            negocio_id=NEGOCIO_ID,
            prefijo="A",
            ultimo_consecutivo=0,
            nombre="Celular principal",
            creado_en=ahora,
        )
    )

    for i, p in enumerate(PRODUCTOS, start=1):
        session.add(
            Producto(
                id=p["id"],
                negocio_id=NEGOCIO_ID,
                nombre=p["nombre"],
                precio=p["precio"],
                categoria=p["categoria"],
                activo=p["activo"],
                seq=i,
                creado_en=ahora,
                actualizado_en=ahora,
            )
        )

    negocio.ultimo_seq = len(PRODUCTOS)
    negocio.actualizado_en = ahora
    session.commit()
    return True


def main() -> None:
    with Session(engine) as session:
        creado = seed(session)
        if creado:
            n_productos = len(
                session.exec(
                    select(Producto).where(Producto.negocio_id == NEGOCIO_ID)
                ).all()
            )
            print(
                f"Semilla creada: Arepas La Esquina "
                f"({n_productos} productos, usuarios carlos/laura)."
            )
        else:
            print("La semilla ya existe; no se hicieron cambios.")


if __name__ == "__main__":
    main()
