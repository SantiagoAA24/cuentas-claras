from __future__ import annotations

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from helpers import auth_header, crear_negocio_y_usuario, login
from test_sync_push import (
    _cambio_anular,
    _cambio_producto,
    _cambio_venta,
    _registrar_dispositivo,
)


def test_pull_desde_cero_paginado(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)

    cambios = [_cambio_producto(producto_id=uuid4()) for _ in range(5)]
    cambios += [
        _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=i + 1)
        for i in range(5)
    ]
    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": cambios},
    )

    pagina1 = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": 0, "limite": 4},
    )
    assert pagina1.status_code == 200
    body1 = pagina1.json()
    assert body1["hayMas"] is True
    n1 = len(body1["productos"]) + len(body1["ventas"]) + len(body1["anulaciones"])
    assert n1 == 4
    cursor = body1["cursor"]

    todos_ids: set[str] = {p["id"] for p in body1["productos"]}
    todos_ids |= {v["id"] for v in body1["ventas"]}

    cursor_actual = cursor
    while True:
        pagina = client.get(
            "/api/v1/sync/pull",
            headers=headers,
            params={
                "dispositivo_id": disp["id"],
                "desde": cursor_actual,
                "limite": 4,
            },
        )
        body = pagina.json()
        todos_ids |= {p["id"] for p in body["productos"]}
        todos_ids |= {v["id"] for v in body["ventas"]}
        if not body["hayMas"]:
            break
        assert body["cursor"] > cursor_actual
        cursor_actual = body["cursor"]

    assert len(todos_ids) == 10


def test_pull_incremental(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)

    client.post(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": 0},
    )
    # baseline
    base = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": 0},
    ).json()
    assert base["cursor"] == 0
    assert base["ventas"] == []

    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={
            "dispositivoId": disp["id"],
            "cambios": [
                _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=1)
            ],
        },
    )

    despues = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": 0},
    ).json()
    assert len(despues["ventas"]) == 1
    cursor = despues["cursor"]

    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={
            "dispositivoId": disp["id"],
            "cambios": [
                _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=2)
            ],
        },
    )

    incr = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": cursor},
    ).json()
    assert len(incr["ventas"]) == 1
    assert incr["ventas"][0]["consecutivo"] == 2


def test_dos_dispositivos_paralelo_venta_y_anulacion(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])

    disp_a = _registrar_dispositivo(client, headers)
    disp_b = _registrar_dispositivo(client, headers)
    assert disp_a["prefijo"] == "A"
    assert disp_b["prefijo"] == "B"

    venta_a = _cambio_venta(dispositivo_prefijo="A", consecutivo=1, total=10000)
    venta_b = _cambio_venta(dispositivo_prefijo="B", consecutivo=1, total=15000)
    venta_b_id = venta_b["entidadId"]

    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp_a["id"], "cambios": [venta_a]},
    )
    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp_b["id"], "cambios": [venta_b]},
    )

    # A anula la venta de B
    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={
            "dispositivoId": disp_a["id"],
            "cambios": [_cambio_anular(venta_id=venta_b_id)],
        },
    )

    pull_a = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp_a["id"], "desde": 0},
    ).json()
    pull_b = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp_b["id"], "desde": 0},
    ).json()

    assert len(pull_a["ventas"]) == 2
    assert len(pull_b["ventas"]) == 2
    assert len(pull_a["anulaciones"]) == 1
    assert len(pull_b["anulaciones"]) == 1
    assert pull_a["anulaciones"][0]["ventaId"] == venta_b_id


def test_pull_requiere_auth(client: TestClient) -> None:
    r = client.get(
        "/api/v1/sync/pull",
        params={"dispositivo_id": str(uuid4()), "desde": 0},
    )
    assert r.status_code == 401
