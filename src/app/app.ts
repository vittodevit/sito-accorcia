import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showNav: boolean = false;

  constructor(
    private router: Router,
  ) {
    // hides navbar on login page
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNav = !event.url.includes('/login');
      }
    });
  }
}
