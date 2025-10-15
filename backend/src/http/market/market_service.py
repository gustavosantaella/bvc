from nest.core import Injectable
from src.database.mongo import db


@Injectable
class MarketService:
    def get_all_symbols(self):
        collection = db["market_data"]
        symbols = list(collection.find({}, {"_id": 0}))
        return {"data": symbols, "count": len(symbols)}
