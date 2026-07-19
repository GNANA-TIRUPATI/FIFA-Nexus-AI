import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Determine database engine connection URL with fallback
db_url = settings.DATABASE_URL
connect_args = {}

# Rewrite dialect to use pg8000 for pure-Python execution if using postgresql
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)

# Test PostgreSQL connection. If connection fails, default to a local SQLite fallback database
if "postgresql+pg8000" in db_url:
    try:
        # Check connection quickly
        test_engine = create_engine(db_url, connect_args={"timeout": 2})
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("Connected to PostgreSQL successfully.")
    except Exception as e:
        print(f"PostgreSQL connection failed: {e}. Falling back to local SQLite database for development.")
        db_url = "sqlite:///./fifa_nexus.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(db_url, connect_args=connect_args)
else:
    if "sqlite" in db_url:
        connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)

# Create SessionLocal session builder
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for SQLAlchemy models
Base = declarative_base()

def get_db():
    """Dependency generator for database sessions.
    Ensures sessions are closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
