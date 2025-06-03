import { Component, OnInit, OnDestroy } from '@angular/core';
import { UrlService } from '../../services/url.service';
import { DateRangeRequest } from '../../dto/DateRangeRequest';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { NotificationService } from '../../services/notification.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import {
  LucideAngularModule,
  PlusCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon
} from 'lucide-angular';
import md5 from 'md5';

/**
 * Componente della pagina principale (dashboard) dell'applicazione.
 *
 * Questa pagina visualizza statistiche dettagliate sulle visite agli URL accorciati dell'utente,
 * inclusi grafici interattivi e una tabella paginata e ricercabile con i dettagli delle visite.
 *
 * Funzionalità principali:
 * - Visualizzazione del conteggio totale delle visite
 * - Grafico a barre delle visite giornaliere
 * - Grafico a torta della distribuzione delle visite per shortlink
 * - Filtro per intervallo di date personalizzabile
 * - Tabella paginata e ricercabile con i dettagli delle visite
 * - Supporto per il cambio di tema (chiaro/scuro)
 */

@Component({
  selector: 'app-home-page',
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
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './home-page.html',
})
export class HomePage implements OnInit, OnDestroy {
  /**
   * Contiene i dati delle statistiche dell'account ricevuti dal server.
   * Include il conteggio totale delle visite, il contatore dettagliato per shortlink
   * e l'elenco completo delle visite.
   */
  accountStats: any = null;

  /** Indica se è in corso il caricamento dei dati dal server */
  loading: boolean = true;

  /**
   * Dati formattati per il grafico a barre delle visite giornaliere.
   * Struttura conforme alle specifiche di Chart.js.
   */
  visitsByDayData: any;

  /**
   * Opzioni di configurazione per il grafico a barre delle visite giornaliere.
   * Include impostazioni per legenda, assi e colori.
   */
  visitsByDayOptions: any;

  /**
   * Dati formattati per il grafico a torta delle visite per shortlink.
   * Struttura conforme alle specifiche di Chart.js.
   */
  totalVisitsData: any;

  /**
   * Opzioni di configurazione per il grafico a torta delle visite per shortlink.
   * Include impostazioni per legenda, tooltip e colori.
   */
  totalVisitsOptions: any;

  /** Data di inizio per il filtro dell'intervallo di date (default: 7 giorni fa) */
  startDate: Date = new Date();

  /** Data di fine per il filtro dell'intervallo di date (default: oggi) */
  endDate: Date = new Date();

  /** Array completo delle visite ricevute dal server */
  visits: any[] = [];

  /** Array filtrato delle visite in base alla ricerca dell'utente */
  filteredVisits: any[] = [];

  /** Valore corrente del filtro di ricerca globale */
  globalFilter: string = '';

  /** Colore del testo/griglia nei grafici, cambia in base al tema (chiaro/scuro) */
  graphTextColor: string = "#495057";
  gridColor: string = "#ebedef";

  /** Sottoscrizione all'observable dei cambiamenti di tema */
  private themeChangeSubscription!: Subscription;

  /**
   * Inizializza il componente e imposta l'intervallo di date predefinito.
   *
   * @param urlService Servizio per le chiamate API relative agli URL
   * @param notificationService Servizio per la visualizzazione delle notifiche
   * @param themeService Servizio per la gestione del tema dell'applicazione
   */
  constructor(
    private urlService: UrlService,
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
   * Inizializza il componente al momento del caricamento.
   * Carica le statistiche dell'account, imposta il colore del testo dei grafici
   * in base al tema corrente e si sottoscrive ai cambiamenti di tema.
   */
  ngOnInit() {
    this.loadAccountStats();
    this.setGraphTextColor(
      this.themeService.getCurrentThemeFromLocalStorage()
    )
    // iscrizione a evento del cambio del tema per aggiornare i colori dei grafici
    this.themeChangeSubscription = this.themeService.themeChange$.subscribe((theme: string) => {
      this.setGraphTextColor(theme);
      this.loadAccountStats();
    });
  }

  /**
   * Eseguito alla distruzione del componente.
   * Annulla la sottoscrizione ai cambiamenti di tema per evitare memory leak.
   */
  ngOnDestroy() {
    this.themeChangeSubscription.unsubscribe();
  }

  /**
   * Carica le statistiche dell'account dal server per l'intervallo di date selezionato.
   * Imposta i dati per i grafici e la tabella, gestendo anche gli errori.
   */
  loadAccountStats() {
    this.loading = true;

    // Prepara l'oggetto di richiesta con l'intervallo di date formattato
    const dateRange: DateRangeRequest = {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate, true), // true per includere l'intero giorno finale
    };

    // Effettua la chiamata API per ottenere le statistiche
    this.urlService.getAccountStats(dateRange).subscribe({
      next: (data) => {
        // Memorizza i dati ricevuti
        this.accountStats = data;
        this.visits = data.visits;
        this.filteredVisits = [...this.visits]; // Copia per il filtro

        // Prepara i dati per i grafici
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.notify('Errore durante il caricamento delle statistiche: ' + error, 5000);
        this.loading = false;
      }
    });
  }

  /**
   * Prepara i dati per i grafici delle statistiche.
   * Configura sia il grafico a barre delle visite giornaliere che
   * il grafico a torta della distribuzione delle visite per shortlink.
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

    // Prepara i dati per il grafico a torta delle visite per shortlink
    if (this.accountStats.visitDetailedCounter) {
      // Estrae i codici brevi e i conteggi delle visite
      const shortCodes = Object.keys(this.accountStats.visitDetailedCounter);
      const visitCounts = Object.values(this.accountStats.visitDetailedCounter);

      // Genera colori consistenti per ogni shortlink
      const backgroundColors =
        shortCodes.map(shortCode => this.generateColorFromShortlink(shortCode));

      // Crea versioni più chiare dei colori per l'effetto hover
      const hoverBackgroundColors =
        backgroundColors.map(color => this.lightenColor(color, 10));

      // Configura il dataset per il grafico a torta
      this.totalVisitsData = {
        labels: shortCodes,
        datasets: [
          {
            label: 'Visite per shortlink',
            data: visitCounts,
            backgroundColor: backgroundColors,
            hoverBackgroundColor: hoverBackgroundColors
          }
        ]
      };
    } else {
      // Fallback se visitDetailedCounter non è disponibile
      this.totalVisitsData = {
        labels: ['Visite Totali'],
        datasets: [
          {
            label: 'Visite Totali',
            data: [this.accountStats.visitCount],
            backgroundColor: ['#66BB6A'],
            hoverBackgroundColor: ['#81C784']
          }
        ]
      };
    }

    // Configura le opzioni per il grafico a torta
    this.totalVisitsOptions = {
      plugins: {
        legend: {
          labels: {
            color: this.graphTextColor // Colore del testo della legenda basato sul tema
          }
        },
        tooltip: {
          callbacks: {
            // Personalizza il tooltip per mostrare percentuale e valore
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              // Calcola la percentuale sul totale
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
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
      const actualDay = new Date();
      actualDay.setTime(day.getTime()); // Copia la data corrente
      // aggiungi un giorno per evitare problemi??? non so come mai
      actualDay.setDate(actualDay.getDate() + 1);
      const dateStr = actualDay.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      visitsByDay[dateStr] = 0;
    }

    // Conta le visite effettive per ogni giorno
    this.visits.forEach(visit => {
      const visitDate = new Date(visit.visitDate);
      const localDateStr = visitDate.toISOString().split('T')[0]; // Adjust for time zone
      if (visitsByDay[localDateStr] !== undefined) {
        visitsByDay[localDateStr]++;
      }else{
        // Se la data non è nell'intervallo, non la consideriamo
        console.warn(`Visita con data ${visit.visitDate} fuori dall'intervallo selezionato`);
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
   * Applica il filtro dell'intervallo di date e ricarica le statistiche.
   * Viene chiamato quando l'utente clicca sul pulsante di applicazione del filtro.
   */
  applyFilter() {
    this.loadAccountStats();
  }

  /**
   * Gestisce il filtro globale sulla tabella delle visite.
   * Filtra le visite in base al testo inserito dall'utente, cercando corrispondenze
   * nel codice breve, nell'indirizzo IP o nell'user agent.
   *
   * @param event L'evento di input dal campo di ricerca
   */
  onGlobalFilter(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredVisits = this.visits.filter(visit =>
      visit.shortCode.toLowerCase().includes(searchValue) ||
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
   * Genera un colore consistente per un dato shortlink utilizzando una funzione di hash.
   * Lo stesso shortlink genererà sempre lo stesso colore, garantendo coerenza visiva.
   *
   * @param shortlink Lo shortlink per cui generare il colore
   * @returns Un colore in formato esadecimale (es. #FF5733)
   */
  generateColorFromShortlink(shortlink: string): string {
    // Genera un hash md5 dello shortlink
    const hash = md5(shortlink);

    // converti l'ultimo carattere dell'hash in un numero decimale (0-15)
    const lastChar = parseInt(hash[hash.length - 1], 16); // 16 perche l'hash è in esadecimale

    // Usa 6 caratteri dell'hash (con offset lastChar a partire da 0) per il colore
    // Questo garantisce che lo stesso shortlink ottenga sempre lo stesso colore
    return '#' + hash.substring((lastChar), 6 + (lastChar));
  }

  /**
   * Schiarisce un colore di una data percentuale.
   * Utile per creare effetti hover nei grafici.
   *
   * @param color Il colore esadecimale da schiarire
   * @param percent La percentuale di schiarimento
   * @returns Il colore schiarito in formato esadecimale
   */
  lightenColor(color: string, percent: number): string {
    // Rimuove il # se presente
    color = color.replace('#', '');

    // Converte in RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Schiarisce
    const lightenR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    const lightenG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    const lightenB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    // Converte di nuovo in esadecimale
    const rHex = lightenR.toString(16).padStart(2, '0');
    const gHex = lightenG.toString(16).padStart(2, '0');
    const bHex = lightenB.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * Verifica se il conteggio delle visite è zero.
   * Gestisce anche il caso in cui accountStats non sia ancora disponibile.
   *
   * @returns true se non ci sono visite o se i dati non sono disponibili, false altrimenti
   */
  isVisitCountZero(): boolean {
    try {
      return this.accountStats.visitCount === 0;
    } catch (ignored) {
      return true; // Assume zero se c'è un errore
    }
  }

  protected readonly PlusCircleIcon = PlusCircleIcon;
  protected readonly AlertTriangleIcon = AlertTriangleIcon;
  protected readonly RefreshCwIcon = RefreshCwIcon;
}
