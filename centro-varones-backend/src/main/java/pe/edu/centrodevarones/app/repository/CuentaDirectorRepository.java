
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.centrodevarones.app.entity.CuentaDirector;

import java.util.Optional;

public interface CuentaDirectorRepository
        extends JpaRepository<CuentaDirector, Integer> {

    Optional<CuentaDirector> findByCorreoIgnoreCaseAndEstadoTrue(
            String correo
    );

    boolean existsByCorreoIgnoreCase(String correo);
}
