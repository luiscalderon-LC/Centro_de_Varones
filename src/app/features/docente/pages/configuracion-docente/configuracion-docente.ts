
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  NotasApiService,
  AsignacionDocenteApi,
  GradoSeccionApi
} from '../../../../core/services/notas-api';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-configuracion-docente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './configuracion-docente.html',
  styleUrl: './configuracion-docente.css'
})
export class ConfiguracionDocente implements OnInit {

  private readonly idDocente = 1;

  nombreDocente = 'Docente';
  rol = 'Docente';
  institucion = 'I.E. N.° 20874';
  nombreInstitucion = 'Centro de Varones';
  ubicacion = 'Cañete, Lima, Perú';

  anioEscolar = '—';
  totalCursos = 0;
  totalSalones = 0;

  estadoCuenta = 'En uso';
  cargando = false;
  mensaje = '';

  constructor(
    private notasApi: NotasApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarInformacion();
  }

  cargarInformacion(): void {

    this.cargando = true;
    this.mensaje = '';

    forkJoin({
      asignaciones: this.notasApi.obtenerAsignaciones(),
      asignaturas: this.notasApi.obtenerAsignaturas(),
      salones: this.notasApi.obtenerGradosSecciones()
    }).subscribe({

      next: respuesta => {

        const asignaciones: AsignacionDocenteApi[] =
          respuesta.asignaciones.filter(
            a => a.estado && a.idDocente === this.idDocente
          );

        const salones: GradoSeccionApi[] =
          respuesta.salones.filter(
            s =>
              s.estado &&
              asignaciones.some(
                a => a.idGradoSeccion === s.idGradoSeccion
              )
          );

        const idsCursos = new Set(
          asignaciones
            .filter(a =>
              respuesta.asignaturas.some(
                c => c.estado &&
                  c.idAsignatura === a.idAsignatura
              )
            )
            .map(a => a.idAsignatura)
        );

        this.totalCursos = idsCursos.size;

        this.totalSalones = new Set(
          salones.map(s => s.idGradoSeccion)
        ).size;

        const anios = [
          ...new Set(salones.map(s => s.anioEscolar))
        ].sort((a, b) => b - a);

        this.anioEscolar = anios.length
          ? anios.join(', ')
          : '—';

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Error al cargar configuración:',
          error
        );

        this.cargando = false;
        this.mensaje =
          'No se pudo consultar la información académica.';

        this.cdr.detectChanges();
      }
    });
  }
}
