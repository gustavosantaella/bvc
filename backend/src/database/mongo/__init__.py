from pymongo import MongoClient
import os


db = None
client: MongoClient = None


def start_db() -> None:
    global db, client
    # Replace with your MongoDB connection string
    connection_string = (
        os.getenv("MONGO_URL") or "mongodb://localhost:27017/bvc"
    )  # Or your Atlas connection string
    client = MongoClient(connection_string)
    db = client[os.getenv("MONGO_DATABASE") or "bvc"]
    print("MONGO DB IS CONNECTED")
