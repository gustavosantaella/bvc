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
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MarketInterface } from '../../services/http/market.service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-market-charts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market-charts.component.html',
  styleUrl: './market-charts.component.css',
})
export class MarketChartsComponent implements OnInit, OnChanges {
  @Input() marketData: MarketInterface[] = [];

  @ViewChild('priceChart') priceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('variationChart')
  variationChartRef!: ElementRef<HTMLCanvasElement>;

  selectedSymbol = '';
  selectedMarket: MarketInterface | null = null;

  priceChart: Chart | null = null;
  volumeChart: Chart | null = null;
  variationChart: Chart | null = null;

  // Exponer Math para uso en el template
  Math = Math;

  getMaxPrice(): number {
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.max(...this.selectedMarket.history.map((h) => h.price));
  }

  getMinPrice(): number {
    if (!this.selectedMarket || !this.selectedMarket.history.length) return 0;
    return Math.min(...this.selectedMarket.history.map((h) => h.price));
  }

  getLastHistory() {
    if (!this.selectedMarket || !this.selectedMarket.history.length)
      return null;
    return this.selectedMarket.history[this.selectedMarket.history.length - 1];
  }

  ngOnInit() {
    if (this.marketData.length > 0) {
      this.selectedSymbol = this.marketData[0].symbol;
      this.selectedMarket = this.marketData[0];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['marketData'] && this.marketData.length > 0) {
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
    this.selectedMarket =
      this.marketData.find((m) => m.symbol === symbol) || null;
    this.updateCharts();
  }

  createCharts() {
    if (!this.selectedMarket || !this.selectedMarket.history.length) return;

    this.createPriceChart();
    this.createVolumeChart();
    this.createVariationChart();
  }

  updateCharts() {
    this.destroyCharts();
    this.createCharts();
  }

  destroyCharts() {
    if (this.priceChart) {
      this.priceChart.destroy();
      this.priceChart = null;
    }
    if (this.volumeChart) {
      this.volumeChart.destroy();
      this.volumeChart = null;
    }
    if (this.variationChart) {
      this.variationChart.destroy();
      this.variationChart = null;
    }
  }

  createPriceChart() {
    if (!this.selectedMarket || !this.priceChartRef) return;

    const history = this.selectedMarket.history;
    const labels = history.map((h) => h.market_time);
    const prices = history.map((h) => h.price);

    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Precio ($)',
            data: prices,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
            text: `Evolución del Precio - ${this.selectedMarket.symbol}`,
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

  createVolumeChart() {
    if (!this.selectedMarket || !this.volumeChartRef) return;

    const history = this.selectedMarket.history;
    const labels = history.map((h) => h.market_time);
    const volumes = history.map((h) => h.volume);

    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Volumen',
            data: volumes,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgb(99, 102, 241)',
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
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString('es-CO'),
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

  createVariationChart() {
    if (!this.selectedMarket || !this.variationChartRef) return;

    const history = this.selectedMarket.history;
    const labels = history.map((h) => h.market_time);
    const variations = history.map((h) => h.relative_variation);

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

  ngOnDestroy() {
    this.destroyCharts();
  }
}
