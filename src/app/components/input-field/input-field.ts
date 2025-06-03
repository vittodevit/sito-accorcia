import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/**
 * Componente di campo di input riutilizzabile. (per form relativi a sezione auth e new)
 * Implementa ControlValueAccessor per l'integrazione con i form di Angular.
 * Supporta icone, placeholder, diversi tipi di input e validazione required.
 */
@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './input-field.html',
  styles: [`
    .special-label {
      border-top: 1px solid var(--bs-border-color);
      border-left: 1px solid var(--bs-border-color);
      border-right: 1px solid var(--bs-border-color);
      padding-left: 8px;
      padding-right: 8px;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      margin-left: 5px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true
    }
  ]
})
export class InputField implements ControlValueAccessor {
  /** Icona da visualizzare nel campo di input */
  @Input() icon!: LucideIconData;
  /** Testo segnaposto da visualizzare quando il campo è vuoto */
  @Input() placeholder: string = '';
  /** Tipo di input (text, password, email, ecc.) */
  @Input() type: string = 'text';
  /** Nome del campo di input */
  @Input() name: string = '';
  /** Etichetta del campo di input */
  @Input() label: string = '';
  /** Indica se il campo è obbligatorio */
  @Input() required: boolean = false;

  /** Valore corrente del campo di input */
  value: string = '';
  /** Indica se il campo è disabilitato */
  disabled: boolean = false;

  /** Funzione di callback chiamata quando il valore cambia */
  onChange: any = () => {};
  /** Funzione di callback chiamata quando il campo viene toccato */
  onTouched: any = () => {};

  /**
   * Imposta il valore del campo di input.
   * Implementazione dell'interfaccia ControlValueAccessor.
   * @param value Il valore da impostare
   */
  writeValue(value: string): void {
    this.value = value;
  }

  /**
   * Registra una funzione da chiamare quando il valore cambia.
   * Implementazione dell'interfaccia ControlValueAccessor.
   * @param fn La funzione da chiamare
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registra una funzione da chiamare quando il campo viene toccato.
   * Implementazione dell'interfaccia ControlValueAccessor.
   * @param fn La funzione da chiamare
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Imposta lo stato di disabilitazione del campo.
   * Implementazione dell'interfaccia ControlValueAccessor.
   * @param isDisabled True se il campo deve essere disabilitato, false altrimenti
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Gestisce l'evento di modifica dell'input.
   * Aggiorna il valore e chiama le funzioni di callback.
   * @param event L'evento di input
   */
  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
