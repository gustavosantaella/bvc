import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';

export class BaseService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;
}
