
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface Evaluacion {
  nombre: string;
  calificacion: number | null;
}

interface CursoApi {
  nombre: string;
  periodo: string;
  evaluaciones: Evaluacion[];
}

interface CalificacionesResponse {
  cursos: CursoApi[];
}

interface CursoHistorial {
  nombre: string;
  periodo: string;
  evaluaciones: Evaluacion[];
  promedio: number | null;
  registradas: number;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {

  private readonly apiUrl =
    'http://localhost:8081/api/estudiante/mis-calificaciones';

  estudiante = {
    nombre: '',
    grado: '',
    anio: 2026
  };

  readonly periodos = [
    'Todos',
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  periodoSeleccionado = 'Todos';
  cursoSeleccionado = 'Todos';

  private cursosApi: CursoApi[] = [];

  cursosDisponibles: string[] = [];
  historial: CursoHistorial[] = [];

  cargando = true;
  cerrandoSesion = false;
  mensajeError = '';

  constructor(
    private http: HttpClient,
    private panelApi: PanelEstudianteApiService,
    private auth: AuthEstudianteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstudiante();
    this.cargarHistorial();
  }

  // DATOS DEL ESTUDIANTE AUTENTICADO
  cargarEstudiante(): void {

    this.panelApi.obtenerMisDatos().subscribe({

      next: datos => {

        this.estudiante.nombre =
          datos.nombre || 'Sin nombre registrado';

        this.estudiante.grado =
          datos.grado || 'Sin matrícula';

        if (datos.anio != null) {
          this.estudiante.anio = datos.anio;
        }

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.mensajeError =
          'No se pudieron cargar los datos del estudiante.';

        this.cdr.detectChanges();
      }
    });
  }

  // CONSULTAR CALIFICACIONES REALES
  cargarHistorial(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.http.get<CalificacionesResponse>(
      this.apiUrl,
      { withCredentials: true }
    ).subscribe({

      next: (respuesta: CalificacionesResponse) => {

        this.cursosApi = respuesta.cursos ?? [];

        this.cursosDisponibles = [
          'Todos',
          ...new Set(
            this.cursosApi.map(curso => curso.nombre)
          )
        ];

        this.actualizarHistorial();

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        this.cargando = false;

        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.mensajeError =
          'No se pudo consultar el historial académico.';

        this.cdr.detectChanges();
      }
    });
  }

  // FILTRAR POR CURSO Y BIMESTRE
  actualizarHistorial(): void {

    const filtrados = this.cursosApi.filter(curso => {

      const coincidePeriodo =
        this.periodoSeleccionado === 'Todos' ||
        curso.periodo === this.periodoSeleccionado;

      const coincideCurso =
        this.cursoSeleccionado === 'Todos' ||
        curso.nombre === this.cursoSeleccionado;

      return coincidePeriodo && coincideCurso;
    });

    this.historial = filtrados.map(curso => {

      const notas = curso.evaluaciones
        .map(e => e.calificacion)
        .filter(
          (nota): nota is number => nota !== null
        );

      const promedio = notas.length > 0
        ? notas.reduce(
            (total, nota) => total + nota,
            0
          ) / notas.length
        : null;

      return {
        nombre: curso.nombre,
        periodo: curso.periodo,
        evaluaciones: curso.evaluaciones,
        promedio,
        registradas: notas.length
      };
    });

    this.historial.sort((a, b) => {

      const ordenA = this.periodos.indexOf(a.periodo);
      const ordenB = this.periodos.indexOf(b.periodo);

      return ordenA - ordenB ||
        a.nombre.localeCompare(b.nombre);
    });
  }

  // TOTAL DE EVALUACIONES CON NOTA
  get totalEvaluaciones(): number {

    return this.historial.reduce(
      (total, curso) => total + curso.registradas,
      0
    );
  }

  // CURSOS DIFERENTES
  get totalCursos(): number {

    return new Set(
      this.historial.map(curso => curso.nombre)
    ).size;
  }

  // PROMEDIO PROVISIONAL DEL FILTRO
  get promedioGeneral(): number | null {

    const promedios = this.historial
      .map(curso => curso.promedio)
      .filter(
        (promedio): promedio is number =>
          promedio !== null
      );

    if (promedios.length === 0) {
      return null;
    }

    return promedios.reduce(
      (total, promedio) => total + promedio,
      0
    ) / promedios.length;
  }

  // ESTADO POR CURSO
  obtenerEstado(promedio: number | null): string {

    if (promedio === null) {
      return 'Sin calificaciones';
    }

    return promedio >= 11
      ? 'Aprobado'
      : 'Desaprobado';
  }

  // CERRAR SESIÓN
  cerrarSesion(): void {

    if (this.cerrandoSesion) return;

    this.cerrandoSesion = true;

    this.auth.cerrarSesion().subscribe({

      next: () => {
        this.cerrandoSesion = false;
        this.router.navigate(['/login-estudiante']);
      },

      error: () => {
        this.cerrandoSesion = false;
        this.mensajeError =
          'No se pudo cerrar sesión. Intenta nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }
}
