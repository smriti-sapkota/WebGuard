"""bridge missing revision

Revision ID: 755b99d1d828
Revises: 0b4e65bf2208
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '755b99d1d828'
down_revision: Union[str, Sequence[str], None] = '0b4e65bf2208'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
