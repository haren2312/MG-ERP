"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, Session
from config import DATABASE_URL
from models import Base
import logging

logger = logging.getLogger(__name__)

# Create engine with SQLite-specific settings
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

    # Enforce one refund row per POS transaction at DB level.
    # This protects against duplicate refunds caused by concurrent requests.
    with engine.begin() as conn:
        try:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_refunds_transaction_id ON refunds (transaction_id)"))
        except Exception as e:
            logger.warning("Could not ensure unique refunds index: %s", e)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
