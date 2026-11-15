
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.Docente;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocenteRepository
        extends JpaRepository<Docente, Integer> {

    // LISTAR DOCENTES ACTIVOS
    List<Docente> findByEstadoTrue();

    // LISTAR DOCENTES ELIMINADOS
    List<Docente> findByEstadoFalse();

    // BUSCAR DOCENTE POR DOCUMENTO
    Optional<Docente> findByNumeroDocumento(String numeroDocumento);

    // VALIDAR DOCUMENTO DUPLICADO
    boolean existsByNumeroDocumento(String numeroDocumento);

    // BUSCAR DOCENTE POR CORREO
    Optional<Docente> findByCorreoIgnoreCase(String correo);

    // VALIDAR CORREO DUPLICADO
    boolean existsByCorreoIgnoreCase(String correo);

    // BUSCAR DOCENTES ACTIVOS POR NOMBRES
    List<Docente> findByNombresContainingIgnoreCaseAndEstadoTrue(
            String nombres
    );

    // BUSCAR DOCENTES ACTIVOS POR APELLIDOS
    List<Docente> findByApellidosContainingIgnoreCaseAndEstadoTrue(
            String apellidos
    );

    // BUSCAR DOCENTES ACTIVOS POR ESPECIALIDAD
    List<Docente> findByEspecialidadContainingIgnoreCaseAndEstadoTrue(
            String especialidad
    );
}
