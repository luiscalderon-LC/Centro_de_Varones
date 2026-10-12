import { Routes } from '@angular/router';
import { Inicio } from './features/landing/pages/inicio/inicio';
import { LoginDocente } from './features/auth/pages/login-docente/login-docente';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login-docente', component: LoginDocente },
  { path: '**', redirectTo: '' }
];