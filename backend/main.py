import uvicorn
from dotenv import load_dotenv
from src.database.mongo import start_db, db
from src.ws.bvc import BVCWebSocketClient
import asyncio
import logging
import signal
import sys
import io
from src.config.time import set_time_zone

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

# Global variable for WebSocket client
ws_client: BVCWebSocketClient = None


async def shutdown(signal_name: str = None):
    """Handle clean application shutdown."""
    if signal_name:
        logger.info(f"Signal {signal_name} received. Starting clean shutdown...")

    # Stop WebSocket client
    if ws_client:
        await ws_client.stop()

    # Cancel all pending tasks
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    for task in tasks:
        task.cancel()

    logger.info("Shutdown completed")


def handle_exception(loop, context):
    """Handle uncaught exceptions in event loop."""
    msg = context.get("exception", context["message"])
    logger.error(f"Uncaught exception: {msg}")


async def main():
    """Main function that initializes and runs the application."""
    global ws_client

    logger.info("=" * 50)
    logger.info("Starting BVC application")
    logger.info("=" * 50)

    # Configure signal handlers for clean shutdown
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(handle_exception)

    # Connect to database
    try:
        start_db()
        logger.info("[OK] Database connected successfully")

    except Exception as e:
        logger.error(f"[ERROR] Error connecting to database: {e}", exc_info=True)
        raise Exception("Error to connect to the database.") from e

    # Initialize WebSocket client
    try:
        ws_client = BVCWebSocketClient()
        websocket_task = asyncio.create_task(ws_client.start())
        logger.info("[OK] WebSocket client initialized")
    except Exception as e:
        logger.error(f"[ERROR] Error initializing WebSocket: {e}", exc_info=True)
        raise

    # Configure HTTP server (optional, currently commented)
    config = uvicorn.Config(
        "src.app_module:http_server",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )

    server = uvicorn.Server(config)
    server_task = asyncio.create_task(server.serve())

    try:
        # Run tasks concurrently
        await asyncio.gather(
            server_task,
            websocket_task,
            # server_task,  # Uncomment if using HTTP server
            return_exceptions=False,
        )
    except Exception as e:
        logger.error(f"Error in main execution: {e}", exc_info=True)
        raise


# Export app for Vercel
from src.app_module import http_server as app


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("[WARNING] Program stopped by user (Ctrl+C)")
        exit(0)
    except Exception as e:
        logger.error(f"[ERROR] Fatal error: {e}", exc_info=True)
        sys.exit(1)
else:
    print("Running on Vercel")
    asyncio.run(main())
