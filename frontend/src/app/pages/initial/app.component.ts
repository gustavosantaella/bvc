import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MarketInterface,
  MarketService,
  HistoryInterface,
} from '../../services/http/market.service';
import { MarketChartsComponent } from '../../components/market-charts/market-charts.component';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MarketChartsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'BVC History';
  marketData: MarketInterface[] = [];
  filteredMarketData: MarketInterface[] = [];
  searchTerm = '';
  loading = true;
  error = '';
  showHistoryTable = false;
  showMarketPanel = false;
  selectedMarket: MarketInterface | null = null;
  currentTime = '';
  showMobileMenu = false;

  // Filtros
  currentFilter: 'all' | 'gainers' | 'losers' = 'all';

  // Ordenamiento
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  historySortColumn: string = '';
  historySortDirection: 'asc' | 'desc' = 'asc';

  today = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  imagePath =
    'https://market.bolsadecaracas.com/_next/image?url=%2Ficons%2F{{symbol}}.png&w=96&q=75';

  constructor(
    private marketService: MarketService,
    public translationService: TranslationService
  ) {}

  get currentLanguage(): Language {
    return this.translationService.currentLanguage;
  }

  changeLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit() {
    // Inicializar Vercel Analytics y Speed Insights
    inject();
    injectSpeedInsights();

    this.removeMarketDataIfBetweenHours(9, 13);

    this.getMarketData();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    setInterval(() => this.getMarketData(), 600000);
  }

  removeMarketDataIfBetweenHours(startHour: number, endHour: number) {
    const now = new Date();
    const currentHour = now.getHours();
    console.log('currentHour', currentHour);
    if (currentHour >= startHour && currentHour < endHour) {
      localStorage.removeItem('marketData');
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.showMobileMenu = false;
    }
  }

  getMarketData() {
    this.loading = true;
    const marketData = localStorage.getItem('marketData');
    if (marketData) {
      this.marketData = JSON.parse(marketData) as MarketInterface[];
      this.filteredMarketData = this.marketData.filter((market) =>
        this.hasDataFromToday(market)
      );
      this.loading = false;
      return;
    }
    this.marketService.getMarketData().subscribe({
      next: (data: any) => {
        this.marketData = data.data as MarketInterface[];

        // Filtrar solo los que tienen datos de hoy para la tabla
        this.filteredMarketData = this.marketData.filter((market) =>
          this.hasDataFromToday(market)
        );
        localStorage.setItem('marketData', JSON.stringify(this.marketData));

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del mercado';
        this.loading = false;
        console.error(err);
      },
    });
  }

  hasDataFromToday(market: MarketInterface): boolean {
    if (!market.history || market.history.length === 0) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear a medianoche para comparar solo fechas

    // Verificar si el último registro es de hoy
    const lastHistory = market.history[market.history.length - 1];
    const lastDate = new Date(lastHistory.timestamp);
    lastDate.setHours(0, 0, 0, 0);

    return lastDate.getTime() === today.getTime();
  }

  onSearch(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue.toLowerCase().trim();
    this.filterMarketData();
  }

  filterMarketData() {
    let filtered = this.marketData.filter((market) => {
      // Aplicar filtro de búsqueda
      if (this.searchTerm) {
        const symbolMatch = market.symbol
          .toLowerCase()
          .includes(this.searchTerm);
        const descriptionMatch = market.description
          .toLowerCase()
          .includes(this.searchTerm);
        if (!symbolMatch && !descriptionMatch) return false;
      }

      // Aplicar filtro de ganancia/pérdida
      const lastHistory = this.getLastHistory(market);
      if (!lastHistory) return false;

      switch (this.currentFilter) {
        case 'gainers':
          return lastHistory.relative_variation > 0;
        case 'losers':
          return lastHistory.relative_variation < 0;
        default:
          return true;
      }
    });

    // Aplicar ordenamiento
    if (this.sortColumn) {
      filtered = this.sortData(filtered, this.sortColumn, this.sortDirection);
    }

    this.filteredMarketData = filtered;
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentFilter = 'all';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.filterMarketData();
  }

  // Métodos para filtros
  setFilter(filter: 'all' | 'gainers' | 'losers') {
    this.currentFilter = filter;
    this.filterMarketData();
  }

  // Métodos para ordenamiento
  sortData(
    data: MarketInterface[],
    column: string,
    direction: 'asc' | 'desc'
  ): MarketInterface[] {
    return [...data].sort((a, b) => {
      const lastHistoryA = this.getLastHistory(a);
      const lastHistoryB = this.getLastHistory(b);

      if (!lastHistoryA || !lastHistoryB) return 0;

      let valueA: any;
      let valueB: any;

      switch (column) {
        case 'symbol':
          valueA = a.symbol;
          valueB = b.symbol;
          break;
        case 'description':
          valueA = a.description;
          valueB = b.description;
          break;
        case 'price':
          valueA = lastHistoryA.price;
          valueB = lastHistoryB.price;
          break;
        case 'variation':
          valueA = lastHistoryA.relative_variation;
          valueB = lastHistoryB.relative_variation;
          break;
        case 'volume':
          valueA = lastHistoryA.volume;
          valueB = lastHistoryB.volume;
          break;
        case 'amount':
          valueA = lastHistoryA.effective_amount;
          valueB = lastHistoryB.effective_amount;
          break;
        case 'time':
          valueA = new Date(lastHistoryA.timestamp).getTime();
          valueB = new Date(lastHistoryB.timestamp).getTime();
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filterMarketData();
  }

  // Métodos para ordenamiento del historial
  sortHistory(column: string) {
    if (!this.selectedMarket) return;

    if (this.historySortColumn === column) {
      this.historySortDirection =
        this.historySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.historySortColumn = column;
      this.historySortDirection = 'asc';
    }

    this.selectedMarket.history = this.sortHistoryData(
      this.selectedMarket.history,
      column,
      this.historySortDirection
    );
  }

  sortHistoryData(
    data: HistoryInterface[],
    column: string,
    direction: 'asc' | 'desc'
  ): HistoryInterface[] {
    return [...data].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (column) {
        case 'date':
          valueA = new Date(a.timestamp).getTime();
          valueB = new Date(b.timestamp).getTime();
          break;
        case 'time':
          valueA = a.market_time;
          valueB = b.market_time;
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'variation':
          valueA = a.relative_variation;
          valueB = b.relative_variation;
          break;
        case 'volume':
          valueA = a.volume;
          valueB = b.volume;
          break;
        case 'amount':
          valueA = a.effective_amount;
          valueB = b.effective_amount;
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getHistorySortIcon(column: string): string {
    if (this.historySortColumn !== column) return '↕️';
    return this.historySortDirection === 'asc' ? '↑' : '↓';
  }

  getLastHistory(market: MarketInterface): HistoryInterface | null {
    return market.history.length > 0
      ? market.history[market.history.length - 1]
      : null;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatVolume(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value);
  }

  viewHistory(market: MarketInterface) {
    this.selectedMarket = market;
    this.showHistoryTable = true;
  }

  backToMainTable() {
    this.showHistoryTable = false;
    this.selectedMarket = null;
  }

  // Obtener el instrumento más destacado (mayor variación positiva)
  getTopPerformerToday(): {
    market: MarketInterface;
    history: HistoryInterface;
  } | null {
    const marketsWithToday = this.marketData.filter((m) =>
      this.hasDataFromToday(m)
    );

    if (marketsWithToday.length === 0) return null;

    let topMarket: MarketInterface | null = null;
    let topHistory: HistoryInterface | null = null;
    let maxVariation = -Infinity;

    marketsWithToday.forEach((market) => {
      const lastHistory = this.getLastHistory(market);
      if (lastHistory && lastHistory.relative_variation > maxVariation) {
        maxVariation = lastHistory.relative_variation;
        topMarket = market;
        topHistory = lastHistory;
      }
    });

    if (!topMarket || !topHistory) return null;
    return { market: topMarket, history: topHistory };
  }

  getTopPerformerYesterday(): {
    market: MarketInterface;
    history: HistoryInterface;
  } | null {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let topMarket: MarketInterface | null = null;
    let topHistory: HistoryInterface | null = null;
    let maxVariation = -Infinity;

    this.marketData.forEach((market) => {
      // Buscar el último registro de ayer
      const yesterdayRecords = market.history.filter((h) => {
        const recordDate = new Date(h.timestamp).toISOString().split('T')[0];
        return recordDate === yesterdayStr;
      });

      if (yesterdayRecords.length > 0) {
        const lastYesterdayRecord =
          yesterdayRecords[yesterdayRecords.length - 1];
        if (lastYesterdayRecord.relative_variation > maxVariation) {
          maxVariation = lastYesterdayRecord.relative_variation;
          topMarket = market;
          topHistory = lastYesterdayRecord;
        }
      }
    });

    if (!topMarket || !topHistory) return null;
    return { market: topMarket, history: topHistory };
  }

  getWorstPerformerYesterday(): {
    market: MarketInterface;
    history: HistoryInterface;
  } | null {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let worstMarket: MarketInterface | null = null;
    let worstHistory: HistoryInterface | null = null;
    let minVariation = Infinity;

    this.marketData.forEach((market) => {
      // Buscar el último registro de ayer
      const yesterdayRecords = market.history.filter((h) => {
        const recordDate = new Date(h.timestamp).toISOString().split('T')[0];
        return recordDate === yesterdayStr;
      });

      if (yesterdayRecords.length > 0) {
        const lastYesterdayRecord =
          yesterdayRecords[yesterdayRecords.length - 1];
        if (lastYesterdayRecord.relative_variation < minVariation) {
          minVariation = lastYesterdayRecord.relative_variation;
          worstMarket = market;
          worstHistory = lastYesterdayRecord;
        }
      }
    });

    if (!worstMarket || !worstHistory) return null;
    return { market: worstMarket, history: worstHistory };
  }

  getWorstPerformerToday(): {
    market: MarketInterface;
    history: HistoryInterface;
  } | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Filtrar solo instrumentos que tienen datos de hoy
    const marketsWithToday = this.marketData.filter((market) => {
      return market.history.some((h) => {
        const recordDate = new Date(h.timestamp).toISOString().split('T')[0];
        return recordDate === todayStr;
      });
    });

    if (marketsWithToday.length === 0) return null;

    let worstMarket: MarketInterface | null = null;
    let worstHistory: HistoryInterface | null = null;
    let minVariation = Infinity;

    marketsWithToday.forEach((market) => {
      const lastHistory = this.getLastHistory(market);
      if (lastHistory && lastHistory.relative_variation < minVariation) {
        minVariation = lastHistory.relative_variation;
        worstMarket = market;
        worstHistory = lastHistory;
      }
    });

    if (!worstMarket || !worstHistory) return null;
    return { market: worstMarket, history: worstHistory };
  }

  get marketStatus(): { isOpen: boolean; status: string; statusClass: string } {
    const now = new Date();
    const currentHour = now.getHours();

    // Mercado abierto de 9:00 AM a 1:00 PM (13:00)
    const isOpen = currentHour >= 9 && currentHour < 13;

    return {
      isOpen,
      status: isOpen ? this.t('market.open') : this.t('market.closed'),
      statusClass: isOpen ? 'bg-green-500' : 'bg-red-500',
    };
  }

  toggleMarketPanel() {
    this.showMarketPanel = !this.showMarketPanel;
  }

  formatDateOnly(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
