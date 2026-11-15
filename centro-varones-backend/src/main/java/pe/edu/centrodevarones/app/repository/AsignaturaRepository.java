
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.Asignatura;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignaturaRepository
        extends JpaRepository<Asignatura, Integer> {

    // LISTAR ASIGNATURAS ACTIVAS
    List<Asignatura> findByEstadoTrue();

    // LISTAR ASIGNATURAS ELIMINADAS
    List<Asignatura> findByEstadoFalse();

    // BUSCAR ASIGNATURA POR NOMBRE
    Optional<Asignatura> findByNombreIgnoreCase(String nombre);

    // VALIDAR SI EL NOMBRE YA EXISTE
    boolean existsByNombreIgnoreCase(String nombre);

    // BUSCAR ASIGNATURAS ACTIVAS POR NOMBRE
    List<Asignatura> findByNombreContainingIgnoreCaseAndEstadoTrue(
            String nombre
    );

    // BUSCAR ASIGNATURAS ACTIVAS POR DESCRIPCIÓN
    List<Asignatura> findByDescripcionContainingIgnoreCaseAndEstadoTrue(
            String descripcion
    );
}
