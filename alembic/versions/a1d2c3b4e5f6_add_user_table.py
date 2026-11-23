"""add user table and scan.user_id

Revision ID: a1d2c3b4e5f6
Revises: 8c6c5e3f7e01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1d2c3b4e5f6"
down_revision: Union[str, Sequence[str], None] = "8c6c5e3f7e01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("password_hash", sa.String(), nullable=True),
        sa.Column("google_sub", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=True)
    op.create_index("ix_user_google_sub", "user", ["google_sub"], unique=True)
    op.add_column("scan", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index("ix_scan_user_id", "scan", ["user_id"])
    op.create_foreign_key("fk_scan_user_id", "scan", "user", ["user_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_scan_user_id", "scan", type_="foreignkey")
    op.drop_index("ix_scan_user_id", table_name="scan")
    op.drop_column("scan", "user_id")
    op.drop_index("ix_user_google_sub", table_name="user")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")
