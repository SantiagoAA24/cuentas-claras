from __future__ import annotations

import string
from uuid import UUID

from fastapi import status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.core.errors import AppError
from backend.core.time import utcnow
from backend.models import Dispositivo, Negocio
from backend.schemas.dispositivo import DispositivoResponse

_PREFIJOS = string.ascii_uppercase  # A–Z


def _a_respuesta(dispositivo: Dispositivo) -> DispositivoResponse:
    return DispositivoResponse(
        id=dispositivo.id,
        prefijo=dispositivo.prefijo,
        ultimo_consecutivo=dispositivo.ultimo_consecutivo,
    )


def _siguiente_prefijo(session: Session, negocio_id: UUID) -> str:
    usados = set(
        session.exec(
            select(Dispositivo.prefijo).where(Dispositivo.negocio_id == negocio_id)
        ).all()
    )
    for letra in _PREFIJOS:
        if letra not in usados:
            return letra
    raise AppError(
        codigo="prefijos_agotados",
        mensaje="Este negocio ya tiene los 26 prefijos de dispositivo asignados.",
        status_code=status.HTTP_409_CONFLICT,
    )


def registrar_dispositivo(
    session: Session,
    *,
    negocio_id: UUID,
    dispositivo_id: UUID,
) -> DispositivoResponse:
    existente = session.get(Dispositivo, dispositivo_id)
    if existente is not None:
        if existente.negocio_id != negocio_id:
            raise AppError(
                codigo="dispositivo_otro_negocio",
                mensaje="Este dispositivo ya está registrado en otro negocio.",
                status_code=status.HTTP_409_CONFLICT,
            )
        return _a_respuesta(existente)

    # Bloqueo del negocio para serializar asignación de prefijos.
    negocio = session.exec(
        select(Negocio).where(Negocio.id == negocio_id).with_for_update()
    ).first()
    if negocio is None:
        raise AppError(
            codigo="negocio_no_encontrado",
            mensaje="El negocio no existe.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # Re-chequear por si otro request insertó el mismo id mientras esperábamos el lock.
    existente = session.get(Dispositivo, dispositivo_id)
    if existente is not None:
        if existente.negocio_id != negocio_id:
            raise AppError(
                codigo="dispositivo_otro_negocio",
                mensaje="Este dispositivo ya está registrado en otro negocio.",
                status_code=status.HTTP_409_CONFLICT,
            )
        return _a_respuesta(existente)

    prefijo = _siguiente_prefijo(session, negocio_id)
    dispositivo = Dispositivo(
        id=dispositivo_id,
        negocio_id=negocio_id,
        prefijo=prefijo,
        ultimo_consecutivo=0,
        creado_en=utcnow(),
    )
    session.add(dispositivo)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        existente = session.get(Dispositivo, dispositivo_id)
        if existente is not None and existente.negocio_id == negocio_id:
            return _a_respuesta(existente)
        raise AppError(
            codigo="dispositivo_conflicto",
            mensaje="No se pudo registrar el dispositivo. Intenta de nuevo.",
            status_code=status.HTTP_409_CONFLICT,
        ) from exc

    session.refresh(dispositivo)
    return _a_respuesta(dispositivo)
