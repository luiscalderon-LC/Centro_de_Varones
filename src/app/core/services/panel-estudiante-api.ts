
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatosEstudianteApi {
  id: number;
  nombre: string;
  documento: string;
  grado: string;
  anio: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class PanelEstudianteApiService {

  private readonly apiUrl =
    'http://localhost:8081/api/estudiante/mi-panel';

  constructor(
    private http: HttpClient
  ) {}

  obtenerMisDatos(): Observable<DatosEstudianteApi> {

    return this.http.get<DatosEstudianteApi>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }
}
