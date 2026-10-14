
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

interface Estudiante {
  id: number;
  nombre: string;
  evaluacion1: number;
  evaluacion2: number;
}

@Component({
  selector: 'app-registrar-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registrar-notas.html',
  styleUrl: './registrar-notas.css'
})
export class RegistrarNotas implements OnInit {

  // CURSOS DISPONIBLES
  cursos: { nombre: string; seccion: string }[] = [];

  // 15 SALONES: 1.° A HASTA 5.° C
  salones: string[] = [];

  // BIMESTRES
  periodos: string[] = [];

  cursoSeleccionado = 'Matemáticas';
  seccionSeleccionada = '5.° A';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  editando = false;
  mensaje = '';

  estudiantes: Estudiante[] = [];
  respaldo: Estudiante[] = [];

  constructor(
    private route: ActivatedRoute,
    private datosService: DatosAcademicosService
  ) {
    this.cursos = this.datosService.cursos.map(nombre => ({
      nombre,
      seccion: '5.° A'
    }));

    this.salones = [...this.datosService.salones];
    this.periodos = [...this.datosService.periodos];
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {

      const curso = params.get('curso');
      const seccion = params.get('seccion');
      const periodo = params.get('periodo');

      if (
        curso &&
        this.datosService.cursos.includes(curso)
      ) {
        this.cursoSeleccionado = curso;
      }

      if (
        seccion &&
        this.salones.includes(seccion)
      ) {
        this.seccionSeleccionada = seccion;
      }

      if (
        periodo &&
        this.periodos.includes(periodo)
      ) {
        this.periodoSeleccionado = periodo;
      }

      // El servicio académico trabaja con el año 2026.
      this.anioSeleccionado = String(this.datosService.anio);

      this.cargarEstudiantes();
    });
  }

  // CARGAR ESTUDIANTES DEL SALÓN SELECCIONADO
  cargarEstudiantes(): void {

    const partes = this.seccionSeleccionada.split(' ');

    const grado = partes[0];
    const seccion = partes[1];

    const matriculados =
      this.datosService.obtenerEstudiantesPorSalon(
        grado,
        seccion
      );

    const notas =
      this.datosService.obtenerNotasPorSalon(
        this.cursoSeleccionado,
        this.periodoSeleccionado,
        grado,
        seccion,
        Number(this.anioSeleccionado)
      );

    this.estudiantes = matriculados.map(estudiante => {

      const nota = notas.find(
        item => item.estudianteId === estudiante.id
      );

      return {
        id: estudiante.id,
        nombre: estudiante.nombre,
        evaluacion1: nota?.evaluacion1 ?? 0,
        evaluacion2: nota?.evaluacion2 ?? 0
      };
    });

    this.editando = false;
    this.respaldo = [];
    this.mensaje = '';
  }

  // CAMBIAR DE CURSO
  cambiarCurso(): void {
    this.cargarEstudiantes();
  }

  // SE CONSERVA POR COMPATIBILIDAD
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
  promedio(estudiante: Estudiante): number {
    return this.datosService.calcularPromedio(
      estudiante.evaluacion1,
      estudiante.evaluacion2
    );
  }

  // ESTADO ACADÉMICO
  estado(estudiante: Estudiante): string {

    const nota = this.promedio(estudiante);

    if (nota >= 11) {
      return 'Aprobado';
    }

    if (nota >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  // ACTIVAR EDICIÓN
  editarNotas(): void {
    this.respaldo = this.estudiantes.map(
      estudiante => ({ ...estudiante })
    );

    this.editando = true;
    this.mensaje = '';
  }

  // CANCELAR EDICIÓN
  cancelar(): void {

    if (!this.editando) {
      return;
    }

    this.estudiantes = this.respaldo.map(
      estudiante => ({ ...estudiante })
    );

    this.editando = false;
    this.mensaje = '';
  }

  // GUARDAR CALIFICACIONES
  guardarNotas(): void {

    if (!this.editando) {
      return;
    }

    const validas = this.estudiantes.every(estudiante =>
      Number.isFinite(estudiante.evaluacion1) &&
      Number.isFinite(estudiante.evaluacion2) &&
      estudiante.evaluacion1 >= 0 &&
      estudiante.evaluacion1 <= 20 &&
      estudiante.evaluacion2 >= 0 &&
      estudiante.evaluacion2 <= 20
    );

    if (!validas) {
      this.mensaje = 'Las notas deben estar entre 0 y 20.';
      return;
    }

    for (const estudiante of this.estudiantes) {

      const guardado = this.datosService.actualizarNota(
        estudiante.id,
        this.cursoSeleccionado,
        this.periodoSeleccionado,
        estudiante.evaluacion1,
        estudiante.evaluacion2
      );

      if (!guardado) {
        this.mensaje =
          'No se pudieron guardar todas las calificaciones.';
        return;
      }
    }

    this.editando = false;
    this.respaldo = [];

    this.mensaje =
      'Las calificaciones se guardaron correctamente.';
  }

}
