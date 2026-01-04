"""
Main FastAPI application for Light Module
Serves both API and static frontend files
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
import sys
import logging
from pathlib import Path
from datetime import datetime

from config import API_HOST, API_PORT, CORS_ORIGINS, APP_NAME, APP_VERSION
from database import init_db
from routes import router

# Setup logging
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle
    LOG_DIR = Path(sys.executable).parent
else:
    # Running in development
    LOG_DIR = Path(__file__).parent

LOG_FILE = LOG_DIR / f"light_erp_{datetime.now().strftime('%Y%m%d')}.log"

# Configure file handler
file_handler = logging.FileHandler(LOG_FILE, mode='a', encoding='utf-8')
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

# Configure console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[file_handler, console_handler]
)

# Get logger for this module
logger = logging.getLogger(__name__)

# Configure uvicorn loggers to use the same handlers
uvicorn_access = logging.getLogger("uvicorn.access")
uvicorn_access.handlers = [file_handler, console_handler]
uvicorn_error = logging.getLogger("uvicorn.error")
uvicorn_error.handlers = [file_handler, console_handler]
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.handlers = [file_handler, console_handler]

logger.info(f"Logging initialized. Log file: {LOG_FILE}")

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Lightweight ERP module with POS, Inventory, and Ledger functionality using SQLite"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Determine the static files directory
# Handle both development and PyInstaller bundled scenarios
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle
    BASE_DIR = Path(sys.executable).parent
    STATIC_DIR = BASE_DIR / "frontend" / "dist"
else:
    # Running in development
    BASE_DIR = Path(__file__).parent.parent
    STATIC_DIR = BASE_DIR / "frontend" / "dist"

# Serve static files if dist folder exists
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    @app.get("/")
    def serve_frontend():
        """Serve the frontend index.html"""
        return FileResponse(STATIC_DIR / "index.html")
    
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Serve SPA routes and static files"""
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # For SPA routing, return index.html
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def root():
        """Root endpoint when frontend not built"""
        return {
            "message": "Light ERP Module API",
            "version": APP_VERSION,
            "docs": "/docs",
            "note": "Frontend not built. Run 'cd ../frontend && npm run build'"
        }


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database tables created successfully!")
    
    # Check if default users exist, create them if not
    from database import SessionLocal
    from models import User, UserRole, SalesUser
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = SessionLocal()
    
    try:
        # Check if any users exist
        user_count = db.query(User).count()
        
        if user_count == 0:
            logger.info("No users found. Creating default users...")
            
            # Create default authentication users
            default_users = [
                User(
                    username="admin",
                    hashed_password=pwd_context.hash("admin123"),
                    role=UserRole.SUPER_ADMIN,
                    is_active=True
                ),
                User(
                    username="manager",
                    hashed_password=pwd_context.hash("manager123"),
                    role=UserRole.MANAGER,
                    is_active=True
                ),
                User(
                    username="cashier",
                    hashed_password=pwd_context.hash("cashier123"),
                    role=UserRole.CASHIER,
                    is_active=True
                )
            ]
            
            for user in default_users:
                db.add(user)
            
            db.commit()
            logger.info("Default users created: admin, manager, cashier")
            
            # Check if sales users exist
            sales_user_count = db.query(SalesUser).count()
            if sales_user_count == 0:
                logger.info("Creating default sales user...")
                
                default_sales_user = SalesUser(
                    name="Default",
                    employee_code="DEFAULT",
                    position="Sales Staff",
                    contact_info="",
                    is_active=True
                )
                
                db.add(default_sales_user)
                db.commit()
                logger.info("Default sales user created successfully!")
        else:
            logger.info(f"Found {user_count} existing users in database")
            
    except Exception as e:
        logger.error(f"Error during user initialization: {e}")
        db.rollback()
    finally:
        db.close()
    
    logger.info("Database initialized successfully!")
    if STATIC_DIR.exists():
        logger.info(f"Serving frontend from {STATIC_DIR}")
    else:
        logger.warning(f"Frontend directory not found: {STATIC_DIR}")


if __name__ == "__main__":
    logger.info(f"Starting {APP_NAME} v{APP_VERSION}")
    logger.info(f"Access the application at http://{API_HOST}:{API_PORT}")
    logger.info(f"API Documentation available at http://{API_HOST}:{API_PORT}/docs")
    uvicorn.run(app, host=API_HOST, port=API_PORT)
