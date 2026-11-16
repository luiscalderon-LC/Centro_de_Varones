
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.AsignacionDocente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionDocenteRepository
        extends JpaRepository<AsignacionDocente, Integer> {

    // 1. LISTAR ASIGNACIONES ACTIVAS
    List<AsignacionDocente> findByEstadoTrue();

    // 2. BUSCAR ASIGNACIONES POR DOCENTE
    List<AsignacionDocente> findByIdDocenteAndEstadoTrue(
            Integer idDocente
    );

    // 3. BUSCAR ASIGNACIONES POR SALÓN
    List<AsignacionDocente> findByIdGradoSeccionAndEstadoTrue(
            Integer idGradoSeccion
    );

    // 4. BUSCAR ASIGNACIONES POR ASIGNATURA
    List<AsignacionDocente> findByIdAsignaturaAndEstadoTrue(
            Integer idAsignatura
    );

    // 5. BUSCAR CURSOS DE UN DOCENTE EN UN SALÓN
    List<AsignacionDocente>
    findByIdDocenteAndIdGradoSeccionAndEstadoTrue(
            Integer idDocente,
            Integer idGradoSeccion
    );

    // 6. BUSCAR UNA ASIGNACIÓN ESPECÍFICA
    Optional<AsignacionDocente>
    findByIdDocenteAndIdAsignaturaAndIdGradoSeccion(
            Integer idDocente,
            Integer idAsignatura,
            Integer idGradoSeccion
    );

    // 7. VERIFICAR SI YA EXISTE UNA ASIGNACIÓN
    boolean existsByIdDocenteAndIdAsignaturaAndIdGradoSeccion(
            Integer idDocente,
            Integer idAsignatura,
            Integer idGradoSeccion
    );

    // 8. CONTAR ASIGNACIONES ACTIVAS POR DOCENTE
    long countByIdDocenteAndEstadoTrue(
            Integer idDocente
    );
}
