
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

  cursos = [
    { nombre: 'Matemáticas', seccion: '3.° A' },
    { nombre: 'Comunicación', seccion: '3.° B' },
    { nombre: 'Ciencia y Tecnología', seccion: '4.° A' },
    { nombre: 'Desarrollo Personal', seccion: '5.° B' }
  ];

  cursoSeleccionado = 'Matemáticas';
  seccionSeleccionada = '3.° A';
  periodoSeleccionado = 'I Bimestre';
  anioSeleccionado = '2026';

  editando = false;
  mensaje = '';

  estudiantes: Estudiante[] = [];
  respaldo: Estudiante[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const curso = params.get('curso');
      const seccion = params.get('seccion');

      if (curso && this.cursos.some(c => c.nombre === curso)) {
        this.cursoSeleccionado = curso;
      }

      if (seccion) {
        this.seccionSeleccionada = seccion;
      }

      this.cargarEstudiantes();
    });
  }

  cargarEstudiantes(): void {
    const clave = this.obtenerClave();
    const guardados = localStorage.getItem(clave);

    this.estudiantes = guardados
      ? JSON.parse(guardados)
      : [
          { id: 1, nombre: 'María Alvarado', evaluacion1: 16, evaluacion2: 17 },
          { id: 2, nombre: 'Andrés Salazar', evaluacion1: 15, evaluacion2: 17 },
          { id: 3, nombre: 'José Mendoza', evaluacion1: 17, evaluacion2: 13 },
          { id: 4, nombre: 'Valeria Torres', evaluacion1: 8, evaluacion2: 10 },
          { id: 5, nombre: 'Diego Ramos', evaluacion1: 18, evaluacion2: 17 }
        ];

    this.editando = false;
    this.mensaje = '';
  }

  cambiarCurso(): void {
    const curso = this.cursos.find(
      c => c.nombre === this.cursoSeleccionado
    );

    if (curso) {
      this.seccionSeleccionada = curso.seccion;
    }

    this.cargarEstudiantes();
  }

  obtenerClave(): string {
    return [
      'notas',
      this.cursoSeleccionado,
      this.seccionSeleccionada,
      this.periodoSeleccionado,
      this.anioSeleccionado
    ].join('-');
  }

  promedio(estudiante: Estudiante): number {
    return (
      estudiante.evaluacion1 + estudiante.evaluacion2
    ) / 2;
  }

  estado(estudiante: Estudiante): string {
    const promedio = this.promedio(estudiante);

    if (promedio >= 11) {
      return 'Aprobado';
    }

    if (promedio >= 9) {
      return 'En proceso';
    }

    return 'Desaprobado';
  }

  editarNotas(): void {
    this.respaldo = structuredClone(this.estudiantes);
    this.editando = true;
    this.mensaje = '';
  }

  cancelar(): void {
    this.estudiantes = structuredClone(this.respaldo);
    this.editando = false;
    this.mensaje = '';
  }

  guardarNotas(): void {
    const validas = this.estudiantes.every(e =>
      Number.isFinite(e.evaluacion1) &&
      Number.isFinite(e.evaluacion2) &&
      e.evaluacion1 >= 0 &&
      e.evaluacion1 <= 20 &&
      e.evaluacion2 >= 0 &&
      e.evaluacion2 <= 20
    );

    if (!validas) {
      this.mensaje = 'Las notas deben estar entre 0 y 20.';
      return;
    }

    localStorage.setItem(
      this.obtenerClave(),
      JSON.stringify(this.estudiantes)
    );

    this.editando = false;
    this.mensaje = 'Las calificaciones se guardaron correctamente.';
  }
}
