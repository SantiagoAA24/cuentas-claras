from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from backend.models import Dispositivo
from helpers import auth_header, crear_negocio_y_usuario, login


def test_asigna_prefijos_sin_repetir(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])

    id_a = str(uuid4())
    id_b = str(uuid4())

    r1 = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": id_a},
    )
    assert r1.status_code == 200
    assert r1.json() == {
        "id": id_a,
        "prefijo": "A",
        "ultimo_consecutivo": 0,
    }

    r2 = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": id_b},
    )
    assert r2.status_code == 200
    assert r2.json()["prefijo"] == "B"
    assert r2.json()["id"] == id_b


def test_reregistro_devuelve_mismo_prefijo_y_consecutivo(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    dispositivo_id = uuid4()

    primero = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": str(dispositivo_id)},
    )
    assert primero.status_code == 200

    dispositivo = session.get(Dispositivo, dispositivo_id)
    assert dispositivo is not None
    dispositivo.ultimo_consecutivo = 42
    session.add(dispositivo)
    session.commit()

    segundo = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": str(dispositivo_id)},
    )
    assert segundo.status_code == 200
    assert segundo.json() == {
        "id": str(dispositivo_id),
        "prefijo": "A",
        "ultimo_consecutivo": 42,
    }


def test_requiere_token(client: TestClient) -> None:
    response = client.post(
        "/api/v1/dispositivos/registrar",
        json={"id": str(uuid4())},
    )
    assert response.status_code == 401


def test_prefijos_agotados(client: TestClient, session: Session) -> None:
    negocio, _ = crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])

    from backend.core.time import utcnow

    ahora = utcnow()
    for letra in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        session.add(
            Dispositivo(
                id=uuid4(),
                negocio_id=negocio.id,
                prefijo=letra,
                ultimo_consecutivo=0,
                creado_en=ahora,
            )
        )
    session.commit()

    response = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": str(uuid4())},
    )
    assert response.status_code == 409
    assert response.json()["codigo"] == "prefijos_agotados"

    # No debe haber creado un 27º dispositivo.
    total = session.exec(
        select(Dispositivo).where(Dispositivo.negocio_id == negocio.id)
    ).all()
    assert len(total) == 26
