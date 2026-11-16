
import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface RespuestaMatricula {
  mensaje: string;
  idEstudiante: number;
}

@Component({
  selector: 'app-matricular-estudiante',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './matricular-estudiante.html',
  styleUrl: './matricular-estudiante.css'
})
export class MatricularEstudiante {

  private readonly apiUrl =
    'http://localhost:8081/api/director/matriculas';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // DATOS DEL ESTUDIANTE
  estudiante = {
    tipoDocumento: 'DNI',
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    grado: '',
    seccion: '',
    anio: 2026
  };

  // OPCIONES DEL FORMULARIO
  tiposDocumento = [
    { valor: 'DNI', nombre: 'DNI' },
    { valor: 'CE', nombre: 'Carné de extranjería' }
  ];

  grados = ['1.°', '2.°', '3.°', '4.°', '5.°'];
  secciones = ['A', 'B', 'C'];
  anios = [2026, 2027];

  tipoContrasena: 'dni' | 'personalizada' = 'personalizada';

  contrasena = '';
  confirmarContrasena = '';

  mensaje = '';
  esError = false;
  guardando = false;

  errores: Record<string, string> = {};

  // CAMBIAR TIPO DE DOCUMENTO
  cambiarTipoDocumento(): void {
    this.estudiante.dni = '';
    this.errores['dni'] = '';
    this.mensaje = '';
  }

  // LIMPIAR DOCUMENTO
  limpiarDocumento(): void {
    this.estudiante.dni = this.estudiante.dni
      .replace(/\D/g, '')
      .slice(0, this.estudiante.tipoDocumento === 'DNI' ? 8 : 9);
  }

  // VALIDAR DOCUMENTO
  validarDocumento(): boolean {
    const documento = this.estudiante.dni.trim();

    if (this.estudiante.tipoDocumento === 'DNI') {
      if (!/^\d{8}$/.test(documento)) {
        this.errores['dni'] =
          'El DNI debe contener exactamente 8 números.';
        return false;
      }
    } else if (this.estudiante.tipoDocumento === 'CE') {
      if (!/^\d{9}$/.test(documento)) {
        this.errores['dni'] =
          'El carné de extranjería debe contener exactamente 9 números.';
        return false;
      }
    } else {
      this.errores['dni'] = 'Selecciona un tipo de documento.';
      return false;
    }

    this.errores['dni'] = '';
    return true;
  }

  // VALIDAR NOMBRES
  validarNombres(): boolean {
    const nombres = this.estudiante.nombres.trim();

    if (!nombres) {
      this.errores['nombres'] = 'Los nombres son obligatorios.';
      return false;
    }

    if (nombres.length > 60) {
      this.errores['nombres'] =
        'Los nombres no pueden superar los 60 caracteres.';
      return false;
    }

    if (!/^[\p{L} ]+$/u.test(nombres)) {
      this.errores['nombres'] =
        'Los nombres solo deben contener letras y espacios.';
      return false;
    }

    this.errores['nombres'] = '';
    return true;
  }

  // VALIDAR APELLIDOS
  validarApellidos(): boolean {
    const apellidos = this.estudiante.apellidos.trim();

    if (!apellidos) {
      this.errores['apellidos'] =
        'Los apellidos son obligatorios.';
      return false;
    }

    if (apellidos.length > 60) {
      this.errores['apellidos'] =
        'Los apellidos no pueden superar los 60 caracteres.';
      return false;
    }

    if (!/^[\p{L} ]+$/u.test(apellidos)) {
      this.errores['apellidos'] =
        'Los apellidos solo deben contener letras y espacios.';
      return false;
    }

    this.errores['apellidos'] = '';
    return true;
  }

  // VALIDAR CORREO
  validarCorreo(): boolean {
    const correo = this.estudiante.correo.trim().toLowerCase();

    if (!correo) {
      this.errores['correo'] =
        'El correo institucional es obligatorio.';
      return false;
    }

    if (correo.length > 100) {
      this.errores['correo'] =
        'El correo no puede superar los 100 caracteres.';
      return false;
    }

    if (!/^[a-z0-9._%+-]+@centrovarones\.edu\.pe$/.test(correo)) {
      this.errores['correo'] =
        'El correo debe terminar en @centrovarones.edu.pe.';
      return false;
    }

    this.errores['correo'] = '';
    return true;
  }

  // VALIDAR GRADO
  validarGrado(): boolean {
    if (!this.grados.includes(this.estudiante.grado)) {
      this.errores['grado'] = 'Selecciona un grado válido.';
      return false;
    }

    this.errores['grado'] = '';
    return true;
  }

  // VALIDAR SECCIÓN
  validarSeccion(): boolean {
    if (!this.secciones.includes(this.estudiante.seccion)) {
      this.errores['seccion'] = 'Selecciona una sección válida.';
      return false;
    }

    this.errores['seccion'] = '';
    return true;
  }

  // VALIDAR AÑO
  validarAnio(): boolean {
    if (!this.anios.includes(Number(this.estudiante.anio))) {
      this.errores['anio'] =
        'Selecciona un año escolar válido.';
      return false;
    }

    this.errores['anio'] = '';
    return true;
  }

  // VALIDAR CONTRASEÑA
  validarContrasena(): boolean {
    // POR SEGURIDAD, NO UTILIZAREMOS EL DNI
    // COMO CONTRASEÑA INICIAL
    if (this.tipoContrasena === 'dni') {
      this.errores['contrasena'] =
        'Selecciona una contraseña personalizada.';
      return false;
    }

    if (this.contrasena.length < 8) {
      this.errores['contrasena'] =
        'La contraseña debe tener al menos 8 caracteres.';
      return false;
    }

    if (this.contrasena.length > 72) {
      this.errores['contrasena'] =
        'La contraseña no puede superar los 72 caracteres.';
      return false;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.errores['contrasena'] =
        'Las contraseñas no coinciden.';
      return false;
    }

    this.errores['contrasena'] = '';
    return true;
  }

  // OBTENER COOKIE CSRF
  private obtenerCookie(nombre: string): string {
    const cookie = document.cookie
      .split('; ')
      .find(item => item.startsWith(nombre + '='));

    if (!cookie) {
      return '';
    }

    return decodeURIComponent(
      cookie.substring(nombre.length + 1)
    );
  }

  // REGISTRAR MATRÍCULA EN SQL SERVER
  registrar(): void {

    if (this.guardando) {
      return;
    }

    this.mensaje = '';
    this.esError = false;
    this.errores = {};

    const formularioValido = [
      this.validarDocumento(),
      this.validarNombres(),
      this.validarApellidos(),
      this.validarCorreo(),
      this.validarGrado(),
      this.validarSeccion(),
      this.validarAnio(),
      this.validarContrasena()
    ].every(Boolean);

    if (!formularioValido) {
      this.mostrarError(
        'Revisa los campos señalados antes de registrar la matrícula.'
      );
      return;
    }

    const gradoNumero = Number.parseInt(
      this.estudiante.grado,
      10
    );

    const datos = {
      tipoDocumento: this.estudiante.tipoDocumento,
      numeroDocumento: this.estudiante.dni.trim(),
      nombres: this.estudiante.nombres.trim(),
      apellidos: this.estudiante.apellidos.trim(),
      correo: this.estudiante.correo.trim().toLowerCase(),
      grado: gradoNumero,
      seccion: this.estudiante.seccion,
      anioEscolar: Number(this.estudiante.anio),
      contrasena: this.contrasena
    };

    const tokenCsrf = this.obtenerCookie('XSRF-TOKEN');

    if (!tokenCsrf) {
      this.mostrarError(
        'No se encontró el token de seguridad. ' +
        'Inicia sesión nuevamente como director.'
      );
      return;
    }

    this.guardando = true;

    this.http.post<RespuestaMatricula>(
      this.apiUrl,
      datos,
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': tokenCsrf
        }
      }
    ).subscribe({

      next: (respuesta) => {
        this.guardando = false;
        this.esError = false;

        this.mensaje =
          respuesta.mensaje +
          '. Código del estudiante: ' +
          respuesta.idEstudiante;

        this.limpiarFormulario();
        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        this.guardando = false;

        if (error.status === 0) {
          this.mostrarError(
            'No se pudo conectar con Spring Boot. ' +
            'Verifica que el backend esté funcionando.'
          );
        } else if (error.status === 400) {
          this.mostrarError(
            error.error?.message ||
            error.error?.detail ||
            'Los datos enviados no son válidos.'
          );
        } else if (error.status === 401) {
          this.mostrarError(
            'Tu sesión ha terminado. Inicia sesión nuevamente.'
          );
        } else if (error.status === 403) {
          this.mostrarError(
            'No tienes autorización o el token CSRF no es válido.'
          );
        } else if (error.status === 409) {
          this.mostrarError(
            error.error?.message ||
            error.error?.detail ||
            'El documento o correo ya existe, o el salón está lleno.'
          );
        } else {
          this.mostrarError(
            'No se pudo registrar la matrícula. ' +
            'Revisa los registros del backend.'
          );
        }

        this.cdr.detectChanges();
      }
    });
  }

  // LIMPIAR FORMULARIO
  limpiarFormulario(): void {
    this.estudiante = {
      tipoDocumento: 'DNI',
      dni: '',
      nombres: '',
      apellidos: '',
      correo: '',
      grado: '',
      seccion: '',
      anio: 2026
    };

    this.tipoContrasena = 'personalizada';
    this.contrasena = '';
    this.confirmarContrasena = '';
    this.errores = {};
  }

  // MOSTRAR ERROR
  mostrarError(texto: string): void {
    this.mensaje = texto;
    this.esError = true;
  }
}
