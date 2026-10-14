
import { Injectable } from '@angular/core';

export interface EstudianteAcademico {
  id: number;
  codigo: string;
  nombre: string;
  grado: string;
  seccion: string;
}

export interface NotaAcademica {
  estudianteId: number;
  curso: string;
  periodo: string;
  anio: number;
  evaluacion1: number;
  evaluacion2: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatosAcademicosService {

  // Almacenamiento de notas en el navegador.
  // Conservamos la misma clave para no perder las notas anteriores.
  private readonly CLAVE = 'centro_varones_datos_academicos_v1';

  // 1. GRADOS Y SECCIONES DEL COLEGIO
  readonly grados: string[] = [
    '1.°',
    '2.°',
    '3.°',
    '4.°',
    '5.°'
  ];

  readonly secciones: string[] = [
    'A',
    'B',
    'C'
  ];

  readonly salones: string[] = this.grados.flatMap(
    grado => this.secciones.map(
      seccion => `${grado} ${seccion}`
    )
  );

  // 2. ESTUDIANTES ACTUALES DE 5.° A
  // Estos seis conservan sus mismos ID y códigos.
  private readonly estudiantesOriginales: EstudianteAcademico[] = [
    {
      id: 1,
      codigo: 'EST-001',
      nombre: 'Luis Calderón',
      grado: '5.°',
      seccion: 'A'
    },
    {
      id: 2,
      codigo: 'EST-002',
      nombre: 'Mark Alcalá',
      grado: '5.°',
      seccion: 'A'
    },
    {
      id: 3,
      codigo: 'EST-003',
      nombre: 'Diego Ramos',
      grado: '5.°',
      seccion: 'A'
    },
    {
      id: 4,
      codigo: 'EST-004',
      nombre: 'José Mendoza',
      grado: '5.°',
      seccion: 'A'
    },
    {
      id: 5,
      codigo: 'EST-005',
      nombre: 'Carlos Torres',
      grado: '5.°',
      seccion: 'A'
    },
    {
      id: 6,
      codigo: 'EST-006',
      nombre: 'Andrés Flores',
      grado: '5.°',
      seccion: 'A'
    }
  ];

  // 3. NOMBRES DE EJEMPLO PARA LOS OTROS 14 SALONES
  private readonly nombresEjemplo: string[] = [
    'Juan Pérez',
    'Miguel Sánchez',
    'Pedro Ramírez',
    'Jorge Castillo',
    'Daniel Rojas',
    'Fernando López',
    'Ricardo Gutiérrez',
    'Ángel Vargas',
    'Sebastián Medina',
    'David Herrera',
    'Gabriel Navarro',
    'Mateo Chávez',
    'Kevin Salazar',
    'Brayan Mendoza',
    'Alexis Romero',
    'Cristian Flores',
    'Adrián Paredes',
    'Samuel Torres',
    'Joaquín Silva',
    'Thiago Morales',
    'Emilio Reyes',
    'Nicolás Campos',
    'Anthony Aguilar',
    'José Huamán',
    'Luis Cárdenas',
    'Marco Espinoza',
    'Diego Palomino',
    'Carlos Quispe'
  ];

  // 4. LISTA COMPLETA DE 90 ESTUDIANTES
  readonly estudiantes: EstudianteAcademico[] =
    this.crearEstudiantes();

  // 5. CURSOS Y PERIODOS
  readonly cursos: string[] = [
    'Matemáticas',
    'Comunicación',
    'Ciencia y Tecnología',
    'Ciencias Sociales'
  ];

  readonly periodos: string[] = [
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  readonly anio = 2026;

  private notas: NotaAcademica[] = [];

  constructor() {
    this.cargarDatos();
  }

  // 6. GENERAR ESTUDIANTES POR SALÓN
  private crearEstudiantes(): EstudianteAcademico[] {

    const resultado = [
      ...this.estudiantesOriginales
    ];

    let siguienteId = 7;
    let indiceNombre = 0;

    for (const grado of this.grados) {
      for (const seccion of this.secciones) {

        // 5.° A ya tiene seis estudiantes.
        if (grado === '5.°' && seccion === 'A') {
          continue;
        }

        for (let numero = 1; numero <= 6; numero++) {

          const nombreBase = this.nombresEjemplo[
            indiceNombre % this.nombresEjemplo.length
          ];

          const estudiante: EstudianteAcademico = {
            id: siguienteId,
            codigo: `EST-${String(siguienteId).padStart(3, '0')}`,
            nombre: nombreBase,
            grado,
            seccion
          };

          resultado.push(estudiante);

          siguienteId++;
          indiceNombre++;
        }
      }
    }

    return resultado;
  }

  // 7. CREAR NOTAS INICIALES DE DEMOSTRACIÓN
  private crearDatosIniciales(): NotaAcademica[] {

    const resultado: NotaAcademica[] = [];

    const ejemplos = [
      [16, 18],
      [14, 16],
      [10, 8],
      [12, 14],
      [9, 11],
      [18, 19]
    ];

    for (const periodo of this.periodos) {
      for (const curso of this.cursos) {
        for (const estudiante of this.estudiantes) {

          const posicion = (estudiante.id - 1) % ejemplos.length;
          const ejemplo = ejemplos[posicion];

          let ajuste = 0;

          if (curso === 'Comunicación') {
            ajuste = 1;
          }

          if (curso === 'Ciencia y Tecnología') {
            ajuste = -1;
          }

          if (curso === 'Ciencias Sociales') {
            ajuste = 2;
          }

          const numeroPeriodo =
            this.periodos.indexOf(periodo);

          resultado.push({
            estudianteId: estudiante.id,
            curso,
            periodo,
            anio: this.anio,
            evaluacion1: Math.max(
              0,
              Math.min(20, ejemplo[0] + ajuste + numeroPeriodo)
            ),
            evaluacion2: Math.max(
              0,
              Math.min(20, ejemplo[1] + ajuste + numeroPeriodo)
            )
          });
        }
      }
    }

    return resultado;
  }

  // 8. CARGAR NOTAS SIN BORRAR LAS ANTERIORES
  private cargarDatos(): void {

    const guardado = localStorage.getItem(this.CLAVE);

    let anteriores: NotaAcademica[] = [];

    if (guardado) {
      try {
        const datos = JSON.parse(guardado);

        if (Array.isArray(datos)) {
          anteriores = datos;
        }
      } catch {
        anteriores = [];
      }
    }

    const iniciales = this.crearDatosIniciales();

    const clavesExistentes = new Set(
      anteriores.map(nota => this.claveNota(nota))
    );

    // Primero conservamos las notas guardadas.
    this.notas = [...anteriores];

    // Después añadimos solamente las que faltan.
    for (const nota of iniciales) {
      if (!clavesExistentes.has(this.claveNota(nota))) {
        this.notas.push(nota);
      }
    }

    this.guardarDatos();
  }

  private claveNota(nota: NotaAcademica): string {
    return [
      nota.estudianteId,
      nota.curso,
      nota.periodo,
      nota.anio
    ].join('|');
  }

  private guardarDatos(): void {
    localStorage.setItem(
      this.CLAVE,
      JSON.stringify(this.notas)
    );
  }

  // 9. OBTENER TODOS LOS ESTUDIANTES
  obtenerEstudiantes(): EstudianteAcademico[] {
    return [...this.estudiantes];
  }

  // 10. OBTENER ESTUDIANTES DE UN SALÓN
  obtenerEstudiantesPorSalon(
    grado: string,
    seccion: string
  ): EstudianteAcademico[] {

    return this.estudiantes.filter(
      estudiante =>
        estudiante.grado === grado &&
        estudiante.seccion === seccion
    );
  }

  // 11. CONTAR ESTUDIANTES POR SALÓN
  contarEstudiantesPorSalon(
    grado: string,
    seccion: string
  ): number {

    return this.obtenerEstudiantesPorSalon(
      grado,
      seccion
    ).length;
  }

  // 12. BUSCAR UN ESTUDIANTE POR ID
  obtenerEstudiante(
    estudianteId: number
  ): EstudianteAcademico | undefined {

    return this.estudiantes.find(
      estudiante => estudiante.id === estudianteId
    );
  }

  // 13. CONSULTAR NOTAS POR CURSO Y PERIODO
  obtenerNotas(
    curso: string,
    periodo: string,
    anio: number = this.anio
  ): NotaAcademica[] {

    return this.notas
      .filter(nota =>
        nota.curso === curso &&
        nota.periodo === periodo &&
        nota.anio === anio
      )
      .map(nota => ({ ...nota }));
  }

  // 14. CONSULTAR NOTAS DE UN SALÓN
  obtenerNotasPorSalon(
    curso: string,
    periodo: string,
    grado: string,
    seccion: string,
    anio: number = this.anio
  ): NotaAcademica[] {

    const ids = new Set(
      this.obtenerEstudiantesPorSalon(
        grado,
        seccion
      ).map(estudiante => estudiante.id)
    );

    return this.obtenerNotas(
      curso,
      periodo,
      anio
    ).filter(nota =>
      ids.has(nota.estudianteId)
    );
  }

  // 15. CONSULTAR NOTAS DE UN ESTUDIANTE
  obtenerNotasEstudiante(
    estudianteId: number,
    periodo: string = 'I Bimestre'
  ): NotaAcademica[] {

    return this.notas
      .filter(nota =>
        nota.estudianteId === estudianteId &&
        nota.periodo === periodo &&
        nota.anio === this.anio
      )
      .map(nota => ({ ...nota }));
  }

  // 16. ACTUALIZAR CALIFICACIONES
  actualizarNota(
    estudianteId: number,
    curso: string,
    periodo: string,
    evaluacion1: number,
    evaluacion2: number
  ): boolean {

    if (
      !Number.isFinite(evaluacion1) ||
      !Number.isFinite(evaluacion2) ||
      evaluacion1 < 0 ||
      evaluacion1 > 20 ||
      evaluacion2 < 0 ||
      evaluacion2 > 20
    ) {
      return false;
    }

    const nota = this.notas.find(item =>
      item.estudianteId === estudianteId &&
      item.curso === curso &&
      item.periodo === periodo &&
      item.anio === this.anio
    );

    if (!nota) {
      return false;
    }

    nota.evaluacion1 = evaluacion1;
    nota.evaluacion2 = evaluacion2;

    this.guardarDatos();

    return true;
  }

  // 17. CALCULAR PROMEDIO
  calcularPromedio(
    evaluacion1: number,
    evaluacion2: number
  ): number {

    return (evaluacion1 + evaluacion2) / 2;
  }

  // 18. DETERMINAR ESTADO ACADÉMICO
  obtenerEstado(promedio: number): string {

    return promedio >= 11
      ? 'Aprobado'
      : 'Desaprobado';
  }

  // 19. CALCULAR PROMEDIO GENERAL
  obtenerPromedioGeneral(
    estudianteId: number,
    periodo: string = 'I Bimestre'
  ): number {

    const notas = this.obtenerNotasEstudiante(
      estudianteId,
      periodo
    );

    if (notas.length === 0) {
      return 0;
    }

    const total = notas.reduce(
      (suma, nota) =>
        suma + this.calcularPromedio(
          nota.evaluacion1,
          nota.evaluacion2
        ),
      0
    );

    return total / notas.length;
  }

}
