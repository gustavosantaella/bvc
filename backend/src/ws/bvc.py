import asyncio
import websockets
from os import getenv
import ssl
import json
import logging
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

import sys

# Handle imports for both direct execution and module import
try:
    from src.config.time import get_current_time, set_time_zone
    from src.database.mongo import db
except ImportError:
    # When running directly, add src to path first
    import sys
    from pathlib import Path

    src_dir = Path(__file__).parent.parent
    sys.path.insert(0, str(src_dir))
    from config.time import get_current_time, set_time_zone
    from database.mongo import db


set_time_zone()

# Logging configuration
logger = logging.getLogger(__name__)


class BVCWebSocketClient:
    """
    WebSocket client to connect to Bolsa de Valores de Caracas (BVC).
    Handles connection, automatic reconnection, and message processing.
    """

    def __init__(self, ws_url: Optional[str] = None):
        """
        Initialize the WebSocket client.

        Args:
            ws_url: WebSocket URL. If not provided, it will be obtained from environment variables.
        """
        self.ws_url = ws_url or getenv("WS_BVC")
        if not self.ws_url:
            raise ValueError("WS_BVC environment variable is not set")

        self.headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.5",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive, Upgrade",
            "Pragma": "no-cache",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "websocket",
            "Sec-Fetch-Site": "same-origin",
            "Sec-WebSocket-Extensions": "permessage-deflate",
            "Upgrade": "websocket",
        }

        self.is_running = False
        self.reconnect_delay = 5  # seconds
        self.max_reconnect_attempts = 10
        self.ping_timeout = 20  # seconds
        self.ping_interval = 25  # seconds

    def _create_ssl_context(self) -> ssl.SSLContext:
        """
        Create SSL context for the connection.
        Note: Disabling SSL verification is a security risk.
        Only use in development or if the server doesn't have a valid certificate.
        """
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        return ssl_context

    async def _handle_message(self, message: str) -> None:
        """
        Process messages received from WebSocket.

        Args:
            message: Message received from server
        """
        try:
            # Process different message types
            if message == "2":
                # Ping message, respond with pong
                logger.debug("Ping received, sending pong")
                print("Ping received, sending pong")
                return "3"  # Return response

            elif message and message.startswith("42"):
                # Message with data
                data_str = message[2:]
                data = json.loads(data_str)

                if isinstance(data, list) and len(data) > 0:
                    event_type = data[0]

                    if event_type == "serverData" and len(data) > 1:
                        logger.info(f"Server data received: {len(data[1])} symbols")
                        await self._process_server_data(data[1])

            else:
                logger.debug(f"Unrecognized message: {message}")

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}, message: {message}")
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)

    async def _process_server_data(self, data: List[Dict[str, Any]]) -> None:
        """
        Process and save server data.

        Args:
            data: List of symbol data received from BVC WebSocket
        """
        try:
            symbols_data = []
            for item in data:
                if "COD_SIMB" in item:
                    symbol_info = {
                        "symbol": item.get("COD_SIMB"),
                        "description": item.get("DESC_SIMB"),
                        "price": item.get("PRECIO"),
                        "absolute_variation": item.get("VAR_ABS"),
                        "relative_variation": item.get("VAR_REL"),
                        "volume": item.get("VOLUMEN"),
                        "effective_amount": item.get("MONTO_EFECTIVO"),
                        "market_time": item.get("HORA"),
                        "timestamp": get_current_time(),
                        "raw_data": item,
                    }
                    symbols_data.append(symbol_info)

            if symbols_data:
                await self._save_data(symbols_data)
                logger.info(f"Saved {len(symbols_data)} symbols to database")

        except Exception as e:
            logger.error(f"Error processing server data: {e}", exc_info=True)

    async def _save_data(self, symbols_data: List[Dict[str, Any]]) -> None:
        """
        Save data to MongoDB.

        For each symbol:
        - If it doesn't exist, create a new document with initial history
        - If it exists, add to 'history' array only if there's no duplicate timestamp/hour

        Args:
            symbols_data: List of symbol data to save
        """
        try:

            if db is None:
                logger.error("Database not initialized")
                return

            collection = db["market_data"]

            inserted_count = 0
            updated_count = 0
            skipped_count = 0

            for symbol_info in symbols_data:
                symbol_code = symbol_info["symbol"]

                # History data (without raw_data to save space)
                history_entry = {
                    "price": symbol_info["price"],
                    "absolute_variation": symbol_info["absolute_variation"],
                    "relative_variation": symbol_info["relative_variation"],
                    "volume": symbol_info["volume"],
                    "effective_amount": symbol_info["effective_amount"],
                    "market_time": symbol_info["market_time"],
                    "timestamp": symbol_info["timestamp"],
                }

                # Check if symbol already exists
                existing_doc = collection.find_one({"symbol": symbol_code})

                if existing_doc is None:
                    # Doesn't exist, create new document with initial history
                    new_document = {
                        "symbol": symbol_info["symbol"],
                        "description": symbol_info["description"],
                        "timestamp": symbol_info["timestamp"],
                        "raw_data": symbol_info["raw_data"],
                        "history": [history_entry],
                    }
                    collection.insert_one(new_document)
                    inserted_count += 1
                    logger.debug(f"New symbol inserted: {symbol_code}")
                else:
                    # Exists, check if there's already a record with same date and market_time
                    current_date = symbol_info[
                        "timestamp"
                    ].date()  # Only year, month, day
                    market_time = symbol_info["market_time"]

                    # Check if it exists in history
                    duplicate_exists = False
                    if "history" in existing_doc:
                        for entry in existing_doc["history"]:
                            entry_timestamp = entry.get("timestamp")

                            # Get date from entry timestamp
                            if isinstance(entry_timestamp, str):
                                # Parse ISO format string to datetime (format: 2025-10-15T14:30:00.000000)
                                try:

                                    entry_date = get_current_time().date()
                                except (ValueError, AttributeError):
                                    continue  # Skip if we can't parse
                            elif hasattr(entry_timestamp, "date"):
                                entry_date = entry_timestamp.date()
                            else:
                                continue  # Skip if we can't get date

                            # Compare only date (year, month, day) AND market_time
                            # Only skip if BOTH match (same date AND same time)
                            if (
                                entry_date == current_date
                                and entry.get("market_time") == market_time
                            ):
                                duplicate_exists = True
                                break

                    if not duplicate_exists:
                        # Update document: main data + add to history
                        collection.update_one(
                            {"symbol": symbol_code},
                            {
                                "$push": {"history": history_entry},
                            },
                        )
                        updated_count += 1
                        logger.debug(f"Symbol updated: {symbol_code}")
                    else:
                        skipped_count += 1
                        logger.debug(
                            f"Duplicate record skipped: {symbol_code} (date: {current_date}, time: {market_time})"
                        )

            logger.info(
                f"Processed {len(symbols_data)} symbols: "
                f"{inserted_count} new, {updated_count} updated, {skipped_count} skipped"
            )

        except Exception as e:
            logger.error(f"Error saving data: {e}", exc_info=True)

    async def _connect_and_listen(self) -> None:
        """
        Establish WebSocket connection and listen for messages.
        Handles send/receive message logic.
        """
        ssl_context = self._create_ssl_context()

        try:
            async with websockets.connect(
                self.ws_url,
                ssl=ssl_context,
                additional_headers=self.headers,
                ping_interval=self.ping_interval,
                ping_timeout=self.ping_timeout,
            ) as websocket:
                logger.info("[OK] Connected to BVC WebSocket server")

                # Send initial handshake message
                await websocket.send("40")
                print("Handshake message sent (40)")
                logger.debug("Handshake message sent (40)")

                # Main receive loop
                while self.is_running:
                    try:
                        message = await asyncio.wait_for(
                            websocket.recv(), timeout=self.ping_timeout
                        )

                        current_hour = get_current_time().hour

                        response = await self._handle_message(message)
                        if current_hour < 9 or current_hour == 13:
                            if self.is_running:
                                print(
                                    f"The time must be between 9am and 1pm. {get_current_time()}"
                                )
                                logger.info(
                                    f"The time must be between 9am and 1pm. {get_current_time()}"
                                )
                            # self.is_running = False
                            continue
                        else:
                            print("The time is between 9am and 1pm")
                            logger.info("The time is between 9am and 1pm")

                        if response:
                            await websocket.send(response)

                    except asyncio.TimeoutError:
                        logger.warning("Timeout receiving message")
                        # Try to send manual ping
                        await websocket.ping()

        except websockets.exceptions.WebSocketException as e:
            logger.error(f"WebSocket error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected connection error: {e}", exc_info=True)
            raise

    async def start(self) -> None:
        """
        Start WebSocket client with automatic reconnection.
        """
        self.is_running = True
        reconnect_attempts = 0

        logger.info(f"Starting BVC WebSocket client: {self.ws_url}")
        print("IS RUNNING", self.is_running)
        while self.is_running and reconnect_attempts < self.max_reconnect_attempts:
            try:
                await self._connect_and_listen()

            except (
                websockets.exceptions.ConnectionClosed,
                websockets.exceptions.WebSocketException,
                ConnectionError,
            ) as e:
                reconnect_attempts += 1
                if self.is_running:
                    logger.warning(
                        f"Connection lost ({reconnect_attempts}/{self.max_reconnect_attempts}): {e}"
                    )
                    logger.info(f"Reconnecting in {self.reconnect_delay} seconds...")
                    await asyncio.sleep(self.reconnect_delay)
                else:
                    break

            except Exception as e:
                logger.error(f"Critical error: {e}", exc_info=True)
                reconnect_attempts += 1
                if reconnect_attempts < self.max_reconnect_attempts:
                    await asyncio.sleep(self.reconnect_delay)
                else:
                    break

        if reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Maximum reconnection attempts reached")

        logger.info("BVC WebSocket client stopped")

    async def stop(self) -> None:
        """
        Stop WebSocket client cleanly.
        """
        logger.info("Stopping BVC WebSocket client...")
        self.is_running = False


# Maintain compatibility with original function
async def connect_to_ws_bvc() -> None:
    """
    Compatibility function to connect to BVC WebSocket.
    Recommended to use BVCWebSocketClient directly for more control.
    """
    client = BVCWebSocketClient()
    print("Starting BVC WebSocket client...")
    await client.start()


if __name__ == "__main__":
    try:
        from database.mongo import start_db

        db = start_db()
        logger.info("[OK] Database connected successfully")
    except Exception as e:
        logger.error(f"[ERROR] Error connecting to database: {e}", exc_info=True)
        sys.exit(1)

    # Start the WebSocket client
    logger.info("Starting BVC WebSocket client...")
    try:
        asyncio.run(connect_to_ws_bvc())
    except Exception as e:
        logger.error(f"[ERROR] Error starting BVC WebSocket client: {e}", exc_info=True)
        sys.exit(1)
    except KeyboardInterrupt:
        print("KeyboardInterrupt")
        logger.info("Stopping BVC WebSocket client...")
        sys.exit(0)
