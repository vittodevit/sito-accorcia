import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPage {
  @Input() title: string = '';
  @Input() linkText: string = '';
  @Input() linkRoute: string = '';
  @Input() linkPrompt: string = '';
}
