import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-estudiante',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-estudiante.html',
  styleUrl: './login-estudiante.css'
})
export class LoginEstudiante {
  correo: string = '';
  password: string = '';

  ingresar(): void {
    // Pendiente: conectar autenticación con el backend.
  }
}