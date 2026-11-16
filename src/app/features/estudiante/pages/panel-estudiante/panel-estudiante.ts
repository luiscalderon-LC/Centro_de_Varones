
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthEstudianteService
} from '../../../../core/services/auth-estudiante';

import {
  PanelEstudianteApiService
} from '../../../../core/services/panel-estudiante-api';

// EVALUACIONES RECIBIDAS DEL BACKEND
interface EvaluacionEstudiante {
  nombre: string;
  calificacion: number | null;
}

// CURSOS RECIBIDOS DEL BACKEND
interface CursoApi {
  nombre: string;
  periodo: string;
  evaluaciones: EvaluacionEstudiante[];
}

// RESPUESTA DE SPRING BOOT
interface CalificacionesResponse {
  cursos: CursoApi[];
}

// CURSOS QUE MOSTRAMOS EN EL PANEL
interface CursoPanel {
  nombre: string;
  promedio: number | null;
}

@Component({
  selector: 'app-panel-estudiante',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe
  ],
  templateUrl: './panel-estudiante.html',
  styleUrl: './panel-estudiante.css'
})
export class PanelEstudiante implements OnInit {

  private readonly apiCalificaciones =
    'http://localhost:8081/api/estudiante/mis-calificaciones';

  estudiante = {
    nombre: '',
    grado: 'Pendiente de consultar',
    codigo: '',
    periodo: 'I Bimestre',
    anio: 2026
  };

  cursos: CursoPanel[] = [];

  cargando = true;
  cerrandoSesion = false;
  mensaje = '';

  constructor(
    private panelApi: PanelEstudianteApiService,
    private auth: AuthEstudianteService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // CONSULTAR DATOS DEL ESTUDIANTE
  cargarDatos(): void {

    this.cargando = true;
    this.mensaje = '';

    this.panelApi.obtenerMisDatos().subscribe({

      next: datos => {

        this.estudiante.nombre =
          datos.nombre || 'Sin nombre registrado';

        this.estudiante.codigo =
          datos.documento || 'Sin documento';

        this.estudiante.grado =
          datos.grado || 'Sin matrícula';

        if (datos.anio !== null) {
          this.estudiante.anio = datos.anio;
        }

        // DESPUÉS DE CARGAR EL ESTUDIANTE
        // CONSULTAR SUS CALIFICACIONES
        this.cargarCalificaciones();

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Error al consultar estudiante:',
          error
        );

        this.cargando = false;

        if (
          error.status === 401 ||
          error.status === 403
        ) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.mensaje =
          'No se pudo cargar la información del estudiante.';

        this.cdr.detectChanges();
      }
    });
  }

  // CONSULTAR CALIFICACIONES REALES
  cargarCalificaciones(): void {

    this.http.get<CalificacionesResponse>(
      this.apiCalificaciones,
      { withCredentials: true }
    ).subscribe({

      next: (respuesta: CalificacionesResponse) => {

        const cursosApi = respuesta.cursos ?? [];

        // FILTRAR EL BIMESTRE MOSTRADO
        const cursosPeriodo = cursosApi.filter(
          curso =>
            curso.periodo === this.estudiante.periodo
        );

        // CALCULAR PROMEDIO POR CURSO
        this.cursos = cursosPeriodo.map(curso => {

          const notas = curso.evaluaciones
            .map(evaluacion => evaluacion.calificacion)
            .filter(
              (nota): nota is number =>
                nota !== null
            );

          let promedio: number | null = null;

          if (notas.length > 0) {

            const suma = notas.reduce(
              (total, nota) => total + nota,
              0
            );

            promedio = suma / notas.length;
          }

          return {
            nombre: curso.nombre,
            promedio
          };
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Error al consultar calificaciones:',
          error
        );

        this.cargando = false;

        if (
          error.status === 401 ||
          error.status === 403
        ) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.mensaje =
          'No se pudieron cargar las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }

  // INICIALES DEL ESTUDIANTE
  get iniciales(): string {

    const nombre = this.estudiante.nombre.trim();

    if (!nombre) {
      return 'ES';
    }

    return nombre
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra =>
        palabra.charAt(0).toUpperCase()
      )
      .join('');
  }

  // PROMEDIO GENERAL DEL BIMESTRE
  get promedioGeneral(): number | null {

    const cursosConNotas = this.cursos.filter(
      curso => curso.promedio !== null
    );

    if (cursosConNotas.length === 0) {
      return null;
    }

    const suma = cursosConNotas.reduce(
      (total, curso) =>
        total + (curso.promedio ?? 0),
      0
    );

    return suma / cursosConNotas.length;
  }

  // ESTADO ACADÉMICO
  get estadoAcademico(): string {

    const promedio = this.promedioGeneral;

    if (promedio === null) {
      return 'Sin calificaciones';
    }

    return promedio >= 11
      ? 'Aprobado'
      : 'Desaprobado';
  }

  // CERRAR SESIÓN
  cerrarSesion(): void {

    if (this.cerrandoSesion) {
      return;
    }

    this.cerrandoSesion = true;
    this.mensaje = '';

    this.auth.cerrarSesion().subscribe({

      next: () => {

        this.cerrandoSesion = false;

        this.router.navigate([
          '/login-estudiante'
        ]);
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Error al cerrar sesión:',
          error
        );

        this.cerrandoSesion = false;

        this.mensaje =
          'No se pudo cerrar sesión. Intenta nuevamente.';

        this.cdr.detectChanges();
      }
    });
  }
}
