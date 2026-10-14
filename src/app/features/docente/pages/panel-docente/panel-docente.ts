
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

import {
  SesionService
} from '../../../../core/services/sesion';

interface CursoDocente {
  nombre: string;
  grado: string;
  estudiantes: number;
}

interface AsignacionDocente {
  curso: string;
  salon: string;
}

@Component({
  selector: 'app-panel-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel-docente.html',
  styleUrl: './panel-docente.css'
})
export class PanelDocente {

  docente = '';
  cursos: CursoDocente[] = [];

  constructor(
    private datosService: DatosAcademicosService,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.cargarDocente();
  }

  cargarDocente(): void {

    const usuario = this.sesionService.obtenerUsuario();

    if (!usuario || usuario.rol !== 'docente') {
      this.router.navigate(['/login-docente']);
      return;
    }

    this.docente = usuario.nombre;

    const asignaciones: Record<string, AsignacionDocente[]> = {

      'DOC-001': [
        { curso: 'Matemáticas', salon: '5.° A' },
        { curso: 'Matemáticas', salon: '5.° B' },
        { curso: 'Matemáticas', salon: '4.° A' }
      ],

      'DOC-002': [
        { curso: 'Comunicación', salon: '3.° A' },
        { curso: 'Comunicación', salon: '3.° B' },
        { curso: 'Comunicación', salon: '2.° A' }
      ]

    };

    const cursosAsignados = asignaciones[usuario.codigo] ?? [];

    this.cursos = cursosAsignados.map(asignacion => {

      const [grado, seccion] = asignacion.salon.split(' ');

      return {
        nombre: asignacion.curso,
        grado: asignacion.salon,
        estudiantes:
          this.datosService.contarEstudiantesPorSalon(
            grado,
            seccion
          )
      };

    });
  }

  get totalEstudiantes(): number {

    const ids = new Set<number>();

    for (const curso of this.cursos) {

      const [grado, seccion] = curso.grado.split(' ');

      const estudiantes =
        this.datosService.obtenerEstudiantesPorSalon(
          grado,
          seccion
        );

      estudiantes.forEach(estudiante => {
        ids.add(estudiante.id);
      });
    }

    return ids.size;
  }

  get totalSalones(): number {

    return new Set(
      this.cursos.map(curso => curso.grado)
    ).size;
  }

  get totalCursos(): number {
    return this.cursos.length;
  }

  cerrarSesion(): void {
    this.sesionService.cerrarSesion();
    this.router.navigate(['/login-docente']);
  }

}
