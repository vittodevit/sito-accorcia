import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {NotificationService} from '../services/notification.service';

/**
 * Guard per proteggere le rotte che richiedono l'autenticazione.
 * Verifica che l'utente sia autenticato prima di consentire l'accesso alla rotta.
 * Se l'utente non è autenticato, viene reindirizzato alla pagina di login.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Verifica se l'utente può accedere alla rotta protetta.
   *
   * @returns true se l'utente è autenticato, false altrimenti
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.authService.logout();
      this.notificationService.notify('Sessione scaduta, effettua il login');
      return false;
    }
  }
}
