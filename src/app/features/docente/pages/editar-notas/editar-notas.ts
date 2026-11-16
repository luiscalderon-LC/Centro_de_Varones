
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  forkJoin,
  from,
  of,
  concatMap,
  switchMap,
  map,
  toArray
} from 'rxjs';

import {
  NotasApiService,
  AsignaturaApi,
  GradoSeccionApi,
  AsignacionDocenteApi,
  EvaluacionApi,
  RegistroNotaApi,
  GuardarNotaApi
} from '../../../../core/services/notas-api';

import {
  SesionService
} from '../../../../core/services/sesion';

// DATOS DEL ESTUDIANTE
interface Estudiante {
  id: number;
  idMatricula: number;
  nombre: string;
  evaluacion1: number | null;
  evaluacion2: number | null;
}

// CAMBIOS DE CALIFICACIONES
interface CambioNota {
  idEvaluacion: number;
  idMatricula: number;
  calificacion: number;
  notaExistente?: RegistroNotaApi;
}

@Component({
  selector: 'app-editar-notas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './editar-notas.html',
  styleUrl: './editar-notas.css'
})
export class EditarNotas implements OnInit {

  // DOCENTE AUTENTICADO
  private idDocente: number | null = null;

  // DATOS DEL BACKEND
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

  // ESTUDIANTES Y NOTAS
  estudiantes: Estudiante[] = [];

  private evaluaciones: EvaluacionApi[] = [];
  private notasOriginales: RegistroNotaApi[] = [];

  // ESTADO DE LA PANTALLA
  mensaje = '';
  error = false;
  cargando = false;
  guardando = false;

  private numeroConsulta = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef,
    private sesionService: SesionService
  ) {}

  // ======================================
  // INICIAR COMPONENTE
  // ======================================
  ngOnInit(): void {

    const usuario = this.sesionService.obtenerUsuario();

    if (!usuario || usuario.rol !== 'docente') {
      this.router.navigate(['/login-docente']);
      return;
    }

    // OBTENER ID DEL DOCENTE QUE INICIÓ SESIÓN
    this.idDocente = usuario.id;

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

  // ======================================
  // CONSULTAR CURSOS Y SALONES
  // ======================================
  cargarFiltros(
    cursoInicial: string | null,
    seccionInicial: string | null
  ): void {

    if (this.idDocente === null) {
      this.error = true;
      this.mensaje = 'No se encontró la sesión del docente.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = false;

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

        // SOLO ASIGNACIONES DEL DOCENTE AUTENTICADO
        this.asignaciones = respuesta.asignaciones.filter(
          a =>
            a.estado &&
            a.idDocente === this.idDocente
        );

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

        if (this.cursos.length === 0) {
          this.salones = [];
          this.estudiantes = [];
          this.cursoSeleccionado = '';
          this.seccionSeleccionada = '';
          this.cargando = false;

          this.mensaje =
            'No tienes cursos asignados. Consulta con el director.';

          this.cdr.detectChanges();
          return;
        }

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
        this.error = true;
        this.mensaje =
          'No se pudieron cargar los cursos y salones.';

        this.cdr.detectChanges();
      }
    });
  }

  // ======================================
  // SALONES DEL CURSO SELECCIONADO
  // ======================================
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

      this.cdr.detectChanges();
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

  // ======================================
  // CAMBIAR CURSO
  // ======================================
  cambiarCurso(): void {
    this.actualizarSalones();
  }

  // ======================================
  // CONSULTAR ESTUDIANTES Y NOTAS
  // ======================================
  cargarEstudiantes(): void {

    const consultaActual = ++this.numeroConsulta;

    this.estudiantes = [];
    this.evaluaciones = [];
    this.notasOriginales = [];

    this.mensaje = '';
    this.error = false;

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
        'No hay cursos o salones disponibles para esta selección.';

      this.cdr.detectChanges();
      return;
    }

    const asignacion = this.asignaciones.find(
      a =>
        a.idAsignatura === asignatura.idAsignatura &&
        a.idGradoSeccion === salon.idGradoSeccion &&
        a.idDocente === this.idDocente
    );

    if (!asignacion) {

      this.cargando = false;
      this.error = true;
      this.mensaje =
        'El docente no tiene asignación para este curso y salón.';

      this.cdr.detectChanges();
      return;
    }

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
            e =>
              e.estado &&
              e.idPeriodo === this.obtenerIdPeriodo()
          )
          .sort(
            (a, b) => a.idEvaluacion - b.idEvaluacion
          );

        if (matriculas.length === 0) {

          return of({
            estudiantes: [] as Estudiante[],
            evaluaciones,
            notasOriginales: [] as RegistroNotaApi[],
            sinMatriculas: true
          });
        }

        return forkJoin(
          matriculas.map(
            m => this.notasApi.obtenerNotas(m.idMatricula)
          )
        ).pipe(

          map(notasPorMatricula => {

            const estudiantes: Estudiante[] =
              matriculas.map((matricula, index) => {

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
              });

            return {
              estudiantes,
              evaluaciones,
              notasOriginales: notasPorMatricula.flat(),
              sinMatriculas: false
            };
          })
        );
      })

    ).subscribe({

      next: resultado => {

        if (consultaActual !== this.numeroConsulta) {
          return;
        }

        this.estudiantes = resultado.estudiantes;
        this.evaluaciones = resultado.evaluaciones;
        this.notasOriginales = resultado.notasOriginales;

        this.cargando = false;

        if (resultado.sinMatriculas) {
          this.mensaje =
            'No hay estudiantes matriculados en este salón.';
        } else if (this.evaluaciones.length === 0) {
          this.mensaje =
            'No hay evaluaciones configuradas para este bimestre.';
        }

        this.cdr.detectChanges();
      },

      error: error => {

        if (consultaActual !== this.numeroConsulta) {
          return;
        }

        console.error(
          'Error al consultar notas:',
          error
        );

        this.cargando = false;
        this.error = true;
        this.mensaje =
          'No se pudieron consultar las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }

  // ======================================
  // OBTENER ID DEL BIMESTRE
  // ======================================
  obtenerIdPeriodo(): number {

    const ids: Record<string, number> = {
      'I Bimestre': 1,
      'II Bimestre': 2,
      'III Bimestre': 3,
      'IV Bimestre': 4
    };

    return ids[this.periodoSeleccionado] ?? 1;
  }

  // ======================================
  // CALCULAR PROMEDIO
  // ======================================
  promedio(estudiante: Estudiante): number {

    const notas = [
      estudiante.evaluacion1,
      estudiante.evaluacion2
    ].filter(
      (nota): nota is number =>
        nota !== null && nota !== undefined
    );

    if (notas.length === 0) {
      return 0;
    }

    return notas.reduce(
      (total, nota) => total + nota,
      0
    ) / notas.length;
  }

  // ======================================
  // ESTADO ACADÉMICO
  // ======================================
  estado(estudiante: Estudiante): string {

    const tieneNotas =
      estudiante.evaluacion1 !== null ||
      estudiante.evaluacion2 !== null;

    if (!tieneNotas) {
      return 'Sin notas';
    }

    const nota = this.promedio(estudiante);

    if (nota >= 11) {
      return 'Aprobado';
    }

    if (nota >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  // ======================================
  // CONSERVAR FILTROS AL REGRESAR
  // ======================================
  obtenerParametros() {

    return {
      curso: this.cursoSeleccionado,
      seccion: this.seccionSeleccionada,
      periodo: this.periodoSeleccionado,
      anio: this.anioSeleccionado
    };
  }

  // ======================================
  // CANCELAR EDICIÓN
  // ======================================
  cancelar(): void {

    this.router.navigate(['/registrar-notas'], {
      queryParams: this.obtenerParametros()
    });
  }

  // ======================================
  // GUARDAR CALIFICACIONES EN SQL SERVER
  // ======================================
  guardarCambios(): void {

    if (this.cargando || this.guardando) {
      return;
    }

    this.error = false;
    this.mensaje = '';

    if (this.evaluaciones.length === 0) {

      this.error = true;
      this.mensaje =
        'No hay evaluaciones configuradas para registrar notas.';

      this.cdr.detectChanges();
      return;
    }

    const cambios: CambioNota[] = [];

    for (const estudiante of this.estudiantes) {

      const valores = [
        estudiante.evaluacion1,
        estudiante.evaluacion2
      ];

      for (let i = 0; i < valores.length; i++) {

        const valor = valores[i];
        const evaluacion = this.evaluaciones[i];

        if (
          valor === null ||
          valor === undefined ||
          valor === ('' as unknown as number)
        ) {
          continue;
        }

        if (
          typeof valor !== 'number' ||
          !Number.isFinite(valor) ||
          valor < 0 ||
          valor > 20
        ) {

          this.error = true;
          this.mensaje =
            'Las calificaciones deben estar entre 0 y 20.';

          this.cdr.detectChanges();
          return;
        }

        if (!evaluacion) {

          this.error = true;
          this.mensaje =
            'La evaluación todavía no está configurada.';

          this.cdr.detectChanges();
          return;
        }

        const existente = this.notasOriginales.find(
          nota =>
            nota.estado &&
            nota.idEvaluacion === evaluacion.idEvaluacion &&
            nota.idMatricula === estudiante.idMatricula
        );

        if (
          existente &&
          Number(existente.calificacion) === valor
        ) {
          continue;
        }

        cambios.push({
          idEvaluacion: evaluacion.idEvaluacion,
          idMatricula: estudiante.idMatricula,
          calificacion: valor,
          notaExistente: existente
        });
      }
    }

    if (cambios.length === 0) {

      this.mensaje =
        'No hay cambios nuevos para guardar.';

      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    from(cambios).pipe(

      concatMap(cambio => {

        const datos: GuardarNotaApi = {
          idEvaluacion: cambio.idEvaluacion,
          idMatricula: cambio.idMatricula,
          calificacion: cambio.calificacion
        };

        if (cambio.notaExistente) {

          return this.notasApi.actualizarNota(
            cambio.notaExistente.idNota,
            datos
          );
        }

        return this.notasApi.registrarNota(datos);
      }),

      toArray()

    ).subscribe({

      next: () => {

        this.guardando = false;
        this.error = false;
        this.mensaje =
          'Calificaciones guardadas correctamente.';

        this.cdr.detectChanges();

        this.router.navigate(['/registrar-notas'], {
          queryParams: this.obtenerParametros()
        });
      },

      error: error => {

        console.error(
          'Error al guardar calificaciones:',
          error
        );

        this.guardando = false;
        this.error = true;
        this.mensaje =
          'No se pudieron guardar todas las calificaciones.';

        this.cdr.detectChanges();
      }
    });
  }
}
