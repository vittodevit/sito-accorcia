import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { UrlService } from './url.service';
import { RegisterRequest } from '../dto/RegisterRequest';
import { LoginRequest } from '../dto/LoginRequest';
import { LoginResponse } from '../dto/LoginResponse';
import { ChangePasswordRequest } from '../dto/ChangePasswordRequest';
import md5 from 'md5';

/**
 * Servizio per la gestione dell'autenticazione degli utenti.
 * Fornisce funzionalità per la registrazione, il login, il logout e la gestione del token JWT.
 * Gestisce anche la scadenza automatica del token e il reindirizzamento dell'utente.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // #### VARIABILI DI STATO ####
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'username';
  private readonly EXPIRATION_KEY = 'token_expiration';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.USERNAME_KEY));
  public username$ = this.usernameSubject.asObservable();

  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private urlService: UrlService
  ) {
    this.checkTokenExpiration();
  }

  /**
   * Registra un nuovo utente nel sistema.
   *
   * @param registerRequest Richiesta di registrazione contenente username, email, password e codice di invito
   * @returns Observable con il risultato della registrazione
   */
  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post<any>('/auth/register', registerRequest)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Registrazione fallita');
        })
      );
  }

  /**
   * Effettua il login di un utente.
   * In caso di successo, salva il token JWT e imposta il timer per il logout automatico.
   *
   * @param loginRequest Richiesta di login contenente username e password
   * @returns Observable che emette true in caso di login riuscito
   */
  login(loginRequest: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>('/auth/login', loginRequest)
      .pipe(
        tap(response => this.handleLoginSuccess(response)),
        map(() => true),
        catchError(error => {
          this.notificationService.notify("Credenziali non valide");
          return throwError(() => error.error?.error);
        })
      );
  }

  /**
   * Effettua il logout dell'utente.
   * Rimuove il token JWT dal localStorage, cancella il timer di scadenza
   * e reindirizza l'utente alla pagina di login.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
    this.isAuthenticatedSubject.next(false);
    this.usernameSubject.next(null);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    this.router.navigate(['/login']);
  }

  /**
   * Cambia la password dell'utente autenticato.
   *
   * @param changePasswordRequest Richiesta contenente la vecchia e la nuova password
   * @returns Observable con il risultato del cambio password
   */
  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>('/change-password', changePasswordRequest)
      .pipe(
        catchError(error => {
          return throwError(() => error.error?.error || 'Cambiamento password fallito');
        })
      );
  }

  /**
   * Ottiene il token JWT salvato nel localStorage.
   *
   * @returns Il token JWT o null se non presente
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se l'utente è autenticato controllando la validità del token.
   *
   * @returns true se l'utente è autenticato, false altrimenti
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Ottiene la foto profilo dell'utente autenticato.
   *
   * @returns URL dell'avatar Gravatar basato sull'email dell'utente
   */
  getProfilePicture(): string {
    return localStorage.getItem('gravatar') ||
      'https://www.gravatar.com/avatar/36549f39abeae93ba58e4ed6abf46d91?s=32&amp;d=mp';
  }

  /**
   * Gestisce il successo del login salvando il token e impostando il timer di scadenza.
   *
   * @param response Risposta dal server contenente il token JWT e il nome utente
   */
  private handleLoginSuccess(response: LoginResponse): void {
    const token = response.token;
    const username = response.username;

    // Salva token e nome utente
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, username);

    // Calcola e salva il tempo di scadenza
    // Analizza il JWT per ottenere il tempo di scadenza
    const expirationTime = this.getTokenExpirationTime(token);
    localStorage.setItem(this.EXPIRATION_KEY, expirationTime.toString());
    // Imposta l'email dell'utente per generare l'avatar Gravatar
    localStorage.setItem('gravatar', this.getGravatarURL());

    // Imposta il logout automatico alla scadenza del token
    this.setTokenExpirationTimer(expirationTime);

    // Aggiorna lo stato di autenticazione
    this.isAuthenticatedSubject.next(true);
    this.usernameSubject.next(username);

    // Reindirizza l'utente alla pagina principale dopo il login
    this.router.navigate(['/']);

    // invia segnale di caricamento lista URL ai componenti interessati
    this.urlService.refreshUrls();
  }

  /**
   * Verifica se esiste un token valido nel localStorage.
   *
   * @returns true se il token esiste ed è valido, false altrimenti
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    const expirationTime = Number(localStorage.getItem(this.EXPIRATION_KEY));
    return expirationTime > Date.now();
  }

  /**
   * Estrae il tempo di scadenza da un token JWT.
   *
   * @param token Il token JWT da analizzare
   * @returns Il tempo di scadenza in millisecondi
   */
  private getTokenExpirationTime(token: string): number {
    try {
      // Il token JWT è composto da tre parti separate da punti
      const payload = token.split('.')[1];
      // Decodifica il payload codificato in base64
      const decodedPayload = JSON.parse(atob(payload));
      // Ottiene il tempo di scadenza in millisecondi
      return decodedPayload.exp * 1000; // Converte da secondi a millisecondi
    } catch (error) {
      console.error('Impossibile decodificare token JWT', error);
      // Predefinito a 1 ora da adesso se l'analisi fallisce
      return Date.now() + 3600000;
    }
  }

  /**
   * Ottiene l'email dell'utente dal local storage per generare l'avatar Gravatar.
   * Se il token non è valido o non contiene un'email, restituisce un avatar predefinito.
   *
   * @return L'URL dell'avatar Gravatar basato sull'email dell'utente
   */
  private getGravatarURL(): string {
    const token = this.getToken();
    if (!token) return 'https://www.gravatar.com/avatar/36549f39abeae93ba58e4ed6abf46d91?s=32&amp;d=mp';

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      if (decodedPayload && decodedPayload.email) {
        const emailHash = md5(decodedPayload.email.trim().toLowerCase());
        return `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
      }
      return 'https://www.gravatar.com/avatar/36549f39abeae93ba58e4ed6abf46d91?s=32&amp;d=mp';
    } catch (error) {
      return 'https://www.gravatar.com/avatar/36549f39abeae93ba58e4ed6abf46d91?s=32&amp;d=mp';
    }
  }

  /**
   * Ottieni il nome utente salvato nel localStorage.
   *
   * @return Il nome utente o null se non presente
   */
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  /**
   * Utility function per reindirizzare l'utente alla homepage o alla pagina di login
   */
  redirectToHomepage(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Imposta un timer per il logout automatico alla scadenza del token.
   *
   * @param expirationTime Il tempo di scadenza in millisecondi
   */
  private setTokenExpirationTimer(expirationTime: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const timeUntilExpiration = expirationTime - Date.now();
    if (timeUntilExpiration > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      }, timeUntilExpiration);
    }
  }

  /**
   * Verifica la scadenza del token all'avvio del servizio e imposta il timer se necessario.
   */
  private checkTokenExpiration(): void {
    if (this.hasValidToken()) {
      const expirationTime = Number(localStorage.getItem(this.EXPIRATION_KEY));
      this.setTokenExpirationTimer(expirationTime);
    }
  }
}
