import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<Language>('es');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Translations = {
    // Header
    'header.title': {
      es: 'Informacion de la Bolsa de Valores de Caracas',
      en: 'Caracas Stock Exchange Information',
    },
    'header.subtitle': {
      es: 'Sistema de Información de Mercado',
      en: 'Market Information System',
    },
    'header.charts': {
      es: 'Gráficos',
      en: 'Charts',
    },
    'header.data': {
      es: 'Datos',
      en: 'Data',
    },
    'header.history': {
      es: 'Histórico BCV',
      en: 'BCV History',
    },
    'header.status': {
      es: 'Estado: En línea',
      en: 'Status: Online',
    },

    // Info Banners
    'banner.freeSystem': {
      es: 'Plataforma de acceso gratuito destinada únicamente a la visualización y análisis de datos. La información es obtenida directamente de la Bolsa de Valores de Caracas, institución que detenta todos los derechos de propiedad sobre los datos financieros aquí presentados. Este sistema no proporciona recomendaciones de inversión ni asesoramiento financiero.',
      en: 'Free-access platform intended solely for data visualization and analysis. Information is sourced directly from the Caracas Stock Exchange, which holds all proprietary rights to the financial data displayed. This system does not provide investment recommendations or financial advice.',
    },
    'banner.officialSite': {
      es: '(Ver sitio oficial)',
      en: '(View official site)',
    },
    'banner.currency': {
      es: 'Todos los montos están en moneda venezolana y las variaciones están en porcentajes.',
      en: 'All amounts are in Venezuelan currency and variations are in percentages.',
    },

    // Charts Section
    'charts.title': {
      es: 'Análisis Gráfico del Mercado',
      en: 'Market Chart Analysis',
    },
    'charts.subtitle': {
      es: 'Visualiza el comportamiento histórico de los instrumentos',
      en: 'Visualize the historical behavior of instruments',
    },
    'charts.selectInstruments': {
      es: 'Selecciona uno o más instrumentos para ver su comportamiento',
      en: 'Select one or more instruments to view their behavior',
    },
    'charts.selectAll': {
      es: 'Seleccionar Todos',
      en: 'Select All',
    },
    'charts.clearSelection': {
      es: 'Limpiar Selección',
      en: 'Clear Selection',
    },
    'charts.searchPlaceholder': {
      es: '🔍 Buscar y seleccionar instrumentos...',
      en: '🔍 Search and select instruments...',
    },
    'charts.notFound': {
      es: 'No se encontraron instrumentos',
      en: 'No instruments found',
    },
    'charts.instrumentsSelected': {
      es: 'instrumento',
      en: 'instrument',
    },
    'charts.selected': {
      es: 'seleccionado',
      en: 'selected',
    },
    'charts.dateRange': {
      es: 'Rango de Fechas',
      en: 'Date Range',
    },
    'charts.dataAvailable': {
      es: 'Datos disponibles:',
      en: 'Data available:',
    },
    'charts.tip': {
      es: 'Tip: Puedes seleccionar cualquier fecha, incluso fuera de este rango',
      en: 'Tip: You can select any date, even outside this range',
    },
    'charts.correlationTitle': {
      es: 'Análisis de Correlación',
      en: 'Correlation Analysis',
    },
    'charts.volatilityTitle': {
      es: 'Análisis de Volatilidad',
      en: 'Volatility Analysis',
    },
    'charts.distributionTitle': {
      es: 'Distribución de Precios',
      en: 'Price Distribution',
    },
    'charts.from': {
      es: 'Desde',
      en: 'From',
    },
    'charts.to': {
      es: 'Hasta',
      en: 'To',
    },
    'charts.last3Months': {
      es: 'Últimos 3 meses',
      en: 'Last 3 months',
    },
    'charts.generalViewTitle': {
      es: 'Vista General del Mercado',
      en: 'Market Overview',
    },
    'charts.activeInstruments': {
      es: 'instrumentos activos',
      en: 'active instruments',
    },
    'charts.realTimeComparison': {
      es: 'Comparativa en tiempo real',
      en: 'Real-time comparison',
    },
    'charts.multipleInstrumentsComparisonTitle': {
      es: 'Comparativa de Instrumentos',
      en: 'Instrument Comparison',
    },
    'charts.comparativeAnalysis': {
      es: 'Análisis comparativo',
      en: 'Comparative analysis',
    },
    'charts.treemapTitle': {
      es: 'Mapa de Calor - Variación de Instrumentos',
      en: 'Heat Map - Instrument Variation',
    },
    'charts.variationChartTitle': {
      es: 'Gráfico de Variación Porcentual',
      en: 'Percentage Variation Chart',
    },
    'charts.volumeAnalysisTitle': {
      es: 'Análisis de Volumen',
      en: 'Volume Analysis',
    },
    'charts.candlestickChartTitle': {
      es: 'Gráfico de Velas',
      en: 'Candlestick Chart',
    },
    'charts.amountAnalysisTitle': {
      es: 'Análisis de Monto Efectivo',
      en: 'Cash Amount Analysis',
    },
    'charts.noHistoryData': {
      es: 'No hay datos históricos disponibles para este instrumento',
      en: 'No historical data available for this instrument',
    },

    // Common terms
    'common.minimize': {
      es: 'Minimizar',
      en: 'Minimize',
    },
    'common.expand': {
      es: 'Expandir',
      en: 'Expand',
    },
    'common.volume': {
      es: 'Volumen',
      en: 'Volume',
    },
    'common.amount': {
      es: 'Monto',
      en: 'Amount',
    },
    'common.total': {
      es: 'Total',
      en: 'Total',
    },
    'common.min': {
      es: 'Mínimo',
      en: 'Min',
    },
    'common.max': {
      es: 'Máximo',
      en: 'Max',
    },
    'common.price': {
      es: 'Precio',
      en: 'Price',
    },
    'common.average': {
      es: 'Promedio',
      en: 'Average',
    },

    // Top Performers
    'top.title': {
      es: 'Instrumentos Más Destacados',
      en: 'Top Performing Instruments',
    },
    'top.yesterday': {
      es: 'Destacado de Ayer',
      en: "Yesterday's Top",
    },
    'top.yesterdayDesc': {
      es: 'Mayor variación del día anterior',
      en: 'Highest variation from previous day',
    },
    'top.today': {
      es: 'Destacado de Hoy',
      en: "Today's Top",
    },
    'top.todayDesc': {
      es: 'Mayor variación del día actual',
      en: 'Highest variation from current day',
    },
    'top.live': {
      es: 'En vivo',
      en: 'Live',
    },
    'top.noYesterdayData': {
      es: 'No hay datos de ayer disponibles',
      en: 'No data available from yesterday',
    },
    'top.noTodayData': {
      es: 'No hay datos de hoy disponibles',
      en: 'No data available from today',
    },
    'worst.title': {
      es: '⚠️ Instrumentos con Menor Rendimiento',
      en: '⚠️ Worst Performing Instruments',
    },
    'worst.yesterday': {
      es: 'Menor Rendimiento de Ayer',
      en: "Yesterday's Worst",
    },
    'worst.yesterdayDesc': {
      es: 'Menor variación del día anterior',
      en: 'Lowest variation from previous day',
    },
    'worst.today': {
      es: 'Menor Rendimiento de Hoy',
      en: "Today's Worst",
    },
    'worst.todayDesc': {
      es: 'Menor variación del día actual',
      en: 'Lowest variation from current day',
    },
    'worst.noYesterdayData': {
      es: 'No hay datos de ayer disponibles',
      en: 'No data available from yesterday',
    },
    'worst.noTodayData': {
      es: 'No hay datos de hoy disponibles',
      en: 'No data available from today',
    },

    // Table
    'table.title': {
      es: 'Datos del Mercado - BVC A la fecha',
      en: 'Market Data - BVC As of',
    },
    'table.subtitle': {
      es: 'Información actualizada del mercado de valores',
      en: 'Updated stock market information',
    },
    'table.searchPlaceholder': {
      es: 'Buscar por símbolo o descripción...',
      en: 'Search by symbol or description...',
    },
    'table.refresh': {
      es: 'Actualizar',
      en: 'Refresh',
    },
    'table.found': {
      es: 'Se encontraron',
      en: 'Found',
    },
    'table.results': {
      es: 'resultado(s)',
      en: 'result(s)',
    },
    'table.noResults': {
      es: 'No se encontraron resultados para',
      en: 'No results found for',
    },
    'table.symbol': {
      es: 'Símbolo',
      en: 'Symbol',
    },
    'table.description': {
      es: 'Descripción',
      en: 'Description',
    },
    'table.price': {
      es: 'Precio ($)',
      en: 'Price ($)',
    },
    'table.variation': {
      es: 'Variación %',
      en: 'Variation %',
    },
    'table.volume': {
      es: 'Volumen (MM)',
      en: 'Volume (MM)',
    },
    'table.amount': {
      es: 'Efectivo ($MM)',
      en: 'Cash ($MM)',
    },
    'table.time': {
      es: 'Hora',
      en: 'Time',
    },
    'table.actions': {
      es: 'Acciones',
      en: 'Actions',
    },
    'table.history': {
      es: 'Historial',
      en: 'History',
    },
    'table.historyOf': {
      es: 'Historial de',
      en: 'History of',
    },
    'table.back': {
      es: 'Volver',
      en: 'Back',
    },
    'table.date': {
      es: 'Fecha',
      en: 'Date',
    },
    'table.totalInstruments': {
      es: 'Total de instrumentos',
      en: 'Total instruments',
    },
    'table.showing': {
      es: 'Mostrando',
      en: 'Showing',
    },
    'table.of': {
      es: 'de',
      en: 'of',
    },
    'table.instruments': {
      es: 'instrumentos',
      en: 'instruments',
    },
    'table.noData': {
      es: 'No hay datos disponibles en este momento',
      en: 'No data available at this time',
    },
    'table.absVar': {
      es: 'Var. Abs',
      en: 'Abs. Var',
    },

    // Filtros
    'filters.all': {
      es: 'Todos',
      en: 'All',
    },
    'filters.gainers': {
      es: 'En Subida',
      en: 'Gainers',
    },
    'filters.losers': {
      es: 'En Bajada',
      en: 'Losers',
    },
    'filters.title': {
      es: 'Filtros',
      en: 'Filters',
    },
    'sort.title': {
      es: 'Ordenar por',
      en: 'Sort by',
    },

    // Footer
    'footer.about': {
      es: 'Sistema de Información de Mercado de la Bolsa de Valores de Caracas. Datos actualizados en tiempo real.',
      en: 'Caracas Stock Exchange Market Information System. Real-time updated data.',
    },
    'footer.quickNav': {
      es: 'Navegación Rápida',
      en: 'Quick Navigation',
    },
    'footer.marketCharts': {
      es: 'Gráficos del Mercado',
      en: 'Market Charts',
    },
    'footer.marketData': {
      es: 'Datos del Mercado',
      en: 'Market Data',
    },
    'footer.information': {
      es: 'Información',
      en: 'Information',
    },
    'footer.lastUpdate': {
      es: 'Última actualización',
      en: 'Last update',
    },
    'footer.currentTime': {
      es: 'Hora actual',
      en: 'Current time',
    },
    'footer.rights': {
      es: 'Los datos pertenecen a la Bolsa de Valores de Caracas.',
      en: 'The data belong to the Caracas Stock Exchange.',
    },
    'footer.community': {
      es: 'Por la comunidad',
      en: 'By the community',
    },
    'footer.aboutText': {
      es: 'Sistema de Información de Mercado de la Bolsa de Valores de Caracas. Datos actualizados en tiempo real.',
      en: 'Caracas Stock Exchange Market Information System. Real-time updated data.',
    },
    'footer.quickLinksTitle': {
      es: 'Navegación Rápida',
      en: 'Quick Links',
    },
    'footer.chartsLink': {
      es: 'Gráficos del Mercado',
      en: 'Market Charts',
    },
    'footer.dataLink': {
      es: 'Datos del Mercado',
      en: 'Market Data',
    },
    'footer.historyLink': {
      es: 'Histórico BCV',
      en: 'BCV History',
    },
    'footer.infoTitle': {
      es: 'Información',
      en: 'Information',
    },
    'market.open': {
      es: 'Abierto',
      en: 'Open',
    },
    'market.closed': {
      es: 'Cerrado',
      en: 'Closed',
    },
    'market.status': {
      es: 'Estado del Mercado',
      en: 'Market Status',
    },
    'footer.developedWith': {
      es: 'Desarrollado con',
      en: 'Developed with',
    },
    'footer.status': {
      es: 'Estado',
      en: 'Status',
    },
    'footer.online': {
      es: 'En línea',
      en: 'Online',
    },
  };

  constructor() {
    // Cargar idioma guardado o usar español por defecto
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      this.currentLanguageSubject.next(savedLang);
    }
  }

  get currentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: Language) {
    this.currentLanguageSubject.next(lang);
    localStorage.setItem('language', lang);
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.currentLanguage];
  }

  t(key: string): string {
    return this.translate(key);
  }
}
