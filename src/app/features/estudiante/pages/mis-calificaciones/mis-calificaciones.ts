
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

interface Curso {
  nombre: string;
  evaluacion1: number;
  evaluacion2: number;
}

@Component({
  selector: 'app-mis-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-calificaciones.html',
  styleUrls: ['./mis-calificaciones.css']
})
export class MisCalificaciones implements OnInit {

  estudianteId = 2;

  estudiante = {
    nombre: 'Mark Alcalá',
    grado: '5.° A',
    anio: 2026
  };

  cursos: Curso[] = [];

  cursoSeleccionado = 'Matemáticas';
  periodoSeleccionado = 'III Bimestre';

  constructor(
    private route: ActivatedRoute,
    private datosService: DatosAcademicosService
  ) {}

  ngOnInit(): void {

    const estudiante =
      this.datosService.obtenerEstudiante(
        this.estudianteId
      );

    if (estudiante) {
      this.estudiante.nombre = estudiante.nombre;
      this.estudiante.grado =
        estudiante.grado + ' ' + estudiante.seccion;
    }

    this.estudiante.anio = this.datosService.anio;

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

  cargarCalificaciones(): void {

    const notas =
      this.datosService.obtenerNotasEstudiante(
        this.estudianteId,
        this.periodoSeleccionado
      );

    this.cursos = notas.map(nota => ({
      nombre: nota.curso,
      evaluacion1: nota.evaluacion1,
      evaluacion2: nota.evaluacion2
    }));
  }

  get cursoActual(): Curso | undefined {
    return this.cursos.find(
      curso => curso.nombre === this.cursoSeleccionado
    );
  }

  get promedio(): number {

    const curso = this.cursoActual;

    if (!curso) {
      return 0;
    }

    return this.datosService.calcularPromedio(
      curso.evaluacion1,
      curso.evaluacion2
    );
  }

  get estado(): string {

    if (!this.cursoActual) {
      return 'Sin calificaciones';
    }

    if (this.promedio >= 11) {
      return 'Aprobado';
    }

    if (this.promedio >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  get puntosFaltantes(): number {
    return Math.max(0, 11 - this.promedio);
  }

  get mensajeAcademico(): string {

    if (!this.cursoActual) {
      return 'Todavía no tienes calificaciones registradas.';
    }

    if (this.promedio >= 11) {
      return 'Has aprobado este curso. Continúa manteniendo tu buen rendimiento académico.';
    }

    if (this.promedio >= 9) {
      return `Estás cerca de aprobar. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio para alcanzar la nota mínima de 11.`;
    }

    return `Actualmente estás desaprobado en este curso. Te faltan ${this.puntosFaltantes.toFixed(1)} puntos en tu promedio para alcanzar la nota mínima de 11.`;
  }

}
