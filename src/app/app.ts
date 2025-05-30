import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ApiConfigService} from './services/api-config.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  apiUrl: string = "";

  constructor(
    apiConfigService: ApiConfigService,
  ) {
    this.apiUrl = apiConfigService.getApiUrl();
  }
}
