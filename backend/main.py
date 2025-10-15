import uvicorn
from dotenv import load_dotenv
from src.database.mongo import start_db, db
import logging
import sys
import io
from src.config.time import set_time_zone
from src.ws.bvc import connect_to_ws_bvc
import asyncio

# Load environment variables
load_dotenv()

set_time_zone()


# Configure UTF-8 encoding for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

# Configure logging
handlers = [logging.StreamHandler(sys.stdout)]

# Only use file handler in local environment (Vercel has read-only filesystem)
import os

if os.getenv("VERCEL") != "1":
    handlers.append(logging.FileHandler("app.log", encoding="utf-8"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=handlers,
)
logger = logging.getLogger(__name__)


# Initialize database for Vercel serverless environment
# This ensures DB is connected when the module is imported
if db is None:  # Only initialize if not already connected
    try:
        start_db()
        logger.info("[OK] Database connected for Vercel")
    except Exception as e:
        logger.error(
            f"[ERROR] Error connecting to database for Vercel: {e}", exc_info=True
        )

# Export app for Vercel
from src.app_module import http_server as app


if __name__ == "__main__":
    # Connect to database
    try:
        if db is None:
            start_db()
        logger.info("[OK] Database connected successfully")
    except Exception as e:
        logger.error(f"[ERROR] Error connecting to database: {e}", exc_info=True)
        sys.exit(1)

    # Start HTTP server with uvicorn
    logger.info("=" * 50)
    logger.info("Starting BVC HTTP Server")
    logger.info("=" * 50)

    uvicorn.run(
        "src.app_module:http_server",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
