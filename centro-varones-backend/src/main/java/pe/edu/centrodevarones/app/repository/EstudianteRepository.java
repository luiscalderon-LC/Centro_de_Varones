
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.Estudiante;

@Repository
public interface EstudianteRepository
        extends JpaRepository<Estudiante, Integer> {
}
