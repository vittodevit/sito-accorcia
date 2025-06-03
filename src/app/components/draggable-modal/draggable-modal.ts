import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

/**
 * Componente per la creazione di finestre modali trascinabili.
 *
 * Questo componente crea una finestra modale che può essere trascinata
 * liberamente all'interno della finestra del browser. Utilizza il modulo
 * DragDropModule di Angular CDK per implementare la funzionalità di trascinamento.
 *
 * Caratteristiche principali:
 * - Overlay semi-trasparente che copre l'intera pagina
 * - Finestra modale con barra del titolo trascinabile
 * - Pulsante di chiusura
 * - Dimensione personalizzabile
 * - Supporto per la proiezione di contenuto tramite ng-content
 * - Eventi per la gestione della chiusura e delle modifiche ai dati
 */
@Component({
  selector: 'app-draggable-modal',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './draggable-modal.html',
  styleUrls: ['./draggable-modal.css'],
})
export class DraggableModal {
  /** Titolo visualizzato nella barra del titolo della finestra */
  @Input() title: string = 'Modal Title';

  /**
   * Dati da passare al contenuto della finestra.
   * Può essere utilizzato per condividere informazioni tra il componente che la apre
   * e il contenuto proiettato all'interno di essa.
   */
  @Input() data: any;

  /**
   * Se impostato a true, disabilita la classe CSS 'modal-body' sul contenitore del contenuto.
   * Utile quando si desidera personalizzare completamente lo stile del contenuto della finestra.
   */
  @Input() disableModalBodyClass: boolean = false;

  /**
   * Evento emesso quando la finestra viene chiusa.
   * Il componente padre può sottoscriversi a questo evento per eseguire azioni
   * quando l'utente chiude chiude quest'ultima.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Evento emesso quando i dati della finestra cambiano.
   * Può essere utilizzato per comunicare modifiche ai dati dal contenuto
   * di quest'ultima al componente padre.
   */
  @Output() dataChange = new EventEmitter<any>();

  /**
   * Larghezza della finestra .
   * Può essere specificata in qualsiasi unità CSS valida (px, %, em, rem, ecc.).
   */
  @Input() width: string = '400px';

  /**
   * Gestisce l'evento di chiusura della finestra.
   * Emette l'evento 'close' che può essere intercettato dal componente padre.
   */
  onClose() {
    this.close.emit();
  }
}
