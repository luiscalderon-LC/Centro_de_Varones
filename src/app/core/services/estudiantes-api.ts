
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Datos que devuelve Spring Boot
export interface Estudiante {
  idEstudiante: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  nacionalidad: string;
  fechaNacimiento: string | null;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8081/api/estudiantes';

  // Obtener todos los estudiantes
  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.apiUrl);
  }

  // Obtener un estudiante por ID
  obtenerPorId(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(
      `${this.apiUrl}/${id}`
    );
  }

  // Registrar un estudiante
  registrar(
    estudiante: Omit<Estudiante, 'idEstudiante'>
  ): Observable<Estudiante> {
    return this.http.post<Estudiante>(
      this.apiUrl,
      estudiante
    );
  }

  // Actualizar un estudiante
  actualizar(
    id: number,
    estudiante: Partial<Estudiante>
  ): Observable<Estudiante> {
    return this.http.put<Estudiante>(
      `${this.apiUrl}/${id}`,
      estudiante
    );
  }
}
