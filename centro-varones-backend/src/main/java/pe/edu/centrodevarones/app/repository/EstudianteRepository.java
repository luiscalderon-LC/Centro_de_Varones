
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstudianteRepository
        extends JpaRepository<Estudiante, Integer> {

    // Listar estudiantes activos
    List<Estudiante> findByEstadoTrue();

    // Listar estudiantes eliminados
    List<Estudiante> findByEstadoFalse();

    // Buscar estudiante por documento
    Optional<Estudiante> findByNumeroDocumento(String numeroDocumento);

    // Validar si ya existe el documento
    boolean existsByNumeroDocumento(String numeroDocumento);

    // Buscar estudiantes activos por nombres
    List<Estudiante> findByNombresContainingIgnoreCaseAndEstadoTrue(
            String nombres
    );

    // Buscar estudiantes activos por apellidos
    List<Estudiante> findByApellidosContainingIgnoreCaseAndEstadoTrue(
            String apellidos
    );
}
