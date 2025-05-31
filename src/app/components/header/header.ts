import { Component } from '@angular/core';
import { AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
  ],
  templateUrl: './header.html'
})
export class Header {
  profilePictureUrl: string = "";
  username: string = "";

  constructor(
    private authService: AuthService
  ) {
    this.profilePictureUrl = this.authService.getProfilePicture();
    this.username = this.authService.getUsername() || 'Utente';
  }

  logout() {
    this.authService.logout();
  }
}
