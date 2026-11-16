
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.MatriculaEstudiante;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaEstudianteRepository
        extends JpaRepository<MatriculaEstudiante, Integer> {

    // ==========================================
    // 1. LISTAR MATRÍCULAS
    // ==========================================

    // LISTAR MATRÍCULAS ACTIVAS
    List<MatriculaEstudiante> findByEstadoTrue();

    // LISTAR MATRÍCULAS ELIMINADAS O INACTIVAS
    List<MatriculaEstudiante> findByEstadoFalse();

    // ==========================================
    // 2. CONSULTAR POR ESTUDIANTE
    // ==========================================

    // BUSCAR MATRÍCULAS ACTIVAS DE UN ESTUDIANTE
    List<MatriculaEstudiante> findByIdEstudianteAndEstadoTrue(
            Integer idEstudiante
    );

    // BUSCAR TODAS LAS MATRÍCULAS DE UN ESTUDIANTE
    List<MatriculaEstudiante> findByIdEstudiante(
            Integer idEstudiante
    );

    // ==========================================
    // 3. CONSULTAR POR GRADO Y SECCIÓN
    // ==========================================

    // LISTAR ESTUDIANTES MATRICULADOS EN UN SALÓN
    List<MatriculaEstudiante> findByIdGradoSeccionAndEstadoTrue(
            Integer idGradoSeccion
    );

    // LISTAR TODAS LAS MATRÍCULAS DE UN SALÓN
    List<MatriculaEstudiante> findByIdGradoSeccion(
            Integer idGradoSeccion
    );

    // ==========================================
    // 4. BUSCAR MATRÍCULA ESPECÍFICA
    // ==========================================

    Optional<MatriculaEstudiante>
    findByIdEstudianteAndIdGradoSeccion(
            Integer idEstudiante,
            Integer idGradoSeccion
    );

    // ==========================================
    // 5. VALIDAR MATRÍCULAS DUPLICADAS
    // ==========================================

    // VERIFICAR SI EXISTE UNA MATRÍCULA
    boolean existsByIdEstudianteAndIdGradoSeccion(
            Integer idEstudiante,
            Integer idGradoSeccion
    );

    // VERIFICAR SI YA EXISTE UNA MATRÍCULA ACTIVA
    boolean existsByIdEstudianteAndIdGradoSeccionAndEstadoTrue(
            Integer idEstudiante,
            Integer idGradoSeccion
    );

    // VERIFICAR SI EL ESTUDIANTE YA ESTÁ
    // MATRICULADO EN CUALQUIER SECCIÓN DEL MISMO AÑO
    @Query("""
        SELECT CASE WHEN COUNT(m) > 0
                    THEN true ELSE false END
        FROM MatriculaEstudiante m, GradoSeccion gs
        WHERE m.idGradoSeccion = gs.idGradoSeccion
          AND m.idEstudiante = :idEstudiante
          AND gs.anioEscolar = :anioEscolar
          AND m.estado = true
        """)
    boolean existeMatriculaActivaEnAnio(
            @Param("idEstudiante") Integer idEstudiante,
            @Param("anioEscolar") Integer anioEscolar
    );

    // ==========================================
    // 6. CONTAR ESTUDIANTES POR SALÓN
    // ==========================================

    long countByIdGradoSeccionAndEstadoTrue(
            Integer idGradoSeccion
    );

    // ==========================================
    // 7. CONSULTAR MATRÍCULAS POR AÑO
    // ==========================================

    @Query("""
        SELECT m
        FROM MatriculaEstudiante m, GradoSeccion gs
        WHERE m.idGradoSeccion = gs.idGradoSeccion
          AND gs.anioEscolar = :anioEscolar
          AND m.estado = true
        """)
    List<MatriculaEstudiante> buscarMatriculasActivasPorAnio(
            @Param("anioEscolar") Integer anioEscolar
    );

    // ==========================================
    // 8. CONTAR MATRÍCULAS ACTIVAS POR AÑO
    // ==========================================

    @Query("""
        SELECT COUNT(m)
        FROM MatriculaEstudiante m, GradoSeccion gs
        WHERE m.idGradoSeccion = gs.idGradoSeccion
          AND gs.anioEscolar = :anioEscolar
          AND m.estado = true
        """)
    long contarMatriculasActivasPorAnio(
            @Param("anioEscolar") Integer anioEscolar
    );
}
