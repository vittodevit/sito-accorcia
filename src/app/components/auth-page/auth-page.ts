import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, SunMoonIcon } from 'lucide-angular';
import {ThemeService} from '../../services/theme.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPage {
  @Input() title: string = '';
  @Input() linkText: string = '';
  @Input() linkRoute: string = '';
  @Input() linkPrompt: string = '';

  sunMoonIcon = SunMoonIcon;

  constructor(
    private themeService: ThemeService
  ) {}

  themeSwitch() {
    this.themeService.emitThemeChange();
  }
}
