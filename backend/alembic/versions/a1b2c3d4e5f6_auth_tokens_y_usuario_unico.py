"""auth tokens y usuario unico

Revision ID: a1b2c3d4e5f6
Revises: 2eef43c27d34
Create Date: 2026-10-23 09:40:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "2eef43c27d34"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint("uq_usuarios_usuario", "usuarios", ["usuario"])
    op.create_table(
        "tokens_renovacion",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.Text(), nullable=False),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expira_en", sa.DateTime(timezone=True), nullable=False),
        sa.Column("invalidado_en", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        "ix_tokens_renovacion_usuario_id",
        "tokens_renovacion",
        ["usuario_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_tokens_renovacion_usuario_id", table_name="tokens_renovacion")
    op.drop_table("tokens_renovacion")
    op.drop_constraint("uq_usuarios_usuario", "usuarios", type_="unique")
