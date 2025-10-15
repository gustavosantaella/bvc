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

  selectedSymbol = 'ALL';
  selectedMarket: MarketInterface | null = null;

  priceChart: Chart | null = null;
  volumeChart: Chart | null = null;
  variationChart: Chart | null = null;

  // Exponer Math para uso en el template
  Math = Math;

  isShowingAll(): boolean {
    return this.selectedSymbol === 'ALL';
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

  ngOnInit() {
    // Por defecto mostrar "Todos"
    this.selectedSymbol = 'ALL';
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
      this.createAllVolumeChart();
      this.createAllVariationChart();
    } else {
      if (!this.selectedMarket || !this.selectedMarket.history.length) return;
      this.createPriceChart();
      this.createVolumeChart();
      this.createVariationChart();
    }
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

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        this.marketData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = this.marketData.map((market, index) => {
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

  createAllVolumeChart() {
    if (!this.volumeChartRef || !this.marketData.length) return;

    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgba(59, 130, 246, 0.6)',
      'rgba(16, 185, 129, 0.6)',
      'rgba(239, 68, 68, 0.6)',
      'rgba(245, 158, 11, 0.6)',
      'rgba(139, 92, 246, 0.6)',
      'rgba(236, 72, 153, 0.6)',
      'rgba(6, 182, 212, 0.6)',
      'rgba(251, 146, 60, 0.6)',
    ];

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        this.marketData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = this.marketData.map((market, index) => {
      const color = colors[index % colors.length];
      // Crear un mapa de tiempo -> volumen para este mercado
      const volumeMap = new Map(
        market.history.map((h) => [h.market_time, h.volume])
      );
      // Crear array de datos alineado con las etiquetas
      const data = allLabels.map((label) => volumeMap.get(label) ?? null);

      return {
        label: market.symbol,
        data: data as any,
        backgroundColor: color,
        borderColor: color.replace('0.6', '1'),
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

    // Obtener todas las etiquetas únicas
    const allLabels = [
      ...new Set(
        this.marketData.flatMap((m) => m.history.map((h) => h.market_time))
      ),
    ].sort();

    const datasets = this.marketData.map((market, index) => {
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

  ngOnDestroy() {
    this.destroyCharts();
  }
}
