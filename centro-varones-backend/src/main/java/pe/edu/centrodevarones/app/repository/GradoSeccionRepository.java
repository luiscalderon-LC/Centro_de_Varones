
package pe.edu.centrodevarones.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pe.edu.centrodevarones.app.entity.GradoSeccion;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradoSeccionRepository
        extends JpaRepository<GradoSeccion, Integer> {

    // ==========================================
    // LISTAR GRADOS Y SECCIONES
    // ==========================================

    // LISTAR GRADOS Y SECCIONES ACTIVOS
    List<GradoSeccion> findByEstadoTrue();

    // LISTAR GRADOS Y SECCIONES ELIMINADOS
    List<GradoSeccion> findByEstadoFalse();

    // ==========================================
    // BUSCAR GRADO, SECCIÓN Y AÑO
    // ==========================================

    // BUSCAR POR GRADO, SECCIÓN Y AÑO ESCOLAR
    Optional<GradoSeccion> findByGradoAndSeccionIgnoreCaseAndAnioEscolar(
            Integer grado,
            String seccion,
            Integer anioEscolar
    );

    // VALIDAR SI YA EXISTE EL GRADO Y SECCIÓN
    boolean existsByGradoAndSeccionIgnoreCaseAndAnioEscolar(
            Integer grado,
            String seccion,
            Integer anioEscolar
    );

    // ==========================================
    // FILTROS DE CONSULTA
    // ==========================================

    // LISTAR GRADOS Y SECCIONES ACTIVOS POR AÑO
    List<GradoSeccion> findByAnioEscolarAndEstadoTrue(
            Integer anioEscolar
    );

    // LISTAR SECCIONES ACTIVAS POR GRADO
    List<GradoSeccion> findByGradoAndEstadoTrue(
            Integer grado
    );

    // BUSCAR POR GRADO Y AÑO ESCOLAR
    List<GradoSeccion> findByGradoAndAnioEscolarAndEstadoTrue(
            Integer grado,
            Integer anioEscolar
    );

    // BUSCAR POR SECCIÓN Y AÑO ESCOLAR
    List<GradoSeccion> findBySeccionIgnoreCaseAndAnioEscolarAndEstadoTrue(
            String seccion,
            Integer anioEscolar
    );

    // ==========================================
    // NUEVOS MÉTODOS PARA MATRÍCULA
    // ==========================================

    // BUSCAR UN GRADO-SECCIÓN ACTIVO
    // SEGÚN GRADO, SECCIÓN Y AÑO ESCOLAR
    Optional<GradoSeccion>
    findByGradoAndSeccionIgnoreCaseAndAnioEscolarAndEstadoTrue(
            Integer grado,
            String seccion,
            Integer anioEscolar
    );

    // VERIFICAR SI EXISTE UN GRADO-SECCIÓN ACTIVO
    boolean
    existsByGradoAndSeccionIgnoreCaseAndAnioEscolarAndEstadoTrue(
            Integer grado,
            String seccion,
            Integer anioEscolar
    );

}
