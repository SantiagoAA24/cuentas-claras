from datetime import timedelta
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from backend.core.security import crear_access_token
from backend.core.time import utcnow
from helpers import auth_header, crear_negocio_y_usuario, login


def test_login_correcto(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos", password="arepa12")

    response = client.post(
        "/api/v1/auth/login",
        json={"usuario": "  Carlos  ", "password": "arepa12"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["usuario"]["usuario"] == "carlos"
    assert body["usuario"]["nombre"] == "Carlos"
    assert body["usuario"]["negocio_id"]


def test_login_incorrecto(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos", password="arepa12")

    response = client.post(
        "/api/v1/auth/login",
        json={"usuario": "carlos", "password": "mal"},
    )

    assert response.status_code == 401
    assert response.json()["codigo"] == "credenciales_invalidas"

    response = client.post(
        "/api/v1/auth/login",
        json={"usuario": "nadie", "password": "arepa12"},
    )
    assert response.status_code == 401
    assert response.json()["codigo"] == "credenciales_invalidas"


def test_access_token_vencido(client: TestClient, session: Session) -> None:
    _, user = crear_negocio_y_usuario(session, usuario="carlos")
    token = crear_access_token(
        usuario_id=user.id,
        negocio_id=user.negocio_id,
        ahora=utcnow() - timedelta(minutes=20),
        minutos=15,
    )

    response = client.post(
        "/api/v1/dispositivos/registrar",
        headers=auth_header(token),
        json={"id": str(uuid4())},
    )

    assert response.status_code == 401
    assert response.json()["codigo"] == "no_autorizado"


def test_renovar_rota_refresh(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    viejo_refresh = tokens["refresh_token"]

    response = client.post(
        "/api/v1/auth/renovar",
        json={"refresh_token": viejo_refresh},
    )
    assert response.status_code == 200
    nuevo = response.json()
    assert nuevo["access_token"]
    assert nuevo["refresh_token"] != viejo_refresh

    reuse = client.post(
        "/api/v1/auth/renovar",
        json={"refresh_token": viejo_refresh},
    )
    assert reuse.status_code == 401
    assert reuse.json()["codigo"] == "token_invalido"


def test_cerrar_sesion_invalida_refresh(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")

    response = client.post(
        "/api/v1/auth/cerrar-sesion",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert response.status_code == 204

    renovar = client.post(
        "/api/v1/auth/renovar",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert renovar.status_code == 401
    assert renovar.json()["codigo"] == "token_invalido"


def test_cerrar_sesion_idempotente(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")

    for _ in range(2):
        response = client.post(
            "/api/v1/auth/cerrar-sesion",
            json={"refresh_token": tokens["refresh_token"]},
        )
        assert response.status_code == 204


def test_aislamiento_entre_negocios(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(
        session,
        usuario="carlos",
        nombre_negocio="Negocio A",
    )
    crear_negocio_y_usuario(
        session,
        usuario="laura",
        nombre_negocio="Negocio B",
        nombre_usuario="Laura",
    )

    tokens_a = login(client, usuario="carlos")
    tokens_b = login(client, usuario="laura")
    assert tokens_a["usuario"]["negocio_id"] != tokens_b["usuario"]["negocio_id"]

    dispositivo_id = str(uuid4())
    reg_a = client.post(
        "/api/v1/dispositivos/registrar",
        headers=auth_header(tokens_a["access_token"]),
        json={"id": dispositivo_id},
    )
    assert reg_a.status_code == 200
    assert reg_a.json()["prefijo"] == "A"

    conflicto = client.post(
        "/api/v1/dispositivos/registrar",
        headers=auth_header(tokens_b["access_token"]),
        json={"id": dispositivo_id},
    )
    assert conflicto.status_code == 409
    assert conflicto.json()["codigo"] == "dispositivo_otro_negocio"
