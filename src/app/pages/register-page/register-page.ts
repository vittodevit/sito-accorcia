import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../dto/RegisterRequest';
import { KeyRoundIcon, MailIcon, UserIcon, TicketIcon } from 'lucide-angular';
import { AuthPage } from '../../components/auth-page/auth-page';
import { InputField } from '../../components/input-field/input-field';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-register-page',
  imports: [
    FormsModule,
    AuthPage,
    InputField
  ],
  templateUrl: './register-page.html'
})
export class RegisterPage {

  protected readonly MailIcon = MailIcon;
  protected readonly KeyRoundIcon = KeyRoundIcon;
  protected readonly UserIcon = UserIcon;
  protected readonly TicketIcon = TicketIcon;

  username: string = '';
  email: string = '';
  password: string = '';
  passwordConfirm: string = '';
  inviteCode: string = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    // validazione locale dei campi non validati dal backend
    if (this.password !== this.passwordConfirm) {
      this.notificationService.notify('Le password non corrispondono', 3000);
      return;
    }

    let registerRequest: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password,
      inviteCode: this.inviteCode
    }

    this.authService.register(registerRequest).subscribe({
      next: () => {
        // effettua il login automatico dopo la registrazione
        this.authService.login({
          username: this.username,
          password: this.password
        }).subscribe();
      },
      error: (error) => {
        this.notificationService.notify('Registrazione fallita: ' + error, 5000);
      }
    });
  }
}
