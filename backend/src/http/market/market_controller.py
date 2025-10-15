from nest.core import Controller, Get
from .market_service import MarketService


@Controller("/market")
class MarketController:
    def __init__(self, service: MarketService):
        self.service = service

    @Get("/")
    def get_market_data(self):
        return self.service.get_all_symbols()
