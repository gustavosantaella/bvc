import asyncio
import websockets
from os import getenv
import ssl

async def connect_to_ws_bvc():
    WS_URL = getenv("WS_BVC")
    if WS_URL is None:
        raise Exception("PLEASE CHECK THE WS URL ENVIRONMENT")
    
    # Headers personalizados
    headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive, Upgrade",
        # "Host": "market.bolsadecaracas.com",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "empty",
        # "origin": "localhost",
        "Sec-Fetch-Mode": "websocket",
        # "Sec-WebSocket-Key":"xWnazzXNgmNerkrZocfzsA==",
        "Sec-Fetch-Site": "same-origin",
        "Sec-WebSocket-Extensions": "permessage-deflate",
        # "Sec-WebSocket-Version": "13",
        "Upgrade": "websocket",
    }
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    async with websockets.connect(
        WS_URL, 
        ssl=ssl_context,
        additional_headers=headers
    ) as websocket:
        print("Conectado al WebSocket de BVC")
        
        # Escuchar mensajes continuamente
        while True:
            message = await websocket.recv()
            print(f"Received: {message}")