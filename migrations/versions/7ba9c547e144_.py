"""empty message

Revision ID: 7ba9c547e144
Revises: 
Create Date: 2025-04-21 19:03:40.543984

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7ba9c547e144'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('trades',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sender_id', sa.String(length=20), nullable=False),
    sa.Column('receiver_id', sa.String(length=20), nullable=False),
    sa.Column('amount', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
    sa.ForeignKeyConstraint(['receiver_id'], ['employers.employer_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['sender_id'], ['employers.employer_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('trades')
    # ### end Alembic commands ###
