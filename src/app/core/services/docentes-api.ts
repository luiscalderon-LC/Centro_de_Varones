
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  switchMap
} from 'rxjs';

import { SesionService } from './sesion';

// DATOS QUE SE ENVÍAN AL BACKEND
export interface RegistrarDocenteRequest {
  idTipoDocumento: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  especialidad: string;
  estado: string;
  password: string;
}

// RESPUESTA DEL BACKEND
export interface RegistrarDocenteResponse {
  mensaje: string;
  idDocente: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocentesApiService {

  private readonly API =
    'http://localhost:8081/api/director/docentes';

  constructor(
    private http: HttpClient,
    private sesionService: SesionService
  ) {}

  // REGISTRAR DOCENTE EN SQL SERVER
  registrarDocente(
    datos: RegistrarDocenteRequest
  ): Observable<RegistrarDocenteResponse> {

    // OBTENER TOKEN CSRF
    return this.sesionService.obtenerCsrf().pipe(

      switchMap(csrf => {

        // AGREGAR TOKEN A LA SOLICITUD
        const headers = new HttpHeaders()
          .set(csrf.headerName, csrf.token);

        // ENVIAR REGISTRO AL BACKEND
        return this.http.post<RegistrarDocenteResponse>(
          this.API,
          datos,
          {
            headers: headers,
            withCredentials: true
          }
        );

      })

    );
  }
}
