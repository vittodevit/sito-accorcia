import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  apiUrl: string = "";

  constructor(
    private authService: AuthService
  ) {
    this.apiUrl = environment.BACKEND_BASE_URL;
  }

  logout() {
    this.authService.logout();
  }
}
