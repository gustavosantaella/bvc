import uvicorn
from dotenv import load_dotenv
from src.database.mongo import start_db
load_dotenv() 
if __name__ == '__main__':
    
    start_db()
    uvicorn.run(
        'src.app_module:http_server',
        host="0.0.0.0",
        port=8000,
        reload=True
    )
    
