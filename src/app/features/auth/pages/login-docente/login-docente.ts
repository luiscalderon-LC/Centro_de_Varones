
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  ingresar(): void {

    this.mensajeError = '';

    if (!this.correo.trim() || !this.password) {
      this.mensajeError =
        'Completa tu correo o código y contraseña.';
      return;
    }

    const correcto = this.sesionService.iniciarSesionDocente(
      this.correo,
      this.password
    );

    if (!correcto) {
      this.mensajeError =
        'El usuario o la contraseña son incorrectos.';
      return;
    }

    this.router.navigate(['/panel-docente']);
  }
}
