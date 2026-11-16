
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SesionService } from '../../../../core/services/sesion';

@Component({
  selector: 'app-login-docente',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-docente.html',
  styleUrl: './login-docente.css'
})
export class LoginDocente {

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
      this.mensajeError =
        'Completa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.sesionService.iniciarSesionDocente(
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
            'No se pudo iniciar sesión. Verifica tus credenciales o la conexión con el servidor.';
          return;
        }

        // ELIMINAR CONTRASEÑA DEL FORMULARIO
        this.password = '';

        // INGRESAR AL PANEL DOCENTE
        this.router.navigate(['/panel-docente']);
      },

      error: () => {
        this.mensajeError =
          'Ocurrió un error al conectar con el servidor.';
      }
    });
  }
}
