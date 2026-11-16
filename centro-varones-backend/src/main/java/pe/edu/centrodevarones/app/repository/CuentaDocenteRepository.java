
package pe.edu.centrodevarones.app.repository;

import pe.edu.centrodevarones.app.entity.CuentaDocente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CuentaDocenteRepository
        extends JpaRepository<CuentaDocente, Integer> {

    // BUSCAR CUENTA ACTIVA DEL DOCENTE
    Optional<CuentaDocente> findByIdDocenteAndEstadoTrue(
            Integer idDocente
    );

    // BUSCAR CUENTA SIN IMPORTAR SU ESTADO
    Optional<CuentaDocente> findByIdDocente(
            Integer idDocente
    );
}
