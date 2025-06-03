import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

//#region funzioni globali
/**
 * Funzione globale definita in themeSwitcher.js che alterna il tema tra chiaro e scuro.
 * @returns Il nome del tema corrente dopo il cambio ('light' o 'dark')
 */
declare function toggleTheme(): string;

/**
 * Funzione globale definita in themeSwitcher.js che restituisce il tema corrente.
 * @returns Il nome del tema corrente ('light' o 'dark')
 */
declare function getCurrentTheme(): string;
//#endregion

/**
 * Servizio per la gestione del tema dell'applicazione (chiaro/scuro).
 *
 * Questo servizio fornisce funzionalità per:
 * - Cambiare il tema dell'applicazione
 * - Ottenere il tema corrente
 * - Notificare i componenti quando il tema cambia
 *
 * Utilizza funzioni JavaScript globali definite in themeSwitcher.js per
 * interagire con il DOM e il localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /**
   * Subject privato per emettere eventi di cambio tema.
   * Viene utilizzato internamente per notificare i componenti sottoscritti.
   */
  private themeChange = new Subject<string>();

  /**
   * Observable pubblico a cui i componenti possono sottoscriversi
   * per ricevere notifiche quando il tema cambia.
   */
  themeChange$ = this.themeChange.asObservable();

  /**
   * Cambia il tema dell'applicazione e notifica i componenti sottoscritti.
   * Invoca la funzione globale toggleTheme() per alternare tra tema chiaro e scuro.
   */
  emitThemeChange() {
    let theme = toggleTheme();
    this.themeChange.next(theme);
  }

  /**
   * Ottiene il tema corrente dal localStorage.
   * Invoca la funzione globale getCurrentTheme() per leggere il tema salvato.
   *
   * @returns Il nome del tema corrente ('light' o 'dark')
   */
  getCurrentThemeFromLocalStorage(): string {
    return getCurrentTheme();
  }
}
