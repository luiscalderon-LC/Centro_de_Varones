
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  of,
  throwError
} from 'rxjs';

import {
  catchError,
  finalize,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

// DATOS DE LA SESIÓN
export interface UsuarioSesion {
  id: number;
  nombre: string;
  codigo: string;
  rol: 'docente' | 'estudiante' | 'director';
}

// RESPUESTA DEL LOGIN
interface LoginResponse {
  id: number;
  nombre: string;
  correo: string;
  rol: 'docente' | 'director';
}

// RESPUESTA DEL TOKEN CSRF
export interface CsrfResponse {
  headerName: string;
  parameterName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  private readonly API =
    'http://localhost:8081/api';

  private readonly CLAVE =
    'centro_varones_sesion';

  private csrfToken: CsrfResponse | null = null;

  constructor(
    private http: HttpClient
  ) {}

  // OBTENER TOKEN CSRF ACTUAL
  obtenerCsrf(): Observable<CsrfResponse> {

    return this.http.get<CsrfResponse>(
      `${this.API}/auth/csrf`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(token => {
        this.csrfToken = token;
      })
    );
  }

  // CREAR ENCABEZADO CSRF
  private encabezadosCsrf(
    csrf: CsrfResponse
  ): HttpHeaders {

    return new HttpHeaders()
      .set(csrf.headerName, csrf.token);
  }

  // INICIAR SESIÓN DEL DOCENTE
  iniciarSesionDocente(
    usuario: string,
    password: string
  ): Observable<boolean> {

    return this.http.post<LoginResponse>(
      `${this.API}/auth/docente/login`,
      {
        correo: usuario.trim(),
        password
      },
      {
        withCredentials: true
      }
    ).pipe(

      tap(docente => {

        const sesion: UsuarioSesion = {
          id: docente.id,
          nombre: docente.nombre,
          codigo:
            `DOC-${String(docente.id).padStart(3, '0')}`,
          rol: 'docente'
        };

        localStorage.setItem(
          this.CLAVE,
          JSON.stringify(sesion)
        );

        // INVALIDAR TOKEN ANTERIOR
        this.csrfToken = null;
      }),

      map(() => true),

      catchError(error => {
        console.error(
          'Error al iniciar sesión del docente:',
          error
        );

        return of(false);
      })
    );
  }

  // INICIAR SESIÓN DEL DIRECTOR
  iniciarSesionDirector(
    correo: string,
    password: string
  ): Observable<boolean> {

    return this.http.post<LoginResponse>(
      `${this.API}/auth/director/login`,
      {
        correo: correo.trim(),
        password
      },
      {
        withCredentials: true
      }
    ).pipe(

      tap(director => {

        const sesion: UsuarioSesion = {
          id: director.id,
          nombre: director.nombre,
          codigo:
            `DIR-${String(director.id).padStart(3, '0')}`,
          rol: 'director'
        };

        localStorage.setItem(
          this.CLAVE,
          JSON.stringify(sesion)
        );

        // EL TOKEN ANTERIOR YA NO SE REUTILIZA
        this.csrfToken = null;
      }),

      map(() => true),

      catchError(error => {
        console.error(
          'Error al iniciar sesión del director:',
          error
        );

        return of(false);
      })
    );
  }

  // OBTENER USUARIO GUARDADO PARA LA INTERFAZ
  obtenerUsuario(): UsuarioSesion | null {

    const datos =
      localStorage.getItem(this.CLAVE);

    if (!datos) {
      return null;
    }

    try {
      return JSON.parse(datos) as UsuarioSesion;
    } catch {
      localStorage.removeItem(this.CLAVE);
      return null;
    }
  }

  // VERIFICAR SESIÓN REAL EN SPRING BOOT
  verificarSesion(): Observable<boolean> {

    const usuario = this.obtenerUsuario();

    if (!usuario) {
      return of(false);
    }

    // SESIÓN SIMULADA DEL ESTUDIANTE
    if (usuario.rol === 'estudiante') {
      return of(true);
    }

    const endpoint =
      usuario.rol === 'director'
        ? `${this.API}/auth/director/me`
        : `${this.API}/auth/me`;

    return this.http.get(
      endpoint,
      {
        withCredentials: true
      }
    ).pipe(

      map(() => true),

      catchError(error => {

        console.error(
          'No se pudo verificar la sesión:',
          error.status
        );

        localStorage.removeItem(this.CLAVE);
        this.csrfToken = null;

        return of(false);
      })
    );
  }

  // CERRAR SESIÓN
  cerrarSesion(): Observable<void> {

    const usuario = this.obtenerUsuario();

    // ESTUDIANTE: SESIÓN LOCAL
    if (usuario?.rol === 'estudiante') {

      localStorage.removeItem(this.CLAVE);
      this.csrfToken = null;

      return of(void 0);
    }

    return this.obtenerCsrf().pipe(

      switchMap(csrf =>

        this.http.post<void>(
          `${this.API}/auth/logout`,
          {},
          {
            headers: this.encabezadosCsrf(csrf),
            withCredentials: true
          }
        )
      ),

      finalize(() => {

        localStorage.removeItem(this.CLAVE);
        this.csrfToken = null;
      })
    );
  }

  // VERIFICAR ROL DOCENTE
  esDocente(): boolean {
    return this.obtenerUsuario()?.rol === 'docente';
  }

  // VERIFICAR ROL ESTUDIANTE
  esEstudiante(): boolean {
    return this.obtenerUsuario()?.rol === 'estudiante';
  }

  // VERIFICAR ROL DIRECTOR
  esDirector(): boolean {
    return this.obtenerUsuario()?.rol === 'director';
  }
}
