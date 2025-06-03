import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {Fit, Layout, Rive, StateMachineInput} from '@rive-app/canvas';
import {firstValueFrom, timer} from 'rxjs';
import {FormsModule} from '@angular/forms';

// FORM DI TEST ANIMATO, non va :(

@Component({
  selector: 'app-rive-form',
  imports: [
    FormsModule
  ],
  templateUrl: './rive-form.html',
  styleUrl: './rive-form.css'
})
export class RiveForm implements AfterViewInit{
  @ViewChild('riveCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private rive: Rive | undefined;
  private submitInput: StateMachineInput | undefined;
  private finishedInput: StateMachineInput | undefined;

  shortName = signal("")
  expirationDate = signal("")
  fullLink = signal("")

  ngAfterViewInit(): void {
    this.rive = new Rive({
      src: 'anibox.riv',
      canvas: this.canvasRef.nativeElement,
      stateMachines: ['State Machine 1'], // Cambia col nome reale
      autoplay: true,
      layout: new Layout({
        fit: Fit.Contain, // 👈 Cambia questo per altri comportamenti
      }),
      onLoad: () => {
        this.submitInput = this.rive?.stateMachineInputs('State Machine 1')
          .find(input => input.name === 'Submit');
        this.finishedInput = this.rive?.stateMachineInputs('State Machine 1')
          .find(input => input.name === 'FInished');
        console.log(this.rive?.stateMachineInputs('State Machine 1'));
      }
    });
    this.canvasRef.nativeElement.style.zIndex = '-1';
  }

  async onSubmit() {
    const responseP = document.getElementById('response')!;
    // this.canvasRef.nativeElement.style.zIndex = '2';
    console.log(this.shortName());
    console.log(this.expirationDate());
    console.log(this.fullLink());
    if (this.submitInput && this.submitInput.fire) {
      this.submitInput.fire();
    } else {
      console.warn('Trigger non trovato o non pronto');
    }

    const form = document.getElementById('form');
    form!.classList.remove('animate-down');
    void form!.offsetWidth; // forza il reflow
    form!.classList.add('animate-down');

    await firstValueFrom(timer(6000));
    form!.style.display = 'none';

    if (this.finishedInput && this.finishedInput.fire) {
      this.finishedInput.fire();
    } else {
      console.warn('Trigger non trovato o non pronto');
    }
    await firstValueFrom(timer(1000));

    // this.canvasRef.nativeElement.style.zIndex = '-1';

    responseP.style.display = 'block';
    responseP.classList.add('animate-up');

  }
}
