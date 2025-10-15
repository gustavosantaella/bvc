import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/http/base.service';

export interface HistoryInterface {
  price: number;
  absolute_variation: number;
  relative_variation: number;
  volume: number;
  effective_amount: number;
  market_time: string;
  timestamp: string;
}

export interface RawDataInterface {
  DESC_SIMB: string;
  COD_SIMB: string;
  PRECIO: number;
  VAR_ABS: number;
  VAR_REL: number;
  VOLUMEN: number;
  MONTO_EFECTIVO: number;
  HORA: string;
}

export interface MarketInterface {
  symbol: string;
  description: string;
  timestamp: string;
  raw_data: RawDataInterface;
  history: HistoryInterface[];
}

@Injectable({
  providedIn: 'root',
})
export class MarketService extends BaseService {
  getMarketData() {
    return this.http.get(`${this.baseUrl}/market`);
  }
}
