
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.Evaluacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionRepository
        extends JpaRepository<Evaluacion, Integer> {

    // 1. LISTAR EVALUACIONES ACTIVAS
    List<Evaluacion> findByEstadoTrue();

    // 2. CONSULTAR EVALUACIONES POR ASIGNACIÓN DOCENTE
    List<Evaluacion> findByIdAsignacionAndEstadoTrue(
            Integer idAsignacion
    );

    // 3. CONSULTAR EVALUACIONES POR PERIODO
    List<Evaluacion> findByIdPeriodoAndEstadoTrue(
            Integer idPeriodo
    );

    // 4. CONSULTAR EVALUACIONES POR ASIGNACIÓN Y PERIODO
    List<Evaluacion> findByIdAsignacionAndIdPeriodoAndEstadoTrue(
            Integer idAsignacion,
            Integer idPeriodo
    );

    // 5. CONSULTAR EVALUACIONES POR TIPO
    List<Evaluacion> findByTipoEvaluacionAndEstadoTrue(
            String tipoEvaluacion
    );

    // 6. VERIFICAR SI EXISTE UNA EVALUACIÓN CON EL MISMO NOMBRE
    boolean existsByIdAsignacionAndIdPeriodoAndNombreAndEstadoTrue(
            Integer idAsignacion,
            Integer idPeriodo,
            String nombre
    );

    // 7. CONTAR EVALUACIONES POR ASIGNACIÓN
    long countByIdAsignacionAndEstadoTrue(
            Integer idAsignacion
    );

    // 8. LISTAR EVALUACIONES ORDENADAS POR FECHA
    List<Evaluacion> findByIdAsignacionAndEstadoTrueOrderByFechaEvaluacionAsc(
            Integer idAsignacion
    );
}
