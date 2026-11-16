
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  forkJoin,
  of,
  switchMap,
  map
} from 'rxjs';

import {
  NotasApiService,
  AsignaturaApi,
  GradoSeccionApi,
  AsignacionDocenteApi
} from '../../../../core/services/notas-api';

interface ReporteEstudiante {
  id: number;
  nombre: string;
  evaluacion1: number | null;
  evaluacion2: number | null;
  promedio: number | null;
  estado: string;
}

@Component({
  selector: 'app-reportes-docente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reportes-docente.html',
  styleUrl: './reportes-docente.css'
})
export class ReportesDocente implements OnInit {

  private readonly idDocente = 1;

  private asignaturas: AsignaturaApi[] = [];
  private grados: GradoSeccionApi[] = [];
  private asignaciones: AsignacionDocenteApi[] = [];

  cursos: string[] = [];
  salones: string[] = [];

  periodos = [
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  anios: string[] = [];

  cursoSeleccionado = '';
  salonSeleccionado = '';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  estudiantes: ReporteEstudiante[] = [];

  cargando = false;
  mensaje = '';

  private numeroConsulta = 0;

  constructor(
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFiltros();
  }

  cargarFiltros(): void {

    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      asignaturas: this.notasApi.obtenerAsignaturas(),
      grados: this.notasApi.obtenerGradosSecciones(),
      asignaciones: this.notasApi.obtenerAsignaciones()
    }).subscribe({

      next: datos => {

        this.asignaturas = datos.asignaturas.filter(
          a => a.estado
        );

        this.grados = datos.grados.filter(
          g => g.estado
        );

        this.asignaciones = datos.asignaciones.filter(
          a => a.estado && a.idDocente === this.idDocente
        );

        const idsGrados = this.asignaciones.map(
          a => a.idGradoSeccion
        );

        this.anios = [
          ...new Set(
            this.grados
              .filter(g => idsGrados.includes(g.idGradoSeccion))
              .map(g => String(g.anioEscolar))
          )
        ].sort().reverse();

        this.anioSeleccionado =
          this.anios[0] ?? '2026';

        this.actualizarCursos();
      },

      error: error => {
        console.error('Error al cargar filtros:', error);
        this.cargando = false;
        this.mensaje =
          'No se pudieron cargar los datos académicos.';
        this.cdr.detectChanges();
      }
    });
  }

  actualizarCursos(): void {

    const idsGrados = this.grados
      .filter(g => String(g.anioEscolar) === this.anioSeleccionado)
      .map(g => g.idGradoSeccion);

    const idsAsignaturas = this.asignaciones
      .filter(a => idsGrados.includes(a.idGradoSeccion))
      .map(a => a.idAsignatura);

    this.cursos = this.asignaturas
      .filter(a => idsAsignaturas.includes(a.idAsignatura))
      .map(a => a.nombre);

    this.cursoSeleccionado = this.cursos.includes(
      this.cursoSeleccionado
    )
      ? this.cursoSeleccionado
      : this.cursos[0] ?? '';

    this.actualizarSalones();
  }

  actualizarSalones(): void {

    const asignatura = this.asignaturas.find(
      a => a.nombre === this.cursoSeleccionado
    );

    const idsSalones = this.asignaciones
      .filter(a => a.idAsignatura === asignatura?.idAsignatura)
      .map(a => a.idGradoSeccion);

    this.salones = this.grados
      .filter(g =>
        idsSalones.includes(g.idGradoSeccion) &&
        String(g.anioEscolar) === this.anioSeleccionado
      )
      .map(g => `${g.grado}.° ${g.seccion}`);

    this.salonSeleccionado = this.salones.includes(
      this.salonSeleccionado
    )
      ? this.salonSeleccionado
      : this.salones[0] ?? '';

    this.cargarReporte();
  }

  obtenerIdPeriodo(): number {

    const ids: Record<string, number> = {
      'I Bimestre': 1,
      'II Bimestre': 2,
      'III Bimestre': 3,
      'IV Bimestre': 4
    };

    return ids[this.periodoSeleccionado] ?? 1;
  }

  cargarReporte(): void {

    const consultaActual = ++this.numeroConsulta;

    this.estudiantes = [];
    this.mensaje = '';

    const asignatura = this.asignaturas.find(
      a => a.nombre === this.cursoSeleccionado
    );

    const grado = this.grados.find(
      g =>
        `${g.grado}.° ${g.seccion}` === this.salonSeleccionado &&
        String(g.anioEscolar) === this.anioSeleccionado
    );

    const asignacion = this.asignaciones.find(
      a =>
        a.idAsignatura === asignatura?.idAsignatura &&
        a.idGradoSeccion === grado?.idGradoSeccion
    );

    if (!grado || !asignacion) {
      this.cargando = false;
      this.mensaje = 'No hay datos para esta selección.';
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;

    forkJoin({
      matriculas: this.notasApi.obtenerMatriculas(
        grado.idGradoSeccion
      ),
      estudiantes: this.notasApi.obtenerEstudiantes(),
      evaluaciones: this.notasApi.obtenerEvaluaciones(
        asignacion.idAsignacion
      )
    }).pipe(

      switchMap(datos => {

        const matriculas = datos.matriculas.filter(m => m.estado);

        const evaluaciones = datos.evaluaciones
          .filter(e =>
            e.estado &&
            e.idPeriodo === this.obtenerIdPeriodo()
          )
          .sort((a, b) => a.idEvaluacion - b.idEvaluacion);

        if (matriculas.length === 0) {
          return of([] as ReporteEstudiante[]);
        }

        return forkJoin(
          matriculas.map(
            m => this.notasApi.obtenerNotas(m.idMatricula)
          )
        ).pipe(

          map(notasPorMatricula => {

            return matriculas.map((matricula, index) => {

              const estudiante = datos.estudiantes.find(
                e => e.idEstudiante === matricula.idEstudiante
              );

              const notas = notasPorMatricula[index].filter(
                n => n.estado
              );

              const nota1 = notas.find(
                n => n.idEvaluacion ===
                  evaluaciones[0]?.idEvaluacion
              )?.calificacion ?? null;

              const nota2 = notas.find(
                n => n.idEvaluacion ===
                  evaluaciones[1]?.idEvaluacion
              )?.calificacion ?? null;

              const valores = [nota1, nota2].filter(
                (n): n is number => n !== null
              );

              const promedio = valores.length
                ? valores.reduce((a, b) => a + b, 0) /
                  valores.length
                : null;

              let estado = 'Sin notas';

              if (promedio !== null) {
                estado = promedio >= 11
                  ? 'Aprobado'
                  : promedio >= 9
                    ? 'En proceso'
                    : 'Desaprobado';
              }

              return {
                id: matricula.idEstudiante,
                nombre: estudiante
                  ? `${estudiante.nombres} ${estudiante.apellidos}`
                  : `Estudiante ${matricula.idEstudiante}`,
                evaluacion1: nota1,
                evaluacion2: nota2,
                promedio,
                estado
              };
            });
          })
        );
      })

    ).subscribe({

      next: estudiantes => {

        if (consultaActual !== this.numeroConsulta) return;

        this.estudiantes = estudiantes;
        this.cargando = false;

        if (!estudiantes.length) {
          this.mensaje =
            'No hay estudiantes matriculados para esta selección.';
        }

        this.cdr.detectChanges();
      },

      error: error => {

        if (consultaActual !== this.numeroConsulta) return;

        console.error('Error al cargar reporte:', error);

        this.cargando = false;
        this.mensaje =
          'No se pudieron consultar las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }

  get totalEstudiantes(): number {
    return this.estudiantes.length;
  }

  get aprobados(): number {
    return this.estudiantes.filter(
      e => e.estado === 'Aprobado'
    ).length;
  }

  get enProceso(): number {
    return this.estudiantes.filter(
      e => e.estado === 'En proceso'
    ).length;
  }

  get desaprobados(): number {
    return this.estudiantes.filter(
      e => e.estado === 'Desaprobado'
    ).length;
  }

  get promedioGeneral(): number | null {

    const promedios = this.estudiantes
      .map(e => e.promedio)
      .filter((n): n is number => n !== null);

    if (!promedios.length) return null;

    return promedios.reduce(
      (a, b) => a + b, 0
    ) / promedios.length;
  }
}
