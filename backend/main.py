import uvicorn
from dotenv import load_dotenv
from src.database.mongo import start_db
import asyncio
import src.ws.bvc as ws_bvc

load_dotenv() 

async def main():
    start_db()
    websocket_task = asyncio.create_task(ws_bvc.connect_to_ws_bvc())
    
    config = uvicorn.Config(
        'src.app_module:http_server',
        host="0.0.0.0",
        port=8000,
        reload=False
    )
    server = uvicorn.Server(config)
    
    
    try:
        await asyncio.gather(
            server.serve(),
            websocket_task,
            return_exceptions=False  
        )
    except Exception as e:
        print(f"Error: {e}")
    
if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("The program was stopped by the user.")