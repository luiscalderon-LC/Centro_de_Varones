USE CentroVaronesDB;
GO

-- ==========================================
-- TABLAS MAESTRAS - CENTRO DE VARONES
-- ==========================================

-- Crear esquemas si no existen
IF SCHEMA_ID('administracion') IS NULL
    EXEC('CREATE SCHEMA administracion');
GO

IF SCHEMA_ID('usuarios') IS NULL
    EXEC('CREATE SCHEMA usuarios');
GO

IF SCHEMA_ID('cursos') IS NULL
    EXEC('CREATE SCHEMA cursos');
GO

-- ==========================================
-- 1. TIPO DE DOCUMENTO
-- ==========================================

IF OBJECT_ID('administracion.TipoDocumento', 'U') IS NULL
BEGIN
    CREATE TABLE administracion.TipoDocumento (
        id_tipo_documento INT NOT NULL PRIMARY KEY,
        nombre NVARCHAR(50) NOT NULL,
        abreviatura NVARCHAR(10) NOT NULL,

        CONSTRAINT UQ_TipoDocumento_Abreviatura
            UNIQUE (abreviatura)
    );

    PRINT 'Tabla TipoDocumento creada';
END;
GO

-- ==========================================
-- 2. AÑO ESCOLAR
-- ==========================================

IF OBJECT_ID('administracion.AnioEscolar', 'U') IS NULL
BEGIN
    CREATE TABLE administracion.AnioEscolar (
        id_anio INT NOT NULL PRIMARY KEY,
        anio INT NOT NULL,
        estado NVARCHAR(20) NOT NULL DEFAULT 'Activo',

        CONSTRAINT UQ_AnioEscolar_Anio
            UNIQUE (anio)
    );

    PRINT 'Tabla AnioEscolar creada';
END;
GO

-- ==========================================
-- 3. PERIODO ACADÉMICO
-- ==========================================

IF OBJECT_ID('administracion.Periodo', 'U') IS NULL
BEGIN
    CREATE TABLE administracion.Periodo (
        id_periodo INT IDENTITY(1,1) PRIMARY KEY,
        id_anio INT NOT NULL,
        nombre NVARCHAR(30) NOT NULL,
        fecha_inicio DATE NULL,
        fecha_fin DATE NULL,

        CONSTRAINT UQ_Periodo_Anio_Nombre
            UNIQUE (id_anio, nombre),

        CONSTRAINT FK_Periodo_AnioEscolar
            FOREIGN KEY (id_anio)
            REFERENCES administracion.AnioEscolar(id_anio)
    );

    PRINT 'Tabla Periodo creada';
END;
GO

-- ==========================================
-- 4. ESTUDIANTE
-- ==========================================

IF OBJECT_ID('usuarios.Estudiante', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.Estudiante (
        id_estudiante INT IDENTITY(1,1) PRIMARY KEY,
        id_tipo_documento INT NOT NULL,
        numero_documento NVARCHAR(15) NOT NULL,
        nombres NVARCHAR(60) NOT NULL,
        apellidos NVARCHAR(60) NOT NULL,
        nacionalidad NVARCHAR(40) NOT NULL DEFAULT 'Peruana',
        fecha_nacimiento DATE NULL,
        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        CONSTRAINT UQ_Estudiante_Documento
            UNIQUE (numero_documento),

        CONSTRAINT FK_Estudiante_TipoDocumento
            FOREIGN KEY (id_tipo_documento)
            REFERENCES administracion.TipoDocumento(id_tipo_documento)
    );

    PRINT 'Tabla Estudiante creada';
END;
GO

-- ==========================================
-- 5. DOCENTE
-- ==========================================

IF OBJECT_ID('usuarios.Docente', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.Docente (
        id_docente INT IDENTITY(1,1) PRIMARY KEY,
        id_tipo_documento INT NOT NULL,
        numero_documento NVARCHAR(15) NOT NULL,
        nombres NVARCHAR(60) NOT NULL,
        apellidos NVARCHAR(60) NOT NULL,
        especialidad NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL,
        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        CONSTRAINT UQ_Docente_Documento
            UNIQUE (numero_documento),

        CONSTRAINT UQ_Docente_Correo
            UNIQUE (correo),

        CONSTRAINT FK_Docente_TipoDocumento
            FOREIGN KEY (id_tipo_documento)
            REFERENCES administracion.TipoDocumento(id_tipo_documento)
    );

    PRINT 'Tabla Docente creada';
END;
GO

IF OBJECT_ID('usuarios.CuentaDirector', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.CuentaDirector (
        id_director INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        nombres NVARCHAR(100) NOT NULL,
        apellidos NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        estado BIT NOT NULL
            CONSTRAINT DF_CuentaDirector_Estado DEFAULT 1,
        fecha_creacion DATETIME2 NOT NULL
            CONSTRAINT DF_CuentaDirector_FechaCreacion DEFAULT SYSDATETIME(),

        CONSTRAINT UQ_CuentaDirector_Correo
            UNIQUE (correo)
    );
END;
GO

IF OBJECT_ID('usuarios.CuentaDocente', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.CuentaDocente (
        id_cuenta INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_docente INT NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        estado BIT NOT NULL
            CONSTRAINT DF_CuentaDocente_Estado DEFAULT 1,
        fecha_creacion DATETIME2 NOT NULL
            CONSTRAINT DF_CuentaDocente_FechaCreacion DEFAULT SYSDATETIME(),

        CONSTRAINT UQ_CuentaDocente_Docente
            UNIQUE (id_docente),

        CONSTRAINT FK_CuentaDocente_Docente
            FOREIGN KEY (id_docente)
            REFERENCES usuarios.Docente(id_docente)
    );
END;
GO

IF OBJECT_ID('usuarios.CuentaEstudiante', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.CuentaEstudiante (
        id_cuenta INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_estudiante INT NOT NULL,
        correo NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        cambiar_password BIT NOT NULL
            CONSTRAINT DF_CuentaEstudiante_CambiarPassword DEFAULT 0,
        estado BIT NOT NULL
            CONSTRAINT DF_CuentaEstudiante_Estado DEFAULT 1,
        fecha_creacion DATETIME2 NOT NULL,

        CONSTRAINT FK_CuentaEstudiante_Estudiante
            FOREIGN KEY (id_estudiante)
            REFERENCES usuarios.Estudiante(id_estudiante)
    );
END;
GO

-- ==========================================
-- 6. ASIGNATURA
-- ==========================================

IF OBJECT_ID('cursos.Asignatura', 'U') IS NULL
BEGIN
    CREATE TABLE cursos.Asignatura (
        id_asignatura INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(300) NULL,
        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        CONSTRAINT UQ_Asignatura_Nombre
            UNIQUE (nombre)
    );

    PRINT 'Tabla Asignatura creada';
END;
GO

-- ==========================================
-- TABLA: GRADO Y SECCIÓN
-- ==========================================

IF OBJECT_ID('cursos.GradoSeccion', 'U') IS NULL
BEGIN
    CREATE TABLE cursos.GradoSeccion (
        id_grado_seccion INT IDENTITY(1,1) PRIMARY KEY,
        grado INT NOT NULL,
        seccion NVARCHAR(5) NOT NULL,
        anio_escolar INT NOT NULL,
        capacidad INT NOT NULL DEFAULT 30,
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        CONSTRAINT UQ_GradoSeccion
            UNIQUE (grado, seccion, anio_escolar),

        CONSTRAINT CK_GradoSeccion_Grado
            CHECK (grado BETWEEN 1 AND 6),

        CONSTRAINT CK_GradoSeccion_Capacidad
            CHECK (capacidad BETWEEN 1 AND 50)
    );

    PRINT 'Tabla GradoSeccion creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla GradoSeccion ya existe';
END;
GO
-- ==========================================
-- TABLA TRANSACCIONAL: MATRICULA ESTUDIANTE
-- ==========================================

IF OBJECT_ID('usuarios.MatriculaEstudiante', 'U') IS NULL
BEGIN
    CREATE TABLE usuarios.MatriculaEstudiante (
        id_matricula INT IDENTITY(1,1) PRIMARY KEY,

        id_estudiante INT NOT NULL,
        id_grado_seccion INT NOT NULL,

        fecha_matricula DATE NOT NULL
            DEFAULT CAST(GETDATE() AS DATE),

        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        -- Evita matricular dos veces al mismo
        -- estudiante en el mismo grado y sección
        CONSTRAINT UQ_MatriculaEstudiante
            UNIQUE (id_estudiante, id_grado_seccion),

        -- Relación con Estudiante
        CONSTRAINT FK_Matricula_Estudiante
            FOREIGN KEY (id_estudiante)
            REFERENCES usuarios.Estudiante(id_estudiante),

        -- Relación con GradoSeccion
        CONSTRAINT FK_Matricula_GradoSeccion
            FOREIGN KEY (id_grado_seccion)
            REFERENCES cursos.GradoSeccion(id_grado_seccion)
    );

    PRINT 'Tabla MatriculaEstudiante creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla MatriculaEstudiante ya existe';
END;
GO

-- ==========================================
-- TABLA TRANSACCIONAL: ASIGNACION DOCENTE
-- ==========================================

IF SCHEMA_ID('asignacion') IS NULL
BEGIN
    EXEC('CREATE SCHEMA asignacion');
END;
GO

IF OBJECT_ID('asignacion.AsignacionDocente', 'U') IS NULL
BEGIN
    CREATE TABLE asignacion.AsignacionDocente (
        id_asignacion INT IDENTITY(1,1) PRIMARY KEY,

        id_docente INT NOT NULL,
        id_asignatura INT NOT NULL,
        id_grado_seccion INT NOT NULL,

        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        -- Evita repetir la misma asignación
        CONSTRAINT UQ_AsignacionDocente
            UNIQUE (
                id_docente,
                id_asignatura,
                id_grado_seccion
            ),

        -- Relación con Docente
        CONSTRAINT FK_Asignacion_Docente
            FOREIGN KEY (id_docente)
            REFERENCES usuarios.Docente(id_docente),

        -- Relación con Asignatura
        CONSTRAINT FK_Asignacion_Asignatura
            FOREIGN KEY (id_asignatura)
            REFERENCES cursos.Asignatura(id_asignatura),

        -- Relación con GradoSeccion
        CONSTRAINT FK_Asignacion_GradoSeccion
            FOREIGN KEY (id_grado_seccion)
            REFERENCES cursos.GradoSeccion(id_grado_seccion)
    );

    PRINT 'Tabla AsignacionDocente creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla AsignacionDocente ya existe';
END;
GO

-- ==========================================
-- TABLA TRANSACCIONAL: EVALUACION
-- ==========================================

IF SCHEMA_ID('notas') IS NULL
BEGIN
    EXEC('CREATE SCHEMA notas');
END;
GO

IF OBJECT_ID('notas.Evaluacion', 'U') IS NULL
BEGIN
    CREATE TABLE notas.Evaluacion (
        id_evaluacion INT IDENTITY(1,1) PRIMARY KEY,

        id_asignacion INT NOT NULL,
        id_periodo INT NOT NULL,

        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(300) NULL,
        tipo_evaluacion NVARCHAR(30) NOT NULL,

        fecha_evaluacion DATE NOT NULL,

        ponderacion DECIMAL(5,2) NOT NULL
            DEFAULT 100.00,

        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        -- Relación con la asignación docente
        CONSTRAINT FK_Evaluacion_Asignacion
            FOREIGN KEY (id_asignacion)
            REFERENCES asignacion.AsignacionDocente(id_asignacion),

        -- Relación con el periodo académico
        CONSTRAINT FK_Evaluacion_Periodo
            FOREIGN KEY (id_periodo)
            REFERENCES administracion.Periodo(id_periodo),

        -- Validación de la ponderación
        CONSTRAINT CK_Evaluacion_Ponderacion
            CHECK (ponderacion > 0 AND ponderacion <= 100)
    );

    PRINT 'Tabla Evaluacion creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla Evaluacion ya existe';
END;
GO

-- ==========================================
-- TABLA TRANSACCIONAL: REGISTRO DE NOTAS
-- ==========================================

IF OBJECT_ID('notas.RegistroNota', 'U') IS NULL
BEGIN
    CREATE TABLE notas.RegistroNota (
        id_nota INT IDENTITY(1,1) PRIMARY KEY,

        id_evaluacion INT NOT NULL,
        id_matricula INT NOT NULL,

        calificacion DECIMAL(5,2) NOT NULL,

        observacion NVARCHAR(300) NULL,

        estado BIT NOT NULL DEFAULT 1,

        fecha_creacion DATETIME2 NULL,
        usuario_creacion NVARCHAR(50) NULL,
        fecha_modificacion DATETIME2 NULL,
        usuario_modificacion NVARCHAR(50) NULL,

        -- Evita duplicar la nota de un estudiante
        -- para una misma evaluación
        CONSTRAINT UQ_RegistroNota
            UNIQUE (id_evaluacion, id_matricula),

        -- Relación con Evaluacion
        CONSTRAINT FK_RegistroNota_Evaluacion
            FOREIGN KEY (id_evaluacion)
            REFERENCES notas.Evaluacion(id_evaluacion),

        -- Relación con MatriculaEstudiante
        CONSTRAINT FK_RegistroNota_Matricula
            FOREIGN KEY (id_matricula)
            REFERENCES usuarios.MatriculaEstudiante(id_matricula),

        -- Validación de calificaciones de 0 a 20
        CONSTRAINT CK_RegistroNota_Calificacion
            CHECK (calificacion BETWEEN 0 AND 20)
    );

    PRINT 'Tabla RegistroNota creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla RegistroNota ya existe';
END;
GO

-- ==========================================
-- VISTA 1: CONSULTA DE NOTAS DEL ESTUDIANTE
-- ==========================================

CREATE OR ALTER VIEW notas.v_ConsultaNotasEstudiante
AS
SELECT
    e.id_estudiante,
    e.numero_documento,
    e.nombres,
    e.apellidos,

    gs.grado,
    gs.seccion,
    gs.anio_escolar,

    a.id_asignatura,
    a.nombre AS asignatura,

    p.id_periodo,
    p.nombre AS periodo,

    ev.id_evaluacion,
    ev.nombre AS evaluacion,
    ev.tipo_evaluacion,
    ev.fecha_evaluacion,
    ev.ponderacion,

    rn.id_nota,
    rn.calificacion,
    rn.observacion

FROM notas.RegistroNota rn

INNER JOIN notas.Evaluacion ev
    ON rn.id_evaluacion = ev.id_evaluacion

INNER JOIN asignacion.AsignacionDocente ad
    ON ev.id_asignacion = ad.id_asignacion

INNER JOIN cursos.Asignatura a
    ON ad.id_asignatura = a.id_asignatura

INNER JOIN administracion.Periodo p
    ON ev.id_periodo = p.id_periodo

INNER JOIN usuarios.MatriculaEstudiante m
    ON rn.id_matricula = m.id_matricula

INNER JOIN usuarios.Estudiante e
    ON m.id_estudiante = e.id_estudiante

INNER JOIN cursos.GradoSeccion gs
    ON m.id_grado_seccion = gs.id_grado_seccion

WHERE rn.estado = 1
  AND ev.estado = 1
  AND m.estado = 1
  AND ad.estado = 1
  AND ad.id_grado_seccion = m.id_grado_seccion
  AND gs.anio_escolar = (
      SELECT ae.anio
      FROM administracion.AnioEscolar ae
      WHERE ae.id_anio = p.id_anio
  );
GO

PRINT 'Vista de consulta de notas creada correctamente';
GO

-- ==========================================
-- VISTA 2: PROMEDIO DE NOTAS DEL ESTUDIANTE
-- ==========================================

CREATE OR ALTER VIEW notas.v_PromedioEstudiante
AS
SELECT
    id_estudiante,
    numero_documento,
    nombres,
    apellidos,

    grado,
    seccion,
    anio_escolar,

    id_asignatura,
    asignatura,

    id_periodo,
    periodo,

    COUNT(id_nota) AS total_evaluaciones,

    CAST(
        SUM(calificacion * ponderacion)
        / NULLIF(SUM(ponderacion), 0)
        AS DECIMAL(5,2)
    ) AS promedio,

    CASE
        WHEN
            SUM(calificacion * ponderacion)
            / NULLIF(SUM(ponderacion), 0) >= 11
        THEN 'APROBADO'
        ELSE 'DESAPROBADO'
    END AS estado_academico

FROM notas.v_ConsultaNotasEstudiante

GROUP BY
    id_estudiante,
    numero_documento,
    nombres,
    apellidos,
    grado,
    seccion,
    anio_escolar,
    id_asignatura,
    asignatura,
    id_periodo,
    periodo;
GO

PRINT 'Vista de promedios creada correctamente';
GO
