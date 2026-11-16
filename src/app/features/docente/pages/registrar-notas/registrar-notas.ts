
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  forkJoin,
  of,
  switchMap,
  map,
  catchError
} from 'rxjs';

import {
  NotasApiService,
  AsignaturaApi,
  GradoSeccionApi,
  AsignacionDocenteApi
} from '../../../../core/services/notas-api';

interface Estudiante {
  id: number;
  idMatricula: number;
  nombre: string;
  evaluacion1: number | null;
  evaluacion2: number | null;
}

@Component({
  selector: 'app-registrar-notas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './registrar-notas.html',
  styleUrl: './registrar-notas.css'
})
export class RegistrarNotas implements OnInit {

  // DOCENTE DE PRUEBA
  private readonly idDocente = 1;

  // DATOS REALES DEL BACKEND
  private asignaturas: AsignaturaApi[] = [];
  private gradosSecciones: GradoSeccionApi[] = [];
  private asignaciones: AsignacionDocenteApi[] = [];

  // FILTROS
  cursos: { nombre: string; seccion: string }[] = [];
  salones: string[] = [];

  periodos: string[] = [
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  cursoSeleccionado = '';
  seccionSeleccionada = '';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  // ESTADO DE PANTALLA
  editando = false;
  mensaje = '';
  cargando = false;

  estudiantes: Estudiante[] = [];
  respaldo: Estudiante[] = [];

  private numeroConsulta = 0;

  constructor(
    private route: ActivatedRoute,
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const params = this.route.snapshot.queryParamMap;

    const curso = params.get('curso');
    const seccion = params.get('seccion');
    const periodo = params.get('periodo');
    const anio = params.get('anio');

    if (periodo && this.periodos.includes(periodo)) {
      this.periodoSeleccionado = periodo;
    }

    if (anio && /^\d{4}$/.test(anio)) {
      this.anioSeleccionado = anio;
    }

    this.cargarFiltros(curso, seccion);
  }

  // CARGAR CURSOS, SALONES Y ASIGNACIONES
  cargarFiltros(
    cursoInicial: string | null,
    seccionInicial: string | null
  ): void {

    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      asignaturas: this.notasApi.obtenerAsignaturas(),
      salones: this.notasApi.obtenerGradosSecciones(),
      asignaciones: this.notasApi.obtenerAsignaciones()
    }).subscribe({

      next: respuesta => {

        this.asignaturas = respuesta.asignaturas.filter(
          a => a.estado
        );

        this.gradosSecciones = respuesta.salones.filter(
          s => s.estado
        );

        this.asignaciones = respuesta.asignaciones.filter(
          a => a.estado && a.idDocente === this.idDocente
        );

        // CURSOS ASIGNADOS AL DOCENTE
        const cursosAsignados = this.asignaturas.filter(
          asignatura =>
            this.asignaciones.some(
              asignacion =>
                asignacion.idAsignatura ===
                asignatura.idAsignatura
            )
        );

        this.cursos = cursosAsignados.map(
          asignatura => ({
            nombre: asignatura.nombre,
            seccion: ''
          })
        );

        // CONSERVAR CURSO RECIBIDO POR URL
        const cursoCoincidente = this.cursos.find(
          c =>
            c.nombre.toLowerCase() ===
            (cursoInicial ?? '').toLowerCase()
        );

        this.cursoSeleccionado =
          cursoCoincidente?.nombre ??
          this.cursos[0]?.nombre ??
          '';

        this.actualizarSalones(seccionInicial);

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al cargar filtros:',
          error
        );

        this.cargando = false;
        this.mensaje =
          'No se pudieron cargar los cursos y salones desde Spring Boot.';

        this.cdr.detectChanges();
      }
    });
  }

  // SALONES DEL CURSO SELECCIONADO
  actualizarSalones(
    seccionInicial: string | null = null
  ): void {

    const asignatura = this.asignaturas.find(
      a => a.nombre === this.cursoSeleccionado
    );

    if (!asignatura) {
      this.salones = [];
      this.seccionSeleccionada = '';
      this.estudiantes = [];
      this.cargando = false;
      return;
    }

    const idsSalones = this.asignaciones
      .filter(
        a => a.idAsignatura === asignatura.idAsignatura
      )
      .map(a => a.idGradoSeccion);

    const salonesDisponibles = this.gradosSecciones.filter(
      salon =>
        idsSalones.includes(salon.idGradoSeccion) &&
        String(salon.anioEscolar) === this.anioSeleccionado
    );

    this.salones = salonesDisponibles.map(
      salon => `${salon.grado}.° ${salon.seccion}`
    );

    this.seccionSeleccionada =
      this.salones.includes(seccionInicial ?? '')
        ? seccionInicial!
        : this.salones[0] ?? '';

    this.cargarEstudiantes();
  }

  // CAMBIAR CURSO
  cambiarCurso(): void {
    this.actualizarSalones();
  }

  // BUSCAR ASIGNACIÓN Y MATRÍCULAS REALES
  cargarEstudiantes(): void {

    const consultaActual = ++this.numeroConsulta;

    this.estudiantes = [];
    this.respaldo = [];
    this.editando = false;
    this.mensaje = '';

    const asignatura = this.asignaturas.find(
      a => a.nombre === this.cursoSeleccionado
    );

    const salon = this.gradosSecciones.find(
      s =>
        `${s.grado}.° ${s.seccion}` ===
          this.seccionSeleccionada &&
        String(s.anioEscolar) === this.anioSeleccionado
    );

    if (!asignatura || !salon) {
      this.cargando = false;
      this.mensaje =
        'No hay una asignatura o salón disponible para esta selección.';
      this.cdr.detectChanges();
      return;
    }

    const asignacion = this.asignaciones.find(
      a =>
        a.idAsignatura === asignatura.idAsignatura &&
        a.idGradoSeccion === salon.idGradoSeccion
    );

    if (!asignacion) {
      this.cargando = false;
      this.mensaje =
        'El docente no tiene una asignación para este curso y salón.';
      this.cdr.detectChanges();
      return;
    }

    const idPeriodo = this.obtenerIdPeriodo();

    this.cargando = true;

    forkJoin({
      matriculas: this.notasApi.obtenerMatriculas(
        salon.idGradoSeccion
      ),
      estudiantes: this.notasApi.obtenerEstudiantes(),
      evaluaciones: this.notasApi.obtenerEvaluaciones(
        asignacion.idAsignacion
      )
    }).pipe(

      switchMap(respuesta => {

        const matriculas = respuesta.matriculas.filter(
          m => m.estado
        );

        const evaluaciones = respuesta.evaluaciones
          .filter(
            e => e.estado && e.idPeriodo === idPeriodo
          )
          .sort(
            (a, b) => a.idEvaluacion - b.idEvaluacion
          );

        if (matriculas.length === 0) {
          return of({
            estudiantes: [] as Estudiante[],
            sinMatriculas: true
          });
        }

        return forkJoin(
          matriculas.map(m =>
            this.notasApi.obtenerNotas(m.idMatricula)
          )
        ).pipe(
          map(notasPorMatricula => ({

            sinMatriculas: false,

            estudiantes: matriculas.map(
              (matricula, index): Estudiante => {

                const estudiante =
                  respuesta.estudiantes.find(
                    e =>
                      e.idEstudiante ===
                      matricula.idEstudiante
                  );

                const notas = notasPorMatricula[index]
                  .filter(n => n.estado);

                const nota1 = notas.find(
                  n =>
                    n.idEvaluacion ===
                    evaluaciones[0]?.idEvaluacion
                );

                const nota2 = notas.find(
                  n =>
                    n.idEvaluacion ===
                    evaluaciones[1]?.idEvaluacion
                );

                return {
                  id: matricula.idEstudiante,
                  idMatricula: matricula.idMatricula,
                  nombre: estudiante
                    ? `${estudiante.nombres} ${estudiante.apellidos}`
                    : `Estudiante ${matricula.idEstudiante}`,
                  evaluacion1: nota1?.calificacion ?? null,
                  evaluacion2: nota2?.calificacion ?? null
                };
              }
            )
          }))
        );
      }),

      catchError(error => {
        console.error('Error al consultar notas:', error);
        throw error;
      })

    ).subscribe({

      next: resultado => {

        if (consultaActual !== this.numeroConsulta) {
          return;
        }

        this.estudiantes = resultado.estudiantes;
        this.cargando = false;

        if (resultado.sinMatriculas) {
          this.mensaje =
            'No hay estudiantes matriculados en este salón.';
        }

        this.cdr.detectChanges();
      },

      error: error => {

        if (consultaActual !== this.numeroConsulta) {
          return;
        }

        console.error(error);

        this.cargando = false;
        this.mensaje =
          'No se pudieron consultar los datos desde Spring Boot.';

        this.cdr.detectChanges();
      }
    });
  }

  // RELACIONAR BIMESTRE CON ID
  obtenerIdPeriodo(): number {

    const ids: Record<string, number> = {
      'I Bimestre': 1,
      'II Bimestre': 2,
      'III Bimestre': 3,
      'IV Bimestre': 4
    };

    return ids[this.periodoSeleccionado] ?? 1;
  }

  // COMPATIBILIDAD CON EL HTML
  obtenerClave(): string {

    return [
      'notas',
      this.cursoSeleccionado,
      this.seccionSeleccionada,
      this.periodoSeleccionado,
      this.anioSeleccionado
    ].join('-');
  }

  // CALCULAR PROMEDIO
  promedio(estudiante: Estudiante): number | null {

    const notas = [
      estudiante.evaluacion1,
      estudiante.evaluacion2
    ].filter(
      (n): n is number => n !== null
    );

    if (notas.length === 0) {
      return null;
    }

    return notas.reduce(
      (total, nota) => total + nota,
      0
    ) / notas.length;
  }

  // ESTADO ACADÉMICO
  estado(estudiante: Estudiante): string {

    const nota = this.promedio(estudiante);

    if (nota === null) {
      return 'Sin notas';
    }

    if (nota >= 11) {
      return 'Aprobado';
    }

    if (nota >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  // FUNCIONES EXISTENTES
  editarNotas(): void {
    this.editando = true;
  }

  cancelar(): void {
    this.editando = false;
  }

  guardarNotas(): void {
    this.mensaje =
      'Para modificar las calificaciones, utiliza la pantalla Editar notas.';
  }
}
