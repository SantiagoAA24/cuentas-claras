from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from backend.models import AlertaSync, Anulacion, Dispositivo, Producto, Venta
from helpers import auth_header, crear_negocio_y_usuario, login


def _registrar_dispositivo(
    client: TestClient, headers: dict, dispositivo_id=None
) -> dict:
    did = dispositivo_id or uuid4()
    r = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": str(did)},
    )
    assert r.status_code == 200, r.text
    return r.json()


def _cambio_venta(
    *,
    dispositivo_prefijo: str,
    consecutivo: int,
    total: int = 10000,
    venta_id=None,
    cola_id=None,
    items=None,
) -> dict:
    vid = venta_id or uuid4()
    recibo = f"{dispositivo_prefijo}-{consecutivo:04d}"
    if items is None:
        items = [
            {
                "productoId": str(uuid4()),
                "nombre": "Queso",
                "precioUnitario": total,
                "cantidad": 1,
            }
        ]
    return {
        "id": str(cola_id or uuid4()),
        "operacion": "venta.registrar",
        "entidadId": str(vid),
        "payload": {
            "id": str(vid),
            "recibo": recibo,
            "fecha": datetime.now(UTC).isoformat(),
            "items": items,
            "total": total,
            "medioPago": "Efectivo",
            "impreso": False,
        },
    }


def _cambio_producto(
    *, crear: bool = True, producto_id=None, precio: int = 5000
) -> dict:
    pid = producto_id or uuid4()
    return {
        "id": str(uuid4()),
        "operacion": "producto.crear" if crear else "producto.actualizar",
        "entidadId": str(pid),
        "payload": {
            "id": str(pid),
            "nombre": "Arepa queso",
            "precio": precio,
            "categoria": "Arepas",
            "activo": True,
        },
    }


def _cambio_anular(*, venta_id, motivo: str = "Error al registrar") -> dict:
    return {
        "id": str(uuid4()),
        "operacion": "venta.anular",
        "entidadId": str(venta_id),
        "payload": {
            "ventaId": str(venta_id),
            "anulada": {
                "motivo": motivo,
                "en": datetime.now(UTC).isoformat(),
            },
        },
    }


def test_push_idempotente_mismo_lote(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)
    dispositivo_id = disp["id"]

    venta = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=1)
    producto = _cambio_producto()
    body = {
        "dispositivoId": dispositivo_id,
        "cambios": [producto, venta],
    }

    r1 = client.post("/api/v1/sync/push", headers=headers, json=body)
    assert r1.status_code == 200, r1.text
    assert [x["estado"] for x in r1.json()["resultados"]] == ["aplicado", "aplicado"]

    r2 = client.post("/api/v1/sync/push", headers=headers, json=body)
    assert r2.status_code == 200
    assert [x["estado"] for x in r2.json()["resultados"]] == [
        "ya_existia",
        "ya_existia",
    ]

    assert len(session.exec(select(Venta)).all()) == 1
    assert len(session.exec(select(Producto)).all()) == 1


def test_push_cambio_invalido_en_medio_no_bloquea_otros(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)

    ok1 = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=1, total=10000)
    malo = _cambio_venta(
        dispositivo_prefijo=disp["prefijo"],
        consecutivo=2,
        total=999,
        items=[
            {
                "productoId": str(uuid4()),
                "nombre": "Queso",
                "precioUnitario": 10000,
                "cantidad": 1,
            }
        ],
    )
    ok2 = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=3, total=8000)

    r = client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [ok1, malo, ok2]},
    )
    assert r.status_code == 200
    estados = [x["estado"] for x in r.json()["resultados"]]
    assert estados == ["aplicado", "rechazado", "aplicado"]
    assert r.json()["resultados"][1]["codigo"] == "total_invalido"
    assert len(session.exec(select(Venta)).all()) == 2


def test_choque_recibo_acepta_ambas_con_alerta(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)

    v1 = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=5, total=10000)
    v2 = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=5, total=12000)

    r1 = client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [v1]},
    )
    assert r1.json()["resultados"][0]["estado"] == "aplicado"
    assert r1.json()["resultados"][0]["aviso"] is None

    r2 = client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [v2]},
    )
    res = r2.json()["resultados"][0]
    assert res["estado"] == "aplicado"
    assert res["aviso"]["codigo"] == "recibo_duplicado"

    ventas = session.exec(select(Venta)).all()
    assert len(ventas) == 2
    conflictos = [v for v in ventas if v.conflicto_recibo]
    normales = [v for v in ventas if not v.conflicto_recibo]
    assert len(conflictos) == 1
    assert len(normales) == 1
    assert conflictos[0].recibo == normales[0].recibo == "A-0005"

    alertas = session.exec(select(AlertaSync)).all()
    assert len(alertas) == 1
    assert alertas[0].tipo == "recibo_duplicado"

    pull = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": disp["id"], "desde": 0},
    )
    assert pull.status_code == 200
    assert len(pull.json()["ventas"]) == 2
    assert any(v["conflictoRecibo"] for v in pull.json()["ventas"])


def test_anular_ya_anulada_ya_existia(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)

    venta = _cambio_venta(dispositivo_prefijo=disp["prefijo"], consecutivo=1)
    venta_id = venta["entidadId"]
    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [venta]},
    )

    a1 = _cambio_anular(venta_id=venta_id)
    a2 = _cambio_anular(venta_id=venta_id, motivo="Cliente canceló")
    r = client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [a1, a2]},
    )
    assert [x["estado"] for x in r.json()["resultados"]] == ["aplicado", "ya_existia"]
    assert len(session.exec(select(Anulacion)).all()) == 1
    assert session.exec(select(Anulacion)).first().motivo == "Error al registrar"


def test_producto_lww_actualizar(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    disp = _registrar_dispositivo(client, headers)
    pid = uuid4()

    crear = _cambio_producto(crear=True, producto_id=pid, precio=5000)
    act = _cambio_producto(crear=False, producto_id=pid, precio=7000)
    client.post(
        "/api/v1/sync/push",
        headers=headers,
        json={"dispositivoId": disp["id"], "cambios": [crear, act]},
    )

    producto = session.get(Producto, pid)
    assert producto is not None
    assert producto.precio == 7000


def test_aislamiento_entre_negocios(client: TestClient, session: Session) -> None:
    crear_negocio_y_usuario(session, usuario="carlos", nombre_negocio="N1")
    crear_negocio_y_usuario(session, usuario="laura", nombre_negocio="N2")

    t1 = login(client, usuario="carlos")
    t2 = login(client, usuario="laura")
    h1 = auth_header(t1["access_token"])
    h2 = auth_header(t2["access_token"])

    d1 = _registrar_dispositivo(client, h1)
    d2 = _registrar_dispositivo(client, h2)

    venta = _cambio_venta(dispositivo_prefijo=d1["prefijo"], consecutivo=1)
    client.post(
        "/api/v1/sync/push",
        headers=h1,
        json={"dispositivoId": d1["id"], "cambios": [venta]},
    )

    pull2 = client.get(
        "/api/v1/sync/pull",
        headers=h2,
        params={"dispositivo_id": d2["id"], "desde": 0},
    )
    assert pull2.json()["ventas"] == []
    assert pull2.json()["productos"] == []


def test_consecutivo_no_retrocede_tras_reregistro(
    client: TestClient,
    session: Session,
) -> None:
    crear_negocio_y_usuario(session, usuario="carlos")
    tokens = login(client, usuario="carlos")
    headers = auth_header(tokens["access_token"])
    dispositivo_id = uuid4()
    disp = _registrar_dispositivo(client, headers, dispositivo_id=dispositivo_id)

    for n in range(1, 11):
        client.post(
            "/api/v1/sync/push",
            headers=headers,
            json={
                "dispositivoId": disp["id"],
                "cambios": [
                    _cambio_venta(
                        dispositivo_prefijo=disp["prefijo"],
                        consecutivo=n,
                        total=1000 * n,
                    )
                ],
            },
        )

    dispositivo = session.get(Dispositivo, dispositivo_id)
    assert dispositivo is not None
    assert dispositivo.ultimo_consecutivo == 10

    reregistro = client.post(
        "/api/v1/dispositivos/registrar",
        headers=headers,
        json={"id": str(dispositivo_id)},
    )
    assert reregistro.json()["ultimo_consecutivo"] == 10
    assert reregistro.json()["prefijo"] == "A"

    pull = client.get(
        "/api/v1/sync/pull",
        headers=headers,
        params={"dispositivo_id": str(dispositivo_id), "desde": 0, "limite": 500},
    )
    assert pull.json()["dispositivo"]["ultimoConsecutivo"] == 10
