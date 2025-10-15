import asyncio
import websockets
from os import getenv
import ssl

async def connect_to_ws_bvc():
    WS_URL = getenv("WS_BVC")
    if WS_URL is None:
        raise Exception("PLEASE CHECK THE WS URL ENVIRONMENT")
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    async with websockets.connect(WS_URL, ssl=ssl_context) as websocket:
        message = await websocket.recv()
        print(f"Received: {message}")
