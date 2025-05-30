import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private apiUrl: string = (window as any).__env?.API_URL || 'http://localhost:8090/api';

  getApiUrl(): string {
    return this.apiUrl;
  }
}
