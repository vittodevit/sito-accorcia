import { Component } from '@angular/core';
import { AuthService} from '../../services/auth.service';
import { LucideAngularModule, SunMoonIcon } from "lucide-angular";
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
    imports: [
        LucideAngularModule
    ],
  templateUrl: './header.html'
})
export class Header {
  profilePictureUrl: string = "";
  username: string = "";

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.profilePictureUrl = this.authService.getProfilePicture();
    this.username = this.authService.getUsername() || 'Utente';
  }

  logout() {
    this.authService.logout();
  }

  themeSwitch() {
    this.themeService.emitThemeChange();
  }

  protected readonly SunMoonIcon = SunMoonIcon;
}
