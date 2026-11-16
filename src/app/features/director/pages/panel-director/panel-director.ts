
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Docente {
  idDocente: number;
  estado: boolean;
}

interface Estudiante {
  idEstudiante: number;
  idMatricula: number;
  estado: boolean;
}

@Component({
  selector: 'app-panel-director',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel-director.html',
  styleUrl: './panel-director.css'
})
export class PanelDirector implements OnInit {

  private readonly API_DOCENTES =
    'http://localhost:8081/api/docentes';

  private readonly API_ESTUDIANTES =
    'http://localhost:8081/api/director/estudiantes';

  private readonly API_AUTH =
    'http://localhost:8081/api/auth';

  // RESUMEN DE DOCENTES
  docentesActivos: number | null = null;
  docentesEliminados: number | null = null;

  // RESUMEN DE ESTUDIANTES
  estudiantesMatriculados: number | null = null;
  gradosDisponibles = 5;
  seccionesDisponibles = 3;

  // CERRAR SESIÓN
  cerrandoSesion = false;
  errorCerrarSesion = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarResumenDocentes();
    this.cargarResumenEstudiantes();
  }

  // =====================================
  // CONSULTAR RESUMEN DE DOCENTES
  // =====================================

  cargarResumenDocentes(): void {

    // DOCENTES ACTIVOS
    this.http.get<Docente[]>(
      this.API_DOCENTES,
      { withCredentials: true }
    ).subscribe({

      next: (docentes) => {
        this.docentesActivos = docentes.length;
        this.cdr.detectChanges();
      },

      error: () => {
        this.docentesActivos = null;
        this.cdr.detectChanges();
      }
    });

    // DOCENTES ELIMINADOS
    this.http.get<Docente[]>(
      `${this.API_DOCENTES}/eliminados`,
      { withCredentials: true }
    ).subscribe({

      next: (docentes) => {
        this.docentesEliminados = docentes.length;
        this.cdr.detectChanges();
      },

      error: () => {
        this.docentesEliminados = null;
        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // CONSULTAR ESTUDIANTES MATRICULADOS
  // =====================================

  cargarResumenEstudiantes(): void {

    this.http.get<Estudiante[]>(
      this.API_ESTUDIANTES,
      { withCredentials: true }
    ).subscribe({

      next: (estudiantes) => {

        // CONTAR ESTUDIANTES DIFERENTES
        const ids = new Set(
          estudiantes
            .filter(estudiante => estudiante.estado)
            .map(estudiante => estudiante.idEstudiante)
        );

        this.estudiantesMatriculados = ids.size;

        this.cdr.detectChanges();
      },

      error: () => {
        this.estudiantesMatriculados = null;
        this.cdr.detectChanges();
      }
    });
  }

  // =====================================
  // OBTENER COOKIE CSRF
  // =====================================

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

  // =====================================
  // CERRAR SESIÓN DEL DIRECTOR
  // =====================================

  cerrarSesion(): void {

    if (this.cerrandoSesion) {
      return;
    }

    const confirmar = window.confirm(
      '¿Está seguro de que desea cerrar sesión?'
    );

    if (!confirmar) {
      return;
    }

    this.errorCerrarSesion = '';

    const tokenCsrf = this.obtenerCookie('XSRF-TOKEN');

    if (!tokenCsrf) {
      this.errorCerrarSesion =
        'No se encontró el token de seguridad. ' +
        'No se pudo cerrar la sesión.';
      return;
    }

    this.cerrandoSesion = true;

    this.http.post(
      `${this.API_AUTH}/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': tokenCsrf
        }
      }
    ).subscribe({

      next: () => {

        this.cerrandoSesion = false;

        // REGRESAR AL LOGIN DEL DIRECTOR
        this.router.navigateByUrl(
          '/login-director',
          { replaceUrl: true }
        );
      },

      error: (error: HttpErrorResponse) => {

        this.cerrandoSesion = false;

        if (error.status === 0) {
          this.errorCerrarSesion =
            'No se pudo conectar con el backend. ' +
            'La sesión podría seguir activa.';
        } else if (error.status === 401) {
          // LA SESIÓN YA NO ESTÁ ACTIVA
          this.router.navigateByUrl(
            '/login-director',
            { replaceUrl: true }
          );
          return;
        } else if (error.status === 403) {
          this.errorCerrarSesion =
            'No se pudo validar el token de seguridad.';
        } else {
          this.errorCerrarSesion =
            'No se pudo cerrar la sesión. Intente nuevamente.';
        }

        this.cdr.detectChanges();
      }
    });
  }
}
