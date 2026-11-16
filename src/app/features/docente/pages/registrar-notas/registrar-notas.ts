import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, map, catchError, throwError } from 'rxjs';

import {
  NotasApiService,
  AsignaturaApi,
  GradoSeccionApi,
  AsignacionDocenteApi
} from '../../../../core/services/notas-api';
import { SesionService } from '../../../../core/services/sesion';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-notas.html',
  styleUrl: './registrar-notas.css'
})
export class RegistrarNotas implements OnInit {
  nombreDocente = '';

  private asignaturas: AsignaturaApi[] = [];
  private gradosSecciones: GradoSeccionApi[] = [];
  private asignaciones: AsignacionDocenteApi[] = [];

  cursos: { nombre: string; seccion: string }[] = [];
  salones: string[] = [];
  periodos = ['I Bimestre', 'II Bimestre', 'III Bimestre', 'IV Bimestre'];

  cursoSeleccionado = '';
  seccionSeleccionada = '';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  editando = false;
  mensaje = '';
  cargando = false;
  estudiantes: Estudiante[] = [];
  respaldo: Estudiante[] = [];

  private numeroConsulta = 0;

  constructor(
    private route: ActivatedRoute,
    private notasApi: NotasApiService,
    private sesionService: SesionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const usuario = this.sesionService.obtenerUsuario();
    this.nombreDocente = usuario?.rol === 'docente' ? usuario.nombre : '';

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

  cargarFiltros(cursoInicial: string | null = null, seccionInicial: string | null = null): void {
    const usuario = this.sesionService.obtenerUsuario();
    ++this.numeroConsulta;

    if (!usuario || usuario.rol !== 'docente') {
      this.cargando = false;
      this.cursos = [];
      this.salones = [];
      this.estudiantes = [];
      this.mensaje = 'Debes iniciar sesión como docente.';
      this.cdr.detectChanges();
      return;
    }

    this.nombreDocente = usuario.nombre;
    const idDocente = Number(usuario.id);
    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      asignaturas: this.notasApi.obtenerAsignaturas(),
      salones: this.notasApi.obtenerGradosSecciones(),
      asignaciones: this.notasApi.obtenerAsignaciones()
    }).subscribe({
      next: respuesta => {
        this.asignaturas = respuesta.asignaturas.filter(a => a.estado === true);
        this.gradosSecciones = respuesta.salones.filter(s => s.estado === true);
        this.asignaciones = respuesta.asignaciones.filter(
          a => a.estado === true && Number(a.idDocente) === idDocente
        );

        const idsAsignaturas = new Set(this.asignaciones.map(a => Number(a.idAsignatura)));
        const nombresVistos = new Set<string>();
        this.cursos = this.asignaturas
          .filter(a => idsAsignaturas.has(Number(a.idAsignatura)))
          .filter(a => {
            if (nombresVistos.has(a.nombre)) return false;
            nombresVistos.add(a.nombre);
            return true;
          })
          .map(a => ({ nombre: a.nombre, seccion: '' }));

        const cursoCoincidente = this.cursos.find(
          c => c.nombre.toLowerCase() === (cursoInicial ?? '').toLowerCase()
        );
        this.cursoSeleccionado = cursoCoincidente?.nombre ?? this.cursos[0]?.nombre ?? '';

        if (this.cursos.length === 0) {
          this.salones = [];
          this.seccionSeleccionada = '';
          this.estudiantes = [];
          this.cargando = false;
          this.mensaje = 'No se encontraron cursos asignados a este docente. Verifica sus asignaciones con el director.';
          this.cdr.detectChanges();
          return;
        }

        this.actualizarSalones(seccionInicial);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar cursos y salones:', error);
        this.cargando = false;
        this.cursos = [];
        this.salones = [];
        this.estudiantes = [];
        this.mensaje = error.status === 401
          ? 'La sesión no fue reconocida por Spring Boot. Verifica que las peticiones envíen las credenciales.'
          : error.status === 403
            ? 'No tienes permiso para consultar las asignaciones.'
            : 'No se pudieron cargar los cursos y salones desde Spring Boot.';
        this.cdr.detectChanges();
      }
    });
  }

  actualizarSalones(seccionInicial: string | null = null): void {
    const asignatura = this.asignaturas.find(a => a.nombre === this.cursoSeleccionado);

    if (!asignatura) {
      this.salones = [];
      this.seccionSeleccionada = '';
      this.estudiantes = [];
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const idsSalones = new Set(
      this.asignaciones
        .filter(a => Number(a.idAsignatura) === Number(asignatura.idAsignatura))
        .map(a => Number(a.idGradoSeccion))
    );

    const salonesDisponibles = this.gradosSecciones.filter(
      s => idsSalones.has(Number(s.idGradoSeccion)) &&
        String(s.anioEscolar) === String(this.anioSeleccionado)
    );

    this.salones = [...new Set(salonesDisponibles.map(s => `${s.grado}.° ${s.seccion}`))];
    this.seccionSeleccionada = this.salones.includes(seccionInicial ?? '')
      ? seccionInicial!
      : this.salones[0] ?? '';

    if (!this.seccionSeleccionada) {
      ++this.numeroConsulta;
      this.estudiantes = [];
      this.cargando = false;
      this.mensaje = 'No hay salones asignados a este curso en el año escolar seleccionado.';
      this.cdr.detectChanges();
      return;
    }

    this.cargarEstudiantes();
  }

  cambiarCurso(): void {
    this.actualizarSalones();
  }

  cambiarAnio(): void {
    this.actualizarSalones();
  }

  cargarEstudiantes(): void {
    const consultaActual = ++this.numeroConsulta;
    this.estudiantes = [];
    this.respaldo = [];
    this.editando = false;
    this.mensaje = '';

    const asignatura = this.asignaturas.find(a => a.nombre === this.cursoSeleccionado);
    const salon = this.gradosSecciones.find(
      s => `${s.grado}.° ${s.seccion}` === this.seccionSeleccionada &&
        String(s.anioEscolar) === String(this.anioSeleccionado)
    );

    if (!asignatura || !salon) {
      this.cargando = false;
      this.mensaje = 'Selecciona un curso y salón disponibles.';
      this.cdr.detectChanges();
      return;
    }

    const asignacion = this.asignaciones.find(
      a => Number(a.idAsignatura) === Number(asignatura.idAsignatura) &&
        Number(a.idGradoSeccion) === Number(salon.idGradoSeccion)
    );

    if (!asignacion) {
      this.cargando = false;
      this.mensaje = 'No tienes una asignación para este curso y salón.';
      this.cdr.detectChanges();
      return;
    }

    const idPeriodo = this.obtenerIdPeriodo();
    this.cargando = true;

    forkJoin({
      matriculas: this.notasApi.obtenerMatriculas(salon.idGradoSeccion),
      estudiantes: this.notasApi.obtenerEstudiantes(),
      evaluaciones: this.notasApi.obtenerEvaluaciones(asignacion.idAsignacion)
    }).pipe(
      switchMap(respuesta => {
        const matriculas = respuesta.matriculas.filter(
          m => m.estado === true && Number(m.idGradoSeccion) === Number(salon.idGradoSeccion)
        );
        const evaluaciones = respuesta.evaluaciones
          .filter(e => e.estado === true && Number(e.idPeriodo) === idPeriodo)
          .sort((a, b) => a.idEvaluacion - b.idEvaluacion);

        if (matriculas.length === 0) {
          return of({ estudiantes: [] as Estudiante[], sinMatriculas: true });
        }

        if (evaluaciones.length === 0) {
          const filas: Estudiante[] = matriculas.map(m => {
            const estudiante = respuesta.estudiantes.find(e => Number(e.idEstudiante) === Number(m.idEstudiante));
            return {
              id: m.idEstudiante,
              idMatricula: m.idMatricula,
              nombre: estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : `Estudiante ${m.idEstudiante}`,
              evaluacion1: null,
              evaluacion2: null
            };
          });
          return of({ estudiantes: filas, sinMatriculas: false });
        }

        return forkJoin(matriculas.map(m => this.notasApi.obtenerNotas(m.idMatricula))).pipe(
          map(notasPorMatricula => ({
            sinMatriculas: false,
            estudiantes: matriculas.map((matricula, index): Estudiante => {
              const estudiante = respuesta.estudiantes.find(
                e => Number(e.idEstudiante) === Number(matricula.idEstudiante)
              );
              const notas = notasPorMatricula[index].filter(n => n.estado === true);
              const nota1 = notas.find(n => Number(n.idEvaluacion) === Number(evaluaciones[0]?.idEvaluacion));
              const nota2 = notas.find(n => Number(n.idEvaluacion) === Number(evaluaciones[1]?.idEvaluacion));
              return {
                id: matricula.idEstudiante,
                idMatricula: matricula.idMatricula,
                nombre: estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : `Estudiante ${matricula.idEstudiante}`,
                evaluacion1: nota1?.calificacion ?? null,
                evaluacion2: nota2?.calificacion ?? null
              };
            })
          }))
        );
      }),
      catchError(error => {
        console.error('Error al consultar estudiantes y notas:', error);
        return throwError(() => error);
      })
    ).subscribe({
      next: resultado => {
        if (consultaActual !== this.numeroConsulta) return;
        this.estudiantes = resultado.estudiantes;
        this.cargando = false;
        if (resultado.sinMatriculas) {
          this.mensaje = 'No hay estudiantes matriculados en este salón.';
        }
        this.cdr.detectChanges();
      },
      error: error => {
        if (consultaActual !== this.numeroConsulta) return;
        this.cargando = false;
        this.mensaje = error.status === 401
          ? 'Tu sesión ha expirado o no se están enviando las credenciales.'
          : 'No se pudieron consultar los estudiantes y sus notas desde Spring Boot.';
        this.cdr.detectChanges();
      }
    });
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

  obtenerClave(): string {
    return [
      'notas', this.cursoSeleccionado, this.seccionSeleccionada,
      this.periodoSeleccionado, this.anioSeleccionado
    ].join('-');
  }

  promedio(estudiante: Estudiante): number | null {
    const notas = [estudiante.evaluacion1, estudiante.evaluacion2]
      .filter((n): n is number => n !== null);
    if (notas.length === 0) return null;
    return notas.reduce((total, nota) => total + nota, 0) / notas.length;
  }

  estado(estudiante: Estudiante): string {
    const nota = this.promedio(estudiante);
    if (nota === null) return 'Sin notas';
    if (nota >= 11) return 'Aprobado';
    if (nota >= 9) return 'En proceso';
    return 'Desaprobado';
  }

  editarNotas(): void { this.editando = true; }
  cancelar(): void { this.editando = false; }
  guardarNotas(): void {
    this.mensaje = 'Para modificar las calificaciones, utiliza la pantalla Editar notas.';
  }
}
