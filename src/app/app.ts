import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import {
  LucideAngularModule,
  HomeIcon,
  KeyIcon,
  LinkIcon,
  PlusCircleIcon
} from 'lucide-angular';
import { NavItem } from './components/nav-item/nav-item';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    LucideAngularModule,
    NavItem,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly HomeIcon = HomeIcon;
  protected readonly PlusCircleIcon = PlusCircleIcon;
  protected readonly KeyIcon = KeyIcon;
  protected readonly LinkIcon = LinkIcon;

  // variabili di stato
  showNav: boolean = true;
  showSidebar: boolean = true;

  constructor(
    private router: Router,
  ) {
    // nasconde la navbar e sidebar nella pagina di login
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(event.url.includes('/login') || event.url.includes('/register')){
          this.showNav = false;
          this.showSidebar = false;
        } else {
          this.showNav = true;
          this.showSidebar = true;
        }
      }
    });
  }
}
