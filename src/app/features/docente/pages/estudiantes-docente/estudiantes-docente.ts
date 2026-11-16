
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, map } from 'rxjs';

import {
  NotasApiService
} from '../../../../core/services/notas-api';

interface EstudianteDocente {
  idEstudiante: number;
  idMatricula: number;
  nombre: string;
  salon: string;
  anio: number;
  cursos: string[];
}

@Component({
  selector: 'app-estudiantes-docente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estudiantes-docente.html',
  styleUrl: './estudiantes-docente.css'
})
export class EstudiantesDocente implements OnInit {

  private readonly idDocente = 1;

  estudiantes: EstudianteDocente[] = [];
  estudiantesFiltrados: EstudianteDocente[] = [];

  salones: string[] = [];
  salonSeleccionado = 'Todos';

  cargando = false;
  mensaje = '';

  constructor(
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {

    this.cargando = true;
    this.mensaje = '';
    this.estudiantes = [];
    this.estudiantesFiltrados = [];

    forkJoin({
      asignaciones: this.notasApi.obtenerAsignaciones(),
      asignaturas: this.notasApi.obtenerAsignaturas(),
      grados: this.notasApi.obtenerGradosSecciones(),
      estudiantes: this.notasApi.obtenerEstudiantes()
    }).pipe(

      switchMap(respuesta => {

        const asignaciones = respuesta.asignaciones.filter(
          a => a.estado && a.idDocente === this.idDocente
        );

        const idsSalones = [
          ...new Set(
            asignaciones.map(a => a.idGradoSeccion)
          )
        ];

        const consultas = idsSalones.map(id =>
          this.notasApi.obtenerMatriculas(id)
        );

        return (consultas.length ? forkJoin(consultas) : of([]))
          .pipe(
            map(matriculas => ({
              respuesta,
              asignaciones,
              idsSalones,
              matriculas
            }))
          );
      })

    ).subscribe({

      next: datos => {

        const resultado = new Map<string, EstudianteDocente>();

        datos.idsSalones.forEach((idSalon, indice) => {

          const salon = datos.respuesta.grados.find(
            s => s.idGradoSeccion === idSalon && s.estado
          );

          if (!salon) return;

          const nombreSalon =
            `${salon.grado}.° ${salon.seccion}`;

          const cursos = datos.asignaciones
            .filter(a => a.idGradoSeccion === idSalon)
            .map(a =>
              datos.respuesta.asignaturas.find(
                c => c.idAsignatura === a.idAsignatura &&
                     c.estado
              )?.nombre
            )
            .filter((c): c is string => !!c);

          const matriculas = datos.matriculas[indice] ?? [];

          matriculas.filter(m => m.estado).forEach(m => {

            const estudiante = datos.respuesta.estudiantes.find(
              e => e.idEstudiante === m.idEstudiante &&
                   e.estado
            );

            if (!estudiante) return;

            const clave = `${m.idEstudiante}-${idSalon}`;

            resultado.set(clave, {
              idEstudiante: estudiante.idEstudiante,
              idMatricula: m.idMatricula,
              nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
              salon: nombreSalon,
              anio: salon.anioEscolar,
              cursos: [...new Set(cursos)]
            });
          });
        });

        this.estudiantes = [...resultado.values()].sort(
          (a, b) => a.nombre.localeCompare(b.nombre)
        );

        this.salones = [
          ...new Set(
            this.estudiantes.map(e => e.salon)
          )
        ].sort();

        this.filtrarEstudiantes();

        this.cargando = false;

        if (this.estudiantes.length === 0) {
          this.mensaje =
            'No hay estudiantes matriculados en los salones asignados.';
        }

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al consultar estudiantes:',
          error
        );

        this.cargando = false;
        this.mensaje =
          'No se pudieron cargar los estudiantes desde Spring Boot.';

        this.cdr.detectChanges();
      }
    });
  }

  filtrarEstudiantes(): void {

    this.estudiantesFiltrados =
      this.salonSeleccionado === 'Todos'
        ? [...this.estudiantes]
        : this.estudiantes.filter(
            e => e.salon === this.salonSeleccionado
          );
  }

  cambiarSalon(valor: string): void {
    this.salonSeleccionado = valor;
    this.filtrarEstudiantes();
  }
}
