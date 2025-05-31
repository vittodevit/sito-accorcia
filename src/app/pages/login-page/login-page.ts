import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../dto/LoginRequest';
import { KeyRoundIcon, UserIcon } from 'lucide-angular';
import { AuthPage } from '../../components/auth-page/auth-page';
import { InputField } from '../../components/input-field/input-field';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    AuthPage,
    InputField
  ],
  templateUrl: './login-page.html',
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

  protected readonly KeyRoundIcon = KeyRoundIcon;
  protected readonly UserIcon = UserIcon;
}
