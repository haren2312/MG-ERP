"""
Configuration for the Light Module
Uses SQLite database (cross-platform)
"""
import os
import sys
from pathlib import Path

# Base directory - handle both development and PyInstaller scenarios
if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle - use executable directory
    BASE_DIR = Path(sys.executable).parent
else:
    # Running in development - use script directory
    BASE_DIR = Path(__file__).parent

# Database configuration - SQLite
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/light_erp.db")

# API configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8005"))

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8005",
]

# Tax rate (can be configured)
TAX_RATE = float(os.getenv("TAX_RATE", "0.0"))  # 0% default, set to 0.15 for 15% etc

# App settings
APP_NAME = "Light ERP Module"
APP_VERSION = "1.0.0"

# WhatsApp Cloud API settings
WHATSAPP_API_VERSION = os.getenv("WHATSAPP_API_VERSION", "v25.0")
WHATSAPP_ACCOUNT_ID = os.getenv("WHATSAPP_ACCOUNT_ID", "986488187892071")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "EAARZChIp22D0BRO5dFZAxOkUvFApKpG891jfyZBezZA9Oi1Idqb85hyTWvLosfE8sKFsZASqF8bxrlhZA6iHoEmqWeWzfmJ0VND3zFrkDnZA8QkOBhmaJuZBPg9CdPTAZAZA0fxTvnmSlbI6ju7nfHqpXVEKoSmDpCc2N7sv0CbUquMMaq39Q7qfSouDZBrsjOVhcLxihVfCYSZAEWKh1PqPAhD10yUkbeTecAHLeZCWv3PXd")
WHATSAPP_GRAPH_BASE_URL = os.getenv("WHATSAPP_GRAPH_BASE_URL", "https://graph.facebook.com")
WHATSAPP_REQUEST_TIMEOUT_SECONDS = float(os.getenv("WHATSAPP_REQUEST_TIMEOUT_SECONDS", "20"))
