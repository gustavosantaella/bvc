import { Injectable } from '@angular/core';
import { ADSENSE_CONFIG } from '../config/adsense.config';

/**
 * Servicio para gestionar la configuración de Google AdSense
 */
@Injectable({
  providedIn: 'root',
})
export class AdsenseService {
  /**
   * Obtiene el ID de cliente de AdSense
   */
  getClientId(): string {
    return ADSENSE_CONFIG.clientId;
  }

  /**
   * Obtiene el ID de un bloque de anuncio específico
   */
  getAdSlot(slotName: keyof typeof ADSENSE_CONFIG.adSlots): string {
    return ADSENSE_CONFIG.adSlots[slotName];
  }

  /**
   * Obtiene la configuración de formato de un anuncio
   */
  getFormat(formatName: keyof typeof ADSENSE_CONFIG.formats) {
    return ADSENSE_CONFIG.formats[formatName];
  }

  /**
   * Verifica si AdSense está configurado correctamente
   */
  isConfigured(): boolean {
    return !ADSENSE_CONFIG.clientId.includes('XXXXXXXXXXXXXXXX');
  }

  /**
   * Obtiene un mensaje de advertencia si AdSense no está configurado
   */
  getConfigWarning(): string | null {
    if (!this.isConfigured()) {
      return 'AdSense no está configurado. Por favor, actualiza src/app/config/adsense.config.ts con tus IDs de AdSense.';
    }
    return null;
  }
}
