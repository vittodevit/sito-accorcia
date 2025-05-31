import { Routes } from '@angular/router';
import {LoginPage} from './pages/login-page/login-page';
import {HomePage} from './pages/home-page/home-page';
import {LoginGuard} from './utils/login.guard';
import {AuthGuard} from './utils/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [LoginGuard]
  },
  {
    path: '',
    component: HomePage,
    canActivate: [AuthGuard]
  },
];
