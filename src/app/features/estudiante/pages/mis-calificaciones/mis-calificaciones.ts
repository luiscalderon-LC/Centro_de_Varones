
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
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthEstudianteService
} from '../../../../core/services/auth-estudiante';

import {
  PanelEstudianteApiService
} from '../../../../core/services/panel-estudiante-api';

// EVALUACIONES DEL ESTUDIANTE
interface EvaluacionEstudiante {
  nombre: string;
  calificacion: number | null;
}

// CURSOS Y BIMESTRES
interface CursoEstudiante {
  nombre: string;
  periodo: string;
  evaluaciones: EvaluacionEstudiante[];
}

// RESPUESTA DEL BACKEND
interface CalificacionesResponse {
  cursos: CursoEstudiante[];
}

@Component({
  selector: 'app-mis-calificaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './mis-calificaciones.html',
  styleUrls: ['./mis-calificaciones.css']
})
export class MisCalificaciones implements OnInit {

  // ENDPOINT DE SPRING BOOT
  private readonly apiUrl =
    'http://localhost:8081/api/estudiante/mis-calificaciones';

  // ESTUDIANTE AUTENTICADO
  estudiante = {
    nombre: 'Cargando estudiante...',
    grado: 'Pendiente de consultar',
    anio: 2026
  };

  // CURSOS Y EVALUACIONES
  cursos: CursoEstudiante[] = [];
  nombresCursos: string[] = [];

  // FILTROS
  cursoSeleccionado = '';
  periodoSeleccionado = 'I Bimestre';

  // ESTADOS
  cargando = true;
  cerrandoSesion = false;
  mensajeError = '';

  // INFORMACIÓN ORIGINAL DEL BACKEND
  private cursosApi: CursoEstudiante[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthEstudianteService,
    private panelApi: PanelEstudianteApiService,
    private cdr: ChangeDetectorRef
  ) {}

  // INICIALIZAR COMPONENTE
  ngOnInit(): void {

    this.cargarEstudiante();

    this.route.queryParamMap.subscribe(params => {

      const curso = params.get('curso');
      const periodo = params.get('periodo');

      if (curso) {
        this.cursoSeleccionado = curso;
      }

      if (periodo) {
        this.periodoSeleccionado = periodo;
      }

      this.cargarCalificaciones();
    });
  }

  // OBTENER ESTUDIANTE REAL
  cargarEstudiante(): void {

    this.panelApi.obtenerMisDatos().subscribe({

      next: (datos) => {

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

        console.error(
          'Error al consultar estudiante:',
          error
        );

        if (
          error.status === 401 ||
          error.status === 403
        ) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.estudiante.nombre =
          'No se pudo cargar el estudiante';

        this.cdr.detectChanges();
      }
    });
  }

  // CONSULTAR CALIFICACIONES REALES
  cargarCalificaciones(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.http.get<CalificacionesResponse>(
      this.apiUrl,
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta: CalificacionesResponse) => {

        console.log(
          'Calificaciones recibidas:',
          respuesta
        );

        this.cursosApi = respuesta.cursos ?? [];

        // OBTENER NOMBRES DE CURSOS
        this.nombresCursos = [
          ...new Set(
            this.cursosApi.map(
              curso => curso.nombre
            )
          )
        ];

        // SELECCIONAR PRIMER CURSO DISPONIBLE
        if (
          !this.cursoSeleccionado ||
          !this.nombresCursos.includes(
            this.cursoSeleccionado
          )
        ) {
          this.cursoSeleccionado =
            this.nombresCursos[0] ?? '';
        }

        // MOSTRAR CURSOS DEL BIMESTRE
        this.actualizarCursos();

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Error al consultar calificaciones:',
          error
        );

        this.cargando = false;

        // SESIÓN NO AUTORIZADA
        if (
          error.status === 401 ||
          error.status === 403
        ) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        if (error.status === 0) {

          this.mensajeError =
            'No se pudo conectar con Spring Boot.';

          this.cdr.detectChanges();
          return;
        }

        if (error.status === 404) {

          this.mensajeError =
            'No se encontró el servicio de calificaciones.';

          this.cdr.detectChanges();
          return;
        }

        this.mensajeError =
          'No se pudieron consultar las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }

  // FILTRAR CURSOS POR BIMESTRE
  actualizarCursos(): void {

    this.cursos = this.cursosApi.filter(
      curso =>
        curso.periodo === this.periodoSeleccionado
    );

    this.cdr.detectChanges();
  }

  // CURSO SELECCIONADO
  get cursoActual(): CursoEstudiante | undefined {

    return this.cursos.find(
      curso =>
        curso.nombre === this.cursoSeleccionado
    );
  }

  // CALCULAR PROMEDIO PROVISIONAL
  get promedio(): number | null {

    const curso = this.cursoActual;

    if (!curso) {
      return null;
    }

    const notas = curso.evaluaciones
      .map(
        evaluacion => evaluacion.calificacion
      )
      .filter(
        (nota): nota is number =>
          nota !== null
      );

    if (notas.length === 0) {
      return null;
    }

    const suma = notas.reduce(
      (total, nota) => total + nota,
      0
    );

    return suma / notas.length;
  }

  // DETERMINAR ESTADO ACADÉMICO
  get estado(): string {

    const promedio = this.promedio;

    if (promedio === null) {
      return 'Sin calificaciones';
    }

    if (promedio >= 11) {
      return 'Aprobado';
    }

    if (promedio >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  // CALCULAR PUNTOS FALTANTES
  get puntosFaltantes(): number {

    const promedio = this.promedio;

    if (promedio === null) {
      return 0;
    }

    return Math.max(
      0,
      11 - promedio
    );
  }

  // MENSAJE ACADÉMICO
  get mensajeAcademico(): string {

    const promedio = this.promedio;

    if (promedio === null) {
      return 'Todavía no tienes calificaciones registradas.';
    }

    if (promedio >= 11) {
      return 'Has alcanzado la nota mínima aprobatoria en las evaluaciones registradas.';
    }

    if (promedio >= 9) {
      return `Estás cerca de aprobar. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio provisional para alcanzar 11.`;
    }

    return `Actualmente estás desaprobado en este curso. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio provisional para alcanzar 11.`;
  }

  // CERRAR SESIÓN
  cerrarSesion(): void {

    if (this.cerrandoSesion) {
      return;
    }

    this.cerrandoSesion = true;
    this.mensajeError = '';

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

        this.mensajeError =
          'No se pudo cerrar sesión. Intenta nuevamente.';

        this.cdr.detectChanges();
      }
    });
  }
}