import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

/**
 * Servizio per la gestione delle connessioni WebSocket.
 * Fornisce funzionalità per connettersi, disconnettersi e sottoscriversi a topic WebSocket.
 * Gestisce automaticamente la riconnessione quando l'utente effettua il login.
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private connected = false;
  private subscriptions: Map<string, any> = new Map();
  private messageSubjects: Map<string, Subject<any>> = new Map();

  constructor(private authService: AuthService) {
    // Riconnetti quando l'utente effettua il login
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated && !this.connected) {
        this.connect();
      } else if (!isAuthenticated && this.connected) {
        this.disconnect();
      }
    });
  }

  /**
   * Si connette al server WebSocket
   */
  connect(): void {
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);

    // Aggiunge il token JWT alla connessione WebSocket
    const headers = {
      'Authorization': `Bearer ${this.authService.getToken()}`
    };

    this.stompClient.connect(headers, () => {
      this.connected = true;
      console.log('WebSocket connesso');

      // Risottoscrive a tutti i topic
      this.subscriptions.forEach((subscription, topic) => {
        this.subscribeToTopic(topic);
      });
    }, (error: any) => {
      console.error('Errore di connessione WebSocket:', error);
      this.connected = false;

      // Prova a riconnettersi dopo un ritardo
      setTimeout(() => {
        if (this.authService.isAuthenticated()) {
          this.connect();
        }
      }, 5000);
    });
  }

  /**
   * Si disconnette dal server WebSocket
   */
  disconnect(): void {
    if (this.stompClient && this.connected) {
      // Annulla la sottoscrizione da tutti i topic
      this.subscriptions.forEach(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });

      this.stompClient.disconnect();
      this.connected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnesso');
    }
  }

  /**
   * Sottoscrive a un topic WebSocket
   * @param topic Il topic a cui sottoscriversi
   * @returns Un Observable che emette messaggi dal topic
   */
  subscribe(topic: string): Observable<any> {
    if (!this.messageSubjects.has(topic)) {
      this.messageSubjects.set(topic, new Subject<any>());
    }

    if (this.connected && !this.subscriptions.has(topic)) {
      this.subscribeToTopic(topic);
    } else if (!this.connected && this.authService.isAuthenticated()) {
      // Se non connesso ma autenticato, prova a connettersi
      this.connect();
    }

    return this.messageSubjects.get(topic)!.asObservable();
  }

  /**
   * Annulla la sottoscrizione da un topic WebSocket
   * @param topic Il topic da cui annullare la sottoscrizione
   */
  unsubscribe(topic: string): void {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  /**
     * Annulla la sottoscrizione da tutti i topic WebSocket.
     * Utilizzare questo metodo per rimuovere tutte le sottoscrizioni attive.
     */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Metodo di supporto per sottoscriversi a un topic e configurare il gestore di messaggi
   * @param topic Il topic a cui sottoscriversi
   */
  private subscribeToTopic(topic: string): void {
    const subscription = this.stompClient.subscribe(topic, (message: any) => {
      if (message.body) {
        const messageBody = JSON.parse(message.body);
        const subject = this.messageSubjects.get(topic);
        if (subject) {
          subject.next(messageBody);
        }
      }
    });

    this.subscriptions.set(topic, subscription);
  }
}
