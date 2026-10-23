from uuid import uuid4

from sqlmodel import Session

from backend.core.security import hash_password
from backend.core.time import utcnow
from backend.models import Negocio, Usuario


def crear_negocio_y_usuario(
    session: Session,
    *,
    usuario: str = "carlos",
    password: str = "arepa12",
    nombre_usuario: str = "Carlos",
    nombre_negocio: str | None = None,
) -> tuple[Negocio, Usuario]:
    ahora = utcnow()
    negocio = Negocio(
        id=uuid4(),
        nombre=nombre_negocio or f"Negocio {usuario}",
        documento="1.000.000.000",
        pie_recibo="Gracias",
        ultimo_seq=0,
        creado_en=ahora,
        actualizado_en=ahora,
    )
    session.add(negocio)
    session.flush()

    user = Usuario(
        id=uuid4(),
        negocio_id=negocio.id,
        nombre=nombre_usuario,
        usuario=usuario.strip().lower(),
        password_hash=hash_password(password),
        activo=True,
        creado_en=ahora,
    )
    session.add(user)
    session.commit()
    session.refresh(negocio)
    session.refresh(user)
    return negocio, user


def auth_header(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def login(
    client,
    *,
    usuario: str,
    password: str = "arepa12",
) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"usuario": usuario, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()
