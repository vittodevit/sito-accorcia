import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servizio per la gestione delle notifiche all'utente.
 * Utilizza MatSnackBar di Angular Material per mostrare messaggi temporanei.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Mostra una notifica all'utente.
   *
   * @param message Il messaggio da mostrare nella notifica
   * @param duration La durata in millisecondi per cui la notifica rimane visibile (default: 3000ms)
   */
  notify(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'OK', {
      duration: duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}
