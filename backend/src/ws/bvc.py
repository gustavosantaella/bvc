import asyncio
import websockets
from os import getenv
import ssl
import json

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
        print("Connected to the WS server of BVC")
        await websocket.send(message="40")
        print("Sended 40")
        
        while True:
            message = await websocket.recv()
            if message == "2":
                print("Sending '3' message.")
                await websocket.send(message="3")
            else:
                if message and message[:2] == '42':
                    data = message[2::]
                    data = json.loads(data)
                    if data[0] == 'serverData': 
                        print(data[1])
                        symbols = list(map(lambda e: e['simbolo'], data[1]))
                        print(symbols)
                        print(len(symbols))
                        
                        
def save_message():
    pass