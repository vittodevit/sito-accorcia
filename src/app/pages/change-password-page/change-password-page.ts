import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputField } from '../../components/input-field/input-field';
import { KeyRoundIcon, KeySquareIcon } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ChangePasswordRequest } from '../../dto/ChangePasswordRequest';

@Component({
  selector: 'app-change-password-page',
  imports: [
    FormsModule,
    InputField,
    ReactiveFormsModule
  ],
  templateUrl: './change-password-page.html',
})
export class ChangePasswordPage {

  oldPassword: string = '';
  password: string = '';
  passwordConfirm: string = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    // valida i campi non validati dal backend
    if (this.password !== this.passwordConfirm) {
      this.notificationService.notify('Le password non corrispondono');
      return;
    }

    let changePasswordRequest: ChangePasswordRequest = {
      oldPassword: this.oldPassword,
      newPassword: this.password
    };

    this.authService.changePassword(changePasswordRequest).subscribe({
      next: () => {
        this.notificationService.notify('Password cambiata con successo');
        this.authService.redirectToHomepage()
      },
      error: (error) => {
        this.notificationService.notify('Errore durante il cambio password: ' + error, 5000);
      }
    });
  }

  protected readonly KeyRoundIcon = KeyRoundIcon;
  protected readonly KeySquareIcon = KeySquareIcon;
}
