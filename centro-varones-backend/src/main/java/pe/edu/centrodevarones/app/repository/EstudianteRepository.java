
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.Estudiante;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstudianteRepository
        extends JpaRepository<Estudiante, Integer> {

    // ==========================================
    // 1. LISTAR ESTUDIANTES
    // ==========================================

    // LISTAR ESTUDIANTES ACTIVOS
    List<Estudiante> findByEstadoTrue();

    // LISTAR ESTUDIANTES ELIMINADOS O INACTIVOS
    List<Estudiante> findByEstadoFalse();

    // ==========================================
    // 2. BUSCAR POR DOCUMENTO
    // ==========================================

    // BUSCAR ESTUDIANTE POR DNI O CE
    Optional<Estudiante> findByNumeroDocumento(
            String numeroDocumento
    );

    // VALIDAR SI EL DOCUMENTO YA EXISTE
    boolean existsByNumeroDocumento(
            String numeroDocumento
    );

    // ==========================================
    // 3. BUSCAR POR NOMBRES Y APELLIDOS
    // ==========================================

    // BUSCAR ESTUDIANTES POR NOMBRE
    List<Estudiante> findByNombresContainingIgnoreCase(
            String nombres
    );

    // BUSCAR ESTUDIANTES POR APELLIDO
    List<Estudiante> findByApellidosContainingIgnoreCase(
            String apellidos
    );

    // ==========================================
    // 4. BUSCAR ESTUDIANTES ACTIVOS
    // ==========================================

    List<Estudiante> findByNombresContainingIgnoreCaseAndEstadoTrue(
            String nombres
    );

    List<Estudiante> findByApellidosContainingIgnoreCaseAndEstadoTrue(
            String apellidos
    );

    // ==========================================
    // 5. CONTAR ESTUDIANTES
    // ==========================================

    // CONTAR ESTUDIANTES ACTIVOS
    long countByEstadoTrue();

    // CONTAR ESTUDIANTES INACTIVOS
    long countByEstadoFalse();
}
