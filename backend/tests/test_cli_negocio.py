import pytest
from sqlmodel import Session, select

from backend.core.errors import AppError
from backend.models import Negocio, Usuario
from backend.services.auth import crear_negocio_con_usuario


def test_crear_negocio_con_usuario(session: Session) -> None:
    negocio, usuario = crear_negocio_con_usuario(
        session,
        nombre_negocio="Arepas Centro",
        documento="900.111.222",
        pie_recibo="¡Gracias!",
        usuario="  Admin  ",
        nombre_usuario="Admin",
        password="secreto99",
    )

    assert negocio.nombre == "Arepas Centro"
    assert usuario.usuario == "admin"
    assert usuario.negocio_id == negocio.id

    guardado = session.exec(select(Usuario).where(Usuario.usuario == "admin")).one()
    assert guardado.nombre == "Admin"
    assert session.get(Negocio, negocio.id) is not None


def test_crear_negocio_usuario_duplicado(session: Session) -> None:
    crear_negocio_con_usuario(
        session,
        nombre_negocio="Uno",
        documento="1",
        pie_recibo="x",
        usuario="carlos",
        nombre_usuario="Carlos",
        password="arepa12",
    )

    with pytest.raises(AppError) as exc_info:
        crear_negocio_con_usuario(
            session,
            nombre_negocio="Dos",
            documento="2",
            pie_recibo="y",
            usuario="carlos",
            nombre_usuario="Otro",
            password="arepa12",
        )

    assert exc_info.value.codigo == "usuario_duplicado"
