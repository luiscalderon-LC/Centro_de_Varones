
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthEstudianteService } from '../../../../core/services/auth-estudiante';
import { PanelEstudianteApiService } from '../../../../core/services/panel-estudiante-api';

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

interface CursoPromedio {
  nombre: string;
  promedio: number | null;
  registradas: number;
  total: number;
}

@Component({
  selector: 'app-mi-promedio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mi-promedio.html',
  styleUrl: './mi-promedio.css'
})
export class MiPromedio implements OnInit {

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

  private cursosApi: CursoApi[] = [];

  cursos: CursoPromedio[] = [];

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
        } else {
          this.mensajeError = 'No se pudieron cargar los datos del estudiante.';
        }
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
        this.actualizarPromedios();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login-estudiante']);
          return;
        }

        this.mensajeError = 'No se pudieron consultar las calificaciones.';
        this.cdr.detectChanges();
      }
    });
  }

  actualizarPromedios(): void {
    const cursosPeriodo = this.cursosApi.filter(
      curso => curso.periodo === this.periodoSeleccionado
    );

    this.cursos = cursosPeriodo.map(curso => {
      const notas = curso.evaluaciones
        .map(e => e.calificacion)
        .filter((nota): nota is number => nota !== null);

      const promedio = notas.length
        ? notas.reduce((total, nota) => total + nota, 0) / notas.length
        : null;

      return {
        nombre: curso.nombre,
        promedio,
        registradas: notas.length,
        total: curso.evaluaciones.length
      };
    });
  }

  get promedioGeneral(): number | null {
    const promedios = this.cursos
      .map(curso => curso.promedio)
      .filter((nota): nota is number => nota !== null);

    if (!promedios.length) {
      return null;
    }

    return promedios.reduce((a, b) => a + b, 0) / promedios.length;
  }

  get cursosAprobados(): number {
    return this.cursos.filter(
      curso => curso.promedio !== null && curso.promedio >= 11
    ).length;
  }

  get cursosDesaprobados(): number {
    return this.cursos.filter(
      curso => curso.promedio !== null && curso.promedio < 11
    ).length;
  }

  get estadoGeneral(): string {
    if (this.promedioGeneral === null) {
      return 'Sin calificaciones';
    }

    return this.promedioGeneral >= 11
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
