import uvicorn
from dotenv import load_dotenv
from src.database.mongo import start_db
import asyncio
import src.ws.bvc as ws_bvc
load_dotenv() 

async def main():
    # start_db()
    task  =asyncio.create_task(ws_bvc.connect_to_ws_bvc())
    try:
        asyncio.run(await asyncio.Future())  # Se ejecuta indefinidamente
    except KeyboardInterrupt:
        print("Apagando...")
        task.cancel()
    print("Running")
    # uvicorn.run(
    #     'src.app_module:http_server',
    #     host="0.0.0.0",
    #     port=8000,
    #     reload=True
    # )
    
if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("The program was stoped by the user.")

    
    
