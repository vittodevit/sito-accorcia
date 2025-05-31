import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService
  ) {}

  onSubmit() {
    let loginRequest: LoginRequest = {
      username: this.username,
      password: this.password
    }

    this.authService.login(loginRequest).subscribe()
  }
}
