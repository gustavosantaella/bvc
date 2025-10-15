from nest.core import PyNestFactory, Module

from .app_controller import AppController
from .app_service import AppService
from src.http.market.maket_module import MarketModule


@Module(imports=[MarketModule], controllers=[AppController], providers=[AppService])
class AppModule:
    pass


app = PyNestFactory.create(
    AppModule,
    description="This is my PyNest app.",
    title="PyNest Application",
    version="1.0.0",
    debug=True,
    prefix="/api",
)

# Configure CORS

http_server = app.get_server()

http_server.add_middleware(
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
