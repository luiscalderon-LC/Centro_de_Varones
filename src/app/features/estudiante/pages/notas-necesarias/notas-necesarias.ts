
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

@Component({
  selector: 'app-notas-necesarias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './notas-necesarias.html',
  styleUrl: './notas-necesarias.css'
})
export class NotasNecesarias implements OnInit {

  private readonly apiUrl =
    'http://localhost:8081/api/estudiante/mis-calificaciones';

  estudiante = {
    nombre: '',
    grado: '',
    anio: 2026
  };

  periodos = [
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  periodoSeleccionado = 'I Bimestre';
  cursoSeleccionado = '';

  // NOTA MÍNIMA APROBATORIA
  readonly notaAprobatoria = 11;

  // SIMULACIÓN: UNA EVALUACIÓN ADICIONAL
  notaSimulada: number | null = null;

  private cursosApi: CursoApi[] = [];

  cursosDisponibles: CursoApi[] = [];

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
    this.cargarCalificaciones();
  }

  cargarEstudiante(): void {
    this.panelApi.obtenerMisDatos().subscribe({
      next: datos => {
        this.estudiante.nombre = datos.nombre;
        this.estudiante.grado = datos.grado;

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

  cargarCalificaciones(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.http.get<CalificacionesResponse>(
      this.apiUrl,
      { withCredentials: true }
    ).subscribe({

      next: respuesta => {
        this.cursosApi = respuesta.cursos ?? [];

        this.actualizarCursos();

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
          'No se pudieron consultar las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }

  actualizarCursos(): void {

    this.cursosDisponibles = this.cursosApi.filter(
      curso => curso.periodo === this.periodoSeleccionado
    );

    const existe = this.cursosDisponibles.some(
      curso => curso.nombre === this.cursoSeleccionado
    );

    if (!existe) {
      this.cursoSeleccionado =
        this.cursosDisponibles[0]?.nombre ?? '';
    }

    this.notaSimulada = null;
  }

  get cursoActual(): CursoApi | undefined {
    return this.cursosDisponibles.find(
      curso => curso.nombre === this.cursoSeleccionado
    );
  }

  get notasRegistradas(): number[] {
    return (this.cursoActual?.evaluaciones ?? [])
      .map(e => e.calificacion)
      .filter(
        (nota): nota is number => nota !== null
      );
  }

  get cantidadNotas(): number {
    return this.notasRegistradas.length;
  }

  get sumaNotas(): number {
    return this.notasRegistradas.reduce(
      (total, nota) => total + nota,
      0
    );
  }

  get promedioActual(): number | null {
    if (this.cantidadNotas === 0) {
      return null;
    }

    return this.sumaNotas / this.cantidadNotas;
  }

  // NOTA NECESARIA EN UNA EVALUACIÓN ADICIONAL
  get notaNecesaria(): number | null {

    if (this.cantidadNotas === 0) {
      return null;
    }

    return (
      this.notaAprobatoria * (this.cantidadNotas + 1)
      - this.sumaNotas
    );
  }

  get promedioSimulado(): number | null {

    if (
      this.notaSimulada === null ||
      !Number.isFinite(this.notaSimulada) ||
      this.notaSimulada < 0 ||
      this.notaSimulada > 20
    ) {
      return null;
    }

    return (
      this.sumaNotas + this.notaSimulada
    ) / (this.cantidadNotas + 1);
  }

  get estadoActual(): string {

    if (this.promedioActual === null) {
      return 'Sin calificaciones';
    }

    return this.promedioActual >= this.notaAprobatoria
      ? 'Aprobado'
      : 'Desaprobado';
  }

  get mensajeOrientacion(): string {

    if (!this.cursoActual) {
      return 'Selecciona un curso con evaluaciones registradas.';
    }

    if (this.cantidadNotas === 0) {
      return 'Todavía no tienes notas registradas para realizar el cálculo.';
    }

    const necesaria = this.notaNecesaria!;

    if (necesaria > 20) {
      return 'Con una sola evaluación adicional no sería posible alcanzar el promedio 11, incluso obteniendo 20.';
    }

    if (necesaria <= 0) {
      return 'Tu promedio se mantendría en 11 o más incluso si obtuvieras 0 en una evaluación adicional de igual peso.';
    }

    return `Necesitas obtener al menos ${Math.ceil(necesaria * 100) / 100} en una próxima evaluación de igual peso para alcanzar un promedio de 11.`;
  }

  get estadoSimulado(): string {

    if (this.promedioSimulado === null) {
      return 'Sin simulación';
    }

    return this.promedioSimulado >= this.notaAprobatoria
      ? 'Aprobado'
      : 'Desaprobado';
  }

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
        this.mensajeError = 'No se pudo cerrar sesión.';
        this.cdr.detectChanges();
      }
    });
  }
}
