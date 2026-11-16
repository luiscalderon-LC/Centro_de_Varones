
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

// ==========================================
// INTERFAZ DEL ESTUDIANTE
// ==========================================

interface Estudiante {
  idEstudiante: number;
  idMatricula: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  grado: string;
  seccion: string;
  anio: number;
  estado: boolean;
}

@Component({
  selector: 'app-gestionar-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './gestionar-estudiantes.html',
  styleUrl: './gestionar-estudiantes.css'
})
export class GestionarEstudiantes implements OnInit {

  // ==========================================
  // CONEXIÓN CON SPRING BOOT
  // ==========================================

  private readonly apiUrl =
    'http://localhost:8081/api/director/estudiantes';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // LISTA DE ESTUDIANTES
  // ==========================================

  estudiantes: Estudiante[] = [];

  cargando = false;
  errorCarga = '';

  // ==========================================
  // FILTROS
  // ==========================================

  busqueda = '';

  gradoSeleccionado = '';
  seccionSeleccionada = '';
  anioSeleccionado = 2026;

  grados = [
    '1.°',
    '2.°',
    '3.°',
    '4.°',
    '5.°'
  ];

  secciones = ['A', 'B', 'C'];

  anios = [2026, 2027];

  // ==========================================
  // ESTUDIANTE SELECCIONADO
  // ==========================================

  estudianteSeleccionado: Estudiante | null = null;

  // ==========================================
  // CARGAR AL ABRIR LA PÁGINA
  // ==========================================

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  // ==========================================
  // CONSULTAR ESTUDIANTES EN SPRING BOOT
  // ==========================================

  cargarEstudiantes(): void {

    this.cargando = true;
    this.errorCarga = '';

    this.http.get<Estudiante[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    ).subscribe({

      next: (respuesta) => {

        this.estudiantes = respuesta;

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        this.cargando = false;

        this.estudiantes = [];

        if (error.status === 0) {

          this.errorCarga =
            'No se pudo conectar con Spring Boot. ' +
            'Verifica que el backend esté funcionando.';

        } else if (error.status === 401) {

          this.errorCarga =
            'Tu sesión ha terminado. ' +
            'Inicia sesión nuevamente como director.';

        } else if (error.status === 403) {

          this.errorCarga =
            'No tienes permisos para consultar estudiantes.';

        } else {

          this.errorCarga =
            'Ocurrió un error al cargar los estudiantes.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // FILTRAR ESTUDIANTES
  // ==========================================

  get estudiantesFiltrados(): Estudiante[] {

    const texto = this.busqueda
      .trim()
      .toLowerCase();

    return this.estudiantes.filter(estudiante => {

      // BUSCAR POR NOMBRE, APELLIDO O DOCUMENTO
      const coincideTexto =
        !texto ||
        estudiante.nombres.toLowerCase().includes(texto) ||
        estudiante.apellidos.toLowerCase().includes(texto) ||
        estudiante.numeroDocumento.toLowerCase().includes(texto) ||
        (
          estudiante.apellidos + ' ' + estudiante.nombres
        ).toLowerCase().includes(texto);

      // FILTRAR POR GRADO
      const coincideGrado =
        !this.gradoSeleccionado ||
        estudiante.grado === this.gradoSeleccionado;

      // FILTRAR POR SECCIÓN
      const coincideSeccion =
        !this.seccionSeleccionada ||
        estudiante.seccion === this.seccionSeleccionada;

      // FILTRAR POR AÑO
      const coincideAnio =
        estudiante.anio === Number(this.anioSeleccionado);

      return (
        coincideTexto &&
        coincideGrado &&
        coincideSeccion &&
        coincideAnio
      );

    });
  }

  // ==========================================
  // CONTAR RESULTADOS
  // ==========================================

  get totalEstudiantes(): number {
    return this.estudiantesFiltrados.length;
  }

  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================

  limpiarFiltros(): void {

    this.busqueda = '';

    this.gradoSeleccionado = '';

    this.seccionSeleccionada = '';

    this.anioSeleccionado = 2026;

    this.estudianteSeleccionado = null;
  }

  // ==========================================
  // VER DETALLES DEL ESTUDIANTE
  // ==========================================

  verEstudiante(estudiante: Estudiante): void {

    this.estudianteSeleccionado = estudiante;
  }

  // ==========================================
  // CERRAR DETALLES
  // ==========================================

  cerrarDetalle(): void {

    this.estudianteSeleccionado = null;
  }
}
