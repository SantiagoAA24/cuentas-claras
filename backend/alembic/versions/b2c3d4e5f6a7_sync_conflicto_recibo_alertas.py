"""sync conflicto recibo y alertas

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-10-23 10:05:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ventas",
        sa.Column(
            "conflicto_recibo",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),
    )
    op.drop_constraint(
        "uq_ventas_negocio_prefijo_consecutivo",
        "ventas",
        type_="unique",
    )
    op.create_index(
        "uq_ventas_negocio_prefijo_consecutivo_sin_conflicto",
        "ventas",
        ["negocio_id", "prefijo", "consecutivo"],
        unique=True,
        postgresql_where=sa.text("conflicto_recibo = false"),
    )
    op.create_table(
        "alertas_sync",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("negocio_id", sa.Uuid(), nullable=False),
        sa.Column("tipo", sa.Text(), nullable=False),
        sa.Column("venta_existente_id", sa.Uuid(), nullable=False),
        sa.Column("venta_nueva_id", sa.Uuid(), nullable=False),
        sa.Column("dispositivo_id", sa.Uuid(), nullable=False),
        sa.Column("prefijo", sa.Text(), nullable=False),
        sa.Column("consecutivo", sa.Integer(), nullable=False),
        sa.Column("detalle", sa.Text(), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["dispositivo_id"], ["dispositivos.id"]),
        sa.ForeignKeyConstraint(["negocio_id"], ["negocios.id"]),
        sa.ForeignKeyConstraint(["venta_existente_id"], ["ventas.id"]),
        sa.ForeignKeyConstraint(["venta_nueva_id"], ["ventas.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_alertas_sync_negocio_creado",
        "alertas_sync",
        ["negocio_id", "creado_en"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_alertas_sync_negocio_creado", table_name="alertas_sync")
    op.drop_table("alertas_sync")
    op.drop_index(
        "uq_ventas_negocio_prefijo_consecutivo_sin_conflicto",
        table_name="ventas",
    )
    op.create_unique_constraint(
        "uq_ventas_negocio_prefijo_consecutivo",
        "ventas",
        ["negocio_id", "prefijo", "consecutivo"],
    )
    op.drop_column("ventas", "conflicto_recibo")
