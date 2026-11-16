
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

// ========================================
// MATRÍCULAS DE ESTUDIANTES
// ========================================
export interface MatriculaApi {
  idMatricula: number;
  idEstudiante: number;
  idGradoSeccion: number;
  estado: boolean;
}

// ========================================
// ESTUDIANTES
// ========================================
export interface EstudianteApi {
  idEstudiante: number;
  nombres: string;
  apellidos: string;
  estado: boolean;
}

// ========================================
// ASIGNATURAS
// ========================================
export interface AsignaturaApi {
  idAsignatura: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
}

// ========================================
// GRADOS Y SECCIONES
// ========================================
export interface GradoSeccionApi {
  idGradoSeccion: number;
  grado: number;
  seccion: string;
  anioEscolar: number;
  capacidad: number;
  estado: boolean;
}

// ========================================
// ASIGNACIONES DE DOCENTES
// ========================================
export interface AsignacionDocenteApi {
  idAsignacion: number;
  idDocente: number;
  idAsignatura: number;
  idGradoSeccion: number;
  estado: boolean;
}

// ========================================
// EVALUACIONES ACADÉMICAS
// ========================================
export interface EvaluacionApi {
  idEvaluacion: number;
  idAsignacion: number;
  idPeriodo: number;
  nombre: string;
  ponderacion: number;
  estado: boolean;
}

// ========================================
// CALIFICACIONES REGISTRADAS
// ========================================
export interface RegistroNotaApi {
  idNota: number;
  idEvaluacion: number;
  idMatricula: number;
  calificacion: number;
  observacion: string | null;
  estado: boolean;
}

// ========================================
// DATOS PARA REGISTRAR O EDITAR NOTAS
// ========================================
export interface GuardarNotaApi {
  idEvaluacion: number;
  idMatricula: number;
  calificacion: number;
  observacion?: string;
}

// ========================================
// RESPUESTA DEL TOKEN CSRF
// ========================================
interface CsrfTokenApi {
  headerName: string;
  parameterName: string;
  token: string;
}

// ========================================
// SERVICIO DE CONEXIÓN CON SPRING BOOT
// ========================================
@Injectable({
  providedIn: 'root'
})
export class NotasApiService {

  private readonly apiUrl =
    'http://localhost:8081/api';

  // ENVIAR LA SESIÓN DEL USUARIO AUTENTICADO
  private readonly opciones = {
    withCredentials: true
  };

  constructor(
    private http: HttpClient
  ) {}

  // ======================================
  // OBTENER TOKEN CSRF
  // ======================================
  private obtenerTokenCsrf(): Observable<CsrfTokenApi> {

    return this.http.get<CsrfTokenApi>(
      `${this.apiUrl}/auth/csrf`,
      this.opciones
    );
  }

  // ======================================
  // 1. CONSULTAR ESTUDIANTES
  // ======================================
  obtenerEstudiantes(): Observable<EstudianteApi[]> {

    return this.http.get<EstudianteApi[]>(
      `${this.apiUrl}/estudiantes`,
      this.opciones
    );
  }

  // ======================================
  // 2. CONSULTAR ASIGNATURAS
  // ======================================
  obtenerAsignaturas(): Observable<AsignaturaApi[]> {

    return this.http.get<AsignaturaApi[]>(
      `${this.apiUrl}/asignaturas`,
      this.opciones
    );
  }

  // ======================================
  // 3. CONSULTAR GRADOS Y SECCIONES
  // ======================================
  obtenerGradosSecciones(): Observable<GradoSeccionApi[]> {

    return this.http.get<GradoSeccionApi[]>(
      `${this.apiUrl}/grados-secciones`,
      this.opciones
    );
  }

  // ======================================
  // 4. CONSULTAR ASIGNACIONES DOCENTES
  // ======================================
  obtenerAsignaciones(): Observable<AsignacionDocenteApi[]> {

    return this.http.get<AsignacionDocenteApi[]>(
      `${this.apiUrl}/asignaciones`,
      this.opciones
    );
  }

  // ======================================
  // 5. CONSULTAR MATRÍCULAS POR SALÓN
  // ======================================
  obtenerMatriculas(
    idGradoSeccion: number
  ): Observable<MatriculaApi[]> {

    return this.http.get<MatriculaApi[]>(
      `${this.apiUrl}/matriculas/salon/${idGradoSeccion}`,
      this.opciones
    );
  }

  // ======================================
  // 6. CONSULTAR EVALUACIONES POR ASIGNACIÓN
  // ======================================
  obtenerEvaluaciones(
    idAsignacion: number
  ): Observable<EvaluacionApi[]> {

    return this.http.get<EvaluacionApi[]>(
      `${this.apiUrl}/evaluaciones/asignacion/${idAsignacion}`,
      this.opciones
    );
  }

  // ======================================
  // 7. CONSULTAR NOTAS POR MATRÍCULA
  // ======================================
  obtenerNotas(
    idMatricula: number
  ): Observable<RegistroNotaApi[]> {

    return this.http.get<RegistroNotaApi[]>(
      `${this.apiUrl}/notas/matricula/${idMatricula}`,
      this.opciones
    );
  }

  // ======================================
  // 8. REGISTRAR UNA NUEVA NOTA
  // ======================================
  registrarNota(
    nota: GuardarNotaApi
  ): Observable<RegistroNotaApi> {

    return this.obtenerTokenCsrf().pipe(

      switchMap(csrf => {

        return this.http.post<RegistroNotaApi>(
          `${this.apiUrl}/notas`,
          nota,
          {
            withCredentials: true,
            headers: {
              [csrf.headerName]: csrf.token
            }
          }
        );

      })

    );
  }

  // ======================================
  // 9. ACTUALIZAR UNA NOTA EXISTENTE
  // ======================================
  actualizarNota(
    idNota: number,
    nota: GuardarNotaApi
  ): Observable<RegistroNotaApi> {

    return this.obtenerTokenCsrf().pipe(

      switchMap(csrf => {

        return this.http.put<RegistroNotaApi>(
          `${this.apiUrl}/notas/${idNota}`,
          nota,
          {
            withCredentials: true,
            headers: {
              [csrf.headerName]: csrf.token
            }
          }
        );

      })

    );
  }
}
