from __future__ import annotations

from datetime import timedelta
from uuid import UUID

from fastapi import status
from sqlmodel import Session, select

from backend.core.config import get_settings
from backend.core.errors import AppError
from backend.core.security import (
    crear_access_token,
    generar_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from backend.core.time import utcnow
from backend.models import Negocio, TokenRenovacion, Usuario
from backend.schemas.auth import TokenResponse, UsuarioPublico


def _credenciales_invalidas() -> AppError:
    return AppError(
        codigo="credenciales_invalidas",
        mensaje="Usuario o contraseña incorrectos.",
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


def _token_invalido() -> AppError:
    return AppError(
        codigo="token_invalido",
        mensaje="El token de renovación no es válido o ya expiró.",
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


def normalizar_usuario(usuario: str) -> str:
    return usuario.strip().lower()


def _usuario_publico(usuario: Usuario) -> UsuarioPublico:
    return UsuarioPublico(
        id=usuario.id,
        nombre=usuario.nombre,
        usuario=usuario.usuario,
        negocio_id=usuario.negocio_id,
    )


def _emitir_tokens(session: Session, usuario: Usuario) -> TokenResponse:
    settings = get_settings()
    ahora = utcnow()
    access = crear_access_token(
        usuario_id=usuario.id,
        negocio_id=usuario.negocio_id,
        ahora=ahora,
    )
    refresh_plain = generar_refresh_token()
    session.add(
        TokenRenovacion(
            usuario_id=usuario.id,
            token_hash=hash_refresh_token(refresh_plain),
            creado_en=ahora,
            expira_en=ahora + timedelta(days=settings.jwt_refresh_dias),
        )
    )
    session.commit()
    return TokenResponse(
        access_token=access,
        refresh_token=refresh_plain,
        usuario=_usuario_publico(usuario),
    )


def login(session: Session, *, usuario: str, password: str) -> TokenResponse:
    clave = normalizar_usuario(usuario)
    if not clave or not password:
        raise _credenciales_invalidas()

    row = session.exec(select(Usuario).where(Usuario.usuario == clave)).first()
    if row is None or not row.activo:
        raise _credenciales_invalidas()
    if not verify_password(row.password_hash, password):
        raise _credenciales_invalidas()

    return _emitir_tokens(session, row)


def _obtener_refresh_valido(
    session: Session,
    refresh_token: str,
) -> tuple[TokenRenovacion, Usuario]:
    token_hash = hash_refresh_token(refresh_token)
    registro = session.exec(
        select(TokenRenovacion).where(TokenRenovacion.token_hash == token_hash)
    ).first()
    if registro is None or registro.invalidado_en is not None:
        raise _token_invalido()

    ahora = utcnow()
    expira = registro.expira_en
    if expira.tzinfo is None:
        from datetime import UTC

        expira = expira.replace(tzinfo=UTC)
    if expira <= ahora:
        raise _token_invalido()

    usuario = session.get(Usuario, registro.usuario_id)
    if usuario is None or not usuario.activo:
        raise _token_invalido()

    return registro, usuario


def renovar(session: Session, *, refresh_token: str) -> TokenResponse:
    registro, usuario = _obtener_refresh_valido(session, refresh_token)
    registro.invalidado_en = utcnow()
    session.add(registro)
    session.flush()
    return _emitir_tokens(session, usuario)


def cerrar_sesion(session: Session, *, refresh_token: str) -> None:
    token_hash = hash_refresh_token(refresh_token)
    registro = session.exec(
        select(TokenRenovacion).where(TokenRenovacion.token_hash == token_hash)
    ).first()
    if registro is None:
        return
    if registro.invalidado_en is None:
        registro.invalidado_en = utcnow()
        session.add(registro)
        session.commit()


def crear_negocio_con_usuario(
    session: Session,
    *,
    nombre_negocio: str,
    documento: str,
    pie_recibo: str,
    usuario: str,
    nombre_usuario: str,
    password: str,
) -> tuple[Negocio, Usuario]:
    clave = normalizar_usuario(usuario)
    existente = session.exec(select(Usuario).where(Usuario.usuario == clave)).first()
    if existente is not None:
        raise AppError(
            codigo="usuario_duplicado",
            mensaje=f"Ya existe un usuario con el nombre «{clave}».",
            status_code=status.HTTP_409_CONFLICT,
        )

    ahora = utcnow()
    negocio = Negocio(
        nombre=nombre_negocio,
        documento=documento,
        pie_recibo=pie_recibo,
        ultimo_seq=0,
        creado_en=ahora,
        actualizado_en=ahora,
    )
    session.add(negocio)
    session.flush()

    user = Usuario(
        negocio_id=negocio.id,
        nombre=nombre_usuario,
        usuario=clave,
        password_hash=hash_password(password),
        activo=True,
        creado_en=ahora,
    )
    session.add(user)
    session.commit()
    session.refresh(negocio)
    session.refresh(user)
    return negocio, user


def obtener_usuario_activo(session: Session, usuario_id: UUID) -> Usuario | None:
    usuario = session.get(Usuario, usuario_id)
    if usuario is None or not usuario.activo:
        return None
    return usuario
