
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.CuentaEstudiante;

import java.util.Optional;

@Repository
public interface CuentaEstudianteRepository
        extends JpaRepository<CuentaEstudiante, Integer> {

    // BUSCAR CUENTA POR CORREO
    Optional<CuentaEstudiante> findByCorreo(
            String correo
    );

    // BUSCAR CUENTA POR ESTUDIANTE
    Optional<CuentaEstudiante> findByIdEstudiante(
            Integer idEstudiante
    );

    // VERIFICAR SI EL CORREO YA EXISTE
    boolean existsByCorreoIgnoreCase(
            String correo
    );

    // VERIFICAR SI EL ESTUDIANTE YA TIENE CUENTA
    boolean existsByIdEstudiante(
            Integer idEstudiante
    );
}
