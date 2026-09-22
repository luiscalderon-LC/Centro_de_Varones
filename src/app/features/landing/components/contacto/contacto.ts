import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {

  nombre = '';
  rol = '';
  correo = '';
  mensaje = '';

  mensajeEnviado = false;

  enviarFormulario(): void {

    if (!this.nombre || !this.rol || !this.correo || !this.mensaje) {
      return;
    }

    this.mensajeEnviado = true;

    this.nombre = '';
    this.rol = '';
    this.correo = '';
    this.mensaje = '';

    setTimeout(() => {
      this.mensajeEnviado = false;
    }, 4000);
  }
}