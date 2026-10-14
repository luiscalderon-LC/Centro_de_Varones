
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  selector: 'app-editar-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-notas.html',
  styleUrl: './editar-notas.css'
})
export class EditarNotas implements OnInit {

  // CURSOS DISPONIBLES
  cursos: { nombre: string; seccion: string }[] = [];

  // 15 SALONES
  salones: string[] = [];

  // PERIODOS ACADÉMICOS
  periodos: string[] = [];

  cursoSeleccionado = 'Matemáticas';
  seccionSeleccionada = '5.° A';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  estudiantes: Estudiante[] = [];

  mensaje = '';
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datosService: DatosAcademicosService
  ) {
    this.cursos = this.datosService.cursos.map(nombre => ({
      nombre,
      seccion: '5.° A'
    }));

    this.salones = [...this.datosService.salones];
    this.periodos = [...this.datosService.periodos];
  }

  // 1. RECIBIR CURSO, SALÓN Y PERIODO
  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {

      const curso = params.get('curso');
      const seccion = params.get('seccion');
      const periodo = params.get('periodo');
      const anio = params.get('anio');

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

      if (
        anio &&
        Number(anio) === this.datosService.anio
      ) {
        this.anioSeleccionado = anio;
      }

      this.cargarEstudiantes();
    });
  }

  // 2. CARGAR SOLAMENTE LOS ESTUDIANTES DEL SALÓN
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

    this.mensaje = '';
    this.error = false;
  }

  // 3. CAMBIAR DE CURSO
  cambiarCurso(): void {
    this.cargarEstudiantes();
  }

  // 4. CALCULAR PROMEDIO
  promedio(estudiante: Estudiante): number {

    return this.datosService.calcularPromedio(
      estudiante.evaluacion1,
      estudiante.evaluacion2
    );
  }

  // 5. MOSTRAR ESTADO ACADÉMICO
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

  // 6. CONSERVAR FILTROS AL REGRESAR
  obtenerParametros() {
    return {
      curso: this.cursoSeleccionado,
      seccion: this.seccionSeleccionada,
      periodo: this.periodoSeleccionado,
      anio: this.anioSeleccionado
    };
  }

  // 7. CANCELAR SIN GUARDAR
  cancelar(): void {

    this.router.navigate(['/registrar-notas'], {
      queryParams: this.obtenerParametros()
    });
  }

  // 8. GUARDAR CALIFICACIONES
  guardarCambios(): void {

    const validas = this.estudiantes.every(estudiante =>
      Number.isFinite(estudiante.evaluacion1) &&
      Number.isFinite(estudiante.evaluacion2) &&
      estudiante.evaluacion1 >= 0 &&
      estudiante.evaluacion1 <= 20 &&
      estudiante.evaluacion2 >= 0 &&
      estudiante.evaluacion2 <= 20
    );

    if (!validas) {
      this.error = true;
      this.mensaje =
        'Las calificaciones deben estar entre 0 y 20.';
      return;
    }

    for (const estudiante of this.estudiantes) {

      const guardada =
        this.datosService.actualizarNota(
          estudiante.id,
          this.cursoSeleccionado,
          this.periodoSeleccionado,
          estudiante.evaluacion1,
          estudiante.evaluacion2
        );

      if (!guardada) {
        this.error = true;
        this.mensaje =
          'No se pudo actualizar la nota de ' +
          estudiante.nombre;
        return;
      }
    }

    this.error = false;
    this.mensaje =
      'Calificaciones actualizadas correctamente.';

    this.router.navigate(['/registrar-notas'], {
      queryParams: this.obtenerParametros()
    });
  }

}
