
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthEstudianteService
} from '../../../../core/services/auth-estudiante';

@Component({
  selector: 'app-login-estudiante',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-estudiante.html',
  styleUrl: './login-estudiante.css'
})
export class LoginEstudiante {

  correo = '';
  password = '';

  cargando = false;
  mensaje = '';

  constructor(
    private auth: AuthEstudianteService,
    private router: Router
  ) {}

  ingresar(): void {

    if (this.cargando) {
      return;
    }

    if (!this.correo.trim() || !this.password) {
      this.mensaje = 'Ingrese su correo y contraseña.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.auth.ingresar(
      this.correo.trim(),
      this.password
    ).subscribe({

      next: estudiante => {

        this.cargando = false;

        if (estudiante.rol !== 'estudiante') {
          this.mensaje = 'No se pudo validar el estudiante.';
          return;
        }

        this.router.navigate(['/panel-estudiante']);
      },

      error: error => {

        this.cargando = false;

        this.mensaje = error.status === 401
          ? 'Correo o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Intente nuevamente.';

        console.error('Error de login:', error);
      }
    });
  }
}
