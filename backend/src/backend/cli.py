"""Comandos de consola para administración (sin registro público).

Uso (desde backend/):
    uv run python -m backend.cli crear-negocio \\
      --nombre "Arepas La Esquina" \\
      --documento "1.098.765.432" \\
      --pie-recibo "¡Gracias por su compra!" \\
      --usuario carlos \\
      --nombre-usuario Carlos \\
      --password arepa12
"""

from __future__ import annotations

import argparse
import sys

from sqlmodel import Session

from backend.core.db import engine
from backend.core.errors import AppError
from backend.services.auth import crear_negocio_con_usuario


def _cmd_crear_negocio(args: argparse.Namespace) -> int:
    with Session(engine) as session:
        try:
            negocio, usuario = crear_negocio_con_usuario(
                session,
                nombre_negocio=args.nombre,
                documento=args.documento,
                pie_recibo=args.pie_recibo,
                usuario=args.usuario,
                nombre_usuario=args.nombre_usuario,
                password=args.password,
            )
        except AppError as exc:
            print(f"Error ({exc.codigo}): {exc.mensaje}", file=sys.stderr)
            return 1

    print(
        f"Negocio creado: {negocio.nombre} ({negocio.id})\n"
        f"Usuario: {usuario.usuario} ({usuario.id})"
    )
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="backend.cli", description="CLI Cuentas Claras"
    )
    sub = parser.add_subparsers(dest="comando", required=True)

    crear = sub.add_parser(
        "crear-negocio",
        help="Crea un negocio y su primer usuario",
    )
    crear.add_argument("--nombre", required=True, help="Nombre del negocio")
    crear.add_argument("--documento", required=True, help="NIT o documento")
    crear.add_argument("--pie-recibo", required=True, help="Pie de recibo")
    crear.add_argument("--usuario", required=True, help="Login del usuario")
    crear.add_argument(
        "--nombre-usuario",
        required=True,
        help="Nombre para mostrar del usuario",
    )
    crear.add_argument("--password", required=True, help="Contraseña en claro")
    crear.set_defaults(func=_cmd_crear_negocio)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
