"""
Script de inicio rápido para demostrar el uso del cliente WebSocket de BVC
y las utilidades de consulta de datos.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Agregar el directorio padre al path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from src.database.mongo import start_db, db
from src.ws.bvc import BVCWebSocketClient
from src.ws.market_data_utils import (
    MarketDataQuery,
    format_currency,
    format_percentage,
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def demo_websocket_connection():
    """
    Demuestra cómo conectarse al WebSocket de BVC.
    Conecta por 30 segundos y luego se desconecta.
    """
    logger.info("=" * 60)
    logger.info("DEMO: Conexión WebSocket")
    logger.info("=" * 60)

    # Crear cliente
    client = BVCWebSocketClient()

    # Configurar para demo (menos intentos de reconexión)
    client.max_reconnect_attempts = 3

    # Iniciar cliente en tarea separada
    task = asyncio.create_task(client.start())

    # Esperar 30 segundos
    logger.info("Conectando al WebSocket de BVC por 30 segundos...")
    await asyncio.sleep(30)

    # Detener cliente
    logger.info("Deteniendo cliente...")
    await client.stop()

    # Esperar a que la tarea termine
    try:
        await task
    except asyncio.CancelledError:
        pass

    logger.info("✓ Demo completada\n")


def demo_market_summary():
    """
    Demuestra cómo obtener un resumen del mercado.
    """
    logger.info("=" * 60)
    logger.info("DEMO: Resumen del Mercado")
    logger.info("=" * 60)

    collection = db["market_data"]
    query = MarketDataQuery(collection)

    summary = query.get_market_summary()

    if not summary:
        logger.warning("No hay datos disponibles en la base de datos")
        return

    print(f"\n📊 Resumen del Mercado BVC")
    print(f"{'─' * 60}")
    print(f"Total de símbolos:        {summary['total_symbols']}")
    print(f"Símbolos en alza:         {summary['gainers']} 📈")
    print(f"Símbolos en baja:         {summary['losers']} 📉")
    print(f"Símbolos sin cambio:      {summary['unchanged']} ─")
    print(f"Volumen total:            {format_currency(summary['total_volume'])}")
    print(
        f"Monto efectivo total:     Bs. {format_currency(summary['total_value'])}"
    )
    print(f"Variación promedio:       {format_percentage(summary['avg_variation'])}")
    print(f"{'─' * 60}\n")


def demo_top_lists():
    """
    Demuestra cómo obtener listas de top gainers, losers y más negociados.
    """
    logger.info("=" * 60)
    logger.info("DEMO: Top Listas del Mercado")
    logger.info("=" * 60)

    collection = db["market_data"]
    query = MarketDataQuery(collection)

    # Top Gainers
    print(f"\n📈 Top 5 Ganadores del Día")
    print(f"{'─' * 60}")
    gainers = query.get_top_gainers(5)
    if gainers:
        for i, symbol in enumerate(gainers, 1):
            print(
                f"{i}. {symbol['codigo_simbolo']:8} | "
                f"{symbol['descripcion']:25} | "
                f"{format_percentage(symbol['variacion_relativa']):>10}"
            )
    else:
        print("No hay datos disponibles")

    # Top Losers
    print(f"\n📉 Top 5 Perdedores del Día")
    print(f"{'─' * 60}")
    losers = query.get_top_losers(5)
    if losers:
        for i, symbol in enumerate(losers, 1):
            print(
                f"{i}. {symbol['codigo_simbolo']:8} | "
                f"{symbol['descripcion']:25} | "
                f"{format_percentage(symbol['variacion_relativa']):>10}"
            )
    else:
        print("No hay datos disponibles")

    # Más negociados
    print(f"\n💹 Top 5 Más Negociados")
    print(f"{'─' * 60}")
    most_traded = query.get_most_traded(5)
    if most_traded:
        for i, symbol in enumerate(most_traded, 1):
            print(
                f"{i}. {symbol['codigo_simbolo']:8} | "
                f"{symbol['descripcion']:25} | "
                f"{format_currency(symbol['volumen']):>15} acciones"
            )
    else:
        print("No hay datos disponibles")

    # Mayor valor
    print(f"\n💰 Top 5 Mayor Monto Efectivo")
    print(f"{'─' * 60}")
    highest_value = query.get_highest_value(5)
    if highest_value:
        for i, symbol in enumerate(highest_value, 1):
            print(
                f"{i}. {symbol['codigo_simbolo']:8} | "
                f"{symbol['descripcion']:25} | "
                f"Bs. {format_currency(symbol['monto_efectivo']):>15}"
            )
    else:
        print("No hay datos disponibles")

    print()


def demo_symbol_search():
    """
    Demuestra cómo buscar símbolos específicos.
    """
    logger.info("=" * 60)
    logger.info("DEMO: Búsqueda de Símbolos")
    logger.info("=" * 60)

    collection = db["market_data"]
    query = MarketDataQuery(collection)

    # Buscar bancos
    print(f"\n🔍 Buscando: 'BANCO'")
    print(f"{'─' * 60}")
    results = query.search_symbol("BANCO")
    if results:
        for symbol in results:
            print(
                f"{symbol['codigo_simbolo']:8} | "
                f"{symbol['descripcion']:30} | "
                f"Bs. {symbol['precio']:>8.2f} | "
                f"{format_percentage(symbol['variacion_relativa']):>10}"
            )
    else:
        print("No se encontraron resultados")

    # Buscar símbolo específico
    print(f"\n🔍 Datos detallados de: 'BNC'")
    print(f"{'─' * 60}")
    bnc = query.get_latest_by_symbol("BNC", limit=1)
    if bnc:
        symbol = bnc[0]
        print(f"Código:           {symbol['codigo_simbolo']}")
        print(f"Descripción:      {symbol['descripcion']}")
        print(f"Precio:           Bs. {format_currency(symbol['precio'])}")
        print(
            f"Variación:        {format_percentage(symbol['variacion_relativa'])} "
            f"({format_currency(symbol['variacion_absoluta'])})"
        )
        print(f"Volumen:          {format_currency(symbol['volumen'])} acciones")
        print(
            f"Monto Efectivo:   Bs. {format_currency(symbol['monto_efectivo'])}"
        )
        print(f"Hora:             {symbol['hora_mercado']}")
    else:
        print("No se encontraron datos para BNC")

    print()


async def main():
    """Función principal que ejecuta todos los demos."""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 58 + "║")
    print("║" + "   🚀 BVC WebSocket Client - Quick Start Demo   ".center(58) + "║")
    print("║" + " " * 58 + "║")
    print("╚" + "═" * 58 + "╝")
    print()

    # Cargar variables de entorno
    load_dotenv()

    # Conectar a base de datos
    logger.info("Conectando a MongoDB...")
    try:
        start_db()
        logger.info("✓ Conectado a MongoDB\n")
    except Exception as e:
        logger.error(f"✗ Error al conectar a MongoDB: {e}")
        logger.info(
            "Asegúrate de que MongoDB esté corriendo y las variables de entorno estén configuradas"
        )
        return

    # Menú de demos
    print("\nSelecciona una demo:")
    print("1. Conectar al WebSocket por 30 segundos")
    print("2. Ver resumen del mercado")
    print("3. Ver top listas (ganadores, perdedores, etc.)")
    print("4. Buscar símbolos")
    print("5. Ejecutar todas las demos de consulta (2-4)")
    print("0. Salir")

    try:
        choice = input("\nOpción: ").strip()

        if choice == "1":
            await demo_websocket_connection()
        elif choice == "2":
            demo_market_summary()
        elif choice == "3":
            demo_top_lists()
        elif choice == "4":
            demo_symbol_search()
        elif choice == "5":
            demo_market_summary()
            demo_top_lists()
            demo_symbol_search()
        elif choice == "0":
            logger.info("Saliendo...")
        else:
            logger.warning("Opción no válida")

    except KeyboardInterrupt:
        logger.info("\n⚠ Demo interrumpida por el usuario")

    logger.info("\n✓ Quick Start completado\n")


if __name__ == "__main__":
    asyncio.run(main())

