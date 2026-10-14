
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  DatosAcademicosService
} from '../../../../core/services/datos-academicos';

interface CursoDocente {
  nombre: string;
  grado: string;
  estudiantes: number;
}

@Component({
  selector: 'app-panel-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel-docente.html',
  styleUrl: './panel-docente.css'
})
export class PanelDocente {

  docente = 'Luis Calderón';

  cursos: CursoDocente[] = [];

  constructor(
    private datosService: DatosAcademicosService
  ) {
    this.cargarCursos();
  }

  cargarCursos(): void {

    // Cursos asignados al docente para la demostración.
    // Todos pertenecen al salón 5.° A.
    this.cursos = this.datosService.cursos.map(
      nombre => ({
        nombre,
        grado: '5.° A',
        estudiantes:
          this.datosService.contarEstudiantesPorSalon(
            '5.°',
            'A'
          )
      })
    );
  }

  get totalEstudiantes(): number {
    return this.datosService.obtenerEstudiantes().length;
  }

  get totalSalones(): number {
    return this.datosService.salones.length;
  }

  get totalCursos(): number {
    return this.cursos.length;
  }

}
