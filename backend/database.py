from typing import Annotated

from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session

from .config import settings

DATABASE_URL = settings.sqlalchemy_url

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True, pool_recycle=300)


def get_session():
    with Session(engine) as session:
        yield session


SESSION_LOCAL = Annotated[Session, Depends(get_session)]
