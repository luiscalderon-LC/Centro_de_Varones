
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface LoginEstudianteResponse {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  cambiarPassword: boolean;
}

export interface SesionEstudianteResponse {
  id: number;
  correo: string;
  rol: string;
}

interface CsrfResponse {
  headerName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthEstudianteService {

  private readonly apiUrl =
    'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  // INICIAR SESIÓN DEL ESTUDIANTE
  ingresar(
    correo: string,
    password: string
  ): Observable<LoginEstudianteResponse> {

    return this.http.post<LoginEstudianteResponse>(
      `${this.apiUrl}/estudiante/login`,
      {
        correo,
        password
      },
      {
        withCredentials: true
      }
    );
  }

  // CONSULTAR LA SESIÓN ACTUAL
  obtenerSesion(): Observable<SesionEstudianteResponse> {

    return this.http.get<SesionEstudianteResponse>(
      `${this.apiUrl}/me`,
      {
        withCredentials: true
      }
    );
  }

  // OBTENER TOKEN CSRF
  obtenerCsrf(): Observable<CsrfResponse> {

    return this.http.get<CsrfResponse>(
      `${this.apiUrl}/csrf`,
      {
        withCredentials: true
      }
    );
  }

  // CERRAR SESIÓN REAL EN SPRING BOOT
  cerrarSesion(): Observable<void> {

    return this.obtenerCsrf().pipe(

      switchMap(csrf =>

        this.http.post<void>(
          `${this.apiUrl}/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              [csrf.headerName]: csrf.token
            }
          }
        )

      )

    );
  }
}
