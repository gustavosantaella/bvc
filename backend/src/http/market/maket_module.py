from nest.core import Module
from .market_controller import MarketController
from .market_service import MarketService


@Module(imports=[], controllers=[MarketController], providers=[MarketService])
class MarketModule:
    pass
