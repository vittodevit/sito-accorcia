import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {environment} from '../../environments/environment';

/**
 * Interceptor per aggiungere il token JWT alle richieste HTTP.
 * Aggiunge automaticamente l'header di autorizzazione a tutte le richieste
 * tranne quelle di login e registrazione.
 * Gestisce anche gli errori di autenticazione (401, 403) effettuando il logout.
 *
 * @param request La richiesta HTTP originale
 * @param next La funzione per continuare la catena di interceptor
 * @returns Un Observable con la risposta HTTP
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rootApiUrl = environment.API_URL;

  // aggiunge il prefisso API all'URL della richiesta
  if (!request.url.startsWith(rootApiUrl)) {
    request = request.clone({
      url: `${rootApiUrl}${request.url}`
    });
  }

  // Salta l'aggiunta del token per le richieste di login e registrazione
  if (request.url.includes('/api/auth/login') || request.url.includes('/api/auth/register')) {
    return next(request);
  }

  // Ottiene il token dal servizio di autenticazione
  const token = authService.getToken();

  if (token) {
    // Clona la richiesta e aggiunge l'header di autorizzazione
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Gestisce la richiesta modificata e cattura eventuali errori di autenticazione
    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se riceviamo una risposta 401 Non autorizzato o 403 Vietato, effettuiamo il logout dell'utente
        if (error.status === 401 || error.status === 403) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Se non c'è un token, passa semplicemente la richiesta
  return next(request);
};
