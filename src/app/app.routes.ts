
import { Routes } from '@angular/router';

// LANDING PAGE
import { Inicio } from './features/landing/pages/inicio/inicio';
import { Portal } from './features/landing/pages/portal/portal';

// AUTENTICACIÓN
import { LoginDocente } from './features/auth/pages/login-docente/login-docente';
import { LoginEstudiante } from './features/auth/pages/login-estudiante/login-estudiante';
import { LoginDirector } from './features/auth/pages/login-director/login-director';

// DOCENTE
import { PanelDocente } from './features/docente/pages/panel-docente/panel-docente';
import { RegistrarNotas } from './features/docente/pages/registrar-notas/registrar-notas';
import { EditarNotas } from './features/docente/pages/editar-notas/editar-notas';
import { MisCursos } from './features/docente/pages/mis-cursos/mis-cursos';
import { EstudiantesDocente } from './features/docente/pages/estudiantes-docente/estudiantes-docente';
import { ReportesDocente } from './features/docente/pages/reportes-docente/reportes-docente';
import { ConfiguracionDocente } from './features/docente/pages/configuracion-docente/configuracion-docente';

// ESTUDIANTE
import { PanelEstudiante } from './features/estudiante/pages/panel-estudiante/panel-estudiante';
import { MisCalificaciones } from './features/estudiante/pages/mis-calificaciones/mis-calificaciones';

// DIRECTOR
import { PanelDirector } from './features/director/pages/panel-director/panel-director';
import { RegistrarDocente } from './features/director/pages/registrar-docente/registrar-docente';
import { GestionarDocentes } from './features/director/pages/gestionar-docentes/gestionar-docentes';
import { MatricularEstudiante } from './features/director/pages/matricular-estudiante/matricular-estudiante';
import { GestionarEstudiantes } from './features/director/pages/gestionar-estudiantes/gestionar-estudiantes';

// GUARD DEL DIRECTOR
import { directorGuard } from './guards/director.guard';

export const routes: Routes = [

  // PRESENTACIÓN DEL COLEGIO
  {
    path: '',
    component: Inicio,
    pathMatch: 'full'
  },

  // SELECCIÓN DE PERFILES
  {
    path: 'portal',
    component: Portal
  },

  // AUTENTICACIÓN
  {
    path: 'login-director',
    component: LoginDirector
  },
  {
    path: 'login-docente',
    component: LoginDocente
  },
  {
    path: 'login-estudiante',
    component: LoginEstudiante
  },

  // DIRECTOR
  {
    path: 'panel-director',
    component: PanelDirector,
    canActivate: [directorGuard]
  },
  {
    path: 'registrar-docente',
    component: RegistrarDocente,
    canActivate: [directorGuard]
  },
  {
    path: 'gestionar-docentes',
    component: GestionarDocentes,
    canActivate: [directorGuard]
  },
  {
    path: 'matricular-estudiante',
    component: MatricularEstudiante,
    canActivate: [directorGuard]
  },
  {
    path: 'gestionar-estudiantes',
    component: GestionarEstudiantes,
    canActivate: [directorGuard]
  },

  // DOCENTE
  {
    path: 'panel-docente',
    component: PanelDocente
  },
  {
    path: 'registrar-notas',
    component: RegistrarNotas
  },
  {
    path: 'editar-notas',
    component: EditarNotas
  },
  {
    path: 'mis-cursos',
    component: MisCursos
  },
  {
    path: 'estudiantes-docente',
    component: EstudiantesDocente
  },
  {
    path: 'reportes-docente',
    component: ReportesDocente
  },
  {
    path: 'configuracion-docente',
    component: ConfiguracionDocente
  },

  // ESTUDIANTE
  {
    path: 'panel-estudiante',
    component: PanelEstudiante
  },
  {
    path: 'mis-calificaciones',
    component: MisCalificaciones
  },

  // RUTAS TEMPORALES DEL ESTUDIANTE
  {
    path: 'mi-promedio',
    loadComponent: () =>
      import('./features/estudiante/pages/mi-promedio/mi-promedio')
        .then(m => m.MiPromedio)
  },
  {
    path: 'notas-necesarias',
    loadComponent: () =>
      import('./features/estudiante/pages/notas-necesarias/notas-necesarias')
        .then(m => m.NotasNecesarias)
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./features/estudiante/pages/historial/historial')
        .then(m => m.Historial)
  },

  // RUTA DESCONOCIDA
  {
    path: '**',
    redirectTo: ''
  }

];
