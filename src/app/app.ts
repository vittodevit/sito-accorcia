import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  apiUrl: string = "";

  constructor() {
    this.apiUrl = environment.API_URL;
  }
}
