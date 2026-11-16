
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SesionService } from '../../../../core/services/sesion';

@Component({
  selector: 'app-login-director',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-director.html',
  styleUrl: './login-director.css'
})
export class LoginDirector {

  correo = '';
  password = '';
  mensajeError = '';
  cargando = false;

  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  ingresar(): void {

    this.mensajeError = '';

    if (this.cargando) {
      return;
    }

    if (!this.correo.trim() || !this.password) {
      this.mensajeError = 'Completa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.sesionService.iniciarSesionDirector(
      this.correo,
      this.password
    )
    .pipe(
      finalize(() => {
        this.cargando = false;
      })
    )
    .subscribe({
      next: (correcto: boolean) => {

        if (!correcto) {
          this.mensajeError =
            'Correo o contraseña incorrectos.';
          return;
        }

        this.password = '';

        this.router.navigate(['/panel-director']);
      },

      error: () => {
        this.mensajeError =
          'No se pudo conectar con el servidor.';
      }
    });
  }
}
