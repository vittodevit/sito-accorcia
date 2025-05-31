import { Routes } from '@angular/router';
import {LoginPage} from './pages/login-page/login-page';
import {RegisterPage} from './pages/register-page/register-page';
import {HomePage} from './pages/home-page/home-page';
import {LoginGuard} from './utils/login.guard';
import {AuthGuard} from './utils/auth.guard';

/*
  * Mappatura associativa delle rotte dell'applicazione ai rispettivi componenti.
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [LoginGuard]
  },
  {
    path: '',
    component: HomePage,
    canActivate: [AuthGuard]
  },
];
