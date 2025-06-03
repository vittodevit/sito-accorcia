import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { LucideAngularModule, LucideIconData, HomeIcon } from 'lucide-angular';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Componente per gli elementi di navigazione.
 *
 * Questo componente visualizza un elemento di navigazione con un'icona e un testo.
 * Rileva automaticamente se il link associato è attivo in base all'URL corrente,
 * a meno che lo stato attivo non sia esplicitamente impostato dall'esterno.
 */
@Component({
  selector: 'app-nav-item',
  imports: [
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './nav-item.html'
})
export class NavItem implements OnInit, OnDestroy {
  /** Icona da visualizzare nell'elemento di navigazione */
  @Input() icon: LucideIconData = HomeIcon; //fallback

  /** Testo da visualizzare nell'elemento di navigazione */
  @Input() text: string = '';

  /** Link di destinazione per la navigazione */
  @Input() link: string = '';

  /**
   * Indica se l'elemento è attivo.
   * Se non impostato esplicitamente, viene determinato automaticamente
   * in base all'URL corrente.
   */
  @Input() active: boolean = false;

  /** Flag per tenere traccia se la proprietà active è stata impostata esplicitamente */
  private activeExplicitlySet: boolean = false;

  /** Sottoscrizione agli eventi del router */
  private routerSubscription: Subscription | null = null;

  /**
   * Costruttore del componente.
   *
   * @param router Il servizio Router di Angular per monitorare i cambiamenti di navigazione
   */
  constructor(private router: Router) {}

  /**
   * Inizializza il componente e configura il rilevamento automatico dello stato 'attivo'.
   * Sottoscrive gli eventi di navigazione del router per aggiornare lo stato 'attivo'
   * quando l'URL cambia, ma solo se lo stato 'attivo' non è stato impostato esplicitamente.
   */
  ngOnInit(): void {
    // Monitora i cambiamenti alla proprietà active
    this.activeExplicitlySet = this.active;

    // Se la proprietà active non è stata impostata esplicitamente, configura il rilevamento automatico
    if (!this.activeExplicitlySet) {
      this.checkIfActive();

      // Sottoscrivi agli eventi di navigazione per aggiornare lo stato attivo quando l'URL cambia
      this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkIfActive();
      });
    }
  }

  /**
   * Pulisce le risorse quando il componente viene distrutto.
   * Annulla la sottoscrizione agli eventi del router per evitare memory leak.
   */
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }

  /**
   * Verifica se il link del componente corrisponde all'URL corrente
   * e imposta la proprietà active di conseguenza.
   */
  private checkIfActive(): void {
    if (this.link) {
      // Controlla se l'URL corrente inizia con il link di questo elemento
      const currentUrl = this.router.url;
      this.active = currentUrl === this.link ||
                   (this.link !== '/' && currentUrl.startsWith(this.link));
    }
  }
}
