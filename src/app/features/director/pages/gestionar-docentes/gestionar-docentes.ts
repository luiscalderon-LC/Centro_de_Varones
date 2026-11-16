
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
  HttpHeaders
} from '@angular/common/http';

import { finalize, switchMap } from 'rxjs';

import {
  SesionService
} from '../../../../core/services/sesion';

// MODELO DEL DOCENTE
interface Docente {
  idDocente: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  especialidad: string;
  estado: boolean;
}

@Component({
  selector: 'app-gestionar-docentes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './gestionar-docentes.html',
  styleUrl: './gestionar-docentes.css'
})
export class GestionarDocentes implements OnInit {

  // CONEXIÓN CON SPRING BOOT
  private readonly API =
    'http://localhost:8081/api/docentes';

  // LISTADO DE DOCENTES
  docentes: Docente[] = [];

  // PESTAÑAS
  pestana: 'activos' | 'eliminados' = 'activos';

  // BUSCADOR
  busqueda = '';

  // ESTADOS
  cargando = false;
  procesando = false;

  mensaje = '';
  esError = false;

  // DOCENTE SELECCIONADO
  seleccionado: Docente | null = null;

  // DOCENTE QUE SE ESTÁ EDITANDO
  editando: Docente | null = null;

  // ESPECIALIDADES DISPONIBLES
  especialidades = [
    'Matemática',
    'Comunicación',
    'Ciencia y Tecnología',
    'Ciencias Sociales',
    'Educación Física',
    'Inglés',
    'Arte y Cultura',
    'Educación para el Trabajo',
    'Desarrollo Personal, Ciudadanía y Cívica',
    'Educación Religiosa'
  ];

  constructor(
    private http: HttpClient,
    private sesionService: SesionService,
    private cdr: ChangeDetectorRef
  ) {}

  // CARGAR DOCENTES AL ABRIR LA PÁGINA
  ngOnInit(): void {
    this.cargarDocentes();
  }

  // BUSCAR DOCENTES
  get docentesFiltrados(): Docente[] {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.docentes;
    }

    return this.docentes.filter(docente => {

      const datos = [
        docente.nombres,
        docente.apellidos,
        docente.numeroDocumento,
        docente.correo,
        docente.especialidad
      ];

      return datos.some(valor =>
        (valor ?? '').toLowerCase().includes(texto)
      );
    });
  }

  // CAMBIAR ENTRE ACTIVOS Y ELIMINADOS
  cambiarPestana(
    nuevaPestana: 'activos' | 'eliminados'
  ): void {

    if (this.procesando) {
      return;
    }

    this.pestana = nuevaPestana;

    this.busqueda = '';

    this.seleccionado = null;
    this.editando = null;

    this.mensaje = '';
    this.esError = false;

    this.cargarDocentes();
  }

  // LISTAR DOCENTES DESDE EL BACKEND
  cargarDocentes(): void {

    this.cargando = true;

    const url = this.pestana === 'activos'
      ? this.API
      : `${this.API}/eliminados`;

    this.http.get<Docente[]>(url, {
      withCredentials: true
    })
    .pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({

      next: datos => {

        this.docentes = datos;

        this.cdr.detectChanges();
      },

      error: error => {

        this.docentes = [];

        if (
          error.status === 401 ||
          error.status === 403
        ) {
          this.mostrarMensaje(
            'No tienes permiso para consultar docentes.',
            true
          );
        } else {
          this.mostrarMensaje(
            'No se pudo cargar la lista de docentes.',
            true
          );
        }
      }
    });
  }

  // VER INFORMACIÓN DEL DOCENTE
  verDetalles(docente: Docente): void {

    this.editando = null;

    this.seleccionado = docente;

    this.mensaje = '';
  }

  // ABRIR FORMULARIO PARA EDITAR
  editar(docente: Docente): void {

    this.seleccionado = null;

    // COPIAR DATOS PARA NO ALTERAR EL ORIGINAL
    this.editando = {
      ...docente
    };

    this.mensaje = '';
    this.esError = false;
  }

  // CERRAR DETALLES O EDICIÓN
  cancelar(): void {

    this.seleccionado = null;

    this.editando = null;
  }

  // VALIDAR DATOS DEL DOCENTE
  private validarDocente(docente: Docente): boolean {

    const tipo = Number(docente.idTipoDocumento);

    docente.numeroDocumento =
      docente.numeroDocumento.trim();

    docente.nombres =
      docente.nombres.trim();

    docente.apellidos =
      docente.apellidos.trim();

    docente.correo =
      docente.correo.trim().toLowerCase();

    docente.especialidad =
      docente.especialidad.trim();

    // CAMPOS OBLIGATORIOS
    if (
      !docente.numeroDocumento ||
      !docente.nombres ||
      !docente.apellidos ||
      !docente.correo ||
      !docente.especialidad
    ) {

      this.mostrarMensaje(
        'Todos los campos son obligatorios.',
        true
      );

      return false;
    }

    // VALIDAR TIPO DE DOCUMENTO
    if (![1, 2].includes(tipo)) {

      this.mostrarMensaje(
        'Selecciona un tipo de documento válido.',
        true
      );

      return false;
    }

    // VALIDAR DNI
    if (
      tipo === 1 &&
      !/^\d{8}$/.test(docente.numeroDocumento)
    ) {

      this.mostrarMensaje(
        'El DNI debe tener exactamente 8 dígitos.',
        true
      );

      return false;
    }

    // VALIDAR CARNÉ DE EXTRANJERÍA
    if (
      tipo === 2 &&
      !/^\d{9}$/.test(docente.numeroDocumento)
    ) {

      this.mostrarMensaje(
        'El carné de extranjería debe tener 9 dígitos.',
        true
      );

      return false;
    }

    // VALIDAR LONGITUDES
    if (
      docente.nombres.length > 60 ||
      docente.apellidos.length > 60 ||
      docente.correo.length > 100 ||
      docente.especialidad.length > 100
    ) {

      this.mostrarMensaje(
        'Uno de los campos supera la longitud permitida.',
        true
      );

      return false;
    }

    // VALIDAR CORREO INSTITUCIONAL
    const correoInstitucional =
      /^[a-z0-9._%+-]+@centrovarones\.edu\.pe$/;

    if (!correoInstitucional.test(docente.correo)) {

      this.mostrarMensaje(
        'Solo se permiten correos @centrovarones.edu.pe.',
        true
      );

      return false;
    }

    // VALIDAR ESPECIALIDAD
    if (!this.especialidades.includes(docente.especialidad)) {

      this.mostrarMensaje(
        'Selecciona una especialidad válida.',
        true
      );

      return false;
    }

    return true;
  }

  // ACTUALIZAR INFORMACIÓN DEL DOCENTE
  guardarCambios(): void {

    const docente = this.editando;

    if (!docente || this.procesando) {
      return;
    }

    if (!this.validarDocente(docente)) {
      return;
    }

    this.procesando = true;

    this.sesionService.obtenerCsrf()
    .pipe(

      switchMap(csrf => {

        const headers = new HttpHeaders()
          .set(csrf.headerName, csrf.token);

        return this.http.put<Docente>(
          `${this.API}/${docente.idDocente}`,
          docente,
          {
            headers,
            withCredentials: true
          }
        );
      }),

      finalize(() => {
        this.procesando = false;
        this.cdr.detectChanges();
      })

    )
    .subscribe({

      next: () => {

        this.editando = null;

        this.mostrarMensaje(
          'Docente actualizado correctamente.'
        );

        this.cargarDocentes();
      },

      error: error => {

        if (error.status === 409) {

          this.mostrarMensaje(
            'El documento o correo ya pertenece a otro docente.',
            true
          );

        } else if (error.status === 400) {

          this.mostrarMensaje(
            'Los datos ingresados no son válidos.',
            true
          );

        } else if (
          error.status === 401 ||
          error.status === 403
        ) {

          this.mostrarMensaje(
            'No tienes permiso para actualizar docentes.',
            true
          );

        } else {

          this.mostrarMensaje(
            'No se pudo actualizar el docente.',
            true
          );
        }
      }
    });
  }

  // ELIMINAR LÓGICAMENTE O RESTAURAR
  cambiarEstado(docente: Docente): void {

    if (this.procesando) {
      return;
    }

    const eliminar = this.pestana === 'activos';

    const accion = eliminar
      ? 'desactivar'
      : 'restaurar';

    // CONFIRMACIÓN ANTES DE CAMBIAR EL ESTADO
    const confirmado = window.confirm(
      `¿Deseas ${accion} a ${docente.nombres} ${docente.apellidos}?`
    );

    if (!confirmado) {
      return;
    }

    const ruta = eliminar
      ? 'eliminar'
      : 'restaurar';

    this.procesando = true;

    this.sesionService.obtenerCsrf()
    .pipe(

      switchMap(csrf => {

        const headers = new HttpHeaders()
          .set(csrf.headerName, csrf.token);

        return this.http.patch<Docente>(
          `${this.API}/${docente.idDocente}/${ruta}`,
          {},
          {
            headers,
            withCredentials: true
          }
        );
      }),

      finalize(() => {
        this.procesando = false;
        this.cdr.detectChanges();
      })

    )
    .subscribe({

      next: () => {

        this.cancelar();

        this.mostrarMensaje(
          eliminar
            ? 'Docente desactivado correctamente.'
            : 'Docente restaurado correctamente.'
        );

        // RECARGAR LA LISTA
        this.cargarDocentes();
      },

      error: error => {

        if (
          error.status === 401 ||
          error.status === 403
        ) {

          this.mostrarMensaje(
            'No tienes permiso para realizar esta operación.',
            true
          );

        } else {

          this.mostrarMensaje(
            'No se pudo cambiar el estado del docente.',
            true
          );
        }
      }
    });
  }

  // MOSTRAR MENSAJES
  mostrarMensaje(
    texto: string,
    error = false
  ): void {

    this.mensaje = texto;
    this.esError = error;

    this.cdr.detectChanges();
  }
}
