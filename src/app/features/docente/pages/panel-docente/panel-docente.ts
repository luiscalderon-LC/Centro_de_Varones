
import { Component, OnInit } from '@angular/core';
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
export class PanelDocente implements OnInit {

  docente = '';
  cursos: CursoDocente[] = [];
  cargando = true;

  constructor(
    private datosService: DatosAcademicosService,
    private sesionService: SesionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarAcceso();
  }

  // VERIFICAR SESIÓN REAL CON SPRING BOOT
  verificarAcceso(): void {

    this.sesionService.verificarSesion().subscribe({
      next: (autenticado) => {

        if (!autenticado) {
          this.router.navigate(['/login-docente']);
          return;
        }

        this.cargarDocente();
        this.cargando = false;
      },

      error: () => {
        this.router.navigate(['/login-docente']);
      }
    });
  }

  // CARGAR INFORMACIÓN DEL DOCENTE
  cargarDocente(): void {

    const usuario = this.sesionService.obtenerUsuario();

    if (!usuario || usuario.rol !== 'docente') {
      this.router.navigate(['/login-docente']);
      return;
    }

    this.docente = usuario.nombre;

    // ASIGNACIONES TEMPORALES
    // DESPUÉS SE CONSULTARÁN DESDE SQL SERVER
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

    const cursosAsignados =
      asignaciones[usuario.codigo] ?? [];

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

  // CONTAR ESTUDIANTES SIN DUPLICAR
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

  // CONTAR SALONES
  get totalSalones(): number {

    return new Set(
      this.cursos.map(curso => curso.grado)
    ).size;
  }

  // CONTAR CURSOS
  get totalCursos(): number {
    return this.cursos.length;
  }

  // CERRAR SESIÓN REAL
  cerrarSesion(): void {

    this.sesionService.cerrarSesion().subscribe({
      next: () => {
        this.router.navigate(['/login-docente']);
      },

      error: (error) => {
        console.error(
          'No se pudo cerrar la sesión:',
          error
        );
      }
    });
  }
}