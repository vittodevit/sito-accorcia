import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './input-field.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true
    }
  ]
})
export class InputField implements ControlValueAccessor {
  @Input() icon!: LucideIconData;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() name: string = '';
  @Input() required: boolean = false;

  value: string = '';
  disabled: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
