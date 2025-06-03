import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { HomePage } from './pages/home-page/home-page';
import { LoginGuard } from './utils/login.guard';
import { AuthGuard } from './utils/auth.guard';
import { ChangePasswordPage } from './pages/change-password-page/change-password-page';
import { NewShortlinkPage } from './pages/new-shortlink-page/new-shortlink-page';
import { ShortLinkDetailsPage } from './pages/shortlink-details-page/shortlink-details-page';

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
  {
    path: 'chgpwd',
    component: ChangePasswordPage,
    canActivate: [AuthGuard]
  },
  {
    path: 'new',
    component: NewShortlinkPage,
    canActivate: [AuthGuard]
  },
  {
    path: 'sc/:shortLink',
    component: ShortLinkDetailsPage,
    canActivate: [AuthGuard]
  },
];
