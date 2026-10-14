
import { Injectable } from '@angular/core';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  codigo: string;
  rol: 'docente' | 'estudiante';
}

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  private readonly CLAVE = 'centro_varones_sesion';

  private readonly docentes = [
    {
      id: 1,
      nombre: 'Luis Calderón',
      codigo: 'DOC-001',
      correo: 'luis@centrovarones.edu.pe',
      password: '123456'
    },
    {
      id: 2,
      nombre: 'Carlos Mendoza',
      codigo: 'DOC-002',
      correo: 'carlos@centrovarones.edu.pe',
      password: '123456'
    }
  ];

  iniciarSesionDocente(
    usuario: string,
    password: string
  ): boolean {

    const docente = this.docentes.find(d =>
      (d.correo.toLowerCase() === usuario.trim().toLowerCase() ||
       d.codigo.toLowerCase() === usuario.trim().toLowerCase()) &&
      d.password === password
    );

    if (!docente) {
      return false;
    }

    const sesion: UsuarioSesion = {
      id: docente.id,
      nombre: docente.nombre,
      codigo: docente.codigo,
      rol: 'docente'
    };

    localStorage.setItem(
      this.CLAVE,
      JSON.stringify(sesion)
    );

    return true;
  }

  obtenerUsuario(): UsuarioSesion | null {
    const datos = localStorage.getItem(this.CLAVE);

    if (!datos) {
      return null;
    }

    try {
      return JSON.parse(datos) as UsuarioSesion;
    } catch {
      return null;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.CLAVE);
  }

  esDocente(): boolean {
    return this.obtenerUsuario()?.rol === 'docente';
  }

  esEstudiante(): boolean {
    return this.obtenerUsuario()?.rol === 'estudiante';
  }
}
