import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import * as d3 from 'd3';
import {
  MarketInterface,
  HistoryInterface,
} from '../../services/http/market.service';
import { TranslationService } from '../../services/translation.service';

// Registrar todos los componentes de Chart.js incluyendo candlestick
Chart.register(...registerables, CandlestickController, CandlestickElement);

@Component({
  selector: 'app-market-charts',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './market-charts.component.html',
  styleUrl: './market-charts.component.css',
})
export class MarketChartsComponent implements OnInit, OnChanges {
  @Input() marketData: MarketInterface[] = [];

  constructor(public translationService: TranslationService) {}

  t(key: string): string {
    return this.translationService.translate(key);
  }

  @ViewChild('priceChart') priceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('variationTreemap')
  variationTreemapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('variationChart')
  variationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('amountChart') amountChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('correlationChart')
  correlationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volatilityChart')
  volatilityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distributionChart')
  distributionChartRef!: ElementRef<HTMLCanvasElement>;

  selectedSymbol = 'ALL';
  selectedSymbols: string[] = [];
  selectedMarket: MarketInterface | null = null;
  selectedMarkets: MarketInterface[] = [];

  priceChart: Chart | null = null;
  variationTreemap: any = null;
  variationChart: Chart | null = null;
  volumeChart: Chart | null = null;
  amountChart: Chart | null = null;
  correlationChart: Chart | null = null;
  volatilityChart: Chart | null = null;
  distributionChart: Chart | null = null;

  // Control de expansión de gráficos
  expandedChart: 'price' | 'treemap' | 'variation' | null = null;

  // Control de carrusel de gráficos
  currentSlide = 0;
  isTransitioning = false;

  get totalSlides(): number {
    // 8 slides: treemap, variación%, volumen, velas, monto, correlación, volatilidad, distribución
    return 8;
  }

  // Filtro de fechas
  startDate: string = '';
  endDate: string = '';
  minDate: string = '';
  maxDate: string = '';

  // Exponer Math para uso en el template
  Math = Math;

  isShowingAll(): boolean {
    return this.selectedSymbol === 'ALL' || this.selectedSymbols.length === 0;
  }

  isMultipleSelected(): boolean {
    return this.selectedSymbols.length > 1;
  }

  getMaxPrice(): number {
    if (this.isShowingAll()) {
      if (!this.marketData.length) return 0;
      const allPrices = this.marketData.flatMap((m) =>
        m.history.map((h) => h.price)
      );
      return allPrices.length > 0 ? Math.max(...allPrices) : 0;
    }
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.max(...this.selectedMarket.history.map((h) => h.price));
  }

  getMinPrice(): number {
    if (this.isShowingAll()) {
      if (!this.marketData.length) return 0;
      const allPrices = this.marketData.flatMap((m) =>
        m.history.map((h) => h.price)
      );
      return allPrices.length > 0 ? Math.min(...allPrices) : 0;
    }
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.min(...this.selectedMarket.history.map((h) => h.price));
  }

  getLastHistory() {
    if (!this.selectedMarket || !this.selectedMarket.history.length)
      return null;
    return this.selectedMarket.history[this.selectedMarket.history.length - 1];
  }

  getTotalVolume(): number {
    if (this.isShowingAll()) {
      return this.marketData.reduce((sum, m) => {
        const lastHist = m.history[m.history.length - 1];
        return sum + (lastHist?.volume || 0);
      }, 0);
    }
    return this.getLastHistory()?.volume || 0;
  }

  getTotalAmount(): number {
    if (this.isShowingAll()) {
      return this.marketData.reduce((sum, m) => {
        const lastHist = m.history[m.history.length - 1];
        return sum + (lastHist?.effective_amount || 0);
      }, 0);
    }
    return this.getLastHistory()?.effective_amount || 0;
  }

  getMaxVolume(): number {
    if (this.isShowingAll()) {
      if (!this.marketData.length) return 0;
      const allVolumes = this.marketData.flatMap((m) =>
        m.history.map((h) => h.volume)
      );
      return allVolumes.length > 0 ? Math.max(...allVolumes) : 0;
    }
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.max(...this.selectedMarket.history.map((h) => h.volume));
  }

  getMinVolume(): number {
    if (this.isShowingAll()) {
      if (!this.marketData.length) return 0;
      const allVolumes = this.marketData.flatMap((m) =>
        m.history.map((h) => h.volume)
      );
      return allVolumes.length > 0 ? Math.min(...allVolumes) : 0;
    }
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.min(...this.selectedMarket.history.map((h) => h.volume));
  }

  toggleExpandChart(chartType: 'price' | 'treemap' | 'variation') {
    if (this.expandedChart === chartType) {
      this.expandedChart = null;
    } else {
      this.expandedChart = chartType;
    }
    // Esperar a que el DOM se actualice y luego redimensionar los gráficos
    setTimeout(() => {
      if (this.priceChart) this.priceChart.resize();
      if (this.variationTreemap) {
        // Redimensionar el treemap
        this.createVariationTreemap();
      }
      if (this.variationChart) this.variationChart.resize();
    }, 300);
  }

  isChartExpanded(chartType: 'price' | 'treemap' | 'variation'): boolean {
    return this.expandedChart === chartType;
  }

  isChartMinimized(chartType: 'price' | 'treemap' | 'variation'): boolean {
    return this.expandedChart !== null && this.expandedChart !== chartType;
  }

  // Métodos del carrusel
  nextSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  goToSlide(index: number) {
    if (this.isTransitioning || index >= this.totalSlides) return;
    this.isTransitioning = true;
    this.currentSlide = index;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  resetCarousel() {
    this.currentSlide = 0;
  }

  selectAllInstruments() {
    this.selectedSymbols = this.marketData.map((m) => m.symbol);
    this.updateSelectedMarkets();
    this.resetCarousel();
    this.updateCharts();
  }

  clearSelection() {
    this.selectedSymbols = [];
    this.selectedMarkets = [];
    this.selectedSymbol = 'ALL';
    this.resetCarousel();
    this.updateCharts();
  }

  removeSymbol(symbol: string) {
    this.selectedSymbols = this.selectedSymbols.filter((s) => s !== symbol);
    this.updateSelectedMarkets();
    this.updateCharts();
  }

  updateSelectedMarkets() {
    this.selectedMarkets = this.marketData.filter((m) =>
      this.selectedSymbols.includes(m.symbol)
    );
  }

  onSymbolsChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedSymbols = Array.from(select.selectedOptions).map(
      (option) => option.value
    );
    this.updateSelectedMarkets();
    this.updateCharts();
  }

  onNgSelectChange() {
    console.log('ng-select changed, selectedSymbols:', this.selectedSymbols);

    // Asegurarse de que selectedSymbols sea un array válido
    if (!Array.isArray(this.selectedSymbols)) {
      this.selectedSymbols = [];
    }

    this.updateSelectedMarkets();

    // Actualizar selectedMarket para instrumentos individuales
    if (this.selectedSymbols.length === 1) {
      this.selectedSymbol = this.selectedSymbols[0];
      this.selectedMarket =
        this.marketData.find((m) => m.symbol === this.selectedSymbols[0]) ||
        null;
    } else if (this.selectedSymbols.length === 0) {
      this.selectedSymbol = 'ALL';
      this.selectedMarket = null;
    } else {
      // Múltiples seleccionados
      this.selectedMarket = null;
    }

    console.log('selectedMarkets:', this.selectedMarkets);
    console.log('selectedMarket (single):', this.selectedMarket);
    this.resetCarousel();
    this.updateCharts();
  }

  ngOnInit() {
    // Por defecto mostrar "Todos"
    this.selectedSymbol = 'ALL';

    // Configurar fechas por defecto (últimos 3 meses)
    this.initializeDateRange();
  }

  initializeDateRange() {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(threeMonthsAgo);

    // Establecer fechas mínimas y máximas si hay datos
    if (this.marketData.length > 0) {
      this.updateDateLimits();
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateDateLimits() {
    if (!this.marketData.length) return;

    const allDates = this.marketData.flatMap((m) =>
      m.history.map((h) => new Date(h.timestamp))
    );

    if (allDates.length > 0) {
      const minDateTime = Math.min(...allDates.map((d) => d.getTime()));
      const maxDateTime = Math.max(...allDates.map((d) => d.getTime()));

      this.minDate = this.formatDateForInput(new Date(minDateTime));
      this.maxDate = this.formatDateForInput(new Date(maxDateTime));
    }
  }

  onDateChange() {
    // Validar que las fechas sean lógicas
    this.validateDateRange();
    this.updateCharts();
  }

  validateDateRange() {
    if (!this.startDate || !this.endDate) return;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // Si la fecha de inicio es posterior a la de fin, intercambiar
    if (start > end) {
      const temp = this.startDate;
      this.startDate = this.endDate;
      this.endDate = temp;
    }
  }

  resetDateRange() {
    this.initializeDateRange();
    this.updateCharts();
  }

  filterHistoryByDate(history: HistoryInterface[]): HistoryInterface[] {
    if (!this.startDate || !this.endDate) {
      return history;
    }

    // Crear fechas de comparación usando solo la parte de fecha
    const startDateOnly = this.startDate; // Formato YYYY-MM-DD
    const endDateOnly = this.endDate; // Formato YYYY-MM-DD

    const filtered = history.filter((h) => {
      const historyDate = new Date(h.timestamp);

      // Extraer solo la parte de fecha del timestamp (YYYY-MM-DD)
      const historyDateStr = historyDate.toISOString().split('T')[0];

      // Comparar strings de fecha directamente
      const isInRange =
        historyDateStr >= startDateOnly && historyDateStr <= endDateOnly;

      return isInRange;
    });

    return filtered;
  }

  getFilteredMarket(market: MarketInterface): MarketInterface {
    return {
      ...market,
      history: this.filterHistoryByDate(market.history),
    };
  }

  getFilteredMarketData(): MarketInterface[] {
    const filtered = this.marketData.map((m) => this.getFilteredMarket(m));
    return filtered;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marketData'] && this.marketData.length > 0) {
      // Si no hay fechas configuradas, inicializarlas
      if (!this.startDate || !this.endDate) {
        this.initializeDateRange();
      }

      // Actualizar límites de fecha cuando cambien los datos
      this.updateDateLimits();

      if (!this.selectedSymbol) {
        this.selectedSymbol = this.marketData[0].symbol;
        this.selectedMarket = this.marketData[0];
      } else {
        // Actualizar el mercado seleccionado con nuevos datos
        const updatedMarket = this.marketData.find(
          (m) => m.symbol === this.selectedSymbol
        );
        if (updatedMarket) {
          this.selectedMarket = updatedMarket;
          this.updateCharts();
        }
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  onSymbolChange(event: Event) {
    const symbol = (event.target as HTMLSelectElement).value;
    this.selectedSymbol = symbol;

    if (symbol === 'ALL') {
      this.selectedMarket = null;
    } else {
      this.selectedMarket =
        this.marketData.find((m) => m.symbol === symbol) || null;
    }

    this.updateCharts();
  }

  createCharts() {
    if (this.isShowingAll()) {
      if (!this.marketData.length) return;
      this.createAllPriceChart();
      this.createVariationTreemap();
      this.createAllVariationChart();
    } else if (this.isMultipleSelected()) {
      if (!this.selectedMarkets.length) return;
      this.createMultiplePriceChart();
      this.createVariationTreemap();
      this.createMultipleVariationChart();
    } else {
      if (!this.selectedMarket || !this.selectedMarket.history.length) return;
      this.createPriceChart();
      this.createVariationTreemap();
      this.createVariationChart();
    }

    // Crear gráficos de volumen y monto para todos los casos
    setTimeout(() => {
      this.createVolumeChart();
      this.createAmountChart();
    }, 100);

    // Crear gráficos adicionales
    setTimeout(() => {
      this.createCorrelationChart();
      this.createVolatilityChart();
      this.createDistributionChart();
    }, 200);
  }

  updateCharts() {
    this.destroyCharts();
    // Esperar un momento para que el canvas se limpie completamente y el DOM se actualice
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  destroyCharts() {
    if (this.priceChart) {
      try {
        this.priceChart.destroy();
      } catch (e) {
        console.warn('Error al destruir priceChart:', e);
      }
      this.priceChart = null;
    }
    if (this.variationTreemap) {
      try {
        d3.select(this.variationTreemapRef.nativeElement)
          .selectAll('*')
          .remove();
      } catch (e) {
        console.warn('Error al destruir variationTreemap:', e);
      }
      this.variationTreemap = null;
    }
    if (this.variationChart) {
      try {
        this.variationChart.destroy();
      } catch (e) {
        console.warn('Error al destruir variationChart:', e);
      }
      this.variationChart = null;
    }
    if (this.volumeChart) {
      try {
        this.volumeChart.destroy();
      } catch (e) {
        console.warn('Error al destruir volumeChart:', e);
      }
      this.volumeChart = null;
    }
    if (this.amountChart) {
      try {
        this.amountChart.destroy();
      } catch (e) {
        console.warn('Error al destruir amountChart:', e);
      }
      this.amountChart = null;
    }
    if (this.correlationChart) {
      try {
        this.correlationChart.destroy();
      } catch (e) {
        console.warn('Error al destruir correlationChart:', e);
      }
      this.correlationChart = null;
    }
    if (this.volatilityChart) {
      try {
        this.volatilityChart.destroy();
      } catch (e) {
        console.warn('Error al destruir volatilityChart:', e);
      }
      this.volatilityChart = null;
    }
    if (this.distributionChart) {
      try {
        this.distributionChart.destroy();
      } catch (e) {
        console.warn('Error al destruir distributionChart:', e);
      }
      this.distributionChart = null;
    }
  }

  // Procesar historial para mostrar: último registro de fechas pasadas + todos los registros de hoy
  processHistoryForDisplay(history: HistoryInterface[]): HistoryInterface[] {
    if (!history || history.length === 0) {
      return [];
    }

    const groupedByDate = new Map<string, HistoryInterface[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Agrupar por fecha
    history.forEach((h) => {
      const date = new Date(h.timestamp).toISOString().split('T')[0];
      if (!groupedByDate.has(date)) {
        groupedByDate.set(date, []);
      }
      groupedByDate.get(date)!.push(h);
    });

    const processedHistory: HistoryInterface[] = [];
    const dates = Array.from(groupedByDate.keys()).sort();

    dates.forEach((date) => {
      const dateRecords = groupedByDate.get(date)!;

      // Ordenar registros de esta fecha por hora
      dateRecords.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const isToday = date === todayStr;

      if (isToday) {
        // Para registros de hoy, agregar TODOS con la hora
        processedHistory.push(...dateRecords);
      } else {
        // Para fechas pasadas, solo el ÚLTIMO registro con la fecha en el label
        const lastRecord = dateRecords[dateRecords.length - 1];
        const recordDate = new Date(lastRecord.timestamp);
        const formattedDate = recordDate.toLocaleDateString('es-VE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        processedHistory.push({
          ...lastRecord,
          market_time: `📅 ${formattedDate}`, // Mostrar fecha completa
        });
      }
    });

    return processedHistory;
  }

  // Función auxiliar para generar datos OHLC simulados desde precios históricos
  generateOHLCData(history: HistoryInterface[]) {
    return history.map((h, index) => {
      const price = h.price;
      const prevPrice = index > 0 ? history[index - 1].price : price;

      // Calcular volatilidad aproximada basada en la variación
      const volatility = (Math.abs(h.relative_variation) / 100) * price * 0.3;

      let open, high, low, close;

      close = price;
      open = prevPrice;

      // Si el precio subió (close > open)
      if (close >= open) {
        high = close + volatility;
        low = open - volatility * 0.5;
      } else {
        // Si el precio bajó (close < open)
        high = open + volatility * 0.5;
        low = close - volatility;
      }

      return {
        x: new Date(h.timestamp).getTime(),
        o: open,
        h: high,
        l: low,
        c: close,
      };
    });
  }

  createPriceChart() {
    if (!this.selectedMarket || !this.priceChartRef) return;

    const filteredMarket = this.getFilteredMarket(this.selectedMarket);
    const processedHistory = this.processHistoryForDisplay(
      filteredMarket.history
    );
    if (!processedHistory.length) return;

    const ohlcData = this.generateOHLCData(processedHistory);

    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: any = {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: this.selectedMarket.symbol,
            data: ohlcData,
            borderColor: {
              up: 'rgb(34, 197, 94)', // Verde para subidas
              down: 'rgb(239, 68, 68)', // Rojo para bajadas
              unchanged: 'rgb(156, 163, 175)',
            },
            backgroundColor: {
              up: 'rgba(34, 197, 94, 0.3)',
              down: 'rgba(239, 68, 68, 0.3)',
              unchanged: 'rgba(156, 163, 175, 0.3)',
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Gráfico de Velas - ${this.selectedMarket.symbol}`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                const data = context.raw;
                const diff = data.c - data.o;
                const diffPercent = ((diff / data.o) * 100).toFixed(2);
                return [
                  `Apertura: $${data.o.toFixed(2)}`,
                  `Máximo: $${data.h.toFixed(2)}`,
                  `Mínimo: $${data.l.toFixed(2)}`,
                  `Cierre: $${data.c.toFixed(2)}`,
                  `Variación: ${diff >= 0 ? '+' : ''}$${diff.toFixed(
                    2
                  )} (${diffPercent}%)`,
                ];
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value: any) =>
                '$' + (typeof value === 'number' ? value.toFixed(2) : value),
            },
          },
          x: {
            type: 'timeseries',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'MMM dd',
              },
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.priceChart = new Chart(ctx, config);
  }

  createMultiplePriceChart() {
    if (!this.selectedMarkets.length || !this.priceChartRef) return;

    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(6, 182, 212)',
      'rgb(251, 146, 60)',
      'rgb(34, 197, 94)',
      'rgb(168, 85, 247)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredMarkets = this.selectedMarkets.map((m) => {
      const filtered = this.getFilteredMarket(m);
      return {
        ...filtered,
        history: this.processHistoryForDisplay(filtered.history),
      };
    });

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        filteredMarkets.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredMarkets.map((market, index) => {
      const color = colors[index % colors.length];
      const priceMap = new Map(
        market.history.map((h) => [h.market_time, h.price])
      );
      const data = allLabels.map((label) => priceMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Evolución de Precios - ${this.selectedSymbols.length} Instrumentos Seleccionados`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value: any) {
                return '$' + value.toFixed(2);
              },
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.priceChart = new Chart(ctx, config);
  }

  createVariationTreemap() {
    if (!this.variationTreemapRef || !this.variationTreemapRef.nativeElement) {
      console.warn('variationTreemapRef no está disponible aún');
      return;
    }

    // Limpiar el contenedor
    d3.select(this.variationTreemapRef.nativeElement).selectAll('*').remove();

    // Obtener datos
    let data: any[] = [];

    if (this.isShowingAll()) {
      // Para vista "Todos", usar el último registro de cada instrumento
      data = this.marketData.map((market) => {
        const lastHistory = market.history[market.history.length - 1];
        return {
          symbol: market.symbol,
          description: market.description,
          variation: lastHistory?.relative_variation || 0,
          volume: lastHistory?.volume || 0,
          effective_amount: lastHistory?.effective_amount || 0,
          price: lastHistory?.price || 0,
        };
      });
    } else if (this.isMultipleSelected()) {
      // Para múltiples instrumentos seleccionados, usar el último registro de cada uno
      data = this.selectedMarkets.map((market) => {
        const lastHistory = market.history[market.history.length - 1];
        return {
          symbol: market.symbol,
          description: market.description,
          variation: lastHistory?.relative_variation || 0,
          volume: lastHistory?.volume || 0,
          effective_amount: lastHistory?.effective_amount || 0,
          price: lastHistory?.price || 0,
        };
      });
    } else {
      // Para instrumento individual, mostrar evolución de variación
      if (!this.selectedMarket) return;
      const filteredMarket = this.getFilteredMarket(this.selectedMarket);
      data = filteredMarket.history.map((h) => ({
        symbol: this.selectedMarket!.symbol,
        description: this.selectedMarket!.description,
        variation: h.relative_variation,
        volume: h.volume,
        effective_amount: h.effective_amount,
        price: h.price,
        time: h.market_time,
      }));
    }

    // Filtrar datos con volumen > 0 para evitar bloques muy pequeños
    data = data.filter((d) => d.volume > 0);

    if (data.length === 0) return;

    // Configurar el contenedor
    const container = this.variationTreemapRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // Crear el SVG
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Configurar el treemap
    const treemap = d3
      .treemap()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])
      .padding(2);

    // Preparar datos para D3 hierarchy
    const root = d3
      .hierarchy({ children: data } as any)
      .sum((d: any) => d.effective_amount)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    treemap(root as any);

    // Escala de colores
    const colorScale = d3
      .scaleLinear<string>()
      .domain([
        d3.min(data, (d) => d.variation) || 0,
        d3.max(data, (d) => d.variation) || 0,
      ])
      .range(['#ef4444', '#10b981']);

    // Crear los rectángulos
    const cells = svg
      .selectAll('.cell')
      .data((root as any).leaves())
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    cells
      .append('rect')
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) => {
        const variation = d.data.variation;
        return variation >= 0 ? '#10b981' : '#ef4444';
      })
      .attr('fill-opacity', (d: any) => {
        const variation = Math.abs(d.data.variation);
        return Math.min(0.3 + variation / 30, 1);
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('transition', 'all 0.2s ease');

    // Agregar texto
    cells
      .append('text')
      .attr('x', (d: any) => (d.x1 - d.x0) / 2)
      .attr('y', (d: any) => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        return Math.max(8, Math.min(14, Math.sqrt(area) / 8)) + 'px';
      })
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .text(
        (d: any) =>
          `${d.data.symbol}\n(${
            d.data.variation >= 0 ? '+' : ''
          }${d.data.variation.toFixed(2)}%)`
      );

    // Agregar tooltips y eventos de click
    cells
      .style('cursor', 'pointer')
      .on('mouseover', function (event: any, d: any) {
        d3.select(this)
          .select('rect')
          .attr('stroke', '#000000')
          .attr('stroke-width', 3)
          .style('filter', 'brightness(1.1)');

        // Crear tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'treemap-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000');

        tooltip.html(`
          <strong>${d.data.symbol}</strong><br/>
          ${d.data.description}<br/>
          Variación: ${
            d.data.variation >= 0 ? '+' : ''
          }${d.data.variation.toFixed(2)}%<br/>
          Precio: $${d.data.price.toFixed(2)}<br/>
          Volumen: ${d.data.volume.toLocaleString()}<br/>
          Monto: $${d.data.effective_amount.toLocaleString()}<br/>
          <em>Click para seleccionar</em><br/>
          <small>Ctrl+Click para selección múltiple</small>
        `);
      })
      .on('mousemove', function (event: any) {
        d3.select('.treemap-tooltip')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .select('rect')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1)
          .style('filter', 'none');
        d3.select('.treemap-tooltip').remove();
      })
      .on('click', (event: any, d: any) => {
        // Si Ctrl/Cmd está presionado, agregar/quitar de selección múltiple
        if (event.ctrlKey || event.metaKey) {
          const symbol = d.data.symbol;
          if (this.selectedSymbols.includes(symbol)) {
            this.removeSymbol(symbol);
          } else {
            this.selectedSymbols.push(symbol);
            this.updateSelectedMarkets();
            this.updateCharts();
          }
        } else {
          // Selección única - reemplazar selección actual
          this.selectedSymbols = [d.data.symbol];
          this.selectedSymbol = d.data.symbol;
          this.selectedMarket =
            this.marketData.find((m) => m.symbol === d.data.symbol) || null;
          this.updateSelectedMarkets();

          // Expandir automáticamente el gráfico de variación
          this.expandedChart = 'variation';

          // Actualizar los gráficos
          this.updateCharts();
        }

        // Scroll suave hacia la sección de gráficos
        setTimeout(() => {
          const chartsSection = document.querySelector('.space-y-6');
          if (chartsSection) {
            chartsSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      });

    this.variationTreemap = svg;
  }

  createVariationChart() {
    if (!this.selectedMarket || !this.variationChartRef) return;

    const filteredMarket = this.getFilteredMarket(this.selectedMarket);
    const processedHistory = this.processHistoryForDisplay(
      filteredMarket.history
    );
    if (!processedHistory.length) return;

    const labels = processedHistory.map((h) => h.market_time);
    const variations = processedHistory.map((h) => h.relative_variation);

    const ctx = this.variationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Variación (%)',
            data: variations,
            borderColor: (context: any) => {
              const value = context.parsed?.y ?? 0;
              return value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
            },
            backgroundColor: (context: any) => {
              const value = context.parsed?.y ?? 0;
              return value >= 0
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(239, 68, 68, 0.1)';
            },
            segment: {
              borderColor: (ctx: any) => {
                const value = ctx.p1?.parsed?.y ?? 0;
                return value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
              },
              backgroundColor: (ctx: any) => {
                const value = ctx.p1?.parsed?.y ?? 0;
                return value >= 0
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)';
              },
            },
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Variación Porcentual - ${this.selectedMarket.symbol}`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `Variación: ${value >= 0 ? '+' : ''}${value.toFixed(
                  2
                )}%`;
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => value + '%',
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.variationChart = new Chart(ctx, config);
  }

  // Gráfico de Volumen
  createVolumeChart() {
    if (!this.volumeChartRef) return;

    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Determinar qué tipo de gráfico crear
    if (this.isShowingAll()) {
      this.createAllVolumeChart(ctx);
    } else if (this.isMultipleSelected()) {
      this.createMultipleVolumeChart(ctx);
    } else {
      this.createSingleVolumeChart(ctx);
    }
  }

  createSingleVolumeChart(ctx: CanvasRenderingContext2D) {
    if (!this.selectedMarket) return;

    const filteredMarket = this.getFilteredMarket(this.selectedMarket);
    const processedHistory = this.processHistoryForDisplay(
      filteredMarket.history
    );
    if (!processedHistory.length) return;

    const labels = processedHistory.map((h) => h.market_time);
    const volumes = processedHistory.map((h) => h.volume);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Volumen',
            data: volumes,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Volumen de Operaciones - ${this.selectedMarket.symbol}`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `Volumen: ${value.toLocaleString('es-CO')}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                typeof value === 'number'
                  ? value.toLocaleString('es-CO')
                  : value,
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.volumeChart = new Chart(ctx, config);
  }

  createAllVolumeChart(ctx: CanvasRenderingContext2D) {
    if (!this.marketData.length) return;

    const colors = [
      'rgba(59, 130, 246, 0.6)',
      'rgba(16, 185, 129, 0.6)',
      'rgba(239, 68, 68, 0.6)',
      'rgba(245, 158, 11, 0.6)',
      'rgba(139, 92, 246, 0.6)',
      'rgba(236, 72, 153, 0.6)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredData = this.getFilteredMarketData().map((m) => ({
      ...m,
      history: this.processHistoryForDisplay(m.history),
    }));

    const allLabels = [
      ...new Set(
        filteredData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredData.map((market, index) => {
      const volumeMap = new Map(
        market.history.map((h) => [h.market_time, h.volume])
      );
      const data = allLabels.map((label) => volumeMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.6', '1'),
        borderWidth: 1,
      };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Volumen de Operaciones - Todos los Instrumentos',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                typeof value === 'number'
                  ? value.toLocaleString('es-CO')
                  : value,
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.volumeChart = new Chart(ctx, config);
  }

  createMultipleVolumeChart(ctx: CanvasRenderingContext2D) {
    if (!this.selectedMarkets.length) return;

    const colors = [
      'rgba(59, 130, 246, 0.6)',
      'rgba(16, 185, 129, 0.6)',
      'rgba(239, 68, 68, 0.6)',
      'rgba(245, 158, 11, 0.6)',
      'rgba(139, 92, 246, 0.6)',
      'rgba(236, 72, 153, 0.6)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredMarkets = this.selectedMarkets.map((m) => {
      const filtered = this.getFilteredMarket(m);
      return {
        ...filtered,
        history: this.processHistoryForDisplay(filtered.history),
      };
    });

    const allLabels = [
      ...new Set(
        filteredMarkets.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredMarkets.map((market, index) => {
      const volumeMap = new Map(
        market.history.map((h) => [h.market_time, h.volume])
      );
      const data = allLabels.map((label) => volumeMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.6', '1'),
        borderWidth: 1,
      };
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Volumen de Operaciones - ${this.selectedSymbols.length} Instrumentos`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                typeof value === 'number'
                  ? value.toLocaleString('es-CO')
                  : value,
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.volumeChart = new Chart(ctx, config);
  }

  // Gráfico de Monto Efectivo
  createAmountChart() {
    if (!this.amountChartRef) return;

    const ctx = this.amountChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Determinar qué tipo de gráfico crear
    if (this.isShowingAll()) {
      this.createAllAmountChart(ctx);
    } else if (this.isMultipleSelected()) {
      this.createMultipleAmountChart(ctx);
    } else {
      this.createSingleAmountChart(ctx);
    }
  }

  createSingleAmountChart(ctx: CanvasRenderingContext2D) {
    if (!this.selectedMarket) return;

    const filteredMarket = this.getFilteredMarket(this.selectedMarket);
    const processedHistory = this.processHistoryForDisplay(
      filteredMarket.history
    );
    if (!processedHistory.length) return;

    const labels = processedHistory.map((h) => h.market_time);
    const amounts = processedHistory.map((h) => h.effective_amount);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Monto Efectivo ($)',
            data: amounts,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Monto Efectivo de Operaciones - ${this.selectedMarket.symbol}`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `Monto: $${value.toLocaleString('es-CO')}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) =>
                '$' +
                (typeof value === 'number'
                  ? (value / 1000).toFixed(0) + 'K'
                  : value),
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.amountChart = new Chart(ctx, config);
  }

  createAllAmountChart(ctx: CanvasRenderingContext2D) {
    if (!this.marketData.length) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredData = this.getFilteredMarketData().map((m) => ({
      ...m,
      history: this.processHistoryForDisplay(m.history),
    }));

    const allLabels = [
      ...new Set(
        filteredData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredData.map((market, index) => {
      const amountMap = new Map(
        market.history.map((h) => [h.market_time, h.effective_amount])
      );
      const data = allLabels.map((label) => amountMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length]
          .replace('rgb', 'rgba')
          .replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Monto Efectivo - Todos los Instrumentos',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) =>
                '$' +
                (typeof value === 'number'
                  ? (value / 1000).toFixed(0) + 'K'
                  : value),
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.amountChart = new Chart(ctx, config);
  }

  createMultipleAmountChart(ctx: CanvasRenderingContext2D) {
    if (!this.selectedMarkets.length) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredMarkets = this.selectedMarkets.map((m) => {
      const filtered = this.getFilteredMarket(m);
      return {
        ...filtered,
        history: this.processHistoryForDisplay(filtered.history),
      };
    });

    const allLabels = [
      ...new Set(
        filteredMarkets.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredMarkets.map((market, index) => {
      const amountMap = new Map(
        market.history.map((h) => [h.market_time, h.effective_amount])
      );
      const data = allLabels.map((label) => amountMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length]
          .replace('rgb', 'rgba')
          .replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Monto Efectivo - ${this.selectedSymbols.length} Instrumentos`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) =>
                '$' +
                (typeof value === 'number'
                  ? (value / 1000).toFixed(0) + 'K'
                  : value),
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.amountChart = new Chart(ctx, config);
  }

  // Métodos para mostrar todos los instrumentos
  createAllPriceChart() {
    if (!this.priceChartRef || !this.marketData.length) return;

    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(6, 182, 212)',
      'rgb(251, 146, 60)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredData = this.getFilteredMarketData().map((m) => ({
      ...m,
      history: this.processHistoryForDisplay(m.history),
    }));

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        filteredData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredData.map((market, index) => {
      const color = colors[index % colors.length];
      // Crear un mapa de tiempo -> precio para este mercado
      const priceMap = new Map(
        market.history.map((h) => [h.market_time, h.price])
      );
      // Crear array de datos alineado con las etiquetas
      const data = allLabels.map((label) => priceMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data as any,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Evolución de Precios - Todos los Instrumentos',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) =>
                '$' + (typeof value === 'number' ? value.toFixed(2) : value),
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.priceChart = new Chart(ctx, config);
  }

  createAllVariationChart() {
    if (!this.variationChartRef || !this.marketData.length) return;

    const ctx = this.variationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(6, 182, 212)',
      'rgb(251, 146, 60)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredData = this.getFilteredMarketData().map((m) => ({
      ...m,
      history: this.processHistoryForDisplay(m.history),
    }));

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        filteredData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredData.map((market, index) => {
      const color = colors[index % colors.length];
      // Crear un mapa de tiempo -> variación para este mercado
      const variationMap = new Map(
        market.history.map((h) => [h.market_time, h.relative_variation])
      );
      // Crear array de datos alineado con las etiquetas
      const data = allLabels.map((label) => variationMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data as any,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Variación Porcentual - Todos los Instrumentos',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y ?? 0;
                return `${context.dataset.label}: ${
                  value >= 0 ? '+' : ''
                }${value.toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => value + '%',
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.variationChart = new Chart(ctx, config);
  }

  createMultipleVariationChart() {
    if (!this.variationChartRef || !this.selectedMarkets.length) return;

    const ctx = this.variationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
      'rgb(6, 182, 212)',
      'rgb(251, 146, 60)',
      'rgb(34, 197, 94)',
      'rgb(168, 85, 247)',
    ];

    // Filtrar datos por fecha y procesar el historial
    const filteredMarkets = this.selectedMarkets.map((m) => {
      const filtered = this.getFilteredMarket(m);
      return {
        ...filtered,
        history: this.processHistoryForDisplay(filtered.history),
      };
    });

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        filteredMarkets.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = filteredMarkets.map((market, index) => {
      const color = colors[index % colors.length];
      const variationMap = new Map(
        market.history.map((h) => [h.market_time, h.relative_variation])
      );
      const data = allLabels.map((label) => variationMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data as any,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        spanGaps: true,
      };
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: { labels: allLabels, datasets: datasets as any },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: `Evolución de Variación - ${this.selectedSymbols.length} Instrumentos Seleccionados`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value: any) {
                return value.toFixed(2) + '%';
              },
            },
            grid: {
              color: (context: any) => {
                return context.tick.value === 0 ? '#ef4444' : '#e5e7eb';
              },
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.variationChart = new Chart(ctx, config);
  }

  // Gráfico de Correlación entre Instrumentos
  createCorrelationChart() {
    if (!this.correlationChartRef?.nativeElement) return;

    const ctx = this.correlationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Obtener datos de correlación entre los primeros 10 instrumentos
    const topMarkets = this.marketData.slice(0, 10);
    const symbols = topMarkets.map((m) => m.symbol);

    // Calcular matriz de correlación simplificada basada en variaciones
    const correlations: number[][] = [];
    for (let i = 0; i < symbols.length; i++) {
      correlations[i] = [];
      for (let j = 0; j < symbols.length; j++) {
        if (i === j) {
          correlations[i][j] = 1;
        } else {
          // Correlación simplificada basada en similitud de variaciones
          const marketI = topMarkets[i];
          const marketJ = topMarkets[j];
          const lastHistoryI =
            marketI.history && marketI.history.length > 0
              ? marketI.history[marketI.history.length - 1]
              : null;
          const lastHistoryJ =
            marketJ.history && marketJ.history.length > 0
              ? marketJ.history[marketJ.history.length - 1]
              : null;

          if (lastHistoryI && lastHistoryJ) {
            const variationI = lastHistoryI.relative_variation;
            const variationJ = lastHistoryJ.relative_variation;
            // Correlación basada en la similitud de signos y magnitudes
            const correlation = Math.min(
              1,
              Math.max(
                -1,
                (variationI * variationJ) /
                  (Math.abs(variationI) + Math.abs(variationJ) + 0.1)
              )
            );
            correlations[i][j] = correlation;
          } else {
            correlations[i][j] = 0;
          }
        }
      }
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: symbols,
        datasets: [
          {
            label: 'Correlación Promedio',
            data: correlations.map(
              (row) => row.reduce((sum, val) => sum + val, 0) / row.length
            ),
            backgroundColor: correlations.map((row) => {
              const avg = row.reduce((sum, val) => sum + val, 0) / row.length;
              return avg > 0.5 ? '#10B981' : avg > 0 ? '#F59E0B' : '#EF4444';
            }),
            borderColor: '#1F2937',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Correlación entre Instrumentos',
            font: { size: 16, weight: 'bold' },
          },
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            min: -1,
            max: 1,
            title: { display: true, text: 'Correlación' },
          },
          x: {
            title: { display: true, text: 'Instrumentos' },
          },
        },
      },
    };

    this.correlationChart = new Chart(ctx, config);
  }

  // Gráfico de Volatilidad
  createVolatilityChart() {
    if (!this.volatilityChartRef?.nativeElement) return;

    const ctx = this.volatilityChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Calcular volatilidad para los primeros 10 instrumentos
    const topMarkets = this.marketData.slice(0, 10);
    const volatilityData = topMarkets.map((market) => {
      const history = this.processHistoryForDisplay(market.history);
      if (history.length < 2) return 0;

      // Calcular volatilidad como desviación estándar de las variaciones
      const variations = history.map((h) => h.relative_variation);
      const mean =
        variations.reduce((sum, val) => sum + val, 0) / variations.length;
      const variance =
        variations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        variations.length;
      return Math.sqrt(variance);
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: topMarkets.map((m) => m.symbol),
        datasets: [
          {
            label: 'Volatilidad (%)',
            data: volatilityData,
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Volatilidad Histórica',
            font: { size: 16, weight: 'bold' },
          },
          legend: { display: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Volatilidad (%)' },
          },
          x: {
            title: { display: true, text: 'Instrumentos' },
          },
        },
      },
    };

    this.volatilityChart = new Chart(ctx, config);
  }

  // Gráfico de Distribución de Precios
  createDistributionChart() {
    if (!this.distributionChartRef?.nativeElement) return;

    const ctx = this.distributionChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Obtener todos los precios actuales
    const allPrices = this.marketData
      .map((market) => {
        const lastHistory =
          market.history && market.history.length > 0
            ? market.history[market.history.length - 1]
            : null;
        return lastHistory ? lastHistory.price : 0;
      })
      .filter((price) => price > 0);

    // Crear rangos de precios para el histograma
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const range = maxPrice - minPrice;
    const binSize = range / 10;

    const bins = Array(10)
      .fill(0)
      .map((_, i) => ({
        label: `$${(minPrice + i * binSize).toFixed(0)} - $${(
          minPrice +
          (i + 1) * binSize
        ).toFixed(0)}`,
        count: 0,
      }));

    // Contar precios en cada rango
    allPrices.forEach((price) => {
      const binIndex = Math.min(9, Math.floor((price - minPrice) / binSize));
      bins[binIndex].count++;
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: bins.map((bin) => bin.label),
        datasets: [
          {
            label: 'Número de Instrumentos',
            data: bins.map((bin) => bin.count),
            backgroundColor: '#3B82F6',
            borderColor: '#1E40AF',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Precios',
            font: { size: 16, weight: 'bold' },
          },
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Cantidad de Instrumentos' },
          },
          x: {
            title: { display: true, text: 'Rangos de Precio' },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    };

    this.distributionChart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    this.destroyCharts();
  }
}
