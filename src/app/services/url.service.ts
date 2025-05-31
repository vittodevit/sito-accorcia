import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreateUrlRequest } from '../dto/CreateUrlRequest';
import { EditUrlRequest } from '../dto/EditUrlRequest';
import { DateRangeRequest } from '../dto/DateRangeRequest';

/**
 * Servizio per la gestione degli URL accorciati.
 * Fornisce funzionalità per creare, modificare, eliminare e ottenere statistiche degli URL.
 */
@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor(private http: HttpClient) {}

  /**
   * Crea un nuovo URL accorciato
   * @param request La richiesta di creazione dell'URL
   * @returns Observable con i dettagli dell'URL creato
   */
  createUrl(request: CreateUrlRequest): Observable<any> {
    return this.http.post<any>('/urls', request)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile creare URL');
        })
      );
  }

  /**
   * Modifica un URL accorciato esistente
   * @param shortCode Il codice breve dell'URL da modificare
   * @param request La richiesta di modifica dell'URL
   * @returns Observable con i dettagli dell'URL aggiornato
   */
  editUrl(shortCode: string, request: EditUrlRequest): Observable<any> {
    return this.http.put<any>(`/urls/${shortCode}`, request)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile modificare URL');
        })
      );
  }

  /**
   * Elimina un URL accorciato
   * @param shortCode Il codice breve dell'URL da eliminare
   * @returns Observable con il risultato dell'eliminazione
   */
  deleteUrl(shortCode: string): Observable<any> {
    return this.http.delete<any>(`/urls/${shortCode}`)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile eliminare URL');
        })
      );
  }

  /**
   * Ottiene tutti gli URL creati dall'utente autenticato
   * @returns Observable con la lista degli URL
   */
  getUserUrls(): Observable<any[]> {
    return this.http.get<any[]>('/urls')
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile ottenere gli URL');
        })
      );
  }

  /**
   * Ottiene le statistiche per un URL specifico dell'ultima settimana
   * @param shortCode Il codice breve dell'URL
   * @returns Observable con le statistiche dell'URL
   */
  getUrlStats(shortCode: string): Observable<any> {
    return this.http.get<any>(`/urls/${shortCode}/stats`)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile ottenere le statistiche dell\'URL');
        })
      );
  }

  /**
   * Ottiene le statistiche per un URL specifico in un intervallo di date personalizzato
   * @param shortCode Il codice breve dell'URL
   * @param dateRange L'intervallo di date per le statistiche
   * @returns Observable con le statistiche dell'URL
   */
  getUrlStatsWithRange(
    shortCode: string,
    dateRange: DateRangeRequest
  ): Observable<any> {
    return this.http.post<any>(`/urls/${shortCode}/stats/range`, dateRange)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile ottenere le statistiche dell\'URL');
        })
      );
  }

  /**
   * Ottiene le statistiche dell'account in un intervallo di date personalizzato
   * @param dateRange L'intervallo di date per le statistiche
   * @returns Observable con le statistiche dell'account
   */
  getAccountStats(dateRange: DateRangeRequest): Observable<any> {
    return this.http.post<any>('/urls/accountstats', dateRange)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Impossibile ottenere le statistiche dell\'account');
        })
      );
  }
}
