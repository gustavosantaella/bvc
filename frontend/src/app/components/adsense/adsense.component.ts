import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-adsense',
  standalone: true,
  imports: [],
  templateUrl: './adsense.component.html',
  styleUrl: './adsense.component.css',
})
export class AdsenseComponent implements OnInit, AfterViewInit {
  @Input() adClient: string = 'ca-pub-XXXXXXXXXXXXXXXX'; // Reemplazar con tu ID de AdSense
  @Input() adSlot: string = '';
  @Input() adFormat: string = 'auto';
  @Input() fullWidthResponsive: boolean = true;
  @Input() display: string = 'block';
  @Input() adStyle: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Componente inicializado
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Esperar a que el DOM esté completamente renderizado
      setTimeout(() => {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          // Solo mostrar error si no es un problema de dimensiones
          if (e instanceof Error && !e.message.includes('No slot size')) {
            console.error('Error al cargar AdSense:', e);
          }
          // Los errores de "No slot size" son normales durante desarrollo
        }
      }, 100);
    }
  }
}
