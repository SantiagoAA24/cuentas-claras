from __future__ import annotations

import logging
import re
from typing import Any
from uuid import UUID, uuid4

from fastapi import status
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, select

from backend.core.deps import CurrentUser
from backend.core.errors import AppError
from backend.core.time import utcnow
from backend.models import (
    AlertaSync,
    Anulacion,
    Dispositivo,
    ItemVenta,
    Negocio,
    Producto,
    Venta,
)
from backend.schemas.sync import (
    AnulacionPull,
    AvisoCambio,
    CambioSync,
    DispositivoPull,
    ItemVentaSync,
    ProductoPayload,
    ProductoPull,
    ResultadoCambio,
    SyncPullResponse,
    SyncPushResponse,
    VentaAnularPayload,
    VentaPull,
    VentaRegistrarPayload,
)

logger = logging.getLogger(__name__)

_RECIBO_RE = re.compile(r"^([A-Z])-(\d+)$")
_MEDIOS_PAGO = frozenset({"Efectivo", "Nequi", "Daviplata", "Transferencia"})
_CATEGORIAS = frozenset({"Arepas", "Bebidas", "Adicionales"})
_MOTIVOS = frozenset(
    {
        "Error al registrar",
        "Cliente canceló",
        "Producto equivocado",
        "Otro",
    }
)

_AVISO_RECIBO_DUPLICADO = AvisoCambio(
    codigo="recibo_duplicado",
    mensaje="Este recibo ya existe en otro dispositivo.",
)


class _Rechazo(Exception):
    """Control de flujo: rechazo esperado de un cambio del lote."""

    def __init__(self, codigo: str, mensaje: str) -> None:
        self.codigo = codigo
        self.mensaje = mensaje
        super().__init__(mensaje)


def _resultado(
    cambio_id: UUID,
    estado: str,
    *,
    codigo: str | None = None,
    mensaje: str | None = None,
    aviso: AvisoCambio | None = None,
) -> ResultadoCambio:
    return ResultadoCambio(
        id=cambio_id,
        estado=estado,  # type: ignore[arg-type]
        codigo=codigo,
        mensaje=mensaje,
        aviso=aviso,
    )


def _siguiente_seq(session: Session, negocio_id: UUID) -> int:
    negocio = session.exec(
        select(Negocio).where(Negocio.id == negocio_id).with_for_update()
    ).first()
    if negocio is None:
        raise _Rechazo("negocio_ajeno", "El negocio no existe.")
    negocio.ultimo_seq += 1
    negocio.actualizado_en = utcnow()
    session.add(negocio)
    return negocio.ultimo_seq


def _parsear_recibo(recibo: str) -> tuple[str, int]:
    match = _RECIBO_RE.match(recibo.strip())
    if match is None:
        raise _Rechazo(
            "recibo_invalido",
            "El recibo debe tener el formato A-0001.",
        )
    return match.group(1), int(match.group(2))


def _obtener_dispositivo(
    session: Session,
    *,
    negocio_id: UUID,
    dispositivo_id: UUID,
) -> Dispositivo:
    dispositivo = session.get(Dispositivo, dispositivo_id)
    if dispositivo is None or dispositivo.negocio_id != negocio_id:
        raise _Rechazo(
            "dispositivo_invalido",
            "El dispositivo no pertenece a este negocio.",
        )
    return dispositivo


def _bump_consecutivo(dispositivo: Dispositivo, consecutivo: int) -> None:
    dispositivo.ultimo_consecutivo = max(dispositivo.ultimo_consecutivo, consecutivo)


def _venta_por_recibo_activa(
    session: Session,
    *,
    negocio_id: UUID,
    prefijo: str,
    consecutivo: int,
) -> Venta | None:
    return session.exec(
        select(Venta).where(
            Venta.negocio_id == negocio_id,
            Venta.prefijo == prefijo,
            Venta.consecutivo == consecutivo,
            col(Venta.conflicto_recibo).is_(False),
        )
    ).first()


def _insertar_items(
    session: Session,
    *,
    negocio_id: UUID,
    venta_id: UUID,
    items: list[Any],
) -> None:
    for item in items:
        producto_id = item.producto_id
        if producto_id is not None:
            producto = session.get(Producto, producto_id)
            if producto is None or producto.negocio_id != negocio_id:
                producto_id = None
        session.add(
            ItemVenta(
                id=uuid4(),
                negocio_id=negocio_id,
                venta_id=venta_id,
                producto_id=producto_id,
                nombre=item.nombre,
                precio_unitario=item.precio_unitario,
                cantidad=item.cantidad,
            )
        )


def _registrar_alerta_recibo(
    session: Session,
    *,
    negocio_id: UUID,
    venta_existente: Venta,
    venta_nueva: Venta,
    dispositivo_id: UUID,
) -> None:
    session.add(
        AlertaSync(
            id=uuid4(),
            negocio_id=negocio_id,
            tipo="recibo_duplicado",
            venta_existente_id=venta_existente.id,
            venta_nueva_id=venta_nueva.id,
            dispositivo_id=dispositivo_id,
            prefijo=venta_nueva.prefijo,
            consecutivo=venta_nueva.consecutivo,
            detalle=(
                f"Recibo {venta_nueva.recibo}: existente={venta_existente.id}, "
                f"nueva={venta_nueva.id}"
            ),
            creado_en=utcnow(),
        )
    )
    logger.warning(
        "recibo_duplicado negocio=%s recibo=%s existente=%s nueva=%s dispositivo=%s",
        negocio_id,
        venta_nueva.recibo,
        venta_existente.id,
        venta_nueva.id,
        dispositivo_id,
    )


def _aplicar_venta_registrar(
    session: Session,
    *,
    current: CurrentUser,
    dispositivo: Dispositivo,
    cambio: CambioSync,
) -> ResultadoCambio:
    try:
        payload = VentaRegistrarPayload.model_validate(cambio.payload)
    except ValidationError as exc:
        raise _Rechazo("payload_invalido", "Payload de venta inválido.") from exc

    if payload.id != cambio.entidad_id:
        raise _Rechazo(
            "payload_invalido",
            "entidad_id no coincide con el id de la venta.",
        )

    existente = session.get(Venta, payload.id)
    if existente is not None:
        if existente.negocio_id != current.negocio_id:
            raise _Rechazo("negocio_ajeno", "La venta pertenece a otro negocio.")
        return _resultado(cambio.id, "ya_existia")

    if payload.medio_pago not in _MEDIOS_PAGO:
        raise _Rechazo("payload_invalido", "Medio de pago no válido.")

    suma = sum(i.precio_unitario * i.cantidad for i in payload.items)
    if suma != payload.total:
        raise _Rechazo(
            "total_invalido",
            "El total no coincide con la suma de los ítems.",
        )

    prefijo, consecutivo = _parsear_recibo(payload.recibo)
    if prefijo != dispositivo.prefijo:
        raise _Rechazo(
            "recibo_invalido",
            "El prefijo del recibo no coincide con el del dispositivo.",
        )

    ocupada = _venta_por_recibo_activa(
        session,
        negocio_id=current.negocio_id,
        prefijo=prefijo,
        consecutivo=consecutivo,
    )
    conflicto = ocupada is not None

    seq = _siguiente_seq(session, current.negocio_id)
    venta = Venta(
        id=payload.id,
        negocio_id=current.negocio_id,
        dispositivo_id=dispositivo.id,
        registrada_por_id=current.id,
        prefijo=prefijo,
        consecutivo=consecutivo,
        recibo=payload.recibo,
        fecha=payload.fecha,
        total=payload.total,
        medio_pago=payload.medio_pago,
        paga_con=payload.paga_con,
        vueltas=payload.vueltas,
        impreso=payload.impreso,
        conflicto_recibo=conflicto,
        seq=seq,
        creado_en=utcnow(),
    )
    session.add(venta)
    _insertar_items(
        session,
        negocio_id=current.negocio_id,
        venta_id=venta.id,
        items=payload.items,
    )
    _bump_consecutivo(dispositivo, consecutivo)
    session.add(dispositivo)

    if conflicto and ocupada is not None:
        _registrar_alerta_recibo(
            session,
            negocio_id=current.negocio_id,
            venta_existente=ocupada,
            venta_nueva=venta,
            dispositivo_id=dispositivo.id,
        )
        return _resultado(
            cambio.id,
            "aplicado",
            aviso=_AVISO_RECIBO_DUPLICADO,
        )

    try:
        session.flush()
    except IntegrityError as exc:
        # Carrera: marcar para reintento con conflicto tras rollback en push.
        raise _ReciboConflicto(
            payload=payload,
            prefijo=prefijo,
            consecutivo=consecutivo,
            dispositivo_id=dispositivo.id,
        ) from exc

    return _resultado(cambio.id, "aplicado")


class _ReciboConflicto(Exception):
    def __init__(
        self,
        *,
        payload: VentaRegistrarPayload,
        prefijo: str,
        consecutivo: int,
        dispositivo_id: UUID,
    ) -> None:
        self.payload = payload
        self.prefijo = prefijo
        self.consecutivo = consecutivo
        self.dispositivo_id = dispositivo_id
        super().__init__("recibo_conflicto")


def _aplicar_venta_registrar_tras_conflicto(
    session: Session,
    *,
    current: CurrentUser,
    cambio: CambioSync,
    race: _ReciboConflicto,
) -> ResultadoCambio:
    existente = session.get(Venta, race.payload.id)
    if existente is not None:
        return _resultado(cambio.id, "ya_existia")

    dispositivo = _obtener_dispositivo(
        session,
        negocio_id=current.negocio_id,
        dispositivo_id=race.dispositivo_id,
    )
    ocupada = _venta_por_recibo_activa(
        session,
        negocio_id=current.negocio_id,
        prefijo=race.prefijo,
        consecutivo=race.consecutivo,
    )
    if ocupada is None:
        # El unique falló por otra razón; reintentar el camino normal.
        return _aplicar_venta_registrar(
            session,
            current=current,
            dispositivo=dispositivo,
            cambio=cambio,
        )

    seq = _siguiente_seq(session, current.negocio_id)
    venta = Venta(
        id=race.payload.id,
        negocio_id=current.negocio_id,
        dispositivo_id=dispositivo.id,
        registrada_por_id=current.id,
        prefijo=race.prefijo,
        consecutivo=race.consecutivo,
        recibo=race.payload.recibo,
        fecha=race.payload.fecha,
        total=race.payload.total,
        medio_pago=race.payload.medio_pago,
        paga_con=race.payload.paga_con,
        vueltas=race.payload.vueltas,
        impreso=race.payload.impreso,
        conflicto_recibo=True,
        seq=seq,
        creado_en=utcnow(),
    )
    session.add(venta)
    _insertar_items(
        session,
        negocio_id=current.negocio_id,
        venta_id=venta.id,
        items=race.payload.items,
    )
    _bump_consecutivo(dispositivo, race.consecutivo)
    session.add(dispositivo)
    _registrar_alerta_recibo(
        session,
        negocio_id=current.negocio_id,
        venta_existente=ocupada,
        venta_nueva=venta,
        dispositivo_id=dispositivo.id,
    )
    return _resultado(
        cambio.id,
        "aplicado",
        aviso=_AVISO_RECIBO_DUPLICADO,
    )


def _aplicar_venta_anular(
    session: Session,
    *,
    current: CurrentUser,
    cambio: CambioSync,
) -> ResultadoCambio:
    try:
        payload = VentaAnularPayload.model_validate(cambio.payload)
    except ValidationError as exc:
        raise _Rechazo("payload_invalido", "Payload de anulación inválido.") from exc

    if payload.venta_id != cambio.entidad_id:
        raise _Rechazo(
            "payload_invalido",
            "entidad_id no coincide con venta_id.",
        )

    if payload.anulada.motivo not in _MOTIVOS:
        raise _Rechazo("payload_invalido", "Motivo de anulación no válido.")
    if payload.anulada.motivo == "Otro" and not (payload.anulada.texto or "").strip():
        raise _Rechazo(
            "payload_invalido",
            "El motivo 'Otro' requiere texto.",
        )

    venta = session.get(Venta, payload.venta_id)
    if venta is None:
        raise _Rechazo("venta_no_encontrada", "La venta no existe.")
    if venta.negocio_id != current.negocio_id:
        raise _Rechazo("negocio_ajeno", "La venta pertenece a otro negocio.")

    ya = session.exec(
        select(Anulacion).where(Anulacion.venta_id == payload.venta_id)
    ).first()
    if ya is not None:
        return _resultado(cambio.id, "ya_existia")

    seq = _siguiente_seq(session, current.negocio_id)
    session.add(
        Anulacion(
            id=uuid4(),
            negocio_id=current.negocio_id,
            venta_id=payload.venta_id,
            anulada_por_id=current.id,
            motivo=payload.anulada.motivo,
            texto=(
                payload.anulada.texto.strip()
                if payload.anulada.motivo == "Otro" and payload.anulada.texto
                else None
            ),
            anulada_en=payload.anulada.en,
            seq=seq,
            creado_en=utcnow(),
        )
    )
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        return _resultado(cambio.id, "ya_existia")

    return _resultado(cambio.id, "aplicado")


def _aplicar_producto(
    session: Session,
    *,
    current: CurrentUser,
    cambio: CambioSync,
    es_crear: bool,
) -> ResultadoCambio:
    try:
        payload = ProductoPayload.model_validate(cambio.payload)
    except ValidationError as exc:
        raise _Rechazo("producto_invalido", "Payload de producto inválido.") from exc

    if payload.id != cambio.entidad_id:
        raise _Rechazo(
            "payload_invalido",
            "entidad_id no coincide con el id del producto.",
        )
    if payload.categoria not in _CATEGORIAS:
        raise _Rechazo("producto_invalido", "Categoría no válida.")

    existente = session.get(Producto, payload.id)
    if existente is not None:
        if existente.negocio_id != current.negocio_id:
            raise _Rechazo("negocio_ajeno", "El producto pertenece a otro negocio.")
        if es_crear:
            return _resultado(cambio.id, "ya_existia")
        # LWW: sobrescribir y nuevo seq
        seq = _siguiente_seq(session, current.negocio_id)
        existente.nombre = payload.nombre
        existente.precio = payload.precio
        existente.categoria = payload.categoria
        existente.activo = payload.activo
        existente.seq = seq
        existente.actualizado_en = utcnow()
        session.add(existente)
        return _resultado(cambio.id, "aplicado")

    seq = _siguiente_seq(session, current.negocio_id)
    ahora = utcnow()
    session.add(
        Producto(
            id=payload.id,
            negocio_id=current.negocio_id,
            nombre=payload.nombre,
            precio=payload.precio,
            categoria=payload.categoria,
            activo=payload.activo,
            seq=seq,
            creado_en=ahora,
            actualizado_en=ahora,
        )
    )
    return _resultado(cambio.id, "aplicado")


def _aplicar_cambio(
    session: Session,
    *,
    current: CurrentUser,
    dispositivo: Dispositivo,
    cambio: CambioSync,
) -> ResultadoCambio:
    if cambio.operacion == "venta.registrar":
        return _aplicar_venta_registrar(
            session,
            current=current,
            dispositivo=dispositivo,
            cambio=cambio,
        )
    if cambio.operacion == "venta.anular":
        return _aplicar_venta_anular(session, current=current, cambio=cambio)
    if cambio.operacion == "producto.crear":
        return _aplicar_producto(session, current=current, cambio=cambio, es_crear=True)
    if cambio.operacion == "producto.actualizar":
        return _aplicar_producto(
            session, current=current, cambio=cambio, es_crear=False
        )
    raise _Rechazo("payload_invalido", "Operación no soportada.")


def push(
    session: Session,
    *,
    current: CurrentUser,
    dispositivo_id: UUID,
    cambios: list[CambioSync],
) -> SyncPushResponse:
    resultados: list[ResultadoCambio] = []

    try:
        dispositivo = _obtener_dispositivo(
            session,
            negocio_id=current.negocio_id,
            dispositivo_id=dispositivo_id,
        )
    except _Rechazo as exc:
        # Dispositivo inválido: rechazar todos los cambios del lote.
        for cambio in cambios:
            resultados.append(
                _resultado(
                    cambio.id, "rechazado", codigo=exc.codigo, mensaje=exc.mensaje
                )
            )
        return SyncPushResponse(resultados=resultados)

    for cambio in cambios:
        try:
            dispositivo = _obtener_dispositivo(
                session,
                negocio_id=current.negocio_id,
                dispositivo_id=dispositivo_id,
            )
            resultado = _aplicar_cambio(
                session,
                current=current,
                dispositivo=dispositivo,
                cambio=cambio,
            )
            session.commit()
            resultados.append(resultado)
        except _ReciboConflicto as race:
            session.rollback()
            try:
                resultado = _aplicar_venta_registrar_tras_conflicto(
                    session,
                    current=current,
                    cambio=cambio,
                    race=race,
                )
                session.commit()
                resultados.append(resultado)
            except _Rechazo as exc:
                session.rollback()
                resultados.append(
                    _resultado(
                        cambio.id,
                        "rechazado",
                        codigo=exc.codigo,
                        mensaje=exc.mensaje,
                    )
                )
            except Exception:
                session.rollback()
                logger.exception(
                    "Error reintentando venta con conflicto id=%s", cambio.id
                )
                resultados.append(
                    _resultado(
                        cambio.id,
                        "rechazado",
                        codigo="interno",
                        mensaje="No se pudo aplicar el cambio.",
                    )
                )
        except _Rechazo as exc:
            session.rollback()
            resultados.append(
                _resultado(
                    cambio.id,
                    "rechazado",
                    codigo=exc.codigo,
                    mensaje=exc.mensaje,
                )
            )
        except Exception:
            session.rollback()
            logger.exception("Error aplicando cambio sync id=%s", cambio.id)
            resultados.append(
                _resultado(
                    cambio.id,
                    "rechazado",
                    codigo="interno",
                    mensaje="No se pudo aplicar el cambio.",
                )
            )

    return SyncPushResponse(resultados=resultados)


def _evento(tipo: str, seq: int, entidad_id: UUID) -> tuple[int, str, UUID]:
    return (seq, tipo, entidad_id)


def pull(
    session: Session,
    *,
    current: CurrentUser,
    dispositivo_id: UUID,
    desde: int,
    limite: int,
) -> SyncPullResponse:
    dispositivo = session.get(Dispositivo, dispositivo_id)
    if dispositivo is None or dispositivo.negocio_id != current.negocio_id:
        raise AppError(
            codigo="dispositivo_invalido",
            mensaje="El dispositivo no pertenece a este negocio.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    negocio_id = current.negocio_id
    eventos: list[tuple[int, str, UUID]] = []

    for seq, eid in session.exec(
        select(Producto.seq, Producto.id).where(
            Producto.negocio_id == negocio_id,
            Producto.seq > desde,
        )
    ).all():
        eventos.append(_evento("producto", seq, eid))

    for seq, eid in session.exec(
        select(Venta.seq, Venta.id).where(
            Venta.negocio_id == negocio_id,
            Venta.seq > desde,
        )
    ).all():
        eventos.append(_evento("venta", seq, eid))

    for seq, eid in session.exec(
        select(Anulacion.seq, Anulacion.id).where(
            Anulacion.negocio_id == negocio_id,
            Anulacion.seq > desde,
        )
    ).all():
        eventos.append(_evento("anulacion", seq, eid))

    eventos.sort(key=lambda e: e[0])
    pagina = eventos[:limite]
    cursor = pagina[-1][0] if pagina else desde
    hay_mas = len(eventos) > limite

    producto_ids = [eid for _, tipo, eid in pagina if tipo == "producto"]
    venta_ids = [eid for _, tipo, eid in pagina if tipo == "venta"]
    anulacion_ids = [eid for _, tipo, eid in pagina if tipo == "anulacion"]

    productos_out: list[ProductoPull] = []
    if producto_ids:
        productos = session.exec(
            select(Producto).where(col(Producto.id).in_(producto_ids))
        ).all()
        por_id = {p.id: p for p in productos}
        for pid in producto_ids:
            p = por_id[pid]
            productos_out.append(
                ProductoPull(
                    id=p.id,
                    nombre=p.nombre,
                    precio=p.precio,
                    categoria=p.categoria,
                    activo=p.activo,
                    seq=p.seq,
                    actualizado_en=p.actualizado_en,
                )
            )

    ventas_out: list[VentaPull] = []
    if venta_ids:
        ventas = session.exec(select(Venta).where(col(Venta.id).in_(venta_ids))).all()
        por_id = {v.id: v for v in ventas}
        items = session.exec(
            select(ItemVenta).where(col(ItemVenta.venta_id).in_(venta_ids))
        ).all()
        items_por_venta: dict[UUID, list[ItemVenta]] = {}
        for item in items:
            items_por_venta.setdefault(item.venta_id, []).append(item)

        for vid in venta_ids:
            v = por_id[vid]
            ventas_out.append(
                VentaPull(
                    id=v.id,
                    dispositivo_id=v.dispositivo_id,
                    prefijo=v.prefijo,
                    consecutivo=v.consecutivo,
                    recibo=v.recibo,
                    fecha=v.fecha,
                    registrada_por_id=v.registrada_por_id,
                    total=v.total,
                    medio_pago=v.medio_pago,
                    paga_con=v.paga_con,
                    vueltas=v.vueltas,
                    impreso=v.impreso,
                    conflicto_recibo=v.conflicto_recibo,
                    seq=v.seq,
                    items=[
                        ItemVentaSync(
                            producto_id=i.producto_id,
                            nombre=i.nombre,
                            precio_unitario=i.precio_unitario,
                            cantidad=i.cantidad,
                        )
                        for i in items_por_venta.get(v.id, [])
                    ],
                )
            )

    anulaciones_out: list[AnulacionPull] = []
    if anulacion_ids:
        anulaciones = session.exec(
            select(Anulacion).where(col(Anulacion.id).in_(anulacion_ids))
        ).all()
        por_id = {a.id: a for a in anulaciones}
        for aid in anulacion_ids:
            a = por_id[aid]
            anulaciones_out.append(
                AnulacionPull(
                    id=a.id,
                    venta_id=a.venta_id,
                    motivo=a.motivo,
                    texto=a.texto,
                    anulada_por_id=a.anulada_por_id,
                    anulada_en=a.anulada_en,
                    seq=a.seq,
                )
            )

    # Refrescar por si otro commit actualizó el consecutivo en esta sesión.
    session.refresh(dispositivo)

    return SyncPullResponse(
        cursor=cursor,
        hay_mas=hay_mas,
        productos=productos_out,
        ventas=ventas_out,
        anulaciones=anulaciones_out,
        dispositivo=DispositivoPull(
            id=dispositivo.id,
            prefijo=dispositivo.prefijo,
            ultimo_consecutivo=dispositivo.ultimo_consecutivo,
        ),
    )
