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
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Error al cargar AdSense:', e);
      }
    }
  }
}
