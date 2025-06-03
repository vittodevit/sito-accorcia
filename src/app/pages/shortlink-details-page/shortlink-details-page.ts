import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DraggableModal } from '../../components/draggable-modal/draggable-modal';
import { UrlService } from '../../services/url.service';
import { WebSocketService } from '../../services/websocket.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { DateRangeRequest } from '../../dto/DateRangeRequest';
import { EditUrlRequest } from '../../dto/EditUrlRequest';
import { Subscription } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import {
  LucideAngularModule,
  AlertTriangleIcon,
  RefreshCwIcon,
  EditIcon,
  TrashIcon,
  QrCodeIcon,
  LinkIcon,
  ClipboardCopyIcon,
  DownloadIcon
} from 'lucide-angular';

//#region funzioni globali
declare function downloadCanvasAsImage(shortlink: string): void;
//#endregion

/**
 * Componente della pagina di dettaglio di un shortlink.
 *
 * Questa pagina visualizza statistiche dettagliate sulle visite a un singolo URL accorciato,
 * inclusi grafici interattivi e una tabella paginata e ricercabile con i dettagli delle visite.
 * Supporta aggiornamenti in tempo reale tramite WebSocket e permette di modificare o eliminare lo shortlink.
 *
 * Funzionalità principali:
 * - Visualizzazione del conteggio totale delle visite
 * - Grafico a barre delle visite giornaliere
 * - Filtro per intervallo di date personalizzabile
 * - Modalità live per aggiornamenti in tempo reale
 * - Tabella paginata e ricercabile con i dettagli delle visite
 * - Modifica e eliminazione dello shortlink
 * - Generazione di codice QR per lo shortlink
 * - Supporto per il cambio di tema (chiaro/scuro)
 */
@Component({
  selector: 'app-details-page',
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    CardModule,
    PaginatorModule,
    ToggleButtonModule,
    DraggableModal,
    LucideAngularModule,
    QRCodeComponent
  ],
  templateUrl: './shortlink-details-page.html'
})
export class ShortLinkDetailsPage implements OnInit, OnDestroy {
  /** Reference to the QR code element for download functionality */
  @ViewChild('qrCodeComponent') qrCodeElement!: ElementRef;

  /** Codice breve dell'URL di cui visualizzare i dettagli */
  shortCode: string = '';

  /** Dettagli completi dell'URL */
  urlDetails: any = null;

  /** Contiene i dati delle statistiche dell'URL ricevuti dal server */
  urlStats: any = null;

  /** Indica se è in corso il caricamento dei dati dal server */
  loading: boolean = true;

  /** Indica se la modalità live è attiva */
  liveMode: boolean = true;

  /** Data di inizio per il filtro dell'intervallo di date (default: 7 giorni fa) */
  startDate: Date = new Date();

  /** Data di fine per il filtro dell'intervallo di date (default: oggi) */
  endDate: Date = new Date();

  /** Dati formattati per il grafico a barre delle visite giornaliere */
  visitsByDayData: any;

  /** Opzioni di configurazione per il grafico a barre delle visite giornaliere */
  visitsByDayOptions: any;

  /** Array completo delle visite ricevute dal server */
  visits: any[] = [];

  /** Array filtrato delle visite in base alla ricerca dell'utente */
  filteredVisits: any[] = [];

  /** Valore corrente del filtro di ricerca globale */
  globalFilter: string = '';

  /** Colore del testo/griglia nei grafici, cambia in base al tema (chiaro/scuro) */
  graphTextColor: string = "#495057";
  gridColor: string = "#ebedef";

  /** Flag per i vari modal */
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  showQrModal: boolean = false;

  /** Dati per il form di modifica */
  editFormData: EditUrlRequest = {
    originalUrl: ''
  };

  /** Sottoscrizioni agli observable */
  private themeChangeSubscription!: Subscription;
  private wsSubscription!: Subscription;
  private paramSubscription!: Subscription;

  /** Icone per i pulsanti */
  protected readonly RefreshCwIcon = RefreshCwIcon;
  protected readonly AlertTriangleIcon = AlertTriangleIcon;
  protected readonly EditIcon = EditIcon;
  protected readonly TrashIcon = TrashIcon;
  protected readonly QrCodeIcon = QrCodeIcon;
  protected readonly LinkIcon = LinkIcon;
  protected readonly DownloadIcon = DownloadIcon;

  /**
   * Inizializza il componente e imposta l'intervallo di date predefinito.
   *
   * @param route Servizio per accedere ai parametri della rotta
   * @param urlService Servizio per le chiamate API relative agli URL
   * @param webSocketService Servizio per la connessione WebSocket
   * @param notificationService Servizio per la visualizzazione delle notifiche
   * @param themeService Servizio per la gestione del tema dell'applicazione
   */
  constructor(
    private route: ActivatedRoute,
    private urlService: UrlService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {
    // Imposta il range di date predefinito a 7 giorni fa fino ad oggi
    this.startDate.setDate(this.startDate.getDate() - 7);
  }

  /**
   * Imposta il colore del testo nei grafici in base al tema corrente.
   * Nonostante il nome, imposta anche il colore della griglia.
   * Utilizza un colore chiaro per il tema scuro e viceversa.
   *
   * @param theme Il tema corrente ('dark' o 'light')
   */
  setGraphTextColor(theme: string) {
    this.graphTextColor = (theme == 'dark' ? '#ebedef' : '#495057');
    this.gridColor = (theme == 'dark' ? '#495057' : '#d8d9dc'); // Colore della griglia
  }

  /**
   * Copia l'URL accorciato negli appunti.
   * Utilizza l'API Clipboard per copiare il testo e mostra una notifica di successo o errore.
   */
  copyToClipboard() {
    if (this.urlDetails?.shortUrl) {
      navigator.clipboard.writeText(this.urlDetails.shortUrl).then(() => {
        this.notificationService.notify('URL copiato negli appunti!');
      }).catch(err => {
        this.notificationService.notify('Impossibile copiare URL negli appunti:  ' + err, 5000);
      });
    }
  }

  /**
   * Verifica se lo shortlink è scaduto.
   * Controlla la data di scadenza e restituisce true se è scaduto, false altrimenti.
   *
   * @returns true se lo shortlink è scaduto, false altrimenti
   */
  isShortlinkExpired(): boolean {
    if (this.urlDetails?.expirationDate && this.urlDetails.expirationDate !== 'never') {
      const expirationDate = new Date(this.urlDetails.expirationDate);
      return expirationDate < new Date();
    }
    return false;
  }

  /**
   * Inizializza il componente al momento del caricamento.
   * Ottiene il codice breve dai parametri della rotta, carica i dettagli dell'URL,
   * imposta il colore del testo dei grafici in base al tema corrente e si sottoscrive
   * ai cambiamenti di tema e agli aggiornamenti WebSocket.
   */
  ngOnInit() {
    // Ottiene il codice breve dai parametri della rotta
    this.paramSubscription = this.route.params.subscribe(params => {
      this.shortCode = params['shortLink'];
      this.loadUrlDetails();
      this.loadUrlStats();
    });

    // Imposta il colore del testo dei grafici in base al tema corrente
    this.setGraphTextColor(
      this.themeService.getCurrentThemeFromLocalStorage()
    );

    // Sottoscrizione ai cambiamenti di tema per aggiornare i colori dei grafici
    this.themeChangeSubscription = this.themeService.themeChange$.subscribe((theme: string) => {
      this.setGraphTextColor(theme);
      if (!this.liveMode) {
        this.loadUrlStats();
      }
    });
  }

  /**
   * Eseguito alla distruzione del componente.
   * Annulla tutte le sottoscrizioni per evitare memory leak.
   */
  ngOnDestroy() {
    if (this.themeChangeSubscription) {
      this.themeChangeSubscription.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
    // Annulla la sottoscrizione al WebSocket
    this.webSocketService.unsubscribeAll();
  }

  /**
   * Carica i dettagli dell'URL dal server.
   * Ottiene informazioni come l'URL originale, la data di creazione, ecc.
   */
  loadUrlDetails() {
    this.urlService.getUserUrls().subscribe({
      next: (urls) => {
        const url = urls.find(u => u.shortCode === this.shortCode);
        if (url) {
          this.urlDetails = url;
          this.editFormData.originalUrl = url.originalUrl;
          if (url.expirationDate && url.expirationDate !== 'never') {
            this.editFormData.expirationDate = url.expirationDate;
          }
        } else {
          this.notificationService.notify('URL non trovato', 5000);
        }
      },
      error: (error) => {
        this.notificationService.notify('Errore durante il caricamento dei dettagli dell\'URL: ' + error, 5000);
      }
    });
  }

  /**
   * Carica le statistiche dell'URL dal server.
   * Se la modalità live è attiva, utilizza getUrlStats, altrimenti utilizza getUrlStatsWithRange
   * con l'intervallo di date selezionato.
   */
  loadUrlStats() {
    this.loading = true;

    if (this.liveMode) {
      // In modalità live, utilizza getUrlStats e sottoscrive agli aggiornamenti WebSocket
      this.urlService.getUrlStats(this.shortCode).subscribe({
        next: (data) => {
          this.urlStats = data;
          this.visits = data.visits;
          this.filteredVisits = [...this.visits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
          this.prepareChartData();
          this.loading = false;

          // Sottoscrive agli aggiornamenti WebSocket
          this.subscribeToWebSocketUpdates();
        },
        error: (error) => {
          this.notificationService.notify('Errore durante il caricamento delle statistiche: ' + error, 5000);
          this.loading = false;
        }
      });
    } else {
      // In modalità non live, utilizza getUrlStatsWithRange con l'intervallo di date selezionato
      const dateRange: DateRangeRequest = {
        startDate: this.formatDate(this.startDate),
        endDate: this.formatDate(this.endDate, true), // true per includere l'intero giorno finale
      };

      this.urlService.getUrlStatsWithRange(this.shortCode, dateRange).subscribe({
        next: (data) => {
          this.urlStats = data;
          this.visits = data.visits;
          this.filteredVisits = [...this.visits];
          this.prepareChartData();
          this.loading = false;

          // Annulla la sottoscrizione al WebSocket in modalità non live
          this.webSocketService.unsubscribe(`/topic/url/${this.shortCode}`);
          if (this.wsSubscription) {
            this.wsSubscription.unsubscribe();
          }
        },
        error: (error) => {
          this.notificationService.notify('Errore durante il caricamento delle statistiche: ' + error, 5000);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Sottoscrive agli aggiornamenti WebSocket per l'URL corrente.
   * Quando arriva un nuovo aggiornamento, aggiorna i dati delle visite e i grafici.
   */
  subscribeToWebSocketUpdates() {
    // Annulla eventuali sottoscrizioni precedenti
    this.webSocketService.unsubscribeAll();
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }

    // Sottoscrive agli aggiornamenti WebSocket
    this.wsSubscription = this.webSocketService.subscribe(`/topic/url/${this.shortCode}`).subscribe(
      (message) => {
        // Aggiunge la nuova visita all'inizio dell'array
        this.visits.unshift(message.lastVisit);
        this.filteredVisits = [...this.visits];

        // Aggiorna il conteggio totale delle visite
        if (this.urlStats) {
          this.urlStats.visitCount++;
        }

        // Aggiorna i grafici
        this.prepareChartData();
      }
    );
  }

  /**
   * Prepara i dati per i grafici delle statistiche.
   * Configura il grafico a barre delle visite giornaliere.
   */
  prepareChartData() {
    // Prepara i dati per il grafico delle visite giornaliere
    const visitsByDay = this.groupVisitsByDay();

    // Configura il dataset per il grafico a barre delle visite giornaliere
    this.visitsByDayData = {
      labels: Object.keys(visitsByDay), // Date come etichette
      datasets: [
        {
          label: 'Visite giornaliere',
          data: Object.values(visitsByDay), // Conteggio visite come dati
          backgroundColor: '#42A5F5', // Colore delle barre
          borderColor: '#1E88E5', // Colore del bordo delle barre
          borderWidth: 1
        }
      ]
    };

    // Configura le opzioni per il grafico a barre
    this.visitsByDayOptions = {
      plugins: {
        legend: {
          labels: {
            color: this.graphTextColor // Colore del testo della legenda basato sul tema
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: this.graphTextColor // Colore del testo dell'asse X basato sul tema
          },
          grid: {
            color: this.gridColor // Colore della griglia
          }
        },
        y: {
          ticks: {
            color: this.graphTextColor // Colore del testo dell'asse Y basato sul tema
          },
          grid: {
            color: this.gridColor
          }
        }
      }
    };
  }

  /**
   * Raggruppa le visite per giorno, assicurandosi che tutti i giorni nell'intervallo
   * di date selezionato siano inclusi, anche quelli senza visite.
   *
   * @returns Un oggetto con le date come chiavi e il conteggio delle visite come valori
   */
  groupVisitsByDay() {
    const visitsByDay: { [key: string]: number } = {};

    // Crea un array di date che copre tutto l'intervallo selezionato
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // Resetta le ore per confrontare solo le date
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Inizializza tutti i giorni nell'intervallo con zero visite
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      let actualDay = new Date(day);
      // stesso problema di homepage??
      actualDay.setDate(actualDay.getDate() + 1);
      const dateStr = actualDay.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      visitsByDay[dateStr] = 0;
    }

    // Conta le visite effettive per ogni giorno
    this.visits.forEach(visit => {
      const date = visit.visitDate.split('T')[0];
      if (visitsByDay[date] !== undefined) {
        visitsByDay[date]++;
      }
    });

    // Ordina i giorni cronologicamente
    const sortedVisitsByDay: { [key: string]: number } = {};
    Object.keys(visitsByDay).sort().forEach(key => {
      sortedVisitsByDay[key] = visitsByDay[key];
    });

    return sortedVisitsByDay;
  }

  /**
   * Gestisce il cambio di modalità (live/non live).
   * Se la modalità live viene attivata, disabilita il filtro per data e carica i dati in tempo reale.
   * Se la modalità live viene disattivata, abilita il filtro per data e carica i dati filtrati.
   */
  onLiveModeChange() {
    this.loadUrlStats();
  }

  /**
   * Applica il filtro dell'intervallo di date e ricarica le statistiche.
   * Viene chiamato quando l'utente clicca sul pulsante di applicazione del filtro.
   */
  applyFilter() {
    // Disattiva la modalità live quando si applica un filtro per data
    this.liveMode = false;
    this.loadUrlStats();
  }

  /**
   * Gestisce il filtro globale sulla tabella delle visite.
   * Filtra le visite in base al testo inserito dall'utente, cercando corrispondenze
   * nell'indirizzo IP o nell'user agent.
   *
   * @param event L'evento di input dal campo di ricerca
   */
  onGlobalFilter(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredVisits = this.visits.filter(visit =>
      visit.ipAddress.toLowerCase().includes(searchValue) ||
      visit.userAgent.toLowerCase().includes(searchValue)
    );
  }

  /**
   * Formatta una data nel formato richiesto dall'API.
   * Per le date di fine, imposta l'orario a 23:59:59 per includere l'intero giorno.
   *
   * @param date La data da formattare
   * @param isEndDate Flag che indica se è una data di fine intervallo
   * @returns La data formattata come stringa nel formato ISO (YYYY-MM-DDTHH:MM:SS)
   */
  formatDate(date: Date, isEndDate: boolean = false): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Se è la data di fine, setta l'ora a 23:59:59 per includere tutto il giorno
    if (isEndDate) {
      return `${year}-${month}-${day}T23:59:59`;
    }

    return `${year}-${month}-${day}T00:00:00`;
  }

  /**
   * Verifica se il conteggio delle visite è zero.
   * Gestisce anche il caso in cui urlStats non sia ancora disponibile.
   *
   * @returns true se non ci sono visite o se i dati non sono disponibili, false altrimenti
   */
  isVisitCountZero(): boolean {
    try {
      return this.urlStats.visitCount === 0;
    } catch (ignored) {
      return true; // Assume zero se c'è un errore
    }
  }

  /**
   * Apre il modal per la modifica dell'URL.
   */
  openEditModal() {
    this.showEditModal = true;
  }

  /**
   * Gestisce la modifica dell'URL.
   * Invia la richiesta di modifica al server e aggiorna i dati locali.
   */
  editUrl() {
    this.urlService.editUrl(this.shortCode, this.editFormData).subscribe({
      next: (response) => {
        this.notificationService.notify('URL modificato con successo', 5000);
        this.showEditModal = false;
        this.loadUrlDetails();
      },
      error: (error) => {
        this.notificationService.notify('Errore durante la modifica dell\'URL: ' + error, 5000);
      }
    });
  }

  /**
   * Apre il modal per l'eliminazione dell'URL.
   */
  openDeleteModal() {
    this.showDeleteModal = true;
  }

  /**
   * Gestisce l'eliminazione dell'URL.
   * Invia la richiesta di eliminazione al server e reindirizza l'utente alla home page.
   */
  deleteUrl() {
    this.urlService.deleteUrl(this.shortCode).subscribe({
      next: (response) => {
        this.notificationService.notify('URL eliminato con successo', 5000);
        this.showDeleteModal = false;
        // Reindirizza alla home page
        window.location.href = '/';
      },
      error: (error) => {
        this.notificationService.notify('Errore durante l\'eliminazione dell\'URL: ' + error, 5000);
      }
    });
  }

  /**
   * Apre il modal per la generazione del codice QR.
   */
  openQrModal() {
    this.showQrModal = true;
  }

  /**
   * Scarica il codice QR come immagine PNG.
   * Converte l'elemento SVG del QR code in un'immagine e la scarica.
   */
  downloadQrCode() {
    downloadCanvasAsImage(this.shortCode)
  }

  protected readonly ClipboardCopyIcon = ClipboardCopyIcon;
}
