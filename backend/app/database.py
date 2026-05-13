from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verify connections are alive
)

# Register pgvector type adapter for each new connection
from pgvector.psycopg2 import register_vector

@event.listens_for(engine, "connect")
def register_pgvector(dbapi_connection, connection_record):
    register_vector(dbapi_connection)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting DB session in routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
