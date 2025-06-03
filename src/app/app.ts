import { Component, OnInit, OnDestroy } from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import { Header } from './components/header/header';
import {
  LucideAngularModule,
  HomeIcon,
  KeyIcon,
  LinkIcon,
  PlusCircleIcon
} from 'lucide-angular';
import { NavItem } from './components/nav-item/nav-item';
import { UrlService } from './services/url.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    LucideAngularModule,
    NavItem,
    RouterLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  protected readonly HomeIcon = HomeIcon;
  protected readonly PlusCircleIcon = PlusCircleIcon;
  protected readonly KeyIcon = KeyIcon;
  protected readonly LinkIcon = LinkIcon;

  // variabili di stato
  showNav: boolean = true;
  showSidebar: boolean = true;

  /**
   * Lista degli URL dell'utente autenticato.
   * Viene utilizzata per popolare la sidebar con i link dell'utente.
   */
  userUrls: any[] = [];

  /**
   * Sottoscrizione agli eventi di aggiornamento degli URL.
   * Viene utilizzata per aggiornare la lista degli URL quando vengono
   * create, modificate o eliminate.
   */
  private urlsRefreshSubscription!: Subscription;

  /**
   * Sottoscrizione agli eventi di navigazione.
   * Viene utilizzata per nascondere la navbar e la sidebar nella pagina di login.
   */
  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    private urlService: UrlService
  ) {
    // nasconde la navbar e sidebar nella pagina di login
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(event.url.includes('/login') || event.url.includes('/register')){
          this.showNav = false;
          this.showSidebar = false;
        } else {
          this.showNav = true;
          this.showSidebar = true;
        }
      }
    });
  }

  /**
   * Inizializza il componente.
   * Carica la lista degli URL dell'utente e si sottoscrive agli eventi
   * di aggiornamento degli URL.
   */
  ngOnInit(): void {
    // Carica la lista degli URL dell'utente
    this.loadUserUrls();

    // Si sottoscrive agli eventi di aggiornamento degli URL
    this.urlsRefreshSubscription = this.urlService.urlsRefresh$.subscribe(() => {
      this.loadUserUrls();
    });
  }

  /**
   * Pulisce le risorse quando il componente viene distrutto.
   * Annulla le sottoscrizioni per evitare memory leak.
   */
  ngOnDestroy(): void {
    if (this.urlsRefreshSubscription) {
      this.urlsRefreshSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Carica la lista degli URL dell'utente autenticato.
   * Utilizza il servizio UrlService per ottenere gli URL dal server.
   */
  loadUserUrls(): void {
    this.urlService.getUserUrls().subscribe({
      next: (urls) => {
        this.userUrls = urls;
      },
      error: (error) => {
        console.error('Errore durante il caricamento degli URL:', error);
      }
    });
  }
}
