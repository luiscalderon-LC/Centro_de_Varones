
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.RegistroNota;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroNotaRepository
        extends JpaRepository<RegistroNota, Integer> {

    // Consultar todas las notas activas
    List<RegistroNota> findByEstadoTrue();

    // Consultar notas por matrícula
    List<RegistroNota> findByIdMatriculaAndEstadoTrue(
            Integer idMatricula
    );

    // Consultar notas por evaluación
    List<RegistroNota> findByIdEvaluacionAndEstadoTrue(
            Integer idEvaluacion
    );

    // Buscar la nota de un estudiante en una evaluación
    Optional<RegistroNota> findByIdEvaluacionAndIdMatricula(
            Integer idEvaluacion,
            Integer idMatricula
    );

    // Verificar si ya existe una calificación
    boolean existsByIdEvaluacionAndIdMatricula(
            Integer idEvaluacion,
            Integer idMatricula
    );
}
