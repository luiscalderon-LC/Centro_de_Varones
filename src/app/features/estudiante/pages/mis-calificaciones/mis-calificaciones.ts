
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

import {
  NotasApiService,
  EvaluacionApi
} from '../../../../core/services/notas-api';

interface Curso {
  nombre: string;
  evaluacion1: number | null;
  evaluacion2: number | null;
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

  // IDENTIFICADORES TEMPORALES PARA PRUEBAS
  estudianteId = 2;

  private readonly idMatricula = 1;
  private readonly idAsignacion = 1;

  // INFORMACIÓN DEL ESTUDIANTE
  estudiante = {
    nombre: 'Cargando estudiante...',
    grado: '5.° A',
    anio: 2026
  };

  // CURSOS Y CALIFICACIONES
  cursos: Curso[] = [];

  cursoSeleccionado = 'Matemáticas';
  periodoSeleccionado = 'I Bimestre';

  // ESTADOS DE LA PANTALLA
  cargando = false;
  mensajeError = '';

  constructor(
    private route: ActivatedRoute,
    private datosService: DatosAcademicosService,
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  // INICIALIZAR COMPONENTE
  ngOnInit(): void {

    this.cargarEstudiante();

    this.route.queryParamMap.subscribe(params => {

      const curso = params.get('curso');
      const periodo = params.get('periodo');

      if (
        curso &&
        this.datosService.cursos.includes(curso)
      ) {
        this.cursoSeleccionado = curso;
      }

      if (
        periodo &&
        this.datosService.periodos.includes(periodo)
      ) {
        this.periodoSeleccionado = periodo;
      }

      this.cargarCalificaciones();

    });
  }

  // OBTENER ESTUDIANTE REAL DESDE SQL SERVER
  cargarEstudiante(): void {

    this.estudiante.nombre = 'Cargando estudiante...';

    this.notasApi.obtenerEstudiantes().subscribe({

      next: estudiantes => {

        console.log(
          'Estudiantes recibidos desde SQL Server:',
          estudiantes
        );

        const encontrado = estudiantes.find(
          estudiante =>
            Number(estudiante.idEstudiante) ===
            this.estudianteId
        );

        if (encontrado) {

          this.estudiante.nombre =
            `${encontrado.nombres} ${encontrado.apellidos}`;

        } else {

          this.estudiante.nombre =
            'Estudiante no encontrado';

        }

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al consultar estudiante:',
          error
        );

        this.estudiante.nombre =
          'Error al cargar estudiante';

        this.cdr.detectChanges();
      }

    });
  }

  // CONSULTAR CALIFICACIONES REALES
  cargarCalificaciones(): void {

    this.cargando = true;
    this.mensajeError = '';
    this.cursos = [];

    this.cdr.detectChanges();

    // INTEGRACIÓN INICIAL:
    // MATEMÁTICAS - 5.° A - AÑO 2026
    if (this.cursoSeleccionado !== 'Matemáticas') {

      this.cargando = false;

      this.mensajeError =
        'Todavía no hay datos reales configurados para este curso.';

      this.cdr.detectChanges();

      return;
    }

    const idPeriodo = this.obtenerIdPeriodo();

    forkJoin({

      evaluaciones:
        this.notasApi.obtenerEvaluaciones(
          this.idAsignacion
        ),

      notas:
        this.notasApi.obtenerNotas(
          this.idMatricula
        )

    }).subscribe({

      next: respuesta => {

        console.log(
          'Evaluaciones recibidas:',
          respuesta.evaluaciones
        );

        console.log(
          'Notas recibidas:',
          respuesta.notas
        );

        // FILTRAR EVALUACIONES POR BIMESTRE
        const evaluaciones = respuesta.evaluaciones
          .filter(
            evaluacion =>
              evaluacion.idPeriodo === idPeriodo
          )
          .sort(
            (a, b) =>
              a.idEvaluacion - b.idEvaluacion
          );

        const evaluacion1 = evaluaciones[0];
        const evaluacion2 = evaluaciones[1];

        // BUSCAR NOTA DE CADA EVALUACIÓN
        const buscarNota = (
          evaluacion: EvaluacionApi | undefined
        ): number | null => {

          if (!evaluacion) {
            return null;
          }

          const nota = respuesta.notas.find(
            registro =>
              registro.idEvaluacion ===
                evaluacion.idEvaluacion &&
              registro.estado === true
          );

          if (!nota || nota.calificacion == null) {
            return null;
          }

          const calificacion =
            Number(nota.calificacion);

          return Number.isFinite(calificacion)
            ? calificacion
            : null;
        };

        // ACTUALIZAR CURSO CON NOTAS REALES
        this.cursos = [{

          nombre: 'Matemáticas',

          evaluacion1:
            buscarNota(evaluacion1),

          evaluacion2:
            buscarNota(evaluacion2)

        }];

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al consultar calificaciones:',
          error
        );

        this.cargando = false;

        this.mensajeError =
          'No se pudieron consultar las calificaciones.';

        this.cdr.detectChanges();
      }

    });
  }

  // OBTENER IDENTIFICADOR DEL BIMESTRE
  obtenerIdPeriodo(): number {

    const periodos: Record<string, number> = {
      'I Bimestre': 1,
      'II Bimestre': 2,
      'III Bimestre': 3,
      'IV Bimestre': 4
    };

    return periodos[this.periodoSeleccionado] ?? 1;
  }

  // OBTENER CURSO SELECCIONADO
  get cursoActual(): Curso | undefined {

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

    const notas = [
      curso.evaluacion1,
      curso.evaluacion2
    ].filter(
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

    return Math.max(0, 11 - promedio);
  }

  // MOSTRAR MENSAJE ACADÉMICO
  get mensajeAcademico(): string {

    const promedio = this.promedio;

    if (promedio === null) {
      return 'Todavía no tienes calificaciones registradas.';
    }

    if (promedio >= 11) {
      return 'Has alcanzado la nota mínima aprobatoria en las evaluaciones registradas. Continúa manteniendo tu buen rendimiento académico.';
    }

    if (promedio >= 9) {
      return `Estás cerca de aprobar. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio provisional para alcanzar la nota mínima de 11.`;
    }

    return `Actualmente estás desaprobado en este curso. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio provisional para alcanzar la nota mínima de 11.`;
  }

}
