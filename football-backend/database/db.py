from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# This connects to PostgreSQL running in Docker
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/football"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
