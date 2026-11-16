
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  DocentesApiService
} from '../../../../core/services/docentes-api';

@Component({
  selector: 'app-registrar-docente',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registrar-docente.html',
  styleUrl: './registrar-docente.css'
})
export class RegistrarDocente {

  docente = this.crearDocenteVacio();

  especialidades = [
    'Matemática',
    'Comunicación',
    'Ciencia y Tecnología',
    'Ciencias Sociales',
    'Educación Física',
    'Inglés',
    'Arte y Cultura',
    'Educación para el Trabajo',
    'Desarrollo Personal, Ciudadanía y Cívica',
    'Educación Religiosa'
  ];

  contrasena = '';
  confirmarContrasena = '';

  mensaje = '';
  esError = false;
  cargando = false;

  // ERRORES INDIVIDUALES
  errores: Record<string, string> = {};

  constructor(
    private docentesApi: DocentesApiService,
    private cdr: ChangeDetectorRef
  ) {}

  // CREAR FORMULARIO VACÍO
  private crearDocenteVacio() {
    return {
      idTipoDocumento: 1,
      dni: '',
      nombres: '',
      apellidos: '',
      correo: '',
      especialidad: '',
      estado: 'activo'
    };
  }

  // VALIDAR TODOS LOS CAMPOS
  validarFormulario(): boolean {

    this.errores = {};

    const d = this.docente;

    const tipoDocumento = Number(d.idTipoDocumento);
    const documento = d.dni.trim();
    const nombres = d.nombres.trim();
    const apellidos = d.apellidos.trim();
    const correo = d.correo.trim().toLowerCase();

    // TIPO DE DOCUMENTO
    if (![1, 2].includes(tipoDocumento)) {
      this.errores['idTipoDocumento'] =
        'Selecciona un tipo de documento.';
    }

    // NÚMERO DE DOCUMENTO
    if (!documento) {

      this.errores['dni'] =
        'El número de documento es obligatorio.';

    } else if (
      tipoDocumento === 1 &&
      !/^\d{8}$/.test(documento)
    ) {

      this.errores['dni'] =
        'El DNI debe tener exactamente 8 dígitos.';

    } else if (
      tipoDocumento === 2 &&
      !/^\d{9}$/.test(documento)
    ) {

      this.errores['dni'] =
        'El carné de extranjería debe tener exactamente 9 dígitos.';
    }

    // NOMBRES
    if (!nombres) {

      this.errores['nombres'] =
        'Los nombres son obligatorios.';

    } else if (nombres.length > 60) {

      this.errores['nombres'] =
        'Los nombres no pueden superar los 60 caracteres.';
    }

    // APELLIDOS
    if (!apellidos) {

      this.errores['apellidos'] =
        'Los apellidos son obligatorios.';

    } else if (apellidos.length > 60) {

      this.errores['apellidos'] =
        'Los apellidos no pueden superar los 60 caracteres.';
    }

    // CORREO INSTITUCIONAL
    if (!correo) {

      this.errores['correo'] =
        'El correo institucional es obligatorio.';

    } else if (
      !/^[a-z0-9._%+-]+@centrovarones\.edu\.pe$/.test(correo)
    ) {

      this.errores['correo'] =
        'El correo debe terminar en @centrovarones.edu.pe.';

    } else if (correo.length > 100) {

      this.errores['correo'] =
        'El correo no puede superar los 100 caracteres.';
    }

    // ESPECIALIDAD
    if (!this.especialidades.includes(d.especialidad)) {

      this.errores['especialidad'] =
        'Selecciona una especialidad.';
    }

    // ESTADO
    if (!['activo', 'inactivo'].includes(d.estado)) {

      this.errores['estado'] =
        'Selecciona un estado válido.';
    }

    // CONTRASEÑA
    if (!this.contrasena) {

      this.errores['contrasena'] =
        'La contraseña es obligatoria.';

    } else if (this.contrasena.length < 8) {

      this.errores['contrasena'] =
        'La contraseña debe tener al menos 8 caracteres.';
    }

    // CONFIRMAR CONTRASEÑA
    if (!this.confirmarContrasena) {

      this.errores['confirmarContrasena'] =
        'Debes confirmar la contraseña.';

    } else if (
      this.contrasena !== this.confirmarContrasena
    ) {

      this.errores['confirmarContrasena'] =
        'Las contraseñas no coinciden.';
    }

    return Object.keys(this.errores).length === 0;
  }

  // REGISTRAR DOCENTE
  registrar(): void {

    // EVITAR DOBLE REGISTRO
    if (this.cargando) {
      return;
    }

    this.mensaje = '';
    this.esError = false;

    // VALIDAR FORMULARIO
    if (!this.validarFormulario()) {

      this.mostrarError(
        'Revisa los campos marcados antes de continuar.'
      );

      this.cdr.detectChanges();
      return;
    }

    const d = this.docente;

    // ACTIVAR ESTADO DE CARGA
    this.cargando = true;

    this.docentesApi.registrarDocente({

      idTipoDocumento: Number(d.idTipoDocumento),
      dni: d.dni.trim(),
      nombres: d.nombres.trim(),
      apellidos: d.apellidos.trim(),
      correo: d.correo.trim().toLowerCase(),
      especialidad: d.especialidad,
      estado: d.estado,
      password: this.contrasena

    })
    .pipe(
      finalize(() => {

        // FINALIZAR ESTADO DE CARGA
        this.cargando = false;

        // ACTUALIZAR VISTA
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      next: respuesta => {

        // HABILITAR EL BOTÓN
        this.cargando = false;

        // LIMPIAR FORMULARIO
        this.limpiarFormulario();

        // MOSTRAR MENSAJE DE ÉXITO
        this.mensaje =
          `Docente registrado correctamente. ID: ${respuesta.idDocente}`;

        this.esError = false;

        // ACTUALIZAR LA PANTALLA
        this.cdr.detectChanges();
      },

      error: error => {

        // HABILITAR EL BOTÓN
        this.cargando = false;

        if (error.status === 409) {

          this.mostrarError(
            'El documento o correo ya se encuentra registrado.'
          );

        } else if (error.status === 400) {

          this.mostrarError(
            'El servidor rechazó los datos. Revisa el formulario.'
          );

        } else if (
          error.status === 401 ||
          error.status === 403
        ) {

          this.mostrarError(
            'Tu sesión no tiene permiso para registrar docentes. ' +
            'Inicia sesión nuevamente como director.'
          );

        } else {

          this.mostrarError(
            'No se pudo registrar al docente. ' +
            'Verifica la conexión con el servidor.'
          );
        }

        // ACTUALIZAR LA PANTALLA
        this.cdr.detectChanges();
      }
    });
  }

  // LIMPIAR FORMULARIO
  limpiarFormulario(): void {

    this.docente = this.crearDocenteVacio();

    this.contrasena = '';
    this.confirmarContrasena = '';

    this.errores = {};
  }

  // MOSTRAR ERRORES
  mostrarError(texto: string): void {

    this.mensaje = texto;
    this.esError = true;
  }
}
