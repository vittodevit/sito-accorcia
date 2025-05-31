import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard per la pagina di login.
 * Impedisce agli utenti già autenticati di accedere alla pagina di login,
 * reindirizzandoli alla pagina principale.
 */
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * Verifica se l'utente può accedere alla pagina di login.
   *
   * @returns true se l'utente non è autenticato, false se è già autenticato
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // non permettere l'accesso alla pagina di login o registrazione se l'utente è già autenticato
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }
}
