import sys
import os
import tempfile
from pathlib import Path
import pytest

# Add the backend directory to sys.path
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Create a temporary SQLite file for tests (persists during test session)
test_db_dir = tempfile.mkdtemp(prefix="light_test_db_")
test_db_file = os.path.join(test_db_dir, "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_file}"

# Now import after environment is set
from fastapi.testclient import TestClient
from database import init_db
from main import app


@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Initialize database schema once at the start of the test session."""
    init_db()
    yield
    # Note: Cleanup is skipped on Windows due to file locking issues


@pytest.fixture
def client():
    """Provides a TestClient for the FastAPI app."""
    return TestClient(app)
