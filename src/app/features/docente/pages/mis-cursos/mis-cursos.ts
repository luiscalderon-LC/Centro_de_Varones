
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  NotasApiService
} from '../../../../core/services/notas-api';

interface CursoDocente {
  idAsignacion: number;
  nombre: string;
  grado: number;
  seccion: string;
  salon: string;
  anio: number;
}

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './mis-cursos.html',
  styleUrl: './mis-cursos.css'
})
export class MisCursos implements OnInit {

  // DOCENTE TEMPORAL HASTA IMPLEMENTAR LOGIN
  private readonly idDocente = 1;

  cursos: CursoDocente[] = [];

  cargando = false;
  mensaje = '';

  constructor(
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  // CONSULTAR ASIGNACIONES REALES
  cargarCursos(): void {

    this.cargando = true;
    this.mensaje = '';
    this.cursos = [];

    forkJoin({
      asignaturas: this.notasApi.obtenerAsignaturas(),
      salones: this.notasApi.obtenerGradosSecciones(),
      asignaciones: this.notasApi.obtenerAsignaciones()
    }).subscribe({

      next: respuesta => {

        const asignaciones = respuesta.asignaciones.filter(
          a =>
            a.estado &&
            a.idDocente === this.idDocente
        );

        this.cursos = asignaciones.flatMap(
          asignacion => {

            const asignatura =
              respuesta.asignaturas.find(
                a =>
                  a.idAsignatura ===
                  asignacion.idAsignatura &&
                  a.estado
              );

            const salon =
              respuesta.salones.find(
                s =>
                  s.idGradoSeccion ===
                  asignacion.idGradoSeccion &&
                  s.estado
              );

            if (!asignatura || !salon) {
              return [];
            }

            return [{
              idAsignacion: asignacion.idAsignacion,
              nombre: asignatura.nombre,
              grado: salon.grado,
              seccion: salon.seccion,
              salon: `${salon.grado}.° ${salon.seccion}`,
              anio: salon.anioEscolar
            }];
          }
        );

        this.cursos.sort(
          (a, b) =>
            a.grado - b.grado ||
            a.seccion.localeCompare(b.seccion) ||
            a.nombre.localeCompare(b.nombre)
        );

        this.cargando = false;

        if (this.cursos.length === 0) {
          this.mensaje =
            'Todavía no tienes cursos asignados.';
        }

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al cargar cursos:',
          error
        );

        this.cargando = false;

        this.mensaje =
          'No se pudieron cargar los cursos desde Spring Boot.';

        this.cdr.detectChanges();
      }
    });
  }
}
