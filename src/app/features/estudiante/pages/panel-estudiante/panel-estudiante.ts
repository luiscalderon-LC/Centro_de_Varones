
import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

interface CursoEstudiante {
  nombre: string;
  promedio: number;
}

@Component({
  selector: 'app-panel-estudiante',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './panel-estudiante.html',
  styleUrl: './panel-estudiante.css'
})
export class PanelEstudiante implements OnInit {

  // Estudiante de demostración: Mark Alcalá
  estudianteId = 2;

  estudiante = {
    nombre: 'Mark Alcalá',
    grado: '5.° A',
    codigo: 'EST-002',
    periodo: 'III Bimestre',
    anio: 2026
  };

  cursos: CursoEstudiante[] = [];

  constructor(
    private datosService: DatosAcademicosService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {

    const datosEstudiante =
      this.datosService.obtenerEstudiante(
        this.estudianteId
      );

    if (datosEstudiante) {
      this.estudiante.nombre = datosEstudiante.nombre;

      this.estudiante.grado =
        datosEstudiante.grado + ' ' +
        datosEstudiante.seccion;

      this.estudiante.codigo = datosEstudiante.codigo;
    }

    this.estudiante.anio = this.datosService.anio;

    const notas =
      this.datosService.obtenerNotasEstudiante(
        this.estudianteId,
        this.estudiante.periodo
      );

    this.cursos = notas.map(nota => ({
      nombre: nota.curso,
      promedio: this.datosService.calcularPromedio(
        nota.evaluacion1,
        nota.evaluacion2
      )
    }));
  }

  get iniciales(): string {
    return this.estudiante.nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra => palabra.charAt(0).toUpperCase())
      .join('');
  }

  get promedioGeneral(): number {

    if (this.cursos.length === 0) {
      return 0;
    }

    const total = this.cursos.reduce(
      (suma, curso) => suma + curso.promedio,
      0
    );

    return total / this.cursos.length;
  }

  get estadoAcademico(): string {

    return this.promedioGeneral >= 11
      ? 'Aprobado'
      : 'Desaprobado';
  }

}
