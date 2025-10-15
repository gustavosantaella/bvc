import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MarketInterface,
  MarketService,
  HistoryInterface,
} from '../../services/http/market.service';
import { MarketChartsComponent } from '../../components/market-charts/market-charts.component';

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
  selectedMarket: MarketInterface | null = null;
  currentTime = '';
  showMobileMenu = false;

  today = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  imagePath =
    'https://market.bolsadecaracas.com/_next/image?url=%2Ficons%2F{{symbol}}.png&w=96&q=75';
  constructor(private marketService: MarketService) {}

  ngOnInit() {
    this.getMarketData();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
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
    this.marketService.getMarketData().subscribe({
      next: (data: any) => {
        this.marketData = data.data as MarketInterface[];
        this.filteredMarketData = this.marketData;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del mercado';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSearch(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue.toLowerCase().trim();
    this.filterMarketData();
  }

  filterMarketData() {
    if (!this.searchTerm) {
      this.filteredMarketData = this.marketData;
      return;
    }

    this.filteredMarketData = this.marketData.filter((market) => {
      const symbolMatch = market.symbol.toLowerCase().includes(this.searchTerm);
      const descriptionMatch = market.description
        .toLowerCase()
        .includes(this.searchTerm);
      return symbolMatch || descriptionMatch;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredMarketData = this.marketData;
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
}
