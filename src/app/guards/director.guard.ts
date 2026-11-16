
import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  catchError,
  map,
  of
} from 'rxjs';

// RESPUESTA DEL BACKEND
interface SesionDirector {
  id: number;
  correo: string;
  rol: string;
}

// PROTEGER LAS RUTAS DEL DIRECTOR
export const directorGuard: CanActivateFn = () => {

  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<SesionDirector>(
    'http://localhost:8081/api/auth/director/me',
    {
      withCredentials: true
    }
  ).pipe(

    map((respuesta) => {

      // VERIFICAR SESIÓN Y ROL DIRECTOR
      if (
        respuesta.id != null &&
        respuesta.rol.toLowerCase() === 'director'
      ) {
        return true;
      }

      // SIN SESIÓN VÁLIDA
      return router.createUrlTree([
        '/login-director'
      ]);

    }),

    // ERROR O SESIÓN EXPIRADA
    catchError(() => {

      return of(
        router.createUrlTree([
          '/login-director'
        ])
      );

    })

  );
};
